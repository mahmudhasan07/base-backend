// import admin from "../../../helpers/firebaseAdmin";
// import { paginationHelper } from "../../../helpers/paginationHelper";
import { prisma } from "../../../utils/prisma";
import ApiError from "../../error/ApiErrors";
import admin from "../../helper/firebaseAdmin";
// import ApiError from "../../errors/ApiError";
// import { IPaginationOptions } from "../../interface/pagination.type";
// import prisma from "../../utilis/prisma";

// Send notification to a single user
const sendSingleNotification = async (senderId: string, userId: string, payload: any) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.fcmToken) {
    throw new ApiError(404, "User not found with FCM token");
  }

  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    token: user.fcmToken,
  };

  await prisma.notifications.create({
    data: {
      receiverId: userId,
      senderId: senderId,
      title: payload.title,
      body: payload.body,
    },
  });

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error: any) {
    if (error.code === "messaging/invalid-registration-token") {
      throw new ApiError(400, "Invalid FCM registration token");
    } else if (error.code === "messaging/registration-token-not-registered") {
      throw new ApiError(404, "FCM token is no longer registered");
    } else {
      throw new ApiError(500, "Failed to send notification");
    }
  }
};

// Send notifications to all users with valid FCM tokens
const sendNotifications = async (senderId: string, req: any) => {
  const users = await prisma.user.findMany({
    where: {
      fcmToken: {},
    },
    select: {
      id: true,
      fcmToken: true,
    },
  });

  if (!users || users.length === 0) {
    throw new ApiError(404, "No users found with FCM tokens");
  }

  const fcmTokens = users.map((user) => user.fcmToken);

  const message = {
    notification: {
      title: req.body.title,
      body: req.body.body,
    },
    tokens: fcmTokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message as any);

  // Find indices of successful responses
  const successIndices = response.responses
    .map((res: admin.messaging.SendResponse, idx: number) => (res.success ? idx : null))
    .filter((idx: number | null): idx is number => idx !== null);

  // Filter users by success indices
  const successfulUsers = successIndices.map((idx: number) => users[idx]);

  // Prepare notifications data for only successfully notified users
  const notificationData = successfulUsers.map((user: any) => ({
    senderId: senderId,
    receiverId: user.id,
    title: req.body.title,
    body: req.body.body,
  }));

  // Save notifications only if there is data
  if (notificationData.length > 0) {
    await prisma.notifications.createMany({
      data: notificationData,
    });
  }

  // Collect failed tokens
  const failedTokens = response.responses
    .map((res: any, idx: any) => (!res.success ? fcmTokens[idx] : null))
    .filter((token: any) => token !== null);

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    failedTokens,
  };
};



const getNotificationsFromDB1 = async (
  req: any,
) => {
  // const { page, limit, skip } = paginationHelper.calculatePagination(options);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayNotifications = await prisma.notifications.findMany({
    where: {
      receiverId: req.user.id,
      createdAt: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      senderId: true,
      createdAt: true,
      sender: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  const last7DaysStart = new Date();
  last7DaysStart.setDate(last7DaysStart.getDate() - 7);
  last7DaysStart.setHours(0, 0, 0, 0);

  const last7DaysEnd = new Date(todayStart);
  last7DaysEnd.setMilliseconds(-1);

  const last7DaysNotifications = await prisma.notifications.findMany({
    where: {
      receiverId: req.user.id,
      createdAt: {
        gte: last7DaysStart,
        lte: last7DaysEnd,
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      senderId: true,
      createdAt: true,
      sender: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return {
    meta: {
      total: await prisma.notifications.count({
        where: { receiverId: req.user.id },
      }),
    },
    todayNotifications,
    last7DaysNotifications,
  };
};

const getNotificationsFromDB = async (req: any) => {
  const notifications = await prisma.notifications.findMany({
    where: {
      receiverId: req.user.id,
    },
    orderBy: { createdAt: "desc" },
  });

  if (notifications.length === 0) {
    throw new ApiError(404, "No notifications found for the user");
  }

  return notifications;
};



const getSingleNotificationFromDB = async (
  req: any,
  notificationId: string
) => {
  const notification = await prisma.notifications.findFirst({
    where: {
      id: notificationId,
      receiverId: req.user.id,
    },
  });

  const updatedNotification = await prisma.notifications.update({
    where: { id: notificationId },
    data: { read: true },
    select: {
      id: true,
      title: true,
      body: true,
      senderId: true,
      createdAt: true,
      sender: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return updatedNotification;
};

export const notificationServices = {
  sendSingleNotification,
  sendNotifications,
  getNotificationsFromDB,
  getSingleNotificationFromDB,
};
