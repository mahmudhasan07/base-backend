import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { paymentService } from "./payment.service";
import sendResponse from "../../middleware/sendResponse";
import { StatusCodes } from "http-status-codes";

const createPaymentController = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body as any;
    const { id: userId } = req.user;

    const result = await paymentService.createIntentInStripe(payload, userId);
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      message: "Payment created successfully",
      data: result,
      success: true,
    });
  }
);

const saveCardController = catchAsync(async (req: Request, res: Response) => {
  const body = req.body as any;
  const { id: userId } = req.user;
  const payload = { ...body, userId };

  const result = await paymentService.saveCardInStripe(payload);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    message: "Card saved successfully",
    data: result,
    success: true,
  });
});

const getSaveCardController = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const result = await paymentService.getSaveCardsFromStripe(userId);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      message: "Card saved successfully",
      data: result,
      success: true,
    });
  }
);

const deleteCardController = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as any;
  const { id: userId } = req.user;
  const result = await paymentService.deleteCardFromStripe(
    userId,
    payload.last4
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    message: "Card deleted successfully",
    data: result,
    success: true,
  });
});

export const paymentController = {
  createPaymentController,
  saveCardController,
  getSaveCardController,
  deleteCardController,
};
