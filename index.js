const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// FRONTEND URLs
const FRONTEND_URLS = [
  'https://www.oglenninternational.com',
  'https://oglenninternational.com',
  'http://localhost:3000',
];

// Use a single CORS middleware (removed duplicates)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || FRONTEND_URLS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ADMIN EMAIL - All inquiries will be sent here
const ADMIN_EMAIL = 'appointmentstudio@gmail.com';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Server is ready to send emails');
    console.log(`Admin emails will be sent to: ${ADMIN_EMAIL}`);
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address',
    });
  }

  try {
    // Email to admin (appointmentstudio@gmail.com)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: ADMIN_EMAIL,
      replyTo: email, // This allows you to reply directly to the sender
      subject: `🎓 New Inquiry: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .field { margin-bottom: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px; }
            .label { font-weight: bold; color: #1e3a8a; margin-bottom: 5px; }
            .value { color: #334155; }
            .message-box { background: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
            .reply-info { background: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">🎓 New Contact Inquiry</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">OGLENN ENTERPRISES</p>
            </div>
            <div class="content">
              <p style="font-size: 16px; color: #1e3a8a; font-weight: 600;">You have received a new inquiry from your website.</p>
              
              <div class="reply-info">
                <p style="margin: 0; font-size: 14px;">
                  <strong>💡 Quick Reply:</strong> You can reply directly to this email to respond to ${name}.
                </p>
              </div>
              
              <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></div>
              </div>
              
              <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject}</div>
              </div>
              
              <div class="message-box">
                <div class="label">Message:</div>
                <div class="value" style="white-space: pre-wrap; margin-top: 10px;">${message}</div>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #64748b; font-size: 14px;">
                  📅 Received: ${new Date().toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}
                </p>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from your website contact form at oglenninternational.com</p>
              <p style="margin-top: 10px; color: #94a3b8;">Sent to: ${ADMIN_EMAIL}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎓 Thank You for Your Inquiry - Dr. Odell Glenn',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .content { background: white; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .greeting { font-size: 18px; color: #1e3a8a; font-weight: 600; margin-bottom: 20px; }
            .message-summary { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #3b82f6; }
            .highlight { background: #dbeafe; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px; }
            .social-links { margin: 20px 0; }
            .social-links a { color: #3b82f6; text-decoration: none; margin: 0 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 OGLENN ENTERPRISES</div>
              <p style="margin: 0; opacity: 0.95; font-size: 16px;">Revolutionizing Education Through Neuroscience</p>
            </div>
            <div class="content">
              <div class="greeting">Dear ${name},</div>
              
              <p style="font-size: 16px; color: #334155;">
                Thank you for reaching out to <strong>OGLENN ENTERPRISES</strong>. We have received your inquiry and truly appreciate your interest in our work.
              </p>
              
              <div class="message-summary">
                <p style="margin: 0 0 10px 0; font-weight: 600; color: #1e3a8a;">Your Message Summary:</p>
                <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
                <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date().toLocaleString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <div class="highlight">
                <p style="margin: 0; font-size: 15px; line-height: 1.8;">
                  <strong>📧 What Happens Next?</strong><br>
                  Dr. Odell Glenn and our team will carefully review your message and respond within <strong>24-48 hours</strong>. We're committed to providing thoughtful, personalized responses to every inquiry.
                </p>
              </div>
              
              <p style="font-size: 15px; color: #334155; margin: 25px 0;">
                In the meantime, we invite you to explore our initiatives:
              </p>
              
              <ul style="color: #334155; line-height: 1.8;">
                <li><strong>STEM Outreach:</strong> Empowering the next generation of scientists and innovators</li>
                <li><strong>Neuro Change:</strong> Transforming learning through neuroscience research</li>
                <li><strong>TEDx Speaking:</strong> Sharing groundbreaking educational insights globally</li>
                <li><strong>Educator Training:</strong> Equipping teachers with cutting-edge methodologies</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://www.oglenninternational.com" class="cta-button">Visit Our Website</a>
              </div>
              
              <p style="font-size: 15px; color: #334155; margin-top: 30px;">
                We look forward to connecting with you soon!
              </p>
              
              <p style="font-size: 15px; color: #334155; margin-top: 25px;">
                Warm regards,<br>
                <strong style="color: #1e3a8a;">Dr. Odell Glenn</strong><br>
                <span style="color: #64748b;">Founder & Visionary Leader</span><br>
                <span style="color: #64748b;">OGLENN ENTERPRISES, LLC</span>
              </p>
            </div>
            
            <div class="footer">
              <div class="social-links">
                <a href="https://www.oglenninternational.com">🌐 Website</a>
                <a href="mailto:appointmentstudio@gmail.com">📧 Email</a>
              </div>
              <p style="margin: 10px 0;">
                <strong>OGLENN ENTERPRISES, LLC</strong><br>
                Revolutionizing Education Through Neuroscience
              </p>
              <p style="margin: 15px 0 5px 0; font-size: 12px; color: #94a3b8;">
                This is an automated confirmation email. Please do not reply directly to this message.
              </p>
              <p style="margin: 5px 0; font-size: 12px; color: #94a3b8;">
                © ${new Date().getFullYear()} OGLENN ENTERPRISES, LLC. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    console.log(`✅ Email sent successfully to admin (${ADMIN_EMAIL}) and user (${email})`);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    adminEmail: ADMIN_EMAIL 
  });
});

app.get('/', (req, res) => {
  res.send(`✅ Odell Backend is running! Use /api/contact or /api/health. Admin email: ${ADMIN_EMAIL}`);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Admin notifications will be sent to: ${ADMIN_EMAIL}`);
});