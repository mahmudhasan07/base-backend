// import admin from "../../../helpers/firebaseAdmin";
// import { paginationHelper } from "../../../helpers/paginationHelper";
import { prisma } from "../../../utils/prisma";
import ApiError from "../../error/ApiErrors";
import admin from "../../helper/firebaseAdmin";
// import ApiError from "../../errors/ApiError";
// import { IPaginationOptions } from "../../interface/pagination.type";
// import prisma from "../../utilis/prisma";

// Send notification to a single user
const sendSingleNotification = async (
  senderId: string,
  userId: string,
  payload: any
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  await prisma.notifications.create({
    data: {
      receiverId: userId,
      senderId: senderId,
      title: payload.title,
      body: payload.body,
    },
  });

  if (!user?.fcmToken) {
    // throw new ApiError(404, "User not found with FCM token");
    return;
  }

  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    token: user.fcmToken,
  };

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


  const notificationData = users.map((user: any) => ({
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

  // Collect failed tokens
  const failedTokens = response.responses
    .map((res: any, idx: any) => (!res.success ? fcmTokens[idx] : null))
    .filter((token: any) => token !== null);

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    failedTokens,
    successIndices
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

const isReadNotificationFromDB = async(id : string)=>{
  const notifications = await prisma.notifications.findUnique({
    where: {
      id: id,
      read: false,
    },
  });

  if (!notifications) {
    throw new ApiError(404, "No unread notifications found for the user");
  }

  await prisma.notifications.update({
    where: { id: id },
    data: { read: true },
  });

  return notifications;
}

export const notificationServices = {
  sendSingleNotification,
  sendNotifications,
  getNotificationsFromDB,
  isReadNotificationFromDB,
};
