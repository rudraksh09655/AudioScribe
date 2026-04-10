const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Resend } = require('resend');

class EmailService {
  constructor() {
    // Support both Resend and SMTP
    this.resend = null;
    this.transporter = null;
    this.isConfigured = false;
    this.provider = 'none';
  }

  async initialize() {
    try {
      // Priority 1: Check for Resend API key (recommended)
      if (process.env.RESEND_API_KEY) {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.provider = 'resend';
        this.isConfigured = true;
        console.log('✅ Email service configured with Resend');
        return;
      }

      // Priority 2: Check if custom SMTP is configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        });
        this.provider = 'smtp';
        this.isConfigured = true;
        console.log('✅ Email service configured with custom SMTP');
        return;
      }

      // Priority 3: Fallback to Ethereal for development
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      this.provider = 'ethereal';
      this.isConfigured = true;
      console.log('📧 Email service using Ethereal (test mode)');
      console.log('   User:', testAccount.user);
      console.log('   Pass:', testAccount.pass);
      console.log('   Preview URL will be shown after sending');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.isConfigured = false;
    }
  }

  async sendEmail(to, subject, html) {
    if (!this.isConfigured) {
      await this.initialize();
    }

    if (!this.isConfigured) {
      console.warn('⚠️  Email not sent - service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      // Use Resend if configured
      if (this.provider === 'resend') {
        const fromName = process.env.FROM_NAME || 'AudioScribe';
        const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

        console.log(`📧 Sending email via Resend to: ${to}, from: ${fromName} <${fromEmail}>`);

        const { data, error } = await this.resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          subject: subject,
          html: html,
        });

        if (error) {
          console.error('❌ Resend API error:', JSON.stringify(error, null, 2));
          return { success: false, error: error.message || JSON.stringify(error), provider: 'resend' };
        }

        console.log('✅ Email sent via Resend:', data?.id);
        return { success: true, messageId: data?.id, provider: 'resend' };
      }

      // Use SMTP (Ethereal or custom)
      const info = await this.transporter.sendMail({
        from: `"${process.env.FROM_NAME || 'Speech-to-Text'}" <${process.env.FROM_EMAIL || 'noreply@speechtotext.com'}>`,
        to,
        subject,
        html,
      });

      console.log('✅ Email sent via', this.provider === 'ethereal' ? 'Ethereal' : 'SMTP', ':', info.messageId);

      // For Ethereal, log the preview URL
      if (this.provider === 'ethereal') {
        console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: this.provider === 'ethereal' ? nodemailer.getTestMessageUrl(info) : null,
        provider: this.provider
      };
    } catch (error) {
      console.error('❌ Email send error:', error.message);
      return { success: false, error: error.message };
    }
  }

  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Email Templates
  getWelcomeEmail(name, verificationToken) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Speech-to-Text</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">🎉 Welcome!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Hi ${name},</h2>
                      <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Thank you for joining <strong>Speech-to-Text</strong>! We're excited to have you on board.
                      </p>
                      <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        To get started and unlock all features, please verify your email address by clicking the button below:
                      </p>
                      
                      <!-- Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                          Verify Email Address
                        </a>
                      </div>
                      
                      <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        If the button doesn't work, copy and paste this link into your browser:
                        <br>
                        <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Features Section -->
                  <tr>
                    <td style="padding: 0 30px 40px;">
                      <div style="background-color: #f9fafb; border-radius: 12px; padding: 30px;">
                        <h3 style="margin: 0 0 20px; color: #1f2937; font-size: 18px;">What you can do:</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 2;">
                          <li>📝 Transcribe audio files with high accuracy</li>
                          <li>🎙️ Record audio directly in your browser</li>
                          <li>📊 Track your transcription history</li>
                          <li>⚡ Fast processing with AI-powered technology</li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 13px;">
                        If you didn't create this account, you can safely ignore this email.
                      </p>
                      <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                        © 2026 Speech-to-Text. All rights reserved.
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
  }

  getVerificationSuccessEmail(name) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verified</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">✅ Verified!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px; text-align: center;">
                      <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Hi ${name},</h2>
                      <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Your email has been successfully verified! You now have full access to all features.
                      </p>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                          Go to Dashboard
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                        © 2026 Speech-to-Text. All rights reserved.
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
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
