import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminPhone = '01822706901'
  const adminPassword = '01822706901'
  
  const existingAdmin = await prisma.user.findUnique({
    where: { phoneNumber: adminPhone }
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await prisma.user.create({
      data: {
        phoneNumber: adminPhone,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        profile: {
          create: {
            name: 'System Administrator',
            qualifications: 'N/A',
            regNo: 'ADMIN',
            designation: 'Admin',
            clinics: [],
            diagnosticCentres: [],
            pharmaCompanies: [],
            pharmacies: []
          }
        }
      }
    })
    console.log('Admin user created')
  } else {
    console.log('Admin user already exists')
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
