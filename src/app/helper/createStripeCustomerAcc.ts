import { StatusCodes } from "http-status-codes";
import { stripe } from "../../config/stripe";
import ApiError from "../error/ApiErrors";
import { prisma } from "../../utils/prisma";

export const createStripeCustomerAcc = async (payload: any) => {
    const stripeCustomer = await stripe.customers.create({
        email: payload.email.trim(),
        name: payload.name || undefined,
        phone: payload.phone || undefined,
    })

    if (!stripeCustomer.id) {
        throw new ApiError(
            StatusCodes.EXPECTATION_FAILED,
            "Failed to create a Stripe customer"
        );
    }

    await prisma.user.update({
        where: {
            id: payload.id
        },
        data: {
            customerId: stripeCustomer.id
        }
    })
}