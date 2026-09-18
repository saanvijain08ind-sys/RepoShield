import React, { useState } from 'react';
import { X, Globe, Github, Package, Sliders, ShieldAlert, Check, AlertCircle } from 'lucide-react';
import { Project } from '../types/index.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (newProject: Project) => void;
}

export const ProjectRegistrationModal: React.FC<Props> = ({ isOpen, onClose, onRegistered }) => {
  const [name, setName] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [npmPackageName, setNpmPackageName] = useState('');
  const [githubStars, setGithubStars] = useState(1000);
  const [npmDownloads, setNpmDownloads] = useState(10000);
  const [outsideContributors, setOutsideContributors] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          githubRepoUrl,
          websiteUrl,
          npmPackageName: npmPackageName.trim() || undefined,
          thresholds: {
            githubStars: Number(githubStars),
            npmDownloads: Number(npmDownloads),
            outsideContributors: Number(outsideContributors),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register project.');
      }

      onRegistered(data.project);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Validation error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#161b22] rounded-md shadow-2xl max-w-lg w-full overflow-hidden border border-[#d0d7de] dark:border-[#30363d] transition-colors">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#161b22]">
          <div>
            <h2 className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f6fc]">Register Open Source Project</h2>
            <p className="text-xs text-[#656d76] dark:text-[#8b949e]">Configure milestone indicators and target website</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc] p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="p-3 bg-[#ffebe9] dark:bg-[#490202]/30 border border-[#ff8182]/40 dark:border-[#f85149]/40 rounded-md flex items-start gap-2 text-xs text-[#cf222e] dark:text-[#ff7b72]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#1f2328] dark:text-[#f0f6fc] mb-1">
              Project Name <span className="text-[#cf222e] dark:text-[#ff7b72]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Fast Tool"
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#f0f6fc] placeholder-[#8c959f] dark:placeholder-[#6e7681] rounded-md focus:border-[#0969da] dark:focus:border-[#58a6ff] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1f2328] dark:text-[#f0f6fc] mb-1">
              Public GitHub Repository <span className="text-[#cf222e] dark:text-[#ff7b72]">*</span>
            </label>
            <div className="relative">
              <Github className="w-3.5 h-3.5 text-[#656d76] dark:text-[#8b949e] absolute left-2.5 top-2.5" />
              <input
                type="text"
                required
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo or owner/repo"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#f0f6fc] placeholder-[#8c959f] dark:placeholder-[#6e7681] rounded-md focus:border-[#0969da] dark:focus:border-[#58a6ff] focus:outline-hidden font-mono"
              />
            </div>
            <p className="text-[11px] text-[#656d76] dark:text-[#8b949e] mt-1">Used to monitor star growth and outside contributors.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1f2328] dark:text-[#f0f6fc] mb-1">
              Registered Project Website URL <span className="text-[#cf222e] dark:text-[#ff7b72]">*</span>
            </label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 text-[#656d76] dark:text-[#8b949e] absolute left-2.5 top-2.5" />
              <input
                type="text"
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://myproject.dev"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#f0f6fc] placeholder-[#8c959f] dark:placeholder-[#6e7681] rounded-md focus:border-[#0969da] dark:focus:border-[#58a6ff] focus:outline-hidden font-mono"
              />
            </div>
            <div className="flex items-start gap-1.5 mt-1 text-[11px] text-[#9a6700] dark:text-[#eac54f] bg-[#fff8c5] dark:bg-[#633c01]/25 p-2 rounded-md border border-[#d4a72c]/40 dark:border-[#bb8009]/40">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#bf8700] dark:text-[#d29922]" />
              <span>
                <strong className="font-semibold">Scope note:</strong> Only this registered website target will ever be scanned. The scanner inspects web-level headers and TLS, never the GitHub repository or npm package.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#1f2328] dark:text-[#f0f6fc] mb-1">
              npm Package Name <span className="text-[#656d76] dark:text-[#8b949e] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Package className="w-3.5 h-3.5 text-[#656d76] dark:text-[#8b949e] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={npmPackageName}
                onChange={(e) => setNpmPackageName(e.target.value)}
                placeholder="e.g. express or @scope/pkg"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#f0f6fc] placeholder-[#8c959f] dark:placeholder-[#6e7681] rounded-md focus:border-[#0969da] dark:focus:border-[#58a6ff] focus:outline-hidden font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#d0d7de] dark:border-[#30363d]">
            <div className="flex items-center gap-1.5 mb-2">
              <Sliders className="w-3.5 h-3.5 text-[#656d76] dark:text-[#8b949e]" />
              <span className="text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc]">Configurable Growth Thresholds</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-[#656d76] dark:text-[#8b949e] mb-1">GitHub Stars</label>
                <input
                  type="number"
                  min="1"
                  value={githubStars}
                  onChange={(e) => setGithubStars(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#f0f6fc] rounded-md"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#656d76] dark:text-[#8b949e] mb-1">npm Downloads</label>
                <input
                  type="number"
                  min="1"
                  value={npmDownloads}
                  onChange={(e) => setNpmDownloads(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#f0f6fc] rounded-md"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#656d76] dark:text-[#8b949e] mb-1">Contributors</label>
                <input
                  type="number"
                  min="1"
                  value={outsideContributors}
                  onChange={(e) => setOutsideContributors(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs bg-white dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] text-[#1f2328] dark:text-[#f0f6fc] rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#d0d7de] dark:border-[#30363d]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[#24292f] dark:text-[#c9d1d9] bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] border border-[#1b1f24]/15 rounded-md transition-colors shadow-2xs disabled:opacity-50"
            >
              {loading ? 'Validating & Saving...' : 'Register Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
