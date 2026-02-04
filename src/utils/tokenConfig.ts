export const TOKEN_EXPIRY = {
  LOGIN: "7d",
  ADMIN_LOGIN: "24h",
  OTP_VERIFY: "30m",
  PASSWORD_RESET: "30m"
} as const;

export type TokenType = keyof typeof TOKEN_EXPIRY;