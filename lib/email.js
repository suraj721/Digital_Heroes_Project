import nodemailer from 'nodemailer'

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
})

const senderEmail = process.env.GMAIL_USER || 'surajkumarrai721@gmail.com'
const senderName = 'Elite Golf Club'

// Welcome email on signup
export async function sendWelcomeEmail(userEmail, userName) {
  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: userEmail,
      subject: '🏌️ Welcome to Elite Golf Club!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0F5132 0%, #D4AF37 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🏆 Elite Golf Club</h1>
          </div>
          <div style="background: #f8f9f7; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #0F5132; margin-top: 0;">Welcome ${userName || 'Golfer'}!</h2>
            <p style="color: #2E2E2E; font-size: 16px; line-height: 1.6;">
              Thank you for joining Elite Golf Club - the premier platform for golf performance tracking and rewards!
            </p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #D4AF37;">
              <h3 style="color: #0F5132; margin-top: 0;">What's Next?</h3>
              <ul style="color: #2E2E2E; line-height: 1.8;">
                <li>📊 Track your golf scores</li>
                <li>🎯 Enter monthly draws with prize pools up to ₹100,000</li>
                <li>❤️ Support your favorite charity</li>
                <li>🏆 Win amazing prizes!</li>
              </ul>
            </div>
            <p style="color: #2E2E2E; font-size: 14px;">
              <strong>Get Started:</strong> Subscribe to activate your membership and start entering draws!
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background: #0F5132; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              Elite Golf Club - Where Performance Meets Rewards
            </p>
          </div>
        </div>
      `
    })
    
    console.log('✅ Welcome email sent to:', userEmail, '| Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error)
    return { success: false, error: error.message }
  }
}

// Draw result notification to winners
export async function sendWinnerNotification(userEmail, userName, drawDetails) {
  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: userEmail,
      subject: '🎉 Congratulations! You Won the Draw!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #D4AF37 0%, #0F5132 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🎉 YOU WON!</h1>
          </div>
          <div style="background: #f8f9f7; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #0F5132; margin-top: 0;">Congratulations ${userName || 'Champion'}!</h2>
            <p style="color: #2E2E2E; font-size: 16px; line-height: 1.6;">
              Amazing news! You've won in the latest Elite Golf Club draw!
            </p>
            <div style="background: linear-gradient(135deg, #D4AF37 0%, #D4AF37 100%); padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="color: white; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Prize</p>
              <h1 style="color: white; margin: 10px 0; font-size: 48px; font-weight: bold;">₹${drawDetails.prizeAmount.toLocaleString()}</h1>
              <p style="color: white; margin: 0; font-size: 16px;">${drawDetails.matchTier.replace('_', ' ')}</p>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0F5132; margin-top: 0;">Your Winning Numbers:</h3>
              <div style="text-align: center;">
                ${drawDetails.winningNumbers.map(num => 
                  `<span style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #D4AF37 100%); width: 50px; height: 50px; border-radius: 50%; line-height: 50px; color: white; font-size: 20px; font-weight: bold; margin: 5px;">${num}</span>`
                ).join('')}
              </div>
            </div>
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #D4AF37; margin: 20px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>⚠️ Action Required:</strong> Please upload proof of your golf scores to claim your prize. Login to your dashboard and upload a screenshot.
              </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background: #0F5132; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Upload Proof & Claim Prize
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              Elite Golf Club - Congratulations on your win!
            </p>
          </div>
        </div>
      `
    })
    
    console.log('✅ Winner notification sent to:', userEmail, '| Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send winner notification:', error)
    return { success: false, error: error.message }
  }
}

// Winner verification status update
export async function sendVerificationStatusEmail(userEmail, userName, status, prizeAmount) {
  const isApproved = status === 'APPROVED'
  
  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: userEmail,
      subject: isApproved ? '✅ Winner Verification Approved!' : '❌ Winner Verification Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${isApproved ? '#28a745' : '#dc3545'}; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${isApproved ? '✅ Approved!' : '❌ Update Required'}</h1>
          </div>
          <div style="background: #f8f9f7; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #0F5132; margin-top: 0;">Hello ${userName || 'Member'},</h2>
            ${isApproved ? `
              <p style="color: #2E2E2E; font-size: 16px; line-height: 1.6;">
                Great news! Your winner verification has been <strong style="color: #28a745;">APPROVED</strong> by our admin team.
              </p>
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #28a745;">
                <p style="color: #666; margin: 0; font-size: 14px;">Your Prize Amount</p>
                <h1 style="color: #D4AF37; margin: 10px 0; font-size: 42px;">₹${prizeAmount.toLocaleString()}</h1>
                <p style="color: #28a745; margin: 0; font-size: 16px; font-weight: bold;">Payment Processing</p>
              </div>
              <p style="color: #2E2E2E; font-size: 14px;">
                Your prize payment is now being processed. You'll receive a confirmation email once the payment is completed.
              </p>
            ` : `
              <p style="color: #2E2E2E; font-size: 16px; line-height: 1.6;">
                We've reviewed your winner verification proof and unfortunately it was <strong style="color: #dc3545;">NOT APPROVED</strong>.
              </p>
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>What to do next:</strong> Please upload a clear, valid screenshot of your golf scores showing the winning numbers.
                </p>
              </div>
              <div style="text-align: center; margin: 20px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background: #0F5132; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                  Upload New Proof
                </a>
              </div>
            `}
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              Elite Golf Club - Verification Team
            </p>
          </div>
        </div>
      `
    })
    
    console.log('✅ Verification status email sent to:', userEmail, '| Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send verification status email:', error)
    return { success: false, error: error.message }
  }
}

// Payment confirmation email
export async function sendPaymentConfirmationEmail(userEmail, userName, prizeAmount, matchTier) {
  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: userEmail,
      subject: '💰 Payment Confirmed - Prize Sent!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px;">💰 Payment Sent!</h1>
          </div>
          <div style="background: #f8f9f7; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #0F5132; margin-top: 0;">Congratulations ${userName || 'Winner'}!</h2>
            <p style="color: #2E2E2E; font-size: 16px; line-height: 1.6;">
              Your prize payment has been successfully processed and sent! 🎉
            </p>
            <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #28a745;">
              <p style="color: #666; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Payment Amount</p>
              <h1 style="color: #28a745; margin: 10px 0; font-size: 48px; font-weight: bold;">₹${prizeAmount.toLocaleString()}</h1>
              <p style="color: #666; margin: 0; font-size: 16px;">${matchTier.replace('_', ' ')} Winner</p>
            </div>
            <div style="background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
              <p style="color: #155724; margin: 0; font-size: 14px;">
                <strong>✓ Payment Status:</strong> Completed<br>
                <strong>✓ Payment Method:</strong> Bank Transfer<br>
                <strong>✓ Date:</strong> ${new Date().toLocaleDateString()}
              </p>
            </div>
            <p style="color: #2E2E2E; font-size: 14px; line-height: 1.6;">
              Thank you for being a valued member of Elite Golf Club. Keep playing and enter our next draw for another chance to win!
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background: #0F5132; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Dashboard
              </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
              Elite Golf Club - Thank you for playing with us!
            </p>
          </div>
        </div>
      `
    })
    
    console.log('✅ Payment confirmation sent to:', userEmail, '| Message ID:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send payment confirmation:', error)
    return { success: false, error: error.message }
  }
}
