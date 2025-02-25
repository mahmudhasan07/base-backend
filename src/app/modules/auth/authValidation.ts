import { z } from "zod";

export const authValidation = z.object({
    email: z.string().email({ message: "Use valid email" }),
    password: z.string()
})