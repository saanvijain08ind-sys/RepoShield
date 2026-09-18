import React from 'react';
import { Shield, PlusCircle, RefreshCw, Terminal, Sun, Moon, Github } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.tsx';

interface HeaderProps {
  onOpenRegister: () => void;
  onOpenTestSuite: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenRegister,
  onOpenTestSuite,
  onRefresh,
  isRefreshing,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* GitHub Style Brand & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#24292f] dark:bg-[#21262d] text-emerald-500 border border-[#d0d7de] dark:border-[#30363d] flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center text-sm font-semibold tracking-tight text-[#1f2328] dark:text-[#f0f6fc]">
                <span className="text-[#656d76] dark:text-[#8b949e] font-normal hover:underline cursor-pointer">
                  sentinel-oss
                </span>
                <span className="mx-1 text-[#656d76] dark:text-[#8b949e]">/</span>
                <span className="font-bold">early-warning-security</span>
              </div>

              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                Early-Warning
              </span>
            </div>
          </div>

          {/* GitHub Style Actions Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-1.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#21262d] text-[#656d76] dark:text-[#8b949e] hover:text-[#24292f] dark:hover:text-[#f0f6fc] hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] transition-colors flex items-center gap-1.5 text-xs font-medium"
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden md:inline text-[11px]">Dark</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              id="refresh-data-btn"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#24292f] dark:text-[#c9d1d9] bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded-md transition-colors disabled:opacity-50"
              title="Refresh project metrics & scans"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0969da] dark:text-[#58a6ff]' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {/* Test Suite Verification */}
            <button
              id="open-test-suite-btn"
              onClick={onOpenTestSuite}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#24292f] dark:text-[#c9d1d9] bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded-md transition-colors shadow-2xs"
            >
              <Terminal className="w-3.5 h-3.5 text-[#656d76] dark:text-[#8b949e]" />
              <span className="hidden sm:inline">Test Suite</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-[#afb8c1]/20 dark:bg-[#30363d] text-[#0969da] dark:text-[#58a6ff]">
                11/11
              </span>
            </button>

            {/* Register Project Button - GitHub Green Primary */}
            <button
              id="register-project-btn"
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] border border-[#1b1f24]/15 rounded-md transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register Target</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

