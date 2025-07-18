// cron/expireSubscriptions.ts
import cron from "node-cron";
import { prisma } from "../../utils/prisma";

// Export a function to initialize the cron job
export const startSubscriptionExpiryCron = () => {
  // Run every day at 2:00 AM
  cron.schedule("0 2 * * *", async () => {
    console.log("🔁 Running subscription expiry checker...");

    const today = new Date();

    const expiredSubscriptions = await prisma.subscriptionUser.findMany({
      where: {
        subscriptionEnd: {
          lt: today,
        },
        subscriptionStatus: {
          not: "active",
        },
      },
      include: {
        userDetails: true,
      },
    });

    if (expiredSubscriptions.length === 0) {
      console.log("✅ No expired subscriptions found.");
      return;
    }

    for (const sub of expiredSubscriptions) {
      // Update user status to BLOCKED or change plan to "EXPIRED"
      await prisma.user.update({
        where: { id: sub.userId },
        data: {
          status: "BLOCKED", // Or your logic
        },
      });

      // Update subscription status
      await prisma.subscriptionUser.update({
        where: { id: sub.id },
        data: { subscriptionStatus: "CANCELLED" },
      });
    }

  });
};
