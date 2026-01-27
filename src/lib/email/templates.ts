/**
 * Email templates for Learning Hall
 */

import type { EmailTemplateData, EmailTemplateName } from './types';

/**
 * Base email wrapper with consistent styling
 */
function baseTemplate(content: string, data: EmailTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.appName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .email-wrapper {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background-color: #1a1a2e;
      color: #ffffff;
      padding: 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 32px 24px;
    }
    .content h2 {
      color: #1a1a2e;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #e94560;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
    }
    .button:hover {
      background-color: #d63850;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #666;
    }
    .footer a {
      color: #e94560;
      text-decoration: none;
    }
    .divider {
      border-top: 1px solid #eee;
      margin: 24px 0;
    }
    .highlight-box {
      background-color: #f0f7ff;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin: 16px 0;
      border-radius: 0 4px 4px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>${data.appName}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${data.currentYear} ${data.appName}. All rights reserved.</p>
        <p>
          Questions? Contact us at <a href="mailto:${data.supportEmail}">${data.supportEmail}</a>
        </p>
        <p>
          <a href="${data.appUrl}">Visit our website</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Welcome email template
 */
function welcomeTemplate(data: EmailTemplateData): string {
  const content = `
    <h2>Welcome to ${data.appName}!</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>
      Thank you for joining ${data.appName}! We're excited to have you as part of our learning community.
    </p>
    <p>
      With your new account, you can:
    </p>
    <ul>
      <li>Browse and enroll in courses</li>
      <li>Track your learning progress</li>
      <li>Earn certificates upon completion</li>
      <li>Connect with instructors and fellow learners</li>
    </ul>
    <p style="text-align: center;">
      <a href="${data.appUrl}/dashboard" class="button">Start Learning</a>
    </p>
    <div class="divider"></div>
    <p>
      Need help getting started? Check out our <a href="${data.appUrl}/help">getting started guide</a>
      or reach out to our support team.
    </p>
  `;
  return baseTemplate(content, data);
}

/**
 * Enrollment confirmation template
 */
function enrollmentTemplate(data: EmailTemplateData): string {
  const content = `
    <h2>Enrollment Confirmed!</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>
      Great news! You've been successfully enrolled in:
    </p>
    <div class="highlight-box">
      <strong style="font-size: 18px;">${data.courseName}</strong>
      ${data.instructorName ? `<br><span style="color: #666;">Instructor: ${data.instructorName}</span>` : ''}
    </div>
    <p>
      You now have full access to all course materials. Start learning at your own pace!
    </p>
    <p style="text-align: center;">
      <a href="${data.courseUrl || data.appUrl + '/dashboard'}" class="button">Go to Course</a>
    </p>
    <div class="divider"></div>
    <p>
      <strong>Tips for success:</strong>
    </p>
    <ul>
      <li>Set aside dedicated learning time each day</li>
      <li>Take notes as you progress through lessons</li>
      <li>Complete all exercises and quizzes</li>
      <li>Don't hesitate to ask questions</li>
    </ul>
  `;
  return baseTemplate(content, data);
}

/**
 * Password reset template
 */
function passwordResetTemplate(data: EmailTemplateData): string {
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>
      We received a request to reset the password for your ${data.appName} account
      associated with ${data.userEmail}.
    </p>
    <p style="text-align: center;">
      <a href="${data.resetUrl}" class="button">Reset Password</a>
    </p>
    <p style="font-size: 14px; color: #666;">
      This link will expire in ${data.expiresIn || '1 hour'}. If you didn't request a password reset,
      you can safely ignore this email.
    </p>
    <div class="divider"></div>
    <div class="highlight-box">
      <strong>Security tip:</strong> Never share your password with anyone.
      ${data.appName} will never ask for your password via email.
    </div>
    <p style="font-size: 14px; color: #666;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${data.resetUrl}" style="word-break: break-all;">${data.resetUrl}</a>
    </p>
  `;
  return baseTemplate(content, data);
}

/**
 * Course update notification template
 */
function courseUpdateTemplate(data: EmailTemplateData): string {
  const content = `
    <h2>Course Update</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>
      There's been an update to a course you're enrolled in:
    </p>
    <div class="highlight-box">
      <strong style="font-size: 18px;">${data.courseName}</strong>
    </div>
    <p>${data.updateMessage || 'New content has been added to this course.'}</p>
    <p style="text-align: center;">
      <a href="${data.courseUrl || data.appUrl + '/dashboard'}" class="button">View Update</a>
    </p>
  `;
  return baseTemplate(content, data);
}

/**
 * Enrollment expiring notification template
 */
function enrollmentExpiringTemplate(data: EmailTemplateData): string {
  const content = `
    <h2>Course Access Expiring Soon</h2>
    <p>Hi ${data.userName || 'there'},</p>
    <p>
      This is a friendly reminder that your access to the following course will expire soon:
    </p>
    <div class="highlight-box">
      <strong style="font-size: 18px;">${data.courseName}</strong>
      <br><span style="color: #e94560;">Expires: ${data.expirationDate}</span>
    </div>
    <p>
      Make sure to complete any remaining lessons before your access ends.
    </p>
    <p style="text-align: center;">
      <a href="${data.courseUrl || data.appUrl + '/dashboard'}" class="button">Continue Learning</a>
    </p>
    <p>
      Want to extend your access? <a href="${data.appUrl}/pricing">View our pricing options</a>.
    </p>
  `;
  return baseTemplate(content, data);
}

/**
 * Template registry
 */
export const EmailTemplate: Record<EmailTemplateName, (data: EmailTemplateData) => string> = {
  'welcome': welcomeTemplate,
  'enrollment-confirmation': enrollmentTemplate,
  'password-reset': passwordResetTemplate,
  'course-update': courseUpdateTemplate,
  'enrollment-expiring': enrollmentExpiringTemplate,
};

/**
 * Get a rendered email template
 */
export function getEmailTemplate(
  templateName: EmailTemplateName,
  data: Partial<EmailTemplateData> = {}
): string {
  const template = EmailTemplate[templateName];

  if (!template) {
    throw new Error(`Unknown email template: ${templateName}`);
  }

  const fullData: EmailTemplateData = {
    appName: process.env.APP_NAME || 'Learning Hall',
    appUrl: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@learninghall.com',
    currentYear: new Date().getFullYear(),
    ...data,
  };

  return template(fullData);
}
