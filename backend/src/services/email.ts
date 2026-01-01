import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@mealtrain.com';
const FROM_NAME = process.env.FROM_NAME || 'MealTrain';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured. Email would be sent:', options);
    return true;
  }

  try {
    await sgMail.send({
      to: options.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName?: string
): Promise<boolean> {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Verify your MealTrain account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MealTrain</h1>
            </div>
            <div class="content">
              <h2>Welcome${firstName ? `, ${firstName}` : ''}!</h2>
              <p>Thank you for signing up for MealTrain. Please verify your email address to complete your registration.</p>
              <p style="text-align: center;">
                <a href="${verifyUrl}" class="button">Verify Email</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280;">${verifyUrl}</p>
              <p>This link will expire in 24 hours.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MealTrain. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Reset your MealTrain password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MealTrain</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>You requested to reset your password. Click the button below to set a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
              <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MealTrain. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendParticipantSignupNotification(
  organizerEmail: string,
  participantName: string,
  trainTitle: string,
  date: string,
  mealDescription?: string
): Promise<boolean> {
  return sendEmail({
    to: organizerEmail,
    subject: `New volunteer signed up for ${trainTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .highlight { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MealTrain</h1>
            </div>
            <div class="content">
              <h2>New Volunteer!</h2>
              <p>Great news! Someone has signed up to help with your meal train.</p>
              <div class="highlight">
                <p><strong>Meal Train:</strong> ${trainTitle}</p>
                <p><strong>Volunteer:</strong> ${participantName}</p>
                <p><strong>Date:</strong> ${date}</p>
                ${mealDescription ? `<p><strong>Meal:</strong> ${mealDescription}</p>` : ''}
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MealTrain. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendReminderEmail(
  email: string,
  participantName: string,
  recipientName: string,
  trainTitle: string,
  date: string,
  address: string,
  deliveryTime: string,
  mealDescription?: string,
  trainSlug?: string
): Promise<boolean> {
  const trainUrl = trainSlug ? `${FRONTEND_URL}/train/${trainSlug}` : '';

  return sendEmail({
    to: email,
    subject: `Reminder: Meal delivery tomorrow for ${recipientName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .highlight { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .button { display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MealTrain</h1>
            </div>
            <div class="content">
              <h2>Reminder: Your meal delivery is tomorrow!</h2>
              <p>Hi ${participantName},</p>
              <p>This is a friendly reminder that you're scheduled to deliver a meal tomorrow.</p>
              <div class="highlight">
                <p><strong>Recipient:</strong> ${recipientName}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Delivery Time:</strong> ${deliveryTime}</p>
                <p><strong>Address:</strong> ${address}</p>
                ${mealDescription ? `<p><strong>Your Meal:</strong> ${mealDescription}</p>` : ''}
              </div>
              ${trainUrl ? `
                <p style="text-align: center;">
                  <a href="${trainUrl}" class="button">View Meal Train</a>
                </p>
              ` : ''}
              <p>Thank you for your kindness!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MealTrain. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendDonationConfirmation(
  email: string,
  donorName: string,
  amount: string,
  trainTitle: string,
  recipientName: string,
  message?: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Thank you for your donation to ${recipientName}'s meal train`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .highlight { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MealTrain</h1>
            </div>
            <div class="content">
              <h2>Thank You for Your Donation!</h2>
              <p>Dear ${donorName},</p>
              <p>Your generous donation has been received. Thank you for supporting ${recipientName}!</p>
              <div class="highlight">
                <p><strong>Meal Train:</strong> ${trainTitle}</p>
                <p><strong>Donation Amount:</strong> $${amount}</p>
                ${message ? `<p><strong>Your Message:</strong> ${message}</p>` : ''}
              </div>
              <p>Your kindness makes a real difference.</p>
            </div>
            <div class="footer">
              <p>This email serves as your receipt.</p>
              <p>&copy; ${new Date().getFullYear()} MealTrain. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendGiftCardNotification(
  recipientEmail: string,
  purchaserName: string,
  amount: string,
  vendor: string,
  code: string,
  message?: string
): Promise<boolean> {
  return sendEmail({
    to: recipientEmail,
    subject: `You received a ${vendor} gift card from ${purchaserName}!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f97316; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .gift-card { background: linear-gradient(135deg, #f97316, #fb923c); color: white; padding: 25px; border-radius: 12px; margin: 20px 0; text-align: center; }
            .gift-code { font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 15px 0; font-family: monospace; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MealTrain</h1>
            </div>
            <div class="content">
              <h2>You've Received a Gift Card!</h2>
              <p>${purchaserName} sent you a gift card to help with meals.</p>
              <div class="gift-card">
                <h3>${vendor}</h3>
                <p class="gift-code">${code}</p>
                <p>Value: $${amount}</p>
              </div>
              ${message ? `<p><strong>Message from ${purchaserName}:</strong> "${message}"</p>` : ''}
              <p>Use this code at ${vendor} to order your meals!</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MealTrain. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendDeliveryStatusUpdate(
  recipientEmail: string,
  recipientName: string,
  trainTitle: string,
  dateIso: string,
  status: string
): Promise<boolean> {
  const formattedDate = new Date(dateIso).toLocaleDateString();
  const statusLabel = status.replace(/_/g, ' ').toLowerCase();

  return sendEmail({
    to: recipientEmail,
    subject: `Delivery update for ${recipientName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .highlight { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Chesed Train</h1>
            </div>
            <div class="content">
              <h2>Delivery Update</h2>
              <p>Your scheduled delivery has a new status.</p>
              <div class="highlight">
                <p><strong>Train:</strong> ${trainTitle}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Status:</strong> ${statusLabel}</p>
              </div>
              <p>Thank you for being part of this chesed effort.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} MealTrain. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}
