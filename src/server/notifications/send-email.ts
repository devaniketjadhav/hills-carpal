import nodemailer from 'nodemailer';
import emailValidator from 'email-validator';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER || 'email-smtp.us-west-2.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: 'AKIAS5YEHOBVFXFBQZWV',
    pass: 'BIEAJEtZS6MABIUGM5UeK4FODuvNptDMi/U7GM3rMAG8',
  },
});

type Email = {
  to: string;
  subject: string;
  html: string;
};

export default async function sendEmail(email: Email) {
  if (!email.to || !emailValidator.validate(email.to)) {
    console.error('Could not send email to invalid email address' + email.to);
    return;
  }

  await transporter.sendMail({
    to: email.to,
    subject: email.subject,
    html: email.html,
    from: 'Hills Carpal <no-reply@ride.carpal.org.au>',
  });
}
