require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

const testMail = async () => {
    console.log('Testing email sending...');
    try {
        await sendEmail({
            email: 'test@example.com',
            subject: 'CollabSphere Test Email',
            message: 'This is a test email from the CollabSphere backend troubleshooting session.'
        });
        console.log('Test function call completed.');
    } catch (err) {
        console.error('Test function call failed:', err.message);
    }
};

testMail();
