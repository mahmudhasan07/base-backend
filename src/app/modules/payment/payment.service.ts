import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../utils/prisma";
import ApiError from "../../error/ApiErrors";
import Stripe from "stripe";
import { stripe } from "../../../config/stripe";

interface payloadType {
    amount: number;
    paymentMethodId: string;
    paymentMethod?: string;
    bookId: string;
}

const createIntentInStripe = async (payload: payloadType, userId: string) => {


    const payment = await stripe.paymentIntents.create({
        amount: Math.round(payload.amount * 100),
        currency: payload?.paymentMethod || "usd",
        payment_method: payload.paymentMethodId,
        confirm: true,
        automatic_payment_methods: {
            enabled: true,
            allow_redirects: "never",
        },
    });

    console.log(payment);


    if (payment.status !== "succeeded") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Payment failed");
    }

    await prisma.payment.create({
        data: {
            userId: userId,
            amount: payload.amount,
            paymentMethod: payload.paymentMethod,
            bookingId: payload.bookId,
        },
    });

    const completePayment = await prisma.booking.update({
        where: {
            id: payload.bookId,
        },
        data: {
            isPaid: true,
        },
    });

    return completePayment;
};

const saveCardInStripe = async (payload: { paymentMethodId: string; cardholderName: string; }, userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    const { paymentMethodId, cardholderName } = payload;
    let customerId = user.customerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: user.email as string,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });
        customerId = customer.id;
        await prisma.user.update({
            where: { id: userId },
            data: { customerId },
        });
    }

    const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
    });

    const newCard: any = await stripe.paymentMethods.retrieve(paymentMethodId);

    const existingCard = paymentMethods.data.find(
        (card: any) => card.card.last4 === newCard.card.last4
    );

    if (existingCard) {
        throw new ApiError(409, "This card is already saved.");
    } else {
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId,
        });
        await stripe.paymentMethods.update(paymentMethodId, {
            billing_details: {
                name: cardholderName,
            },
        });
        return {
            message: "Customer created and card saved successfully",
        };
    }
};

const getSaveCardsFromStripe = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new ApiError(404, "User not found!");
    }
    try {
        const saveCard = await stripe.paymentMethods.list({
            customer: user?.customerId || "",
            type: "card",
        });

        const cardDetails = saveCard.data.map((card: Stripe.PaymentMethod) => {
            return {
                id: card.id,
                brand: card.card?.brand,
                last4: card.card?.last4,
                type: card.card?.checks?.cvc_check === "pass" ? "valid" : "invalid",
                exp_month: card.card?.exp_month,
                exp_year: card.card?.exp_year,
                billing_details: card.billing_details,
            }
        })

        return cardDetails;

    } catch {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }
}

const deleteCardFromStripe = async (userId: string, last4: string) => {

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new ApiError(404, "User not found!");
    }
    if (!user.customerId) {
        throw new ApiError(404, "Card is not saved");
    }

    const paymentMethods = await stripe.paymentMethods.list({
        customer: user.customerId,
        type: "card",
    });
    const card = paymentMethods.data.find((card: any) => card.card.last4 === last4);
    if (!card) {
        throw new ApiError(404, "Card not found!");
    }
    await stripe.paymentMethods.detach(card.id);

}





export const paymentService = { createIntentInStripe, saveCardInStripe, getSaveCardsFromStripe, deleteCardFromStripe };