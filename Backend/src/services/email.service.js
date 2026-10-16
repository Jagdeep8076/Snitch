import nodemailer from "nodemailer";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const EMAIL_FROM = process.env.EMAIL_FROM || "SNITCH Studio <no-reply@snitch.co.in>";

/**
 * Configure Nodemailer transport.
 * Supports standard SMTP env vars (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).
 * If SMTP credentials are missing, falls back to secure simulation with formatted console output.
 */
function getTransporter() {
    const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;

    if (host && user && pass) {
        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
        });
    }

    return null;
}

/**
 * Generates the SNITCH-branded HTML email layout.
 */
function renderEmailTemplate({ title, preheader, bodyHtml, ctaText, ctaUrl, footerNote }) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0b0d;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e4e4e7;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0b0b0d;
      padding: 40px 16px;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background: #151518;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      padding: 32px 36px 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .brand {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 4px;
      color: #ffffff;
      text-transform: uppercase;
      margin: 0;
    }
    .tagline {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #71717a;
      margin-top: 4px;
    }
    .content {
      padding: 36px;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 16px;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #a1a1aa;
      margin: 0 0 20px;
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #ffffff;
      color: #09090b !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 14px 32px;
      border-radius: 9999px;
    }
    .link-fallback {
      font-size: 12px;
      color: #71717a;
      word-break: break-all;
      background: rgba(255, 255, 255, 0.03);
      padding: 12px;
      border-radius: 8px;
      margin-top: 24px;
    }
    .link-fallback a {
      color: #d4d4d8;
    }
    .footer {
      padding: 24px 36px;
      background: #111113;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 12px;
      color: #71717a;
      text-align: center;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table role="presentation" class="container" width="100%" cellspacing="0" cellpadding="0">
      <tr>
        <td class="header">
          <div class="brand">SNITCH</div>
          <div class="tagline">Official Studio Access</div>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${bodyHtml}
          ${ctaText && ctaUrl ? `
            <div class="btn-container">
              <a href="${ctaUrl}" class="btn" target="_blank">${ctaText}</a>
            </div>
            <div class="link-fallback">
              Or copy and paste this link into your browser:<br />
              <a href="${ctaUrl}">${ctaUrl}</a>
            </div>
          ` : ""}
        </td>
      </tr>
      <tr>
        <td class="footer">
          ${footerNote || "This single-use link is valid for 24 hours."}<br />
          If you did not make this request, please disregard this email. Your account remains secure.<br /><br />
          &copy; ${new Date().getFullYear()} SNITCH Inc. All rights reserved.
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;
}

/**
 * Sends an email verification link to the newly registered user.
 */
export async function sendVerificationEmail({ email, fullname, token }) {
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;
    const title = "Verify Your SNITCH Account";

    const bodyHtml = `
      <h1>Welcome to SNITCH, ${fullname || "there"}.</h1>
      <p>Thank you for creating an account with SNITCH Studio. To activate your account and access exclusive drops, seamless checkout, and orders, please verify your email address.</p>
    `;

    const html = renderEmailTemplate({
        title,
        bodyHtml,
        ctaText: "Verify Account",
        ctaUrl: verifyUrl,
        footerNote: "This single-use verification link will expire in 24 hours.",
    });

    const transporter = getTransporter();

    if (transporter) {
        try {
            await transporter.sendMail({
                from: EMAIL_FROM,
                to: email,
                subject: "Verify your SNITCH account",
                html,
            });
            console.log(`[EMAIL] Verification email sent successfully to ${email}`);
            return { success: true };
        } catch (err) {
            console.error(`[EMAIL ERROR] Failed to send email via SMTP to ${email}:`, err.message);
            // Fall back to logging link so registration flow is never blocked
        }
    }

    // Development / fallback simulation
    console.log("\n=======================================================");
    console.log("  [SIMULATED EMAIL DELIVERY] - SNITCH EMAIL SERVICE");
    console.log(`  To:      ${email} (${fullname || "User"})`);
    console.log(`  Subject: Verify your SNITCH account`);
    console.log(`  Link:    ${verifyUrl}`);
    console.log("=======================================================\n");

    return { success: true, simulated: true, verifyUrl };
}

/**
 * Sends a password reset link (if required).
 */
export async function sendPasswordResetEmail({ email, fullname, token }) {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
    const title = "Reset Your SNITCH Password";

    const bodyHtml = `
      <h1>Password Reset Request</h1>
      <p>We received a request to reset the password for your SNITCH account (${email}). Click the button below to choose a new password.</p>
    `;

    const html = renderEmailTemplate({
        title,
        bodyHtml,
        ctaText: "Reset Password",
        ctaUrl: resetUrl,
        footerNote: "This password reset link is valid for 1 hour.",
    });

    const transporter = getTransporter();

    if (transporter) {
        try {
            await transporter.sendMail({
                from: EMAIL_FROM,
                to: email,
                subject: "Reset your SNITCH password",
                html,
            });
            return { success: true };
        } catch (err) {
            console.error(`[EMAIL ERROR] Failed to send reset email to ${email}:`, err.message);
        }
    }

    console.log("\n=======================================================");
    console.log("  [SIMULATED EMAIL DELIVERY] - PASSWORD RESET");
    console.log(`  To:   ${email}`);
    console.log(`  Link: ${resetUrl}`);
    console.log("=======================================================\n");

    return { success: true, simulated: true, resetUrl };
}
