import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: "postgresql://alibaba:MNJWR1bTKr6WcqC27tS2TSal2K3DOG6r@dpg-d75b5375r7bs73b25jag-a.frankfurt-postgres.render.com/eventhub_if6g?sslmode=require",
    });
    super({ adapter });
  }
}

const prisma = new PrismaService();

async function main() {
  await prisma.user.createMany({
    data: [
      { id: 1, email: 'user1@mail.com', name: 'Alice', password: 'password1' },
      { id: 2, email: 'user2@mail.com', name: 'Bob', password: 'password2' },
      { id: 3, email: 'user3@mail.com', name: 'Charlie', password: 'password3' },
    ],
    skipDuplicates: true,
  });

  await prisma.post.createMany({
    data: [
      {
        title: 'Tech Conference 2026',
        desc: 'Большая конференция по современным технологиям.',
        image: 'https://picsum.photos/seed/1/600/400',
        date: new Date('2026-03-10T12:00:00Z'),
        place: 'Berlin',
        authorId: 1,
      },
      {
        title: 'Startup Meetup',
        desc: 'Встреча стартаперов и инвесторов.',
        image: 'https://picsum.photos/seed/2/600/400',
        date: new Date('2026-04-05T15:30:00Z'),
        place: 'London',
        authorId: 1,
      },
      {
        title: 'Design Workshop',
        desc: 'Практический воркшоп по UX/UI дизайну.',
        image: 'https://picsum.photos/seed/3/600/400',
        date: new Date('2026-05-12T09:00:00Z'),
        place: 'Amsterdam',
        authorId: 2,
      },
      {
        title: 'Music Festival',
        desc: 'Фестиваль электронной музыки.',
        image: 'https://picsum.photos/seed/4/600/400',
        date: new Date('2026-06-20T18:00:00Z'),
        place: 'Barcelona',
        authorId: 2,
      },
      {
        title: 'AI Hackathon',
        desc: '24-часовой хакатон по искусственному интеллекту.',
        image: 'https://picsum.photos/seed/5/600/400',
        date: new Date('2026-07-01T10:00:00Z'),
        place: 'Paris',
        authorId: 1,
      },
      {
        title: 'Marketing Summit',
        desc: 'Саммит по digital-маркетингу.',
        image: 'https://picsum.photos/seed/6/600/400',
        date: new Date('2026-08-15T11:00:00Z'),
        place: 'New York',
        authorId: 3,
      },
      {
        title: 'Photography Expo',
        desc: 'Выставка современной фотографии.',
        image: 'https://picsum.photos/seed/7/600/400',
        date: new Date('2026-09-03T13:00:00Z'),
        place: 'Rome',
        authorId: 3,
      },
      {
        title: 'Gaming Convention',
        desc: 'Конвенция разработчиков видеоигр.',
        image: 'https://picsum.photos/seed/8/600/400',
        date: new Date('2026-10-18T14:00:00Z'),
        place: 'Tokyo',
        authorId: 2,
      },
      {
        title: 'Blockchain Forum',
        desc: 'Форум по блокчейн-технологиям.',
        image: 'https://picsum.photos/seed/9/600/400',
        date: new Date('2026-11-22T16:00:00Z'),
        place: 'Dubai',
        authorId: 1,
      },
      {
        title: 'Art & Culture Fair',
        desc: 'Ярмарка искусства и культуры.',
        image: 'https://picsum.photos/seed/10/600/400',
        date: new Date('2026-12-05T17:00:00Z'),
        place: 'Vienna',
        authorId: 3,
      },
    ],
  });
}

main()
  .finally(() => prisma.$disconnect());
