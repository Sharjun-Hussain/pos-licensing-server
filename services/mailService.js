const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_API_KEY,
    },
    tls: {
        rejectUnauthorized: false
    }
});

/**
 * Sends a premium branded email with the license keys
 */
exports.sendLicenseEmail = async (email, keys, planType) => {
    const keysHtml = keys.map(k => `
        <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin-bottom: 10px; font-family: monospace; font-size: 18px; font-weight: bold; color: #065f46; text-align: center;">
            ${k}
        </div>
    `).join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .header { background: #10b981; padding: 40px; text-align: center; color: white; }
                .content { padding: 40px; color: #1e293b; line-height: 1.6; }
                .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; background: #f1f5f9; }
                .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin:0; font-size: 24px;">Welcome to Inzeedo POS</h1>
                </div>
                <div class="content">
                    <h2 style="margin-top:0;">Your License Keys are Ready!</h2>
                    <p>Hello,</p>
                    <p>Thank you for choosing Inzeedo POS. We have generated your <b>${planType}</b> license keys. You can use these to activate your desktop software.</p>
                    
                    <div style="margin: 30px 0;">
                        ${keysHtml}
                    </div>

                    <p><b>Next Steps:</b></p>
                    <ol>
                        <li>Install the Inzeedo POS Desktop App.</li>
                        <li>Copy and paste your key into the activation screen.</li>
                        <li>Enjoy your professional POS system!</li>
                    </ol>

                    <a href="https://inzeedo.lk/download" class="btn">Download Software</a>
                </div>
                <div class="footer">
                    &copy; 2026 Inzeedo POS System. All rights reserved.<br>
                    Colombo, Sri Lanka
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await transporter.sendMail({
            from: `"${process.env.EMAIL_NAME || 'Inzeedo Support'}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: '🚀 Your Inzeedo POS License Keys are Ready!',
            html: htmlContent,
        });
        console.log(`📧 Email sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to send license email:', error);
        return false;
    }
};
