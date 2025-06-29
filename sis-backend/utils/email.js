import nodemailer from 'nodemailer'

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })
}

// Send email function
export const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"CoreSIS" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
      attachments
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return info
  } catch (error) {
    console.error('Email sending failed:', error)
    throw error
  }
}

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetURL = `${process.env.CLIENT_URL || 'https://coresis.app'}/reset-password/${resetToken}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1976D2, #1565C0); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">CoreSIS</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Powering Pathways. Fueling Futures.</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          You requested a password reset for your CoreSIS account. Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" 
             style="display: inline-block; padding: 15px 30px; background-color: #1976D2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
          This link will expire in <strong>1 hour</strong> for security reasons.
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
          If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetURL}" style="color: #1976D2;">${resetURL}</a>
        </p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2025 CoreSIS. All rights reserved.</p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: '🔐 Reset Your CoreSIS Password',
    html
  })
}

// Send email verification email
export const sendEmailVerification = async (email, verificationToken) => {
  const verificationURL = `${process.env.CLIENT_URL || 'https://coresis.app'}/verify-email/${verificationToken}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">CoreSIS</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Powering Pathways. Fueling Futures.</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          Welcome to CoreSIS! Please verify your email address to complete your account setup and access all features.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationURL}" 
             style="display: inline-block; padding: 15px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
          This verification link will expire in <strong>24 hours</strong>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${verificationURL}" style="color: #4CAF50;">${verificationURL}</a>
        </p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2025 CoreSIS. All rights reserved.</p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: '📧 Verify Your CoreSIS Email Address',
    html
  })
}

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  const loginURL = `${process.env.CLIENT_URL || 'https://coresis.app'}/login`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1976D2, #1565C0); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">CoreSIS</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Powering Pathways. Fueling Futures.</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Welcome to CoreSIS, ${name}!</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          Your account has been successfully created. You're now ready to access the comprehensive student information system designed to power your educational journey.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginURL}" 
             style="display: inline-block; padding: 15px 30px; background-color: #1976D2; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Access CoreSIS
          </a>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 25px 0;">
          <h3 style="color: #1976D2; margin-top: 0;">What you can do with CoreSIS:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>📚 View your courses and assignments</li>
            <li>📊 Track your academic progress</li>
            <li>💰 Monitor your financial status</li>
            <li>📅 Access your class schedule</li>
            <li>💬 Communicate with instructors</li>
            <li>📱 Use on any device, anywhere</li>
          </ul>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          If you have any questions or need assistance, please don't hesitate to contact our support team.
        </p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2025 CoreSIS. All rights reserved.</p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: '🎓 Welcome to CoreSIS - Your Educational Journey Starts Here',
    html
  })
}

// Send assignment notification
export const sendAssignmentNotification = async (email, studentName, assignmentTitle, dueDate, courseCode) => {
  const loginURL = `${process.env.CLIENT_URL || 'https://coresis.app'}/login`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF9800, #F57C00); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">CoreSIS</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Powering Pathways. Fueling Futures.</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">New Assignment Posted</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          Hello ${studentName}, a new assignment has been posted for your course.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #FF9800; margin: 25px 0;">
          <h3 style="color: #333; margin-top: 0;">Assignment Details:</h3>
          <p style="color: #666; margin: 5px 0;"><strong>Title:</strong> ${assignmentTitle}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Course:</strong> ${courseCode}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginURL}" 
             style="display: inline-block; padding: 15px 30px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Assignment
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          Please log in to CoreSIS to view the full assignment details and submit your work on time.
        </p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2025 CoreSIS. All rights reserved.</p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: '📚 New Assignment: ' + assignmentTitle,
    html
  })
}

// Send grade notification
export const sendGradeNotification = async (email, studentName, courseCode, assignmentTitle, grade) => {
  const loginURL = `${process.env.CLIENT_URL || 'https://coresis.app'}/login`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">CoreSIS</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Powering Pathways. Fueling Futures.</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">Grade Posted</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
          Hello ${studentName}, a grade has been posted for your assignment.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #4CAF50; margin: 25px 0;">
          <h3 style="color: #333; margin-top: 0;">Grade Details:</h3>
          <p style="color: #666; margin: 5px 0;"><strong>Assignment:</strong> ${assignmentTitle}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Course:</strong> ${courseCode}</p>
          <p style="color: #666; margin: 5px 0;"><strong>Grade:</strong> <span style="font-weight: bold; color: #4CAF50;">${grade}</span></p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginURL}" 
             style="display: inline-block; padding: 15px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            View Grade Details
          </a>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          Log in to CoreSIS to view detailed feedback and track your overall progress.
        </p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2025 CoreSIS. All rights reserved.</p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: '📊 Grade Posted: ' + assignmentTitle,
    html
  })
}

// Send system notification
export const sendSystemNotification = async (email, subject, message, type = 'info') => {
  const colors = {
    info: '#1976D2',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336'
  }
  
  const color = colors[type] || colors.info
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, ${color}, ${color}dd); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">CoreSIS</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Powering Pathways. Fueling Futures.</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
        
        <div style="background: white; padding: 20px; border-radius: 5px; border-left: 4px solid ${color}; margin: 25px 0;">
          <p style="color: #666; line-height: 1.6; margin: 0;">${message}</p>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          Thank you for using CoreSIS.
        </p>
      </div>
      
      <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
        <p style="margin: 0;">© 2025 CoreSIS. All rights reserved.</p>
      </div>
    </div>
  `

  return sendEmail({
    to: email,
    subject: `🔔 CoreSIS Notification: ${subject}`,
    html
  })
} 