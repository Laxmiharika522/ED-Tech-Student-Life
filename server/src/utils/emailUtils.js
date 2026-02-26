const nodemailer = require('nodemailer');
const env = require('../config/env');

// ─── Transporter ──────────────────────────────────────────────────────────

/**
 * Create and return a Nodemailer transporter instance.
 * A new one is created per call so config changes in env are reflected.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host:   env.EMAIL_HOST,
    port:   env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465, // true only for port 465 (SSL)
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
};

// ─── Base Sender ──────────────────────────────────────────────────────────

/**
 * Send a generic email.
 *
 * @param {Object} options
 * @param {string}   options.to       Recipient email address
 * @param {string}   options.subject  Email subject line
 * @param {string}   options.html     HTML body
 * @param {string}  [options.text]    Plain-text fallback
 * @returns {Promise<Object>} Nodemailer send info
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // Skip silently if email credentials are not configured yet
  if (!env.EMAIL_USER || !env.EMAIL_PASS) {
    console.log(`📧  Email skipped (no credentials) → "${subject}" to ${to}`);
    return null;
  }

  // Skip sending in test environment to avoid noise
  if (env.NODE_ENV === 'test') return null;

  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''), // strip tags for plain-text fallback
  });

  console.log(`📧  Email sent to ${to} — MessageId: ${info.messageId}`);
  return info;
};

// ─── Shared Layout Helper ─────────────────────────────────────────────────

/**
 * Wrap email content in a consistent branded layout.
 *
 * @param {string} body  Inner HTML content
 * @returns {string}     Full HTML email string
 */
const layout = (body) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Campus Catalyst</title>
  </head>
  <body style="margin:0;padding:0;background:#F3F4F6;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table width="600" cellpadding="0" cellspacing="0"
                 style="background:#ffffff;border-radius:12px;overflow:hidden;
                        box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:#4F46E5;padding:28px 40px;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;
                           letter-spacing:-0.3px;">
                  🎓 Campus Catalyst
                </h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:36px 40px;color:#374151;font-size:15px;line-height:1.7;">
                ${body}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#F9FAFB;padding:20px 40px;border-top:1px solid #E5E7EB;">
                <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">
                  © ${new Date().getFullYear()} Campus Catalyst · 
                  <a href="${env.CLIENT_URL}" style="color:#4F46E5;text-decoration:none;">
                    Visit Platform
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

// ─── Shared Button Helper ─────────────────────────────────────────────────
const btn = (text, href) => `
  <a href="${href}"
     style="display:inline-block;margin-top:24px;padding:13px 28px;
            background:#4F46E5;color:#ffffff;text-decoration:none;
            border-radius:8px;font-size:14px;font-weight:600;">
    ${text}
  </a>
`;

// ─── Email Templates ──────────────────────────────────────────────────────

/**
 * Welcome email sent after successful registration.
 *
 * @param {{ name: string, email: string }} user
 */
