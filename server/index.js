import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

dotenv.config()

// PrismaClient for Serverless
const prisma = globalThis.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
const app = express()

// In-memory bot state for real-time monitoring (Ticket War Console)
let botState = {
    jobCounter: 0,
    proxyStatus: 'Checking...',
    proxies: [], // { ip: string, status: 'live' | 'dead', latency: number }
    browserState: 'Disconnected',
    lastUpdate: null,
    isTargetLive: false,
    activeTasks: [],
    logs: []
}

app.use(cors())
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' })

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token tidak valid.' })
        req.user = user
        next()
    })
}

// Middleware to verify Super Admin role
const requireSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
        next()
    } else {
        res.status(403).json({ error: 'Akses ditolak. Fitur ini hanya untuk Super Admin.' })
    }
}

// Authentication Endpoint
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body

    try {
        const admin = await prisma.admin.findUnique({
            where: { username }
        })

        if (!admin) {
            return res.status(401).json({ error: 'Username atau password salah.' })
        }

        const validPassword = await bcrypt.compare(password, admin.password)
        if (!validPassword) {
            return res.status(401).json({ error: 'Username atau password salah.' })
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: '8h' }
        )
        res.json({ token, username: admin.username, role: admin.role })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Get all merchants
app.get('/api/merchants', async (req, res) => {
    try {
        const merchants = await prisma.merchant.findMany()
        res.json(merchants)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Get slots for a specific merchant and date
app.get('/api/merchants/:id/slots', async (req, res) => {
    const { id } = req.params
    const { date } = req.query

    try {
        const slots = await prisma.timeSlot.findMany({
            where: { merchantId: parseInt(id) },
            include: {
                registrations: {
                    where: { date: date }
                }
            },
            orderBy: { startTime: 'asc' }
        })

        // Map to include current registration count
        const slotsWithStatus = slots.map(slot => ({
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            maxQuota: slot.maxQuota,
            currentCount: slot.registrations.length,
            isAvailable: slot.registrations.length < slot.maxQuota
        }))

        res.json(slotsWithStatus)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Register a new queue
app.post('/api/register', async (req, res) => {
    const { name, email, phone, merchantId, slotId, date } = req.body

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Validate slot availability
            const slot = await tx.timeSlot.findUnique({
                where: { id: parseInt(slotId) },
                include: {
                    registrations: {
                        where: { date: date }
                    }
                }
            })

            if (!slot) throw new Error('Slot waktu tidak ditemukan')
            if (slot.registrations.length >= slot.maxQuota) {
                throw new Error('Kuota untuk slot waktu ini sudah penuh')
            }

            // 2. Get current count for this merchant and date for ticket numbering
            const count = await tx.registration.count({
                where: {
                    merchantId: parseInt(merchantId),
                    date: date
                }
            })

            const rawNumber = count + 1
            const formattedNumber = `A-${rawNumber.toString().padStart(3, '0')}`

            // 3. Create the registration
            const registration = await tx.registration.create({
                data: {
                    name,
                    email,
                    phone,
                    merchantId: parseInt(merchantId),
                    slotId: parseInt(slotId),
                    date,
                    queueNumber: formattedNumber,
                    rawNumber,
                    timeSlot: `${slot.startTime} - ${slot.endTime}`,
                },
                include: {
                    merchant: true,
                    slot: true
                }
            })

            return registration
        })

        res.status(201).json(result)
    } catch (error) {
        console.error('Registration error:', error)
        res.status(500).json({ error: error.message || 'Gagal melakukan pendaftaran. Silakan coba lagi.' })
    }
})

// Get registrations (with optional merchant filtering) - PROTECTED
app.get('/api/registrations', authenticateToken, async (req, res) => {
    const { merchantId, date } = req.query

    try {
        const where = {}
        if (merchantId) where.merchantId = parseInt(merchantId)
        if (date) where.date = date

        const registrations = await prisma.registration.findMany({
            where,
            include: {
                merchant: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        res.json(registrations)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Update registration status - PROTECTED
app.patch('/api/registrations/:id', authenticateToken, async (req, res) => {
    const { id } = req.params
    const { status } = req.body

    try {
        const updated = await prisma.registration.update({
            where: { id: parseInt(id) },
            data: { status }
        })
        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Delete registration - PROTECTED
app.delete('/api/registrations/:id', authenticateToken, async (req, res) => {
    const { id } = req.params
    try {
        await prisma.registration.delete({
            where: { id: parseInt(id) }
        })
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// --- ADMIN MANAGEMENT ENDPOINTS (SUPER ADMIN ONLY) ---

// Get all admins
app.get('/api/admins', authenticateToken, requireSuperAdmin, async (req, res) => {
    try {
        const admins = await prisma.admin.findMany({
            select: { id: true, username: true, role: true }
        })
        res.json(admins)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Create new admin
app.post('/api/admins', authenticateToken, requireSuperAdmin, async (req, res) => {
    const { username, password, role } = req.body
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const newAdmin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
                role: role || 'ADMIN'
            }
        })
        res.status(201).json({ id: newAdmin.id, username: newAdmin.username, role: newAdmin.role })
    } catch (error) {
        res.status(400).json({ error: 'Username sudah digunakan atau data tidak valid.' })
    }
})

// Reset admin password
app.patch('/api/admins/:id/reset-password', authenticateToken, requireSuperAdmin, async (req, res) => {
    const { id } = req.params
    const { newPassword } = req.body
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.admin.update({
            where: { id: parseInt(id) },
            data: { password: hashedPassword }
        })
        res.json({ message: 'Password berhasil direset.' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Delete admin
app.delete('/api/admins/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
    const { id } = req.params
    try {
        await prisma.admin.delete({
            where: { id: parseInt(id) }
        })
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Seed merchants and admin (Initialization)
app.get('/api/seed', async (req, res) => {
    const defaultMerchants = [
        'Boutique Senopati',
        'Merchant Kemang',
        'Store Menteng',
        'Flagship PIK',
        'Balikpapan',
        'Makassar',
        'Kendari',
        'Manado',
        'Palu',
        'Sampit'
    ]

    const defaultSlots = [
        { start: '09:00', end: '09:30' },
        { start: '09:30', end: '10:00' },
        { start: '10:00', end: '10:30' },
        { start: '10:30', end: '11:00' },
        { start: '11:00', end: '11:30' },
        { start: '13:00', end: '13:30' },
        { start: '13:30', end: '14:00' },
        { start: '14:00', end: '14:30' },
    ]

    try {
        // 1. Seed Merchants
        const createdMerchants = []
        for (const name of defaultMerchants) {
            const m = await prisma.merchant.upsert({
                where: { name },
                update: {},
                create: { name }
            })
            createdMerchants.push(m)

            // 2. Seed TimeSlots for each merchant
            for (const slot of defaultSlots) {
                await prisma.timeSlot.upsert({
                    where: {
                        merchantId_startTime_endTime: {
                            merchantId: m.id,
                            startTime: slot.start,
                            endTime: slot.end
                        }
                    },
                    update: {},
                    create: {
                        merchantId: m.id,
                        startTime: slot.start,
                        endTime: slot.end,
                        maxQuota: 5 // Default quota per slot
                    }
                })
            }
        }

        // 3. Seed Default Super Admin
        const hashedPassword = await bcrypt.hash('admin123', 10)
        const admin = await prisma.admin.upsert({
            where: { username: 'admin' },
            update: { role: 'SUPER_ADMIN' },
            create: {
                username: 'admin',
                password: hashedPassword,
                role: 'SUPER_ADMIN'
            }
        })

        res.json({
            message: 'Seeding successful with slots',
            merchants: createdMerchants.length,
            admin: { username: admin.username }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// --- BOT MONITORING ENDPOINTS (TICKET WAR) ---

// Get current bot status
app.get('/api/bot/status', async (req, res) => {
    res.json(botState)
})

// Update bot status (called by monitor/bot scripts)
app.post('/api/bot/update', async (req, res) => {
    const data = req.body

    botState = {
        ...botState,
        ...data,
        lastUpdate: new Date().toISOString()
    }

    // Keep logs manageable (last 50)
    if (data.log) {
        botState.logs = [
            { time: new Date().toISOString(), message: data.log },
            ...botState.logs
        ].slice(0, 50)
    }

    res.json({ success: true })
})

const PORT = process.env.PORT || 5000
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

export default app;
