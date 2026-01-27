/**
 * Email Service for Learning Hall
 *
 * Provides email notification functionality for:
 * - Welcome emails on registration
 * - Enrollment confirmations
 * - Password reset emails
 * - Course updates and announcements
 */

export { sendEmail, sendWelcomeEmail, sendEnrollmentEmail, sendPasswordResetEmail } from './sender';
export { EmailTemplate, getEmailTemplate } from './templates';
export type { EmailOptions, EmailResult, EmailTemplateData } from './types';
