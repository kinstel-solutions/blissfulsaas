import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private readonly isMockMode: boolean;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    this.isMockMode = this.configService.get<string>('MOCK_EMAIL') === 'true';
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'Supabase Auth - Blissful SaaS <auth@theblissfulstation.com>';
    
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    if (!this.isMockMode && apiKey && apiKey !== 'your-resend-api-key-here') {
      this.resend = new Resend(apiKey);
    } else if (!this.isMockMode) {
      this.logger.warn('MOCK_EMAIL is false but RESEND_API_KEY is not set or invalid. Falling back to mock mode.');
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
        this.logger.error(`Failed to send email to ${to}: ${error.message}`, error);
        return false;
      }

      this.logger.log(`Email sent successfully to ${to} (ID: ${data?.id})`);
      return true;
    } catch (err) {
      this.logger.error(`Unexpected error sending email to ${to}`, err);
      return false;
    }
  }

  private generateHtmlWrap(title: string, bodyText: string): string {
    return `
      <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #053628;">${title}</h2>
        <p style="font-size: 16px; color: #414944; white-space: pre-wrap; line-height: 1.5;">${bodyText}</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 12px; color: #94a3b8;">This is an automated message from BlissfulSaaS.</p>
      </div>
    `;
  }

  // Therapist Onboarding
  async sendTherapistApplicationReceived(to: string, therapistName: string) {
    const title = 'Application Received — Blissful SaaS';
    const body = `Hi ${therapistName},\n\nWe have received your application to join The Blissful Station as a therapist. Our admin team will review your credentials and get back to you shortly.\n\nThank you for choosing to partner with us!`;
    return this.sendEmail(to, title, this.generateHtmlWrap(title, body));
  }

  async sendAdminNewApplication(adminEmails: string[], therapistName: string) {
    if (!adminEmails || adminEmails.length === 0) return false;
    const title = 'Action Required: New Therapist Application';
    const body = `A new therapist application has been submitted by ${therapistName}.\n\nPlease log in to the Admin Panel to review their credentials.`;
    // Resend allows sending to an array of emails
    return this.sendEmail(adminEmails.join(','), title, this.generateHtmlWrap(title, body));
  }

  async sendTherapistWelcomeEmail(to: string, therapistName: string) {
    const title = 'Application Approved 🎉 — Blissful SaaS';
    const body = `Congratulations ${therapistName}!\n\nYour therapist application has been reviewed and approved. You can now log in to the Therapist Portal to set your availability slots and complete your profile.`;
    return this.sendEmail(to, title, this.generateHtmlWrap(title, body));
  }

  async sendTherapistRejectionEmail(to: string, therapistName: string, reason: string) {
    const title = 'Update on your Blissful SaaS Application';
    const body = `Hi ${therapistName},\n\nThank you for applying to join The Blissful Station. Unfortunately, we are unable to approve your application at this time.\n\nReason: ${reason}\n\nIf you have any questions, please contact support.`;
    return this.sendEmail(to, title, this.generateHtmlWrap(title, body));
  }

  // Therapist Profile Updates
  async sendAdminProfileUpdatesAlert(adminEmails: string[], therapistName: string) {
    if (!adminEmails || adminEmails.length === 0) return false;
    const title = 'Action Required: Therapist Profile Updates';
    const body = `Verified therapist Dr. ${therapistName} has submitted updates to their profile (e.g., qualifications, rate, address).\n\nPlease log in to the Admin Panel to review and approve these changes.`;
    return this.sendEmail(adminEmails.join(','), title, this.generateHtmlWrap(title, body));
  }

  async sendTherapistProfileUpdatesApproved(to: string, therapistName: string) {
    const title = 'Profile Updates Approved — Blissful SaaS';
    const body = `Hi Dr. ${therapistName},\n\nYour recent profile updates have been reviewed and approved by our team. The changes are now live on your profile.`;
    return this.sendEmail(to, title, this.generateHtmlWrap(title, body));
  }

  async sendTherapistProfileUpdatesRejected(to: string, therapistName: string) {
    const title = 'Profile Updates Reviewed — Blissful SaaS';
    const body = `Hi Dr. ${therapistName},\n\nWe have reviewed your recent profile updates, but unfortunately, they were not approved. Your active profile will remain unchanged.\n\nPlease contact support for more details.`;
    return this.sendEmail(to, title, this.generateHtmlWrap(title, body));
  }

  // Appointment Lifecycle
  async sendAppointmentNotification(to: string, title: string, body: string) {
    return this.sendEmail(to, title, this.generateHtmlWrap(title, body));
  }
}
