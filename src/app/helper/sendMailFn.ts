import nodemailer from "nodemailer";
import { prisma } from "../../utils/prisma";

export const sendEmailFn = async (payload: {
  email: string,
  type: "otp" | "blocked" | "activated" | "rejected",
  otp?: number
  reason?: string
}) => {
  try {
    const findUser = await prisma.user.findUnique({
      where: {
        email: payload.email
      },
    });

    const companyName = "XYZ Services";

    const adminEmail = process.env.MAIL_USER;
    const adminPass = process.env.MAIL_PASS;

    // Create the transporter object using SMTP settings
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: adminEmail,
        pass: adminPass, // Gmail App Password
      },
    });


    // ----------------------- //
    // EMAIL TEMPLATES
    // ----------------------- //
    const templates = {
      otp: {
        subject: "Your OTP Code",
        html: `
          <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:600px; margin:auto; padding:30px; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.08); background-color:#ffffff; border:1px solid #e0e0e0;">
            <h2 style="color:#2c3e50; text-align:center;">🔐 One-Time Password (OTP)</h2>
            <p style="font-size:16px; color:#555;">Hello <strong>${findUser?.name || "User"}</strong>,</p>
            <p style="font-size:16px; color:#555;">Your OTP for verification is:</p>
            <div style="text-align:center; margin:25px 0;">
              <span style="font-size:28px; font-weight:bold; padding:15px 30px; border:2px dashed #3498db; border-radius:10px; background:#ecf5fc; letter-spacing:3px;">
                ${payload.otp}
              </span>
            </div>
            <p style="font-size:16px; color:#555;">This code will expire in <strong>5 minutes</strong>.</p>
            <p style="font-size:14px; color:#888; font-style:italic;">If you did not request this, please ignore this email.</p>
            <hr style="margin:30px 0; border-top:1px solid #eee;">
            <p style="font-size:16px; color:#555;">Best regards,</p>
            <p style="font-size:16px; color:#3498db; font-weight:bold;">${companyName} Team</p>
          </div>
        `,
      },

      blocked: {
        subject: "Your Account Has Been Blocked",
        html: `
          <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:600px; margin:auto; padding:30px; border-radius:12px; background:#fff; border:1px solid #e0e0e0; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <h2 style="color:#d9534f; text-align:center;">🚫 Account Blocked</h2>
            <p style="font-size:16px; color:#555;">
              Hello <strong>${findUser?.name || "User"}</strong>,
            </p>
            <p style="font-size:16px; color:#555;">
              Your account has been <strong>temporarily blocked</strong> due to suspicious activity.
            </p>
            <p style="font-size:16px; color:#555;">
              If you believe this is a mistake, please contact support.
            </p>
            <hr style="margin:30px 0; border-top:1px solid #eee;">
            <p style="font-size:16px; color:#555;">Best regards,</p>
            <p style="font-size:16px; color:#3498db; font-weight:bold;">${companyName} Support Team</p>
          </div>
        `,
      },

      activated: {
        subject: "Your Account Is Now Active",
        html: `
          <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:600px; margin:auto; padding:30px; border-radius:12px; background:#fff; border:1px solid #e0e0e0; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <h2 style="color:#5cb85c; text-align:center;">🎉 Account Activated</h2>
            <p style="font-size:16px; color:#555;">
              Hello <strong>${findUser?.name || "User"}</strong>,
            </p>
            <p style="font-size:16px; color:#555;">
              Great news! Your account has been <strong>successfully activated</strong>.
            </p>
            <p style="font-size:16px; color:#555;">
              You can now log in and start using all available features of our platform.
            </p>
            <p style="font-size:16px; color:#555;">
              If you need any assistance, our support team is always here to help.
            </p>
            <hr style="margin:30px 0; border-top:1px solid #eee;">
            <p style="font-size:16px; color:#555;">Best regards,</p>
            <p style="font-size:16px; color:#3498db; font-weight:bold;">${companyName} Team</p>
          </div>
        `,
      },

      rejected: {
        subject: "Your Approval Request Has Been Rejected",
        html: `
          <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; max-width:600px; margin:auto; padding:30px; border-radius:12px; background:#fff; border:1px solid #e0e0e0; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <h2 style="color:#e67e22; text-align:center;">❗ Approval Request Rejected</h2>
            <p style="font-size:16px; color:#555;">
              Hello <strong>${findUser?.name || "User"}</strong>,
            </p>
            <p style="font-size:16px; color:#555;">
              We regret to inform you that your approval request has been <strong>rejected</strong> after reviewing the submitted documents.
            </p>
            <p style="font-size:16px; color:#555;">
              <strong>Reason for rejection:</strong><br />
              ${payload.reason}
            </p>
            <p style="font-size:16px; color:#555;">
              You may submit a new request by providing the correct and complete documents.
              If you believe this decision was made in error, please contact our support team for assistance.
            </p>
            <hr style="margin:30px 0; border-top:1px solid #eee;">
            <p style="font-size:16px; color:#555;">Best regards,</p>
            <p style="font-size:16px; color:#3498db; font-weight:bold;">${companyName} Verification Team</p>
          </div>
        `,
      },
    };

    const chosenTemplate = templates[payload.type];

    // Sending the email
    const info = await transporter.sendMail({
      from: `${adminEmail}`,
      to: payload.email,
      subject: chosenTemplate.subject,
      html: chosenTemplate.html,
    });

    // Logging success message
    console.log("Email sent successfully:", info.messageId);
    return { success: true, message: "Email sent successfully" };

  } catch (error) {
    // Logging error message if the email fails to send
    console.error("Error sending email:", error);
    return { success: false, message: "Failed to send email", error };
  }
};
