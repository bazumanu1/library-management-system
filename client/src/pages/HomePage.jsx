import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import BookGrid from '../components/BookGrid';
import SearchBar from '../components/SearchBar';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [genres, setGenres] = useState([]);

  const handleSearch = useCallback((value) => {
    setSearch(value);
  }, []);

  useEffect(() => {
    api.get('/genres')
      .then((response) => setGenres(response.data))
      .catch((error) => console.error('Could not load genres:', error));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-indigo-950 px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-300">
            Your digital library
          </p>
          <h1 className="text-4xl font-extrabold md:text-5xl">
            Discover Your Next Read
          </h1>
          <p className="mt-4 max-w-2xl text-indigo-200">
            Explore our collection, discover new authors and find books that inspire you.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 grid gap-4 md:grid-cols-[1fr_260px]">
          <SearchBar onSearch={handleSearch} />

          <select
            value={genreId}
            onChange={(event) => setGenreId(event.target.value)}
            aria-label="Filter books by genre"
            className="rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="">All genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Our Book Collection</h2>
          <p className="mt-1 text-sm text-gray-500">
            Browse books by genre or search by title and author.
          </p>
        </div>

        <BookGrid genreId={genreId} search={search} />
      </section>
    </main>
  );
}
