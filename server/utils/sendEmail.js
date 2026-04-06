const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;
  let fromEmail = 'CollabSphere <noreply@collabsphere.com>';

  // If credentials exist, use them (Gmail by default)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    fromEmail = `CollabSphere <${process.env.EMAIL_USER}>`;
  } else {
    // If no credentials, use Ethereal (Fake SMTP) for real-world simulation
    console.log('\n--- 📧 NO EMAIL CREDENTIALS FOUND - USING ETHEREAL MOCK SERVICE ---');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    fromEmail = `"CollabSphere Test" <${testAccount.user}>`;
  }

  try {
    const mailOptions = {
      from: fromEmail,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    console.log(`Attempting to send email to: ${options.email}...`);
    const info = await transporter.sendMail(mailOptions);
    
    // If using Ethereal, log the preview URL
    if (!process.env.EMAIL_USER) {
      console.log(`✅ Mock email sent successfully!`);
      console.log(`Message ID: ${info.messageId}`);
      console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log('--- 📧 MOCK EMAIL READY ---\n');
    } else {
      console.log(`✅ Real email sent successfully! Message ID: ${info.messageId}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Email sending failed!`);
    console.error(`Error details: ${error.message}`);
    if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your EMAIL_USER and EMAIL_PASS in THE .env file.');
    }
    // Non-blocking: we log the error but don't crash the app
    return false;
  }
};

module.exports = sendEmail;
