const { Client } = require('pg')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config()

async function seedDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('Connected!\n')

    // Create admin user
    const adminId = uuidv4()
    const adminPassword = bcrypt.hashSync('admin123', 10)
    await client.query(`
      INSERT INTO "User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `, [adminId, 'admin@golfclub.com', adminPassword, 'Admin User', 'ADMIN', true])
    console.log('✓ Admin user created (email: admin@golfclub.com, password: admin123)')

    // Create sample charities
    const charities = [
      ['Green Earth Foundation', 'Environmental conservation and sustainability programs', 'Environment', true],
      ['Education for All', 'Providing quality education to underprivileged children', 'Education', true],
      ['Health Care Initiative', 'Healthcare services for rural communities', 'Healthcare', false],
      ['Sports Development Fund', 'Promoting sports among youth', 'Sports', false],
    ]

    for (const [name, description, category, isFeatured] of charities) {
      await client.query(`
        INSERT INTO "Charity" (id, name, description, category, "isFeatured", "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [uuidv4(), name, description, category, isFeatured, true])
    }
    console.log('✓ Sample charities created')

    console.log('\\n✅ Database seeded successfully!')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
  } finally {
    await client.end()
  }
}

seedDatabase()
