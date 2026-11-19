import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchBook() {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/books/${id}`);
        if (active) setBook(response.data);
      } catch {
        if (active) setError('Book not found or unable to load book details.');
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchBook();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <p className="p-12 text-center">Loading book details...</p>;
  if (error) return <p className="p-12 text-center text-red-600">{error}</p>;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="mb-8 inline-block font-semibold text-indigo-600 hover:underline">
          ← Back to catalog
        </Link>

        <article className="overflow-hidden rounded-2xl bg-white shadow-lg md:flex">
          <div className="flex min-h-72 items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-10 md:w-1/3">
            <span className="text-8xl" aria-hidden="true">📚</span>
          </div>

          <div className="p-8 md:w-2/3">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-600">
              {book.genre?.name || 'Uncategorized'}
            </p>

            <h1 className="text-3xl font-extrabold text-gray-900">{book.title}</h1>
            <p className="mt-3 text-lg text-gray-600">By {book.author}</p>

            <div className="mt-8 space-y-3 text-sm text-gray-700">
              <p><strong>ISBN:</strong> {book.isbn}</p>
              <p><strong>Available copies:</strong> {book.totalCopies ?? 'Not specified'}</p>
              <p><strong>Published:</strong> {book.publishedAt ? new Date(book.publishedAt).toLocaleDateString() : 'Not specified'}</p>
            </div>

            {book.description && (
              <section className="mt-8">
                <h2 className="mb-2 text-lg font-bold">About this book</h2>
                <p className="leading-7 text-gray-600">{book.description}</p>
              </section>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
