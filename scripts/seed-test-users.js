const { Client } = require('pg')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()

async function seedTestUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('Connected!\n')

    // Create test users with active subscriptions and scores
    const testUsers = [
      { email: 'user1@test.com', name: 'Test User 1', scores: [5, 12, 18, 25, 30] },
      { email: 'user2@test.com', name: 'Test User 2', scores: [10, 15, 22, 28, 35] },
      { email: 'user3@test.com', name: 'Test User 3', scores: [6, 14, 20, 27, 33] },
      { email: 'user4@test.com', name: 'Test User 4', scores: [8, 16, 24, 31, 38] },
      { email: 'user5@test.com', name: 'Test User 5', scores: [3, 11, 19, 26, 34] },
    ]

    for (const userData of testUsers) {
      // Create user
      const userId = uuidv4()
      const password = bcrypt.hashSync('test123', 10)
      
      await client.query(`
        INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET "isActive" = true
        RETURNING id
      `, [userId, userData.email, password, userData.name, 'SUBSCRIBER', true])
      
      console.log(`✓ Created user: ${userData.email}`)

      // Get actual user ID (in case of conflict)
      const userResult = await client.query('SELECT id FROM "User" WHERE email = $1', [userData.email])
      const actualUserId = userResult.rows[0].id

      // Create active subscription
      const subscriptionId = uuidv4()
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1)
      
      await client.query(`
        INSERT INTO "Subscription" (
          id, "userId", "razorpayOrderId", "razorpayPaymentId", 
          plan, status, amount, currency, "startDate", "endDate", 
          "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        ON CONFLICT ("razorpayOrderId") DO NOTHING
      `, [
        subscriptionId, 
        actualUserId, 
        `test_order_${actualUserId}`, 
        `test_payment_${actualUserId}`,
        'MONTHLY', 
        'ACTIVE', 
        999, 
        'INR', 
        startDate, 
        endDate
      ])
      
      console.log(`  ✓ Created active subscription`)

      // Add scores
      for (let i = 0; i < userData.scores.length; i++) {
        const scoreId = uuidv4()
        const scoreDate = new Date()
        scoreDate.setDate(scoreDate.getDate() - (4 - i)) // Spread over last 5 days
        
        await client.query(`
          INSERT INTO "Score" (id, "userId", score, "scoreDate", "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, NOW(), NOW())
          ON CONFLICT ("userId", "scoreDate") DO NOTHING
        `, [scoreId, actualUserId, userData.scores[i], scoreDate])
      }
      
      console.log(`  ✓ Added ${userData.scores.length} scores: [${userData.scores.join(', ')}]\n`)
    }

    console.log('✅ Test users with subscriptions and scores created successfully!')
    console.log('\nTest Users Created:')
    testUsers.forEach(u => {
      console.log(`  - ${u.email} (password: test123)`)
      console.log(`    Scores: ${u.scores.join(', ')}`)
    })

  } catch (error) {
    console.error('❌ Seeding failed:', error)
  } finally {
    await client.end()
  }
}

seedTestUsers()