const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: '🎓 Welcome to Campus Catalyst!',
    html: layout(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">
        Welcome aboard, ${user.name}! 👋
      </h2>
      <p>Your account has been created. Here's what you can do right away:</p>
      <table cellpadding="0" cellspacing="0" style="margin:20px 0;width:100%;">
        <tr>
          <td style="padding:12px 16px;background:#EEF2FF;border-radius:8px;margin-bottom:8px;">
            📚 <strong>Share Notes</strong> — Upload and discover class notes from your university
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td style="padding:12px 16px;background:#EEF2FF;border-radius:8px;">
            🏠 <strong>Find a Roommate</strong> — Get matched with compatible roommates
          </td>
        </tr>
        <tr><td style="height:8px;"></td></tr>
        <tr>
          <td style="padding:12px 16px;background:#EEF2FF;border-radius:8px;">
            ✅ <strong>Manage Tasks</strong> — Stay on top of your campus admin tasks
          </td>
        </tr>
      </table>
      <p>Start by completing your profile to get the best experience.</p>
      ${btn('Go to Dashboard', `${env.CLIENT_URL}/dashboard`)}
    `),
  });
};

/**
 * Task assignment notification email.
 *
 * @param {{ name: string, email: string }} user
 * @param {{ title: string, description?: string, due_date?: string }} task
 */
const sendTaskAssignmentEmail = async (user, task) => {
  const dueLine = task.due_date
    ? `<p style="margin:12px 0 0;color:#EF4444;">
         <strong>Due:</strong> ${new Date(task.due_date).toLocaleDateString('en-US', {
           weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
         })}
       </p>`
    : '';

  await sendEmail({
    to: user.email,
    subject: `📋 New Task: ${task.title}`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">
        You have a new task, ${user.name}
      </h2>
      <p>An admin has assigned the following task to you:</p>
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;
                  border-left:4px solid #4F46E5;border-radius:8px;
                  padding:20px;margin:20px 0;">
        <h3 style="margin:0 0 8px;color:#111827;">${task.title}</h3>
        <p style="margin:0;color:#6B7280;">
          ${task.description || 'No additional details provided.'}
        </p>
        ${dueLine}
      </div>
      <p>Log in to mark the task as in-progress or done once completed.</p>
      ${btn('View My Tasks', `${env.CLIENT_URL}/tasks`)}
    `),
  });
};

/**
 * Roommate match notification email.
 *
 * @param {{ name: string, email: string }} user       The user being notified
 * @param {{ name: string, score: number }} match      The match details
 */
const sendRoommateMatchEmail = async (user, match) => {
  const scoreColor = match.score >= 80 ? '#10B981' : match.score >= 60 ? '#F59E0B' : '#6B7280';

  await sendEmail({
    to: user.email,
    subject: '🏠 You have a new roommate match!',
    html: layout(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">
        Great news, ${user.name}! 🎉
      </h2>
      <p>You have a new roommate match on Campus Catalyst.</p>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;
                  border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
        <p style="margin:0;font-size:16px;color:#374151;">
          Match with <strong>${match.name}</strong>
        </p>
        <p style="margin:8px 0 0;font-size:32px;font-weight:700;color:${scoreColor};">
          ${match.score}%
        </p>
        <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">compatibility score</p>
      </div>
      <p>View their full profile to see how your preferences align and decide if you'd like to connect.</p>
      ${btn('View My Matches', `${env.CLIENT_URL}/roommate/matches`)}
    `),
  });
};

/**
 * Password reset email with a time-limited link.
 *
 * @param {{ name: string, email: string }} user
 * @param {string} resetToken  Short-lived JWT for password reset
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: '🔑 Reset your Campus Catalyst password',
    html: layout(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">
        Password Reset Request
      </h2>
      <p>Hi ${user.name}, we received a request to reset your password.</p>
      <p>Click the button below to set a new password. 
         <strong>This link expires in 15 minutes.</strong>
      </p>
      ${btn('Reset Password', resetUrl)}
      <p style="margin-top:24px;font-size:13px;color:#9CA3AF;">
        If you didn't request a password reset, you can safely ignore this email.
        Your password will not change.
      </p>
    `),
  });
};

/**
 * Note approval notification email (sent when admin approves a note).
 *
 * @param {{ name: string, email: string }} user
 * @param {{ title: string, subject: string }} note
 */
const sendNoteApprovedEmail = async (user, note) => {
  await sendEmail({
    to: user.email,
    subject: `✅ Your note "${note.title}" has been approved!`,
    html: layout(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">
        Your note is live, ${user.name}! 🎉
      </h2>
      <p>
        Your uploaded note <strong>"${note.title}"</strong> 
        (${note.subject}) has been reviewed and approved by an admin.
        It is now visible to all students on the platform.
      </p>
      ${btn('View Notes', `${env.CLIENT_URL}/notes`)}
    `),
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendTaskAssignmentEmail,
  sendRoommateMatchEmail,
  sendPasswordResetEmail,
  sendNoteApprovedEmail,
};