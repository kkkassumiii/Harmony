import { prisma } from './index';

async function seed() {
  console.log('Starting database seed...');

  // Clear existing data (optional - comment out if you want to preserve)
  // await prisma.emotion.deleteMany({});
  
  // Define default emotions
  const defaultEmotions = [
    { name: 'Happy', color: '#FFD700', icon: '😊' },
    { name: 'Sad', color: '#4169E1', icon: '😢' },
    { name: 'Angry', color: '#FF4500', icon: '😠' },
    { name: 'Anxious', color: '#FF69B4', icon: '😰' },
    { name: 'Calm', color: '#90EE90', icon: '😌' },
    { name: 'Excited', color: '#FFD700', icon: '🤩' },
    { name: 'Confident', color: '#FF8C00', icon: '😎' },
    { name: 'Confused', color: '#9370DB', icon: '😕' },
    { name: 'Grateful', color: '#FF1493', icon: '🙏' },
    { name: 'Lonely', color: '#708090', icon: '😔' },
  ];

  try {
    console.log('Creating default emotions...');
    
    // Create a test user first (optional - for demo purposes)
    let testUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' },
    });

    if (!testUser) {
      console.log('Creating demo user...');
      testUser = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          username: 'demo',
          password: '$2b$10$demo_hash', // This should be properly hashed in real scenario
          profile: {
            create: {
              firstName: 'Demo',
              lastName: 'User',
            },
          },
        },
        include: { profile: true },
      });
      console.log('Demo user created:', testUser.email);
    }

    // Create default emotions for the test user
    for (const emotion of defaultEmotions) {
      const existingEmotion = await prisma.emotion.findFirst({
        where: {
          userId: testUser.id,
          name: emotion.name,
        },
      });

      if (!existingEmotion) {
        await prisma.emotion.create({
          data: {
            userId: testUser.id,
            name: emotion.name,
            color: emotion.color,
            icon: emotion.icon,
          },
        });
        console.log(`Created emotion: ${emotion.name}`);
      } else {
        console.log(`Emotion already exists: ${emotion.name}`);
      }
    }

    console.log('Database seed completed successfully!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
