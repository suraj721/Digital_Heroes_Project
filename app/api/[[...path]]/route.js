import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, comparePassword, generateToken, getUserFromRequest } from '@/lib/auth'
import { createOrder, verifyPaymentSignature } from '@/lib/razorpay'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { 
  sendWelcomeEmail, 
  sendWinnerNotification, 
  sendVerificationStatusEmail, 
  sendPaymentConfirmationEmail 
} from '@/lib/email'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function jsonResponse(data, status = 200) {
  return NextResponse.json(data, { status })
}

// Simple in-memory cache for frequently accessed data
const cache = new Map()
const CACHE_TTL = 60000 // 1 minute

function getCached(key) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() })
}

export async function GET(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api/', '')

  try {
    if (path === '' || path === '/') {
      return jsonResponse({ message: 'Golf Prize Club API' })
    }

    if (path === 'auth/me') {
      const userData = getUserFromRequest(request)
      if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)
      const user = await prisma.user.findUnique({
        where: { id: userData.userId },
        select: { id: true, email: true, name: true, role: true, isActive: true },
      })
      return jsonResponse({ user })
    }

    if (path === 'subscription/status') {
      const userData = getUserFromRequest(request)
      if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)
      const subscription = await prisma.subscription.findFirst({
        where: { userId: userData.userId, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      })
      return jsonResponse({ subscription })
    }

    if (path === 'scores') {
      const userData = getUserFromRequest(request)
      if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)
      const scores = await prisma.score.findMany({
        where: { userId: userData.userId },
        orderBy: { scoreDate: 'desc' },
        take: 5,
      })
      return jsonResponse({ scores })
    }

    if (path === 'charities') {
      const charities = await prisma.charity.findMany({
        where: { isActive: true },
        orderBy: { isFeatured: 'desc' },
      })
      return jsonResponse({ charities })
    }

    if (path === 'user-charity') {
      const userData = getUserFromRequest(request)
      if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)
      const userCharity = await prisma.userCharity.findUnique({
        where: { userId: userData.userId },
        include: { charity: true },
      })
      return jsonResponse({ userCharity })
    }

    if (path === 'draws') {
      const draws = await prisma.draw.findMany({
        where: { isPublished: true },
        orderBy: { drawDate: 'desc' },
        take: 10,
      })
      return jsonResponse({ draws })
    }

    if (path === 'winners/my') {
      const userData = getUserFromRequest(request)
      if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)
      const winners = await prisma.winner.findMany({
        where: { userId: userData.userId },
        include: { draw: true },
        orderBy: { createdAt: 'desc' },
      })
      return jsonResponse({ winners })
    }

    if (path === 'admin/users') {
      const userData = getUserFromRequest(request)
      if (!userData || userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      })
      return jsonResponse({ users })
    }

    if (path === 'admin/analytics') {
      const userData = getUserFromRequest(request)
      if (!userData || userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      
      // Use cache for analytics
      const cacheKey = 'admin_analytics'
      const cached = getCached(cacheKey)
      if (cached) return jsonResponse(cached)
      
      // Run all counts in parallel for speed
      const [totalUsers, activeSubscriptions, totalDraws, totalWinners, totalCharities] = await Promise.all([
        prisma.user.count(),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.draw.count(),
        prisma.winner.count(),
        prisma.charity.count()
      ])
      
      const result = { totalUsers, activeSubscriptions, totalDraws, totalWinners, totalCharities }
      setCache(cacheKey, result)
      return jsonResponse(result)
    }

    if (path === 'admin/winners') {
      const userData = getUserFromRequest(request)
      if (!userData || userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      const winners = await prisma.winner.findMany({
        include: { 
          user: { select: { email: true, name: true } }, 
          draw: { select: { drawDate: true, winningNumbers: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit to recent 50 winners for performance
      })
      return jsonResponse({ winners })
    }

    if (path === 'admin/charities') {
      const userData = getUserFromRequest(request)
      if (!userData || userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      const charities = await prisma.charity.findMany({ orderBy: { createdAt: 'desc' } })
      return jsonResponse({ charities })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  } catch (error) {
    console.error('GET Error:', error)
    return jsonResponse({ error: error.message }, 500)
  }
}

export async function POST(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api/', '')

  try {
    let body = {}
    const contentType = request.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      try { body = await request.json() } catch (e) { body = {} }
    }

    if (path === 'auth/signup') {
      const { email, password, name, phone, charityId, contributionPercent } = body
      if (!email || !password) return jsonResponse({ error: 'Email and password required' }, 400)
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) return jsonResponse({ error: 'Email already exists' }, 400)
      const hashedPassword = hashPassword(password)
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name, phone },
      })
      if (charityId) {
        await prisma.userCharity.create({
          data: {
            userId: user.id,
            charityId,
            contributionPercent: contributionPercent || 10,
          },
        })
      }
      
      // Send welcome email (non-blocking)
      sendWelcomeEmail(user.email, user.name).catch(err => 
        console.error('Welcome email failed:', err)
      )
      
      const token = generateToken(user)
      return jsonResponse({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token })
    }

    if (path === 'auth/login') {
      const { email, password } = body
      if (!email || !password) return jsonResponse({ error: 'Email and password required' }, 400)
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user || !comparePassword(password, user.password)) {
        return jsonResponse({ error: 'Invalid credentials' }, 401)
      }
      const token = generateToken(user)
      return jsonResponse({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token })
    }

    if (path === 'subscription/create') {
      const userData = getUserFromRequest(request)
      if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)
      const { plan } = body
      const amount = plan === 'YEARLY' ? 9999 : 999
      const order = await createOrder(amount, 'INR', `sub_${userData.userId.substring(0, 20)}`)
      const subscription = await prisma.subscription.create({
        data: { userId: userData.userId, razorpayOrderId: order.id, plan, amount, status: 'PENDING' },
      })
      return jsonResponse({ order, subscription })
    }

    if (path === 'subscription/demo') {
      const userData = getUserFromRequest(request)
      if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)
      const existingSubscription = await prisma.subscription.findFirst({
        where: { userId: userData.userId, status: 'ACTIVE' },
      })
      if (existingSubscription) return jsonResponse({ error: 'Already have subscription' }, 400)
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7)
      const timestamp = Date.now()
      const subscription = await prisma.subscription.create({
        data: {
          userId: userData.userId,
          razorpayOrderId: `demo_order_${timestamp}`,
          razorpayPaymentId: `demo_payment_${timestamp}`,
          plan: 'MONTHLY',
          amount: 0,
          status: 'ACTIVE',
          startDate,
          endDate,
        },
      })
      await prisma.user.update({ where: { id: userData.userId }, data: { isActive: true } })
      return jsonResponse({ subscription, message: 'Demo activated! Valid for 7 days.' })
    }

    if (path === 'subscription/verify') {
      const userData = getUserFromRequest(request)
      if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body
      const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
      if (!isValid) return jsonResponse({ error: 'Invalid signature' }, 400)
      const subscription = await prisma.subscription.findFirst({ where: { razorpayOrderId: razorpay_order_id } })
      if (!subscription) return jsonResponse({ error: 'Subscription not found' }, 404)
      const startDate = new Date()
      const endDate = new Date()
      if (subscription.plan === 'YEARLY') {
        endDate.setFullYear(endDate.getFullYear() + 1)
      } else {
        endDate.setMonth(endDate.getMonth() + 1)
      }
      const updated = await prisma.subscription.update({
        where: { id: subscription.id },
        data: { razorpayPaymentId: razorpay_payment_id, status: 'ACTIVE', startDate, endDate },
      })
      await prisma.user.update({ where: { id: userData.userId }, data: { isActive: true } })
      return jsonResponse({ subscription: updated })
    }

    if (path === 'scores') {
      const userData = getUserFromRequest(request)
      if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)
      const { score, scoreDate } = body
      if (!score || score < 1 || score > 45) return jsonResponse({ error: 'Score must be 1-45' }, 400)
      const existingScores = await prisma.score.findMany({
        where: { userId: userData.userId },
        orderBy: { scoreDate: 'asc' },
      })
      if (existingScores.length >= 5) {
        await prisma.score.delete({ where: { id: existingScores[0].id } })
      }
      const newScore = await prisma.score.create({
        data: { userId: userData.userId, score, scoreDate: new Date(scoreDate) },
      })
      return jsonResponse({ score: newScore })
    }

    if (path === 'user-charity') {
      const userData = getUserFromRequest(request)
      if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)
      const { charityId, contributionPercent } = body
      if (contributionPercent < 10) return jsonResponse({ error: 'Minimum 10%' }, 400)
      const userCharity = await prisma.userCharity.upsert({
        where: { userId: userData.userId },
        update: { charityId, contributionPercent },
        create: { userId: userData.userId, charityId, contributionPercent },
      })
      return jsonResponse({ userCharity })
    }

    if (path === 'admin/draw/run') {
      const userData = getUserFromRequest(request)
      if (!userData || userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      const { drawMode } = body
      
      // Generate winning numbers based on draw mode
      let winningNumbers
      if (drawMode === 'WEIGHTED') {
        // Get all active users with their latest 5 scores
        const activeUsers = await prisma.user.findMany({
          where: { 
            isActive: true,
            subscriptions: {
              some: { status: 'ACTIVE' }
            }
          },
          include: {
            scores: {
              orderBy: { scoreDate: 'desc' },
              take: 5
            }
          }
        })
        
        // Create weighted pool based on scores (lower scores = better = more entries)
        const weightedPool = []
        activeUsers.forEach(user => {
          if (user.scores.length > 0) {
            const avgScore = user.scores.reduce((sum, s) => sum + s.score, 0) / user.scores.length
            // Lower score = more weight (45 - avgScore gives us inverted weight)
            const weight = Math.max(1, Math.floor(46 - avgScore))
            for (let i = 0; i < weight; i++) {
              user.scores.forEach(s => weightedPool.push(s.score))
            }
          }
        })
        
        // Select 5 unique numbers from weighted pool
        const selected = new Set()
        while (selected.size < 5 && weightedPool.length > 0) {
          const idx = Math.floor(Math.random() * weightedPool.length)
          selected.add(weightedPool[idx])
        }
        // Fill remaining with random if needed
        while (selected.size < 5) {
          selected.add(Math.floor(Math.random() * 45) + 1)
        }
        winningNumbers = Array.from(selected)
      } else {
        // RANDOM mode: pure random 5 unique numbers
        const selected = new Set()
        while (selected.size < 5) {
          selected.add(Math.floor(Math.random() * 45) + 1)
        }
        winningNumbers = Array.from(selected)
      }
      
      const drawDate = new Date()
      const drawMonth = drawDate.toISOString().substring(0, 7)
      const totalPrizePool = 100000
      
      // Create draw
      const draw = await prisma.draw.create({
        data: {
          drawDate,
          drawMonth,
          drawMode: drawMode || 'RANDOM',
          totalPrizePool,
          winningNumbers: JSON.stringify(winningNumbers),
          isPublished: true,
        },
      })
      
      // Calculate winners
      const activeUsers = await prisma.user.findMany({
        where: { 
          isActive: true,
          subscriptions: {
            some: { status: 'ACTIVE' }
          }
        },
        include: {
          scores: {
            orderBy: { scoreDate: 'desc' },
            take: 5
          }
        }
      })
      
      const winners = {
        FIVE_MATCH: [],
        FOUR_MATCH: [],
        THREE_MATCH: []
      }
      
      // Check each user's scores against winning numbers
      activeUsers.forEach(user => {
        const userNumbers = user.scores.map(s => s.score)
        const matches = userNumbers.filter(n => winningNumbers.includes(n))
        
        if (matches.length >= 5) {
          winners.FIVE_MATCH.push({ userId: user.id, matchedNumbers: matches.slice(0, 5) })
        } else if (matches.length >= 4) {
          winners.FOUR_MATCH.push({ userId: user.id, matchedNumbers: matches.slice(0, 4) })
        } else if (matches.length >= 3) {
          winners.THREE_MATCH.push({ userId: user.id, matchedNumbers: matches.slice(0, 3) })
        }
      })
      
      // Prize distribution (40% / 35% / 25%)
      const fiveMatchPrize = totalPrizePool * 0.40
      const fourMatchPrize = totalPrizePool * 0.35
      const threeMatchPrize = totalPrizePool * 0.25
      
      // Create winner records
      const createdWinners = []
      
      if (winners.FIVE_MATCH.length > 0) {
        const prizePerWinner = fiveMatchPrize / winners.FIVE_MATCH.length
        for (const w of winners.FIVE_MATCH) {
          const winner = await prisma.winner.create({
            data: {
              drawId: draw.id,
              userId: w.userId,
              matchTier: 'FIVE_MATCH',
              prizeAmount: prizePerWinner,
              userNumbers: JSON.stringify(w.matchedNumbers)
            },
            include: { user: { select: { email: true, name: true } } }
          })
          createdWinners.push(winner)
          
          // Send winner notification email (non-blocking)
          sendWinnerNotification(winner.user.email, winner.user.name, {
            prizeAmount: prizePerWinner,
            matchTier: 'FIVE_MATCH',
            winningNumbers: w.matchedNumbers
          }).catch(err => console.error('Winner email failed:', err))
        }
      }
      
      if (winners.FOUR_MATCH.length > 0) {
        const prizePerWinner = fourMatchPrize / winners.FOUR_MATCH.length
        for (const w of winners.FOUR_MATCH) {
          const winner = await prisma.winner.create({
            data: {
              drawId: draw.id,
              userId: w.userId,
              matchTier: 'FOUR_MATCH',
              prizeAmount: prizePerWinner,
              userNumbers: JSON.stringify(w.matchedNumbers)
            },
            include: { user: { select: { email: true, name: true } } }
          })
          createdWinners.push(winner)
          
          // Send winner notification email (non-blocking)
          sendWinnerNotification(winner.user.email, winner.user.name, {
            prizeAmount: prizePerWinner,
            matchTier: 'FOUR_MATCH',
            winningNumbers: w.matchedNumbers
          }).catch(err => console.error('Winner email failed:', err))
        }
      }
      
      if (winners.THREE_MATCH.length > 0) {
        const prizePerWinner = threeMatchPrize / winners.THREE_MATCH.length
        for (const w of winners.THREE_MATCH) {
          const winner = await prisma.winner.create({
            data: {
              drawId: draw.id,
              userId: w.userId,
              matchTier: 'THREE_MATCH',
              prizeAmount: prizePerWinner,
              userNumbers: JSON.stringify(w.matchedNumbers)
            },
            include: { user: { select: { email: true, name: true } } }
          })
          createdWinners.push(winner)
          
          // Send winner notification email (non-blocking)
          sendWinnerNotification(winner.user.email, winner.user.name, {
            prizeAmount: prizePerWinner,
            matchTier: 'THREE_MATCH',
            winningNumbers: w.matchedNumbers
          }).catch(err => console.error('Winner email failed:', err))
        }
      }
      
      return jsonResponse({ 
        draw, 
        winningNumbers,
        winners: createdWinners,
        summary: {
          fiveMatch: winners.FIVE_MATCH.length,
          fourMatch: winners.FOUR_MATCH.length,
          threeMatch: winners.THREE_MATCH.length
        }
      })
    }

    if (path === 'admin/charity') {
      const userData = getUserFromRequest(request)
      if (!userData || userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      const { name, description, category, imageUrl, websiteUrl, isFeatured } = body
      const charity = await prisma.charity.create({
        data: { name, description, category, imageUrl, websiteUrl, isFeatured: isFeatured || false, isActive: true },
      })
      return jsonResponse({ charity })
    }

    if (path === 'admin/winner/verify') {
      const userData = getUserFromRequest(request)
      if (!userData || userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      const { winnerId, status } = body
      const winner = await prisma.winner.update({
        where: { id: winnerId },
        data: { verificationStatus: status, verifiedAt: status === 'APPROVED' ? new Date() : null },
        include: { user: { select: { email: true, name: true } } }
      })
      
      // Send verification status email (non-blocking)
      sendVerificationStatusEmail(
        winner.user.email, 
        winner.user.name, 
        status, 
        winner.prizeAmount
      ).catch(err => console.error('Verification email failed:', err))
      
      return jsonResponse({ winner })
    }

    if (path === 'admin/winner/payment') {
      const userData = getUserFromRequest(request)
      if (!userData || userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      const { winnerId } = body
      const winner = await prisma.winner.update({
        where: { id: winnerId },
        data: { paymentStatus: 'PAID', paidAt: new Date() },
        include: { user: { select: { email: true, name: true } } }
      })
      
      // Send payment confirmation email (non-blocking)
      sendPaymentConfirmationEmail(
        winner.user.email,
        winner.user.name,
        winner.prizeAmount,
        winner.matchTier
      ).catch(err => console.error('Payment email failed:', err))
      
      return jsonResponse({ winner })
    }

    if (path === 'winner/proof-upload') {
      const userData = getUserFromRequest(request)
      if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)
      
      try {
        // Get form data
        const formData = await request.formData()
        const file = formData.get('proof')
        const winnerId = formData.get('winnerId')
        
        if (!file || !winnerId) {
          return jsonResponse({ error: 'File and winnerId required' }, 400)
        }
        
        // Verify winner belongs to user
        const winner = await prisma.winner.findFirst({
          where: { id: winnerId, userId: userData.userId }
        })
        
        if (!winner) {
          return jsonResponse({ error: 'Winner not found' }, 404)
        }
        
        // Create uploads directory
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'proofs')
        await mkdir(uploadsDir, { recursive: true })
        
        // Save file
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fileName = `proof_${winnerId}_${Date.now()}.${file.name.split('.').pop()}`
        const filePath = path.join(uploadsDir, fileName)
        
        await writeFile(filePath, buffer)
        
        // Update winner record
        const proofUrl = `/uploads/proofs/${fileName}`
        const updatedWinner = await prisma.winner.update({
          where: { id: winnerId },
          data: { proofUrl }
        })
        
        return jsonResponse({ winner: updatedWinner, message: 'Proof uploaded successfully' })
      } catch (error) {
        console.error('Proof upload error:', error)
        return jsonResponse({ error: 'Upload failed' }, 500)
      }
    }

    if (path.match(/^admin\/user\/[\w-]+\/toggle$/)) {
      const userData = getUserFromRequest(request)
      if (!userData || userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      
      const userId = path.split('/')[2]
      const { isActive } = body
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive }
      })
      
      return jsonResponse({ user })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  } catch (error) {
    console.error('POST Error:', error)
    return jsonResponse({ error: error.message }, 500)
  }
}

export async function PUT(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api/', '')

  try {
    const body = await request.json()
    const userData = getUserFromRequest(request)
    if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)

    if (path.startsWith('scores/')) {
      const scoreId = path.split('/')[1]
      const { score } = body
      if (score < 1 || score > 45) return jsonResponse({ error: 'Score must be 1-45' }, 400)
      const updated = await prisma.score.update({
        where: { id: scoreId, userId: userData.userId },
        data: { score },
      })
      return jsonResponse({ score: updated })
    }

    if (path.startsWith('admin/charity/')) {
      if (userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      const charityId = path.split('/')[2]
      const charity = await prisma.charity.update({ where: { id: charityId }, data: body })
      return jsonResponse({ charity })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  } catch (error) {
    console.error('PUT Error:', error)
    return jsonResponse({ error: error.message }, 500)
  }
}

export async function DELETE(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api/', '')

  try {
    const userData = getUserFromRequest(request)
    if (!userData) return jsonResponse({ error: 'Unauthorized' }, 401)

    if (path.startsWith('scores/')) {
      const scoreId = path.split('/')[1]
      await prisma.score.delete({ where: { id: scoreId, userId: userData.userId } })
      return jsonResponse({ success: true })
    }

    if (path.startsWith('admin/charity/')) {
      if (userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      const charityId = path.split('/')[2]
      await prisma.charity.delete({ where: { id: charityId } })
      return jsonResponse({ success: true })
    }

    if (path.startsWith('admin/user/')) {
      if (userData.role !== 'ADMIN') return jsonResponse({ error: 'Forbidden' }, 403)
      const userId = path.split('/')[2]
      // Prevent admin from deleting themselves
      if (userId === userData.userId) {
        return jsonResponse({ error: 'Cannot delete your own account' }, 400)
      }
      await prisma.user.delete({ where: { id: userId } })
      return jsonResponse({ success: true })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  } catch (error) {
    console.error('DELETE Error:', error)
    return jsonResponse({ error: error.message }, 500)
  }
}
