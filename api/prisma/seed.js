import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const genreData = [
    { name: 'Fiction', description: 'Imaginative literary works and stories.' },
    { name: 'Science', description: 'Books covering scientific knowledge and discovery.' },
    { name: 'History', description: 'Books about historical events and civilizations.' },
    { name: 'Technology', description: 'Books about computing and technological innovation.' },
  ];

  const genres = {};

  for (const genre of genreData) {
    genres[genre.name] = await prisma.genre.upsert({
      where: { name: genre.name },
      update: { description: genre.description },
      create: genre,
    });
  }

  const books = [
    { title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '9780385474542', genre: 'Fiction' },
    { title: 'The River Between', author: 'Ngugi wa Thiong’o', isbn: '9780435905484', genre: 'Fiction' },
    { title: 'The Old Man and the Sea', author: 'Ernest Hemingway', isbn: '9780684801223', genre: 'Fiction' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', genre: 'Fiction' },
    { title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', genre: 'Science' },
    { title: 'The Selfish Gene', author: 'Richard Dawkins', isbn: '9780198788607', genre: 'Science' },
    { title: 'Cosmos', author: 'Carl Sagan', isbn: '9780345539434', genre: 'Science' },
    { title: 'The Origin of Species', author: 'Charles Darwin', isbn: '9781509827695', genre: 'Science' },
    { title: 'A History of Kenya', author: 'W. R. Ochieng', isbn: '9780435948123', genre: 'History' },
    { title: 'The Art of War', author: 'Sun Tzu', isbn: '9781590302255', genre: 'History' },
    { title: 'Long Walk to Freedom', author: 'Nelson Mandela', isbn: '9780316548182', genre: 'History' },
    { title: 'The Diary of a Young Girl', author: 'Anne Frank', isbn: '9780553296983', genre: 'History' },
    { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', genre: 'Technology' },
    { title: 'The Pragmatic Programmer', author: 'David Thomas and Andrew Hunt', isbn: '9780135957059', genre: 'Technology' },
    { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '9780262046305', genre: 'Technology' },
    { title: 'Code Complete', author: 'Steve McConnell', isbn: '9780735619678', genre: 'Technology' },
  ];

  for (const book of books) {
    const { genre, ...data } = book;

    await prisma.book.upsert({
      where: { isbn: data.isbn },
      update: {
        title: data.title,
        author: data.author,
        genreId: genres[genre].id,
      },
      create: {
        ...data,
        genreId: genres[genre].id,
      },
    });
  }

  console.log('Seeding completed: 4 genres and 16 books processed.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
