import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function createOrder(amount, currency = 'INR', receipt) {
  const options = {
    amount: amount * 100, // Convert to paise
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    payment_capture: 1,
  }
  return await razorpay.orders.create(options)
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  const text = orderId + '|' + paymentId
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex')
  return expectedSignature === signature
}

export default razorpay
