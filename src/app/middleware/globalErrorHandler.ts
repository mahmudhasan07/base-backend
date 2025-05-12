import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import handleZodError from "../../utils/handleZodError";
import ApiError from "../error/ApiErrors";
import handlePrismaValidation from "../../utils/handlePrismaValidation";

// TODO Replace `config.NODE_ENV` with your actual environment configuration

// TODO
const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
};

const GlobalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: any = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong!";
  let errorSources = [];
  let errorDetails = err || null;
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorDetails;
  }
  // Handle Custom ApiError
  else
    if (err instanceof ApiError) {
      statusCode = err.statusCode;
      message = err.message;
      errorSources = [{ type: "ApiError", details: err.message }];
    }
    // handle prisma client validation errors
     // handle prisma client validation errors
    else if (err instanceof Prisma.PrismaClientValidationError) {
      statusCode = StatusCodes.BAD_REQUEST;
      message = handlePrismaValidation(err.message);
      errorSources.push("Prisma Client Validation Error");
    }
    // Prisma Client Initialization Error
    else if (err instanceof Prisma.PrismaClientInitializationError) {
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      message =
        "Failed to initialize Prisma Client. Check your database connection or Prisma configuration.";
      errorSources.push("Prisma Client Initialization Error");
    }
    // Prisma Client Rust Panic Error
    else if (err instanceof Prisma.PrismaClientRustPanicError) {
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      message =
        "A critical error occurred in the Prisma engine. Please try again later.";
      errorSources.push("Prisma Client Rust Panic Error");
    }
    // Prisma Client Unknown Request Error
    else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
      statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
      message = "An unknown error occurred while processing the request.";
      errorSources.push("Prisma Client Unknown Request Error");
    }
    // Generic Error Handling (e.g., JavaScript Errors)
    else if (err instanceof SyntaxError) {
      statusCode = StatusCodes.BAD_REQUEST;
      message = "Syntax error in the request. Please verify your input.";
      errorSources.push("Syntax Error");
    } else if (err instanceof TypeError) {
      statusCode = StatusCodes.BAD_REQUEST;
      message = "Type error in the application. Please verify your input.";
      errorSources.push("Type Error");
    } else if (err instanceof ReferenceError) {
      statusCode = StatusCodes.BAD_REQUEST;
      message = "Reference error in the application. Please verify your input.";
      errorSources.push("Reference Error");
    }
    // Catch any other error type
    else {
      message = "An unexpected error occurred!";
      errorSources.push("Unknown Error");
    }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    stack: config.NODE_ENV === "development" ? err?.stack : null,
  });
};

export default GlobalErrorHandler;