import z from "zod";
const loginUser = z.object({
    email: z
        .string({
            required_error: "Email is required!",
        })
        .email({
            message: "Invalid email format!",
        }),
    password: z.string({
        required_error: "Password is required!",
    }),
});

const forgotPassword = z.object({
    email: z
        .string({
            required_error: "Email is required!",
        })
        .email({
            message: "Invalid email format!",
        }),
});

const verifyOtp = z.object({
    email: z
        .string({
            required_error: "Email is required!",
        })
        .email({
            message: "Invalid email format!",
        }).optional(),
    otp: z.number({
        required_error: "OTP is required!",
    }),
});

const changePassword = z.object({
    newPassword: z.string({
        required_error: "New password is required!",
    }),
});

export const authValidation = { loginUser, forgotPassword, verifyOtp, changePassword };
