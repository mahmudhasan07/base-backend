import { z } from "zod";

export const UserValidation = z.object({
    name: z.string().min(2).max(255),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters long").regex(/[a-zA-Z0-9]/, "Password must contain only letters and numbers")
})

