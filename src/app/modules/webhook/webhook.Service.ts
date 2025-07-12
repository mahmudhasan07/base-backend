import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../../../config/stripe";
import { prisma } from "../../../utils/prisma";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const webHookService = async (
  req: Request,
  res: Response
): Promise<void> => {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    // Construct the event with raw body parsing
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        if (!subscription.metadata?.userId) {
          res.status(400).send("Missing userId in metadata");
          return;
        }

        // Upsert subscription user info
        await prisma.subscriptionUser.upsert({
          where: { userId: subscription.metadata.userId },
          update: {
            subscriptionStatus: subscription.status,
            subscriptionStart: new Date(
              subscription.billing_cycle_anchor * 1000
            ),
            subscriptionEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
            subscriptionId: subscription.id,
            subscriptionPlanId: subscription.items?.data[0]?.plan?.id || "",
          },
          create: {
            userId: subscription.metadata.userId,
            subscriptionStatus: subscription.status,
            subscriptionStart: new Date(
              subscription.items.data[0].current_period_start * 1000
            ),
            subscriptionEnd: new Date(
              subscription.items.data[0].current_period_end * 1000
            ),
            subscriptionPlanId: subscription.items?.data[0]?.plan?.id || "",
            subscriptionId: subscription.id,
          },
        });

        // await prisma.payment.create({
        //   data: {
        //     serviceId: subscription.metadata.userId,
        //     paymentId: subscription.latest_invoice?.payment_intent as string,
        //     amount: subscription.latest_invoice?.amount_due as number,
        //     status: subscription.latest_invoice?.status as string,
        //   },
        // });

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("⚠️ Payment failed for invoice:", invoice.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // ✅ Always end the response without returning it
    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error("Webhook handling error:", err.message);
    res.status(500).send("Webhook internal error");
  }
};
