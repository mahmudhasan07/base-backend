import { z } from "zod";

const createPaymentValidation = z.object({
    amount: z.number().min(1, "Amount must be greater than 0"),
    paymentMethod: z.string().min(1, "Payment method is required").optional(),
    paymentMethodId: z.string().min(1, "Payment method id is required"),
    bookId: z.string().min(1, "Book id is required"),
})

export const PaymentValidation = { createPaymentValidation }