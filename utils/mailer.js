const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.MAIL_FROM || smtpUser;

let cachedTransporter;

function getTransporter() {
	if (cachedTransporter) return cachedTransporter;
	cachedTransporter = nodemailer.createTransport({
		host: smtpHost,
		port: smtpPort,
		secure: smtpPort === 465,
		auth: {
			user: smtpUser,
			pass: smtpPass,
		},
	});
	return cachedTransporter;
}

async function sendEmail({ to, subject, text, html }) {
	const transporter = getTransporter();
	const mailOptions = {
		from: fromEmail,
		to,
		subject,
		text,
		html,
	};
	return transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };