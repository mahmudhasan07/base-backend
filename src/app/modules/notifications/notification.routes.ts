import express from 'express';
import { notificationController } from './notification.controller';

import { NotificationValidation } from "./notification.validation";
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';

const router = express.Router();

router.post(
  "/send-notification/:userId",
  validateRequest(NotificationValidation.cerateNotification),
  auth(),
  notificationController.sendNotification
);

router.post(
  "/send-notification",
  validateRequest(NotificationValidation.cerateNotification),
  auth(),
  notificationController.sendNotifications
);

router.get('/', auth(), notificationController.getNotifications);
router.get(
  '/:notificationId',
  auth(),
  notificationController.getSingleNotificationById,
);

export const NotificationsRouters = router;
