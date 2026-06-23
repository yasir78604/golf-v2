/**
 * Email Service
 * Handles sending emails (notifications, draw results, winner alerts)
 * Currently a placeholder - integrate with SendGrid, Resend, etc.
 */

class EmailService {
  /**
   * Send email notification
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} html - HTML content
   * @param {string} text - Plain text content (fallback)
   */
  static async sendEmail(to, subject, html, text = '') {
    console.log(`📧 Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html.substring(0, 100)}...`);

    // TODO: Integrate with SendGrid, Resend, or Nodemailer
    // For now, just log and return success
    return { success: true };
  }

  /**
   * Send welcome email after signup
   */
  static async sendWelcomeEmail(user) {
    const subject = 'Welcome to Impact Swing! 🏌️';
    const html = `
      <h1>Welcome ${user.full_name}!</h1>
      <p>Thank you for joining Impact Swing. You're now part of a community that combines golf with giving back.</p>
      <p>Here's what you can do next:</p>
      <ul>
        <li>🎯 Complete your profile</li>
        <li>⛳ Log your first score</li>
        <li>❤️ Support your chosen charity</li>
      </ul>
      <p>Visit your dashboard to get started: <a href="${process.env.FRONTEND_URL}/dashboard">Dashboard</a></p>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send draw results notification
   */
  static async sendDrawResults(user, draw) {
    const subject = `🏆 Impact Swing Draw Results - ${draw.month}`;
    const html = `
      <h1>Draw Results Are Here!</h1>
      <p>Dear ${user.full_name},</p>
      <p>The ${draw.month} draw has been completed.</p>
      <p>Winning Numbers: <strong>${draw.numbers.join(' - ')}</strong></p>
      <p>Check your dashboard to see if you're a winner!</p>
      <a href="${process.env.FRONTEND_URL}/dashboard">View Dashboard</a>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send winner notification
   */
  static async sendWinnerNotification(user, winner) {
    const subject = '🎉 Congratulations! You won a prize!';
    const html = `
      <h1>You're a Winner!</h1>
      <p>Dear ${user.full_name},</p>
      <p>Congratulations! You've won <strong>$${winner.prize_amount.toFixed(2)}</strong> in the ${winner.draw?.month} draw!</p>
      <p>Please upload your score proof to claim your prize:</p>
      <a href="${process.env.FRONTEND_URL}/dashboard">Upload Proof</a>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  /**
   * Send payment confirmation
   */
  static async sendPaymentConfirmation(user, amount) {
    const subject = '💰 Payment Processed';
    const html = `
      <h1>Payment Received</h1>
      <p>Dear ${user.full_name},</p>
      <p>Your prize payment of <strong>$${amount.toFixed(2)}</strong> has been processed.</p>
      <p>Thank you for being part of Impact Swing!</p>
    `;

    return this.sendEmail(user.email, subject, html);
  }
}

module.exports = EmailService;