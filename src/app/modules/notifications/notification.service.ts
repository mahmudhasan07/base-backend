import { StatusCodes } from "http-status-codes";
import { prisma } from "../../../utils/prisma";
import ApiError from "../../error/ApiErrors";
import admin from "../../helper/firebaseAdmin";
const sendSingleNotification = async (
  senderId: string,
  receiverId: string,
  payload: any
) => {

  const findSender = await prisma.user.findUnique({
    where: { id: senderId },
  });

  if (!findSender) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Sender not found");
  }

  const findReceiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!findReceiver) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Receiver not found");
  }

  await prisma.notifications.create({
    data: {
      receiverId: receiverId,
      senderId: senderId,
      ...payload,
    },
  });

  if (!findReceiver?.fcmToken) {
    return;
  }

  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
    },
    token: findReceiver.fcmToken,
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
const sendNotifications = async (senderId: string, body: { title: string; body: string }) => {
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
    title: body.title,
    body: body.body,
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
      title: body.title,
      body: body.body,
    },
    tokens: fcmTokens,
  };

  const response = await admin.messaging().sendEachForMulticast(message as any);

  // Find indices of successful responses
  const successIndices = response.responses
    .map((res: admin.messaging.SendResponse, idx: number) =>
      res.success ? idx : null
    )
    .filter((idx: number | null): idx is number => idx !== null);

  // Collect failed tokens
  const failedTokens = response.responses
    .map((res: any, idx: any) => (!res.success ? fcmTokens[idx] : null))
    .filter((token: any) => token !== null);

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    failedTokens,
    successIndices,
  };
};

const getNotificationsFromDB = async (id: string) => {
  const notifications = await prisma.notifications.findMany({
    where: {
      receiverId: id,
    },
    orderBy: { createdAt: "desc" },
  });

   await prisma.notifications.updateMany({
    where: {
      receiverId: id,
    },
    data: {
      read: true,
    },
  })


  return notifications;
};

const isReadNotificationFromDB = async (id: string) => {
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
};

export const notificationServices = {
  sendSingleNotification,
  sendNotifications,
  getNotificationsFromDB,
  isReadNotificationFromDB,
};
