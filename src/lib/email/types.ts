/**
 * Email service type definitions
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailTemplateData {
  // Common fields
  appName: string;
  appUrl: string;
  supportEmail: string;
  currentYear: number;

  // User fields
  userName?: string;
  userEmail?: string;

  // Course fields
  courseName?: string;
  courseUrl?: string;
  instructorName?: string;

  // Action fields
  actionUrl?: string;
  actionText?: string;

  // Password reset
  resetToken?: string;
  resetUrl?: string;
  expiresIn?: string;

  // Custom data
  [key: string]: unknown;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export type EmailTemplateName =
  | 'welcome'
  | 'enrollment-confirmation'
  | 'password-reset'
  | 'course-update'
  | 'enrollment-expiring';
