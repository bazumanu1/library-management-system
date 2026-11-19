import { useEffect, useState } from 'react';
import api from '../services/api';
import BookCard from './BookCard';

export default function BookGrid({ genreId, search }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchBooks() {
      setLoading(true);
      setError('');

      try {
        const params = { limit: 50 };
        if (genreId) params.genreId = genreId;
        if (search) params.search = search;

        const response = await api.get('/books', { params });

        if (active) setBooks(response.data.data || []);
      } catch {
        if (active) setError('Unable to load books. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchBooks();

    return () => {
      active = false;
    };
  }, [genreId, search]);

  if (loading) return <p className="py-12 text-center">Loading books...</p>;

  if (error) {
    return <p className="py-12 text-center text-red-600">{error}</p>;
  }

  if (!books.length) {
    return <p className="py-12 text-center text-gray-500">No books found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
