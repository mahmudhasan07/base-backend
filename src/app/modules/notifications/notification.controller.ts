import { Request, Response } from "express";
// import catchAsync from "../../utils/catchAsync";
// import sendResponse from "../../utils/sendResponse";
import { notificationServices } from "./notification.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../middleware/sendResponse";

const sendNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const payload = req.body;
  const senderId = req.user.id;
  const notification = await notificationServices.sendSingleNotification(
    senderId,
    userId,
    payload
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "notification sent successfully",
    data: notification,
  });
});

const sendNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const notifications = await notificationServices.sendNotifications(
    userId,
    req
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "notifications sent successfully",
    data: notifications,
  });
});

// const getNotifications = catchAsync(async (req: Request, res: Response) => {
//   const options = req.query;
//   const notifications = await notificationServices.getNotificationsFromDB(
//     req,
//     options
//   );

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Notifications retrieved successfully",
//     data: notifications,
//   });
// });

const getNotifications = catchAsync(async (req: any, res: any) => {
  const notifications = await notificationServices.getNotificationsFromDB(req);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved successfully",
    data: notifications,
  });
});


const getSingleNotificationById = catchAsync(
  async (req: Request, res: Response) => {
    const notificationId = req.params.notificationId;
    const notification = await notificationServices.isReadNotificationFromDB(
      notificationId
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Notification retrieved successfully",
      data: notification,
    });
  }
);

export const notificationController = {
  sendNotification,
  sendNotifications,
  getNotifications,
  getSingleNotificationById,
};
