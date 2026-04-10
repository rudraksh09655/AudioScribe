// Email service removed — email verification feature not in use.
// This file is kept as a stub so existing imports don't break.

class EmailService {
  constructor() {
    this.isConfigured = false;
  }

  generateVerificationToken() {
    return '';
  }

  async sendEmail() {
    console.log('📧 Email service is disabled.');
    return { success: false, error: 'Email service is disabled' };
  }

  getWelcomeEmail() {
    return '';
  }

  getVerificationSuccessEmail() {
    return '';
  }
}

const emailService = new EmailService();
module.exports = emailService;
