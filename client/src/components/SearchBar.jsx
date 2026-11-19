import { useEffect, useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <input
      type="search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="Search books by title or author..."
      aria-label="Search books by title or author"
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
  );
}
