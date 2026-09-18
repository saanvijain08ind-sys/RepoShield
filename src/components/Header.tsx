import React from 'react';
import { PlusCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface HeaderProps {
  onOpenRegister: () => void;
  onOpenTestSuite?: () => void;
  currentRepo?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegister,
  currentRepo = 'superprompt-cli',
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc] bg-[#f8f7f4] dark:bg-[#0f1117] px-4 sm:px-8 py-4 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand & Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1a1a1c] dark:bg-[#f0f6fc] text-white dark:text-[#0f1117] flex items-center justify-center font-syne font-extrabold text-lg select-none shadow-xs">
            R
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center text-xs sm:text-sm font-semibold tracking-tight text-[#1a1a1c] dark:text-[#f0f6fc]">
              <span className="label-mono text-[#1a1a1c] dark:text-[#f0f6fc] tracking-wider opacity-90">
                RepoShield
              </span>
              <span className="mx-1.5 opacity-30 font-mono-code">/</span>
              <span className="font-semibold font-mono-code text-[#2ea043]">
                {currentRepo}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Pill */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-full border border-[#1a1a1c] dark:border-[#f0f6fc] bg-white dark:bg-[#161b22] text-[#1a1a1c] dark:text-[#f0f6fc] hover:bg-[#f0f6fc] dark:hover:bg-[#21262d] font-mono-code text-[11px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5 shadow-2xs"
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">LIGHT MODE</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-slate-700" />
                <span className="hidden sm:inline">DARK MODE</span>
              </>
            )}
          </button>

          {/* Register Target Primary Button */}
          <button
            id="register-project-btn"
            onClick={onOpenRegister}
            className="px-3 sm:px-4 py-2 text-xs font-mono-code font-bold uppercase tracking-wider text-white dark:text-[#0f1117] bg-[#1a1a1c] dark:bg-[#f0f6fc] hover:opacity-90 transition-opacity flex items-center gap-1.5 border border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">REGISTER TARGET</span>
            <span className="sm:hidden">REGISTER</span>
          </button>
        </div>
      </div>
    </header>
  );
};


