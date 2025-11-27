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
    })
        .min(8, {
            message: "Password must be at least 6 characters long!",
        })
        .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
            message:
                "Password must contain at least one letter with uppercase, one special character and one number!",
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

const resetPassword = z.object({
    token: z
        .string({
            required_error: "token is required!",
        }),
    password: z.string({
        required_error: "Password is required!",
    })
        .min(8, {
            message: "Password must be at least 6 characters long!",
        })
        .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
            message:
                "Password must contain at least one letter with uppercase, one special character and one number!",
        }),
});

const changePassword = z.object({
    oldPassword: z.string({
        required_error: "Old password is required!",
    }),
    newPassword: z.string({
        required_error: "New password is required!",
    }),
});

export const authValidation = { loginUser, forgotPassword, verifyOtp, changePassword, resetPassword };
