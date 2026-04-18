const { Client } = require('pg')
const fs = require('fs')
require('dotenv').config()

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('Connected!')

    const sql = fs.readFileSync('./scripts/init-db.sql', 'utf8')
    console.log('Running migration...')
    
    await client.query(sql)
    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

runMigration()
