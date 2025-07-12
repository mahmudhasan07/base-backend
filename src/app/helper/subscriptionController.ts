// cron/expireSubscriptions.ts
import cron from "node-cron";
import { prisma } from "../../utils/prisma";

// Run every day at 2:00 AM
cron.schedule("0 2 * * *", async () => {
  console.log("Running subscription expiry checker...");

  const today = new Date();

  const expiredSubscriptions = await prisma.subscriptionUser.findMany({
    where: {
      subscriptionEnd: {
        lt: today,
      },
    },
    include: {
      userDetails: true,
    },
  });

  for (const sub of expiredSubscriptions) {
    // Update user status to BLOCKED
    await prisma.user.update({
      where: { id: sub.userId },
      data: { subscriptionPlan: "EXPIRED" },
    });

    // Optionally update subscription status too
    await prisma.subscriptionUser.update({
      where: { id: sub.id },
      data: { subscriptionStatus: "CANCELLED" }, // or "inactive"
    });

    console.log(`Blocked user: ${sub.userId}`);
  }

  console.log("Subscription check complete.");
});
