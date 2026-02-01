import { Request, Response } from "express";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const webHookService = async (
  req: Request,
  res: Response
): Promise<void> => {
  

};
