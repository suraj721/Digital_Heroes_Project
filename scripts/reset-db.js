const { Client } = require('pg')
require('dotenv').config()

async function checkAndCreateSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('Connected to database\n')

    // Check existing tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    console.log('Existing tables:')
    tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`))

    // Drop all tables to start fresh
    console.log('\\nDropping all tables...')
    await client.query('DROP SCHEMA public CASCADE')
    await client.query('CREATE SCHEMA public')
    console.log('✓ Schema reset complete')

    console.log('\\n✅ Ready for fresh migration')
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await client.end()
  }
}

checkAndCreateSchema()
