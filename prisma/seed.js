const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const teacher = await prisma.user.upsert({
    where: { email: 'guru@sekolah.com' },
    update: {},
    create: {
      email: 'guru@sekolah.com',
      password: 'admin',
      role: 'teacher',
      fullName: 'Guru Utama',
      status: 'active',
      points: 0,
      completedModules: '[]'
    },
  })
  console.log({ teacher })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
