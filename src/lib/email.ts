import nodemailer, { type Transporter } from "nodemailer";

type Mail = { to: string; subject: string; html: string; text: string };

export function appUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

let transporter: Transporter | null = null;

function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  transporter ??= nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

// Without SMTP configured the message is printed to the server console so the flow stays testable
export async function sendMail(mail: Mail) {
  const transport = getTransporter();
  if (!transport) {
    console.info(`[email] SMTP not configured. To: ${mail.to}\n${mail.subject}\n${mail.text}`);
    return;
  }
  await transport.sendMail({
    from: process.env.EMAIL_FROM ?? "AppoFlex <no-reply@appoflex.app>",
    ...mail,
  });
}

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

// Inline styles only, email clients ignore stylesheets. Mirrors the app: dark glass, orange accent, square corners.
function layout({ title, intro, cta, href, outro }: { title: string; intro: string; cta: string; href: string; outro: string }) {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#05070b;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#05070b;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#10141c;border:2px solid #ffffff;border-radius:0;font-family:'Courier New',Courier,monospace;color:#fefefe;">
<tr><td style="padding:20px 28px;border-bottom:2px solid #ffffff;">
<span style="font-size:20px;font-weight:bold;letter-spacing:2px;color:#ffa500;">&#9632; APPOFLEX</span>
</td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 6px;font-size:22px;color:#fefefe;">${esc(title)}</h1>
<p style="margin:0 0 22px;color:#ffa500;font-size:14px;">flexible appointments, no overlaps</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#fefefe;">${esc(intro)}</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#ffa500;border:2px solid #ffffff;border-radius:0;">
<a href="${esc(href)}" style="display:inline-block;padding:12px 26px;font-size:15px;font-weight:bold;color:#05070b;text-decoration:none;font-family:'Courier New',Courier,monospace;">${esc(cta)} &rarr;</a>
</td></tr></table>
<p style="margin:24px 0 6px;font-size:12px;color:#9a9a9a;">Or paste this link into your browser:</p>
<p style="margin:0 0 24px;font-size:12px;word-break:break-all;"><a href="${esc(href)}" style="color:#ffa500;">${esc(href)}</a></p>
<p style="margin:0;font-size:13px;line-height:1.6;color:#9a9a9a;">${esc(outro)}</p>
</td></tr>
<tr><td style="padding:16px 28px;border-top:2px solid #ffffff;font-size:12px;color:#9a9a9a;">
Made with <span style="color:#ff4d6d;">&hearts;</span> by <a href="https://github.com/AJ4200" style="color:#ffa500;text-decoration:none;">AJ4200</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function buildPasswordResetEmail(name: string, token: string, minutes: number) {
  const href = `${appUrl()}/reset-password/${token}`;
  const intro = `Hi ${name}, we received a request to reset your AppoFlex password. Use the button below to choose a new one. The link works once and expires in ${minutes} minutes.`;
  const outro = "If you didn't ask for this, you can ignore this email. Your password won't change.";
  return {
    subject: "Reset your AppoFlex password",
    html: layout({ title: "Reset your password", intro, cta: "Choose a new password", href, outro }),
    text: `${intro}\n\n${href}\n\n${outro}`,
  };
}

export async function sendPasswordResetEmail(to: string, name: string, token: string, minutes: number) {
  await sendMail({ to, ...buildPasswordResetEmail(name, token, minutes) });
}

export async function sendPasswordChangedEmail(to: string, name: string) {
  const href = `${appUrl()}/forgot-password`;
  const intro = `Hi ${name}, the password on your AppoFlex account was just changed.`;
  const outro = "If this wasn't you, reset your password straight away using the button above.";
  await sendMail({
    to,
    subject: "Your AppoFlex password was changed",
    html: layout({ title: "Password changed", intro, cta: "Reset it again", href, outro }),
    text: `${intro}\n\n${outro}\n${href}`,
  });
}
