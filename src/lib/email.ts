import { Resend } from "resend";

const APP_URL    = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const FROM_EMAIL = process.env.EMAIL_FROM ?? "PryroWriter <noreply@pryrowriter.com>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set. Add it to your .env file.");
  return new Resend(key);
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  userName: string | null,
) {
  const resetUrl = `${APP_URL}/reset-password/${token}`;
  const name     = userName ?? "there";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#0D6CFE;padding:28px 32px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">PryroWriter</p>
              <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">AI-Powered Proposal Writer</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#111827;">Reset your password</h1>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
                Hi ${name}, we received a request to reset the password for your PryroWriter account.
                Click the button below to choose a new password.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#0D6CFE;border-radius:8px;">
                    <a href="${resetUrl}"
                       style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
                This link expires in <strong>1 hour</strong>. If you didn't request a password reset,
                you can safely ignore this email — your password won't change.
              </p>
              <p style="margin:16px 0 0;font-size:12px;color:#d1d5db;word-break:break-all;">
                Or copy this URL: ${resetUrl}
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #f3f4f6;">
              <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
                © ${new Date().getFullYear()} PryroWriter · You're receiving this because a password reset was requested.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const { error } = await getResend().emails.send({
    from:    FROM_EMAIL,
    to:      [to],
    subject: "Reset your PryroWriter password",
    html,
  });

  if (error) throw new Error(error.message);
}
