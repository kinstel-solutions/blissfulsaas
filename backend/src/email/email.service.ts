import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private readonly isMockMode: boolean;
  private readonly fromEmail: string;

  private readonly patientAppUrl: string;
  private readonly therapistAppUrl: string;
  private readonly adminPanelUrl: string;

  constructor(private configService: ConfigService) {
    this.isMockMode = this.configService.get<string>('MOCK_EMAIL') === 'true';
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ||
      'Supabase Auth - Blissful SaaS <auth@theblissfulstation.com>';

    this.patientAppUrl =
      this.configService.get<string>('PATIENT_APP_URL') ||
      'http://localhost:3000';
    this.therapistAppUrl =
      this.configService.get<string>('THERAPIST_APP_URL') ||
      'http://localhost:3001';
    this.adminPanelUrl =
      this.configService.get<string>('ADMIN_PANEL_URL') ||
      'http://localhost:3002';

    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!this.isMockMode && apiKey && apiKey !== 'your-resend-api-key-here') {
      this.resend = new Resend(apiKey);
    } else if (!this.isMockMode) {
      this.logger.warn(
        'MOCK_EMAIL is false but RESEND_API_KEY is not set or invalid. Falling back to mock mode.',
      );
      this.isMockMode = true;
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (this.isMockMode) {
      this.logger.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      this.logger.debug(`[MOCK EMAIL CONTENT]:\n${html}`);
      return true;
    }

    try {
      const { data, error } = await this.resend!.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (error) {
        this.logger.error(
          `Failed to send email to ${to}: ${error.message}`,
          error,
        );
        return false;
      }

      this.logger.log(`Email sent successfully to ${to} (ID: ${data?.id})`);
      return true;
    } catch (err) {
      this.logger.error(`Unexpected error sending email to ${to}`, err);
      return false;
    }
  }

  private generateHtmlWrap(
    title: string,
    bodyText: string,
    buttonText?: string,
    buttonUrl?: string,
  ): string {
    const buttonHtml =
      buttonText && buttonUrl
        ? `
      <div style="margin-top: 30px;">
        <a href="${buttonUrl}" style="background-color: #053628; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">${buttonText}</a>
      </div>
    `
        : '';

    return `
      <div style="font-family: 'Inter', Helvetica, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
        <div style="background-color: #ffffff; padding: 40px; max-width: 600px; margin: 0 auto; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #053628; margin: 0; font-size: 24px;">The Blissful Station</h1>
          </div>
          <h2 style="color: #053628; font-size: 20px; margin-top: 0;">${title}</h2>
          <div style="font-size: 16px; color: #334155; white-space: pre-wrap; line-height: 1.6;">${bodyText}</div>
          ${buttonHtml}
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-bottom: 0;">
            This is an automated message from The Blissful Station.<br/>
            If you have any questions, please <a href="mailto:support@theblissfulstation.com" style="color: #053628;">contact support</a>.
          </p>
        </div>
      </div>
    `;
  }

  // Therapist Onboarding
  async sendTherapistApplicationReceived(to: string, therapistName: string) {
    const title = 'Application Received';
    const subject = "We've received your therapist application — Blissful SaaS";
    const body = `Hi ${therapistName},\n\nThank you for your interest in joining The Blissful Station. We have successfully received your application.\n\nOur team is currently reviewing your credentials, and we will let you know as soon as the review is complete.\n\nBest regards,\nThe Blissful Station Team`;
    return this.sendEmail(
      to,
      subject,
      this.generateHtmlWrap(
        title,
        body,
        'View Portal Status',
        `${this.therapistAppUrl}/auth/login`,
      ),
    );
  }

  async sendAdminNewApplication(adminEmails: string[], therapistName: string) {
    if (!adminEmails || adminEmails.length === 0) return false;
    const title = 'New Application Pending Review';
    const subject = 'Action Required: Review New Therapist Application';
    const body = `Hello Admin,\n\nA new therapist application has been submitted by **${therapistName}** and is ready for credentials review.\n\nPlease log in to the admin panel to examine their submitted qualifications, verify documents, and decide on approval.`;
    return this.sendEmail(
      adminEmails.join(','),
      subject,
      this.generateHtmlWrap(
        title,
        body,
        'Review Application',
        `${this.adminPanelUrl}/therapists`,
      ),
    );
  }

  async sendTherapistWelcomeEmail(to: string, therapistName: string) {
    const title = 'Welcome Aboard!';
    const subject = 'Welcome to Blissful SaaS! Your application is approved 🎉';
    const body = `Congratulations ${therapistName},\n\nWe are delighted to inform you that your application to join The Blissful Station has been reviewed and approved.\n\nYou can now access the Therapist Portal to set your consultation hours, configure availability slots, and finalize your professional profile to begin receiving appointments.\n\nWarm welcome,\nThe Blissful Station Team`;
    return this.sendEmail(
      to,
      subject,
      this.generateHtmlWrap(
        title,
        body,
        'Set Up Your Profile',
        `${this.therapistAppUrl}/dashboard`,
      ),
    );
  }

  async sendTherapistRejectionEmail(
    to: string,
    therapistName: string,
    reason: string,
  ) {
    const title = 'Status Update on Your Application';
    const subject = 'Update regarding your Blissful SaaS Application';
    const body = `Dear ${therapistName},\n\nThank you for taking the time to apply to join The Blissful Station. After a careful review of your application, we regret to inform you that we are unable to approve your application at this time.\n\nContact support for further explanation.\n\nBest regards,\nThe Blissful Station Team`;
    return this.sendEmail(
      to,
      subject,
      this.generateHtmlWrap(
        title,
        body,
        'Contact Support',
        'mailto:support@theblissfulstation.com',
      ),
    );
  }

  // Therapist Profile Updates
  async sendTherapistProfileUpdatesApproved(to: string, therapistName: string) {
    const title = 'Changes Approved';
    const subject = 'Your profile updates are now live — Blissful SaaS';
    const body = `Dear ${therapistName},\n\nWe have successfully reviewed and approved your recent profile updates. The changes are now live and visible to patients on the platform.`;
    return this.sendEmail(
      to,
      subject,
      this.generateHtmlWrap(
        title,
        body,
        'View Your Profile',
        `${this.therapistAppUrl}/profile`,
      ),
    );
  }

  async sendTherapistProfileUpdatesRejected(to: string, therapistName: string) {
    const title = 'Profile Updates Reviewed';
    const subject = 'Update on your profile revision request — Blissful SaaS';
    const body = `Dear ${therapistName},\n\nOur administration team has reviewed your requested profile changes. Unfortunately, we could not approve the updates as submitted. Your active profile will remain unchanged for now.\n\nPlease review your details and re-submit or contact therapist support for further clarification.`;
    return this.sendEmail(
      to,
      subject,
      this.generateHtmlWrap(
        title,
        body,
        'View Profile Settings',
        `${this.therapistAppUrl}/profile`,
      ),
    );
  }

  // Appointment Lifecycle
  async sendAppointmentNotification(
    to: string,
    title: string,
    body: string,
    buttonText?: string,
    buttonUrl?: string,
  ) {
    return this.sendEmail(
      to,
      title,
      this.generateHtmlWrap(title, body, buttonText, buttonUrl),
    );
  }
}
