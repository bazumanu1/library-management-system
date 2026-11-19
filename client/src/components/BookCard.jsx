import { Link } from 'react-router-dom';

export default function BookCard({ book }) {
  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
        <span className="text-6xl" aria-hidden="true">📚</span>
      </div>

      <div className="p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {book.genre?.name || 'Uncategorized'}
        </p>

        <h3 className="line-clamp-2 text-lg font-bold text-gray-900">
          {book.title}
        </h3>

        <p className="mt-2 text-sm text-gray-600">
          By {book.author}
        </p>

        <p className="mt-2 text-xs text-gray-500">
          ISBN: {book.isbn}
        </p>

        <Link
          to={`/books/${book.id}`}
          className="mt-5 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
