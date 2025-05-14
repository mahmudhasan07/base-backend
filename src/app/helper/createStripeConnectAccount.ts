import { StatusCodes } from "http-status-codes";
import { stripe } from "../../config/stripe";
import { prisma } from "../../utils/prisma";
import ApiError from "../error/ApiErrors";
import { StripeConnectAccEmail } from "./StripeConnectAccEmail";

export const createStripeConnectAccount = async (userId: string) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new ApiError(404, "User not found!");
    }

    if (user?.connectAccountId === null && user?.email) {
        const stripeAccount = await stripe.accounts.create({
            type: "express",
            country: "US",
            email: user?.email,
            metadata: {
                userId: userId,
            },
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });


        if (!stripeAccount || !stripeAccount.id) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to create a Stripe account"
            );
        }
        let updateUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                connectAccountId: stripeAccount.id,
            },
        });
        StripeConnectAccEmail(updateUser);

        throw new ApiError(
            StatusCodes.EXPECTATION_FAILED,
            "We sent you an onboarding URL. Please check your email."
        );
    }
    else if (user?.connectAccountId) {
        const isAccount = await stripe.accounts.retrieve(
            user?.connectAccountId as string
        );


        if (!isAccount.details_submitted || !isAccount.charges_enabled) {
            await StripeConnectAccEmail(user);
            throw new ApiError(
                StatusCodes.EXPECTATION_FAILED,
                "We sent you an onboarding URL, Please check your email. If you face any issues, please contact support."
            );
        }
    }


}