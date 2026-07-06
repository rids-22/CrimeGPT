import nodemailer from 'nodemailer';

// Initialize an SMTP transporter only if credentials are actually configured.
// This mirrors the pattern used in ai.service.ts: the app should never crash
// or block login just because email hasn't been set up yet (e.g. during local
// development or a hackathon demo where SMTP credentials aren't ready).
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailConfigured = !!(emailUser && emailPass);

let transporter: nodemailer.Transporter | null = null;
if (emailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: { user: emailUser, pass: emailPass }
  });
}

export function isEmailConfigured(): boolean {
  return emailConfigured;
}

/**
 * Sends a 6-digit OTP code to the given email address.
 * Returns true if an email was actually dispatched via SMTP.
 * If SMTP isn't configured, the caller is responsible for falling back
 * (e.g. logging/returning the OTP directly in non-production environments)
 * so the app remains usable without requiring real email setup.
 */
export async function sendOtpEmail(to: string, otp: string, name: string): Promise<boolean> {
  if (!transporter) {
    console.warn(`⚠️ EMAIL_USER/EMAIL_PASS not configured — cannot send OTP email to ${to}.`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"CrimeGPT Security" <${emailUser}>`,
      to,
      subject: 'CrimeGPT Login Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0b1528; color: #e2e8f0; border-radius: 8px;">
          <h2 style="color: #f5b942; margin-bottom: 4px;">CrimeGPT Security Verification</h2>
          <p style="color: #94a3b8; font-size: 13px;">Hello ${name},</p>
          <p style="color: #94a3b8; font-size: 13px;">Use the code below to complete your login. This code expires in 5 minutes.</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; margin: 16px 0; background: #050b14; border-radius: 6px; color: #ffffff;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 11px;">If you did not attempt to log in, please contact your system administrator immediately.</p>
        </div>
      `
    });
    return true;
  } catch (err: any) {
    console.error('Failed to send OTP email:', err.message);
    return false;
  }
}
