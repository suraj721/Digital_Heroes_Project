// Test script to create a draw with numbers that will definitely create winners
const { Client } = require('pg')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()

async function createTestDrawWithWinners() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('Creating test draw with guaranteed winners...\n')

    // User scores:
    // user1: 5, 12, 18, 25, 30
    // user2: 10, 15, 22, 28, 35
    // user3: 6, 14, 20, 27, 33
    // user4: 8, 16, 24, 31, 38
    // user5: 3, 11, 19, 26, 34

    // Draw winning numbers that will create matches:
    // Using: 5, 12, 18, 22, 26
    // user1 will have 3 matches (5, 12, 18)
    // user2 will have 1 match (22)
    // user5 will have 1 match (26)
    
    const winningNumbers = [5, 12, 18, 22, 26]
    const drawId = uuidv4()
    const drawDate = new Date()
    const drawMonth = drawDate.toISOString().substring(0, 7)

    await client.query(`
      INSERT INTO "Draw" (
        id, "drawDate", "drawMonth", "drawMode", 
        "totalPrizePool", "jackpotCarryOver", "winningNumbers", 
        "isSimulated", "isPublished", "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    `, [drawId, drawDate, drawMonth, 'RANDOM', 100000, 0, JSON.stringify(winningNumbers), false, true])

    console.log(`✓ Draw created with winning numbers: ${winningNumbers.join(', ')}`)

    // Get user1's ID
    const userResult = await client.query('SELECT id FROM "User" WHERE email = $1', ['user1@test.com'])
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id
      
      // Create winner record for user1 (3 matches)
      const winnerId = uuidv4()
      const prizeAmount = 100000 * 0.25 // 25% for 3 match
      
      await client.query(`
        INSERT INTO "Winner" (
          id, "drawId", "userId", "matchTier", "prizeAmount", "userNumbers",
          "verificationStatus", "paymentStatus", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `, [winnerId, drawId, userId, 'THREE_MATCH', prizeAmount, JSON.stringify([5, 12, 18]), 'PENDING', 'PENDING'])

      console.log(`✓ Winner created: user1@test.com with 3 matches [5, 12, 18] - ₹${prizeAmount}`)
    }

    console.log('\n✅ Test draw with winners created successfully!')

  } catch (error) {
    console.error('❌ Failed:', error)
  } finally {
    await client.end()
  }
}

createTestDrawWithWinners()
