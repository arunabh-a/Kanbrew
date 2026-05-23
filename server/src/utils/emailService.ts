import nodemailer from "nodemailer";
import * as crypto from "crypto";

/**
 * Single transporter instance reused across calls.
 * Created lazily on first use. Pooled connections avoid
 * the overhead of a new TCP handshake per email.
 */
let _transporter: nodemailer.Transporter | null = null;

const getTransporter = (): nodemailer.Transporter => {
    if (_transporter) return _transporter;

    _transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587"),
        // false → STARTTLS on port 587 (correct for Gmail)
        // true  → implicit TLS on port 465
        secure: parseInt(process.env.EMAIL_PORT || "587") === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Gmail app password (not your login password)
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5,
        connectionTimeout: 30000,
        greetingTimeout: 15000,
        socketTimeout: 30000,
        tls: {
            // Always verify the server cert in production.
            // In dev this can be relaxed via NODE_ENV=development.
            rejectUnauthorized: process.env.NODE_ENV === "production",
            // Do NOT specify `ciphers: "SSLv3"` — SSLv3 is broken (POODLE, 2014)
            // and modern OpenSSL rejects it. Let Node pick a secure default.
        },
    });

    return _transporter;
};

export const generateVerificationToken = (): string => {
    return crypto.randomBytes(32).toString("hex");
};

const buildVerificationEmail = (
    name: string,
    verificationUrl: string,
): string => `
  <div style="background-color: #0d1320; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 480px; margin: 0 auto; padding: 0 20px;">

      <!-- Header -->
      <div style="text-align: center; padding-bottom: 32px;">
        <h1 style="color: #3b82f6; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin: 0;">
          Kanbrew
        </h1>
      </div>

      <!-- Card -->
      <div style="background-color: #111b2e; border: 1px solid #1e2d45; border-radius: 12px; padding: 36px 32px;">

        <h2 style="color: #f8fafc; font-size: 22px; font-weight: 600; margin: 0 0 8px 0; letter-spacing: -0.02em;">
          Welcome, ${name}
        </h2>
        <p style="color: #7b8ba5; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
          Verify your email to finish setting up your account.
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 0 0 28px 0;">
          <a href="${verificationUrl}"
             style="background-color: #3b82f6; color: #ffffff; padding: 12px 32px;
                    text-decoration: none; border-radius: 8px; font-weight: 600;
                    font-size: 14px; display: inline-block; letter-spacing: 0.01em;">
            Verify Email
          </a>
        </div>

        <!-- Divider -->
        <div style="border-top: 1px solid #1e2d45; margin: 0 0 20px 0;"></div>

        <p style="color: #4e5e78; font-size: 13px; line-height: 1.6; margin: 0 0 12px 0;">
          Or copy this link into your browser:
        </p>
        <p style="margin: 0 0 20px 0;">
          <a href="${verificationUrl}" style="color: #3b82f6; font-size: 13px; word-break: break-all; text-decoration: none;">
            ${verificationUrl}
          </a>
        </p>

        <p style="color: #3d4b61; font-size: 12px; line-height: 1.5; margin: 0;">
          This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.
        </p>

      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 24px;">
        <p style="color: #2e3b50; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Kanbrew
        </p>
      </div>

    </div>
  </div>
`;

export const sendVerificationEmail = async (
    email: string,
    name: string,
    verificationToken: string,
): Promise<nodemailer.SentMessageInfo> => {
    const maxRetries = 3;
    let lastError: Error | null = null;

    // Both the main path and fallback use the same route so links are consistent.
    const verificationUrl = `${process.env.CLIENT_URL}/verify-token?token=${verificationToken}`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Sending verification email (attempt ${attempt}/${maxRetries})`);

            const transporter = getTransporter();

            // Verify SMTP connectivity on the first attempt only to avoid
            // adding a full round-trip on every retry.
            if (attempt === 1) {
                try {
                    await transporter.verify();
                    console.log("SMTP connection verified");
                } catch (verifyError) {
                    // Non-fatal: some SMTP servers reject NOOP/verify but still accept mail.
                    console.warn("SMTP verify failed (non-fatal):", verifyError);
                }
            }

            const result = await transporter.sendMail({
                from: `"Kanbrew" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Kanbrew – Verify your email address",
                html: buildVerificationEmail(name, verificationUrl),
            });

            console.log("Email sent:", result.messageId);
            return result;
        } catch (error) {
            lastError = error as Error;
            console.error(`Email attempt ${attempt} failed:`, error);

            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
                console.log(`Retrying in ${delay}ms…`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
    }

    // All SMTP attempts exhausted — throw so callers know something went wrong.
    throw new Error(
        `Failed to send verification email to ${email} after ${maxRetries} attempts. ` +
        `Last error: ${lastError?.message ?? "unknown"}`,
    );
};
