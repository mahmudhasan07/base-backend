"use strict";
const OTPFn = (payload) => {
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333;">Your OTP Code</h2>
                <div style="text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; color: #333; padding: 10px 20px; border: 1px solid #ddd; border-radius: 5px; background-color: #f9f9f9;">${otp}</span>
                </div>
                <p style="font-size: 16px; color: black;">Please use this code to complete your verification. This code is valid for 10 minutes.</p>
                <p style="font-size: 16px; color: black;">If you did not request this code, please ignore this email.</p>
                <p style="font-size: 16px; color: #555;">Thank you,</p>
                <p style="font-size: 16px; color: #555;">The Boffo Team</p>
            </div>`;
};
