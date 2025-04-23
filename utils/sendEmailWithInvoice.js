const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});

async function sendEmailWithInvoice(to, subject, text, invoicePath) {
  const mailOptions = {
    from: '"Striv.enp Store" <your-email@gmail.com>',
    to,
    subject,
    text,
    attachments: [
      {
        filename: path.basename(invoicePath),
        path: invoicePath
      }
    ]
  };

  await transporter.sendMail(mailOptions);

  // Store email log
  fs.appendFileSync(
    path.join(__dirname, '../logs/emailLogs.txt'),
    `[${new Date().toISOString()}] Email sent to ${to} - Subject: ${subject}\n`
  );
}

module.exports = sendEmailWithInvoice;
