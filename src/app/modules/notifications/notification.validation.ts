import { z } from "zod";

const cerateNotification = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required" }),
    body: z.string({ required_error: "Body is required" }),
  }),
});

export const NotificationValidation = { cerateNotification };
