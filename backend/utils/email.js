const nodemailer = require('nodemailer');

const sendStatusUpdateEmail = async (userEmail, userName, issueTitle, newStatus) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `CivicFix: Update on your report - ${issueTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background-color: #3b82f6; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">CivicFix</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>The status of your civic report "<strong>${issueTitle}</strong>" has been updated.</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px; text-align: center;">
              <span style="font-size: 14px; text-transform: uppercase; color: #6b7280; display: block; margin-bottom: 5px;">New Status</span>
              <span style="font-size: 24px; font-weight: bold; color: #1e40af;">${newStatus}</span>
            </div>
            
            <p>Thank you for helping us make our city better! You can track the progress and see more details in your dashboard.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:5173/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View My Dashboard</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">This is an automated message from CivicFix. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendStatusUpdateEmail };
