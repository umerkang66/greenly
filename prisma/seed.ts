import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')
    try {
        await prisma.$connect()
        console.log('Connected to database')
    } catch (e) {
        console.error('Failed to connect to database', e)
        throw e
    }

    // Clean up database
    // Deleting in reverse order of dependencies (mostly) to avoid issues, 
    // though MongoDB relationships are loose, it's good practice.
    await prisma.notification.deleteMany()
    await prisma.like.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.chatMessage.deleteMany()
    await prisma.meeting.deleteMany()
    await prisma.challengeParticipant.deleteMany()
    await prisma.challenge.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.userBadge.deleteMany()
    await prisma.badge.deleteMany()
    await prisma.communityMember.deleteMany()
    await prisma.post.deleteMany()
    await prisma.community.deleteMany()
    await prisma.account.deleteMany()
    await prisma.session.deleteMany()
    await prisma.verification.deleteMany()
    await prisma.user.deleteMany()

    console.log('Database cleared.')

    // Users
    const user1 = await prisma.user.create({
        data: {
            id: 'user_alice',
            name: 'Alice Green',
            email: 'alice@greenly.com',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
            points: 450,
            emailVerified: true,
        },
    })

    const user2 = await prisma.user.create({
        data: {
            id: 'user_bob',
            name: 'Bob Earth',
            email: 'bob@greenly.com',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
            points: 200,
            emailVerified: true,
        },
    })

    const user3 = await prisma.user.create({
        data: {
            id: 'user_charlie',
            name: 'Charlie Wind',
            email: 'charlie@greenly.com',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
            points: 800,
            emailVerified: true,
        },
    })

    // Communities
    const comm1 = await prisma.community.create({
        data: {
            name: 'Zero Waste Living',
            slug: 'zero-waste',
            description: 'A community for those striving for a zero-waste lifestyle.',
            ownerId: user1.id,
            imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
        }
    })

    const comm2 = await prisma.community.create({
        data: {
            name: 'Bike Commuters',
            slug: 'bike-commuters',
            description: 'Join us in reducing carbon footprint by biking to work.',
            ownerId: user2.id,
            imageUrl: 'https://images.unsplash.com/photo-1485965120184-e224f723d62d?auto=format&fit=crop&w=800&q=80',
        }
    })

    // Members
    await prisma.communityMember.createMany({
        data: [
            { userId: user1.id, communityId: comm1.id, role: 'ADMIN' },
            { userId: user2.id, communityId: comm1.id, role: 'MEMBER' },
            { userId: user3.id, communityId: comm1.id, role: 'MEMBER' },
            { userId: user2.id, communityId: comm2.id, role: 'ADMIN' },
            { userId: user1.id, communityId: comm2.id, role: 'MEMBER' },
        ]
    })

    // Activities
    await prisma.activity.create({
        data: {
            userId: user1.id,
            category: 'TRANSPORT',
            action: 'Bike to Work',
            value: 15,
            unit: 'km',
            carbon: 2.5,
            type: 'SAVING',
            communityId: comm2.id,
        }
    })

    await prisma.activity.create({
        data: {
            userId: user1.id,
            category: 'DIET',
            action: 'Vegetarian Meal',
            value: 1,
            unit: 'meal',
            carbon: 1.2,
            type: 'SAVING',
            communityId: comm1.id,
        }
    })

    // Challenges
    await prisma.challenge.create({
        data: {
            title: 'No Plastic July',
            description: 'Avoid single-use plastics for the whole month.',
            goalValue: 30,
            metric: 'days',
            type: 'PLASTIC_REDUCTION',
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            communityId: comm1.id,
            createdById: user1.id,
        }
    })

    console.log('Seeding finished.')
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
