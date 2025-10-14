const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Fix for self-signed certificate error
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
    });
  }

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address',
    });
  }

  try {
    // Email to admin (you)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `🎓 New Inquiry: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 0; text-align: center;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                  
                  <!-- Header with Gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        🎓 New Inquiry Received
                      </h1>
                      <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">
                        OGLENN ENTERPRISES, LLC
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      
                      <!-- Client Info Card -->
                      <div style="background-color: #f8fafc; border-left: 4px solid #8b5cf6; padding: 20px; margin-bottom: 25px; border-radius: 6px;">
                        <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 18px;">Contact Information</h3>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; width: 100px;">
                              <strong style="color: #64748b;">Name:</strong>
                            </td>
                            <td style="padding: 8px 0; color: #1e293b;">
                              ${name}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <strong style="color: #64748b;">Email:</strong>
                            </td>
                            <td style="padding: 8px 0;">
                              <a href="mailto:${email}" style="color: #8b5cf6; text-decoration: none;">${email}</a>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0;">
                              <strong style="color: #64748b;">Subject:</strong>
                            </td>
                            <td style="padding: 8px 0; color: #1e293b;">
                              ${subject}
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Message Section -->
                      <div style="margin-bottom: 25px;">
                        <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 18px;">Message</h3>
                        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 6px; line-height: 1.6; color: #334155;">
                          ${message}
                        </div>
                      </div>

                      <!-- Quick Action Button -->
                      <div style="text-align: center; margin-top: 30px;">
                        <a href="mailto:${email}?subject=Re: ${subject}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);">
                          Reply to ${name.split(' ')[0]}
                        </a>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; color: #64748b; font-size: 13px;">
                        📧 Sent via Dr. Odell Glenn Contact Form<br>
                        <span style="color: #94a3b8;">${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</span>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
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
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 0; text-align: center;">
                <table role="presentation" style="width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                  
                  <!-- Header with Gradient and Logo Area -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 50px 30px; text-align: center;">
                      <div style="background-color: rgba(255,255,255,0.15); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.3);">
                        <span style="font-size: 40px;">🧠</span>
                      </div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        Dr. Odell Glenn
                      </h1>
                      <p style="margin: 8px 0 0; color: #e0e7ff; font-size: 16px; font-weight: 500; letter-spacing: 0.5px;">
                        Education & Neuroscience Expert
                      </p>
                    </td>
                  </tr>

                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      
                      <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 26px; text-align: center;">
                        Thank You, ${name.split(' ')[0]}! 👋
                      </h2>
                      
                      <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                        Thank you for reaching out! I've received your inquiry and am excited to learn more about your educational goals and how neuroscience-based learning methodologies can help you achieve them.
                      </p>

                      <p style="margin: 0 0 30px; color: #475569; font-size: 16px; line-height: 1.6;">
                        I personally review every message and will respond to you within <strong style="color: #8b5cf6;">24-48 hours</strong>. Whether you're interested in educational consulting, learning frameworks, or global innovation strategies, I'm here to help.
                      </p>

                      <!-- Message Recap -->
                      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-left: 4px solid #8b5cf6; padding: 25px; margin: 30px 0; border-radius: 8px;">
                        <h3 style="margin: 0 0 15px; color: #1e293b; font-size: 18px;">📋 Your Inquiry Summary</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 80px;"><strong>Subject:</strong></td>
                            <td style="padding: 6px 0; color: #334155; font-size: 14px;">${subject}</td>
                          </tr>
                        </table>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; font-style: italic;">
                            "${message}"
                          </p>
                        </div>
                      </div>

                      <!-- Key Points -->
                      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
                        <h3 style="margin: 0 0 15px; color: #78350f; font-size: 16px;">⚡ What Happens Next?</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                          <li style="margin-bottom: 10px; line-height: 1.5;">I'll personally review your inquiry</li>
                          <li style="margin-bottom: 10px; line-height: 1.5;">You'll receive a detailed response within 24-48 hours</li>
                          <li style="margin-bottom: 10px; line-height: 1.5;">We can schedule a consultation to discuss your specific needs</li>
                          <li style="margin-bottom: 0; line-height: 1.5;">Explore how neuroscience-based learning can transform your approach</li>
                        </ul>
                      </div>

                      <!-- About Section -->
                      <div style="background-color: #ede9fe; border-left: 4px solid #8b5cf6; padding: 20px; margin: 30px 0; border-radius: 8px;">
                        <h3 style="margin: 0 0 15px; color: #5b21b6; font-size: 16px;">🎓 About OGLENN ENTERPRISES, LLC</h3>
                        <p style="margin: 0; color: #6b21a8; font-size: 14px; line-height: 1.6;">
                          Founded by Dr. Odell Glenn, we specialize in revolutionizing education through the integration of neuroscience research and innovative teaching methodologies. With over two decades of experience across five continents, we develop proprietary learning frameworks that transform how individuals and institutions approach education.
                        </p>
                      </div>

                      <!-- Quote Section -->
                      <div style="text-align: center; padding: 30px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; margin: 30px 0;">
                        <p style="margin: 0; color: #1e293b; font-size: 18px; font-style: italic; line-height: 1.6;">
                          "Education transforms lives when it's combined with neurological insights and innovative methodologies."
                        </p>
                        <p style="margin: 15px 0 0; color: #64748b; font-size: 14px; font-weight: 600;">
                          - Dr. Odell Glenn
                        </p>
                      </div>

                      <!-- Social/Contact Info -->
                      <div style="text-align: center; margin-top: 30px;">
                        <p style="margin: 0 0 15px; color: #64748b; font-size: 14px;">
                          Have questions? Feel free to reply to this email directly.
                        </p>
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #1e293b; padding: 30px 40px; text-align: center;">
                      <p style="margin: 0 0 10px; color: #e2e8f0; font-size: 16px; font-weight: 600;">
                        🧠 OGLENN ENTERPRISES, LLC
                      </p>
                      <p style="margin: 0 0 15px; color: #94a3b8; font-size: 13px;">
                        Transforming Education Through Neuroscience & Innovation
                      </p>
                      <p style="margin: 0; color: #64748b; font-size: 12px;">
                        © ${new Date().getFullYear()} OGLENN ENTERPRISES, LLC. All rights reserved.<br>
                        <span style="color: #475569;">This email was sent because you contacted us through our website.</span>
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

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
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});
app.get('/', (req, res) => {
  res.send('✅ Odell Backend is rhgunning! Use /api/contact or /api/health.');
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on portt ${PORT}`);
});