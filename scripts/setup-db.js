const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Setting up database...')

  try {
    // Create admin user
    const adminPassword = bcrypt.hashSync('admin123', 10)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@golfclub.com' },
      update: {},
      create: {
        email: 'admin@golfclub.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
      },
    })
    console.log('✓ Admin user created:', admin.email)

    // Create sample charities
    const charities = [
      {
        name: 'Green Earth Foundation',
        description: 'Environmental conservation and sustainability programs',
        category: 'Environment',
        isFeatured: true,
      },
      {
        name: 'Education for All',
        description: 'Providing quality education to underprivileged children',
        category: 'Education',
        isFeatured: true,
      },
      {
        name: 'Health Care Initiative',
        description: 'Healthcare services for rural communities',
        category: 'Healthcare',
        isFeatured: false,
      },
      {
        name: 'Sports Development Fund',
        description: 'Promoting sports among youth',
        category: 'Sports',
        isFeatured: false,
      },
    ]

    for (const charity of charities) {
      await prisma.charity.upsert({
        where: { name: charity.name },
        update: {},
        create: charity,
      })
    }
    console.log('✓ Sample charities created')

    console.log('\\n✅ Database setup complete!')
    console.log('\\nAdmin credentials:')
    console.log('Email: admin@golfclub.com')
    console.log('Password: admin123')
  } catch (error) {
    console.error('Error setting up database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
