/**
 * Email sender module
 *
 * Supports multiple email providers through configuration:
 * - SMTP (default)
 * - Console logging (development)
 * - Future: SendGrid, Resend, AWS SES
 */

import type { EmailOptions, EmailResult, EmailTemplateData } from './types';
import { getEmailTemplate } from './templates';

/**
 * Email configuration from environment variables
 */
function getEmailConfig() {
  return {
    provider: process.env.EMAIL_PROVIDER || 'console',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: process.env.EMAIL_FROM || 'Learning Hall <noreply@learninghall.com>',
  };
}

/**
 * Send email via SMTP
 * Note: In production, you would use nodemailer here
 * This is a simplified implementation for the MVP
 */
async function sendViaSMTP(options: EmailOptions): Promise<EmailResult> {
  const config = getEmailConfig();

  // In a real implementation, you would use nodemailer:
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({...});
  // const result = await transporter.sendMail({...});

  // For now, we log the email and return success
  console.log('[EMAIL/SMTP] Would send email:', {
    to: options.to,
    subject: options.subject,
    from: options.from || config.from,
  });

  return {
    success: true,
    messageId: `mock-${Date.now()}`,
  };
}

/**
 * Send email via console (development)
 */
async function sendViaConsole(options: EmailOptions): Promise<EmailResult> {
  console.log('\n========== EMAIL ==========');
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`From: ${options.from || getEmailConfig().from}`);
  console.log('------ HTML Content ------');
  // Print a truncated version of the HTML
  console.log(options.html.substring(0, 500) + '...');
  console.log('===========================\n');

  return {
    success: true,
    messageId: `console-${Date.now()}`,
  };
}

/**
 * Main email sending function
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const config = getEmailConfig();

  try {
    // Add default from address if not provided
    const emailOptions = {
      ...options,
      from: options.from || config.from,
    };

    // Route to appropriate provider
    switch (config.provider) {
      case 'smtp':
        return await sendViaSMTP(emailOptions);

      case 'console':
      default:
        return await sendViaConsole(emailOptions);
    }
  } catch (error) {
    console.error('[EMAIL] Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
  to: string,
  data: Pick<EmailTemplateData, 'userName'> & Partial<EmailTemplateData>
): Promise<EmailResult> {
  const html = getEmailTemplate('welcome', data);

  return sendEmail({
    to,
    subject: `Welcome to ${process.env.APP_NAME || 'Learning Hall'}!`,
    html,
  });
}

/**
 * Send enrollment confirmation email
 */
export async function sendEnrollmentEmail(
  to: string,
  data: Pick<EmailTemplateData, 'userName' | 'courseName'> & Partial<EmailTemplateData>
): Promise<EmailResult> {
  const html = getEmailTemplate('enrollment-confirmation', data);

  return sendEmail({
    to,
    subject: `You're enrolled in ${data.courseName}!`,
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  data: Pick<EmailTemplateData, 'userName' | 'resetUrl'> & Partial<EmailTemplateData>
): Promise<EmailResult> {
  const html = getEmailTemplate('password-reset', {
    ...data,
    userEmail: to,
    expiresIn: '1 hour',
  });

  return sendEmail({
    to,
    subject: `Reset your ${process.env.APP_NAME || 'Learning Hall'} password`,
    html,
  });
}

/**
 * Send course update notification
 */
export async function sendCourseUpdateEmail(
  to: string,
  data: Pick<EmailTemplateData, 'userName' | 'courseName'> & Partial<EmailTemplateData>
): Promise<EmailResult> {
  const html = getEmailTemplate('course-update', data);

  return sendEmail({
    to,
    subject: `Update: ${data.courseName}`,
    html,
  });
}

/**
 * Send enrollment expiring notification
 */
export async function sendEnrollmentExpiringEmail(
  to: string,
  data: Pick<EmailTemplateData, 'userName' | 'courseName'> & { expirationDate: string } & Partial<EmailTemplateData>
): Promise<EmailResult> {
  const html = getEmailTemplate('enrollment-expiring', data);

  return sendEmail({
    to,
    subject: `Your access to ${data.courseName} is expiring soon`,
    html,
  });
}

export async function sendDiscussionReplyEmail(
  to: string,
  data: Pick<EmailTemplateData, 'userName' | 'courseName'> &
    Partial<EmailTemplateData> & { threadTitle: string; threadUrl: string; replyAuthorName?: string; replyPreview?: string }
): Promise<EmailResult> {
  const html = getEmailTemplate('discussion-reply', data);

  return sendEmail({
    to,
    subject: `New reply in ${data.courseName}: ${data.threadTitle}`,
    html,
  });
}
