import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="flex items-center justify-between p-4 bg-surface shadow-md">
      <h1 className="text-xl font-semibold">World Monitor</h1>
      <button
        onClick={toggleTheme}
        className="p-2 rounded hover:bg-primary/20"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </header>
  );
}
