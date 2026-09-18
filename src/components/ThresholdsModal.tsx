import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { Project, ProjectThresholds } from '../types/index.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSaved: (thresholds: ProjectThresholds) => void;
}

export const ThresholdsModal: React.FC<Props> = ({ isOpen, onClose, project, onSaved }) => {
  const [stars, setStars] = useState(project.thresholds.githubStars);
  const [downloads, setDownloads] = useState(project.thresholds.npmDownloads);
  const [contributors, setContributors] = useState(project.thresholds.outsideContributors);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/thresholds`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubStars: Number(stars),
          npmDownloads: Number(downloads),
          outsideContributors: Number(contributors),
        }),
      });
      const data = await res.json();
      if (data.success && data.thresholds) {
        onSaved(data.thresholds);
        onClose();
      }
    } catch {
      alert('Failed to update thresholds');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-100">Configure Growth Thresholds</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              GitHub Stars Milestone Threshold
            </label>
            <input
              type="number"
              min="1"
              value={stars}
              onChange={(e) => setStars(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default milestone trigger: 1,000 stars.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              npm Monthly Downloads Threshold
            </label>
            <input
              type="number"
              min="1"
              value={downloads}
              onChange={(e) => setDownloads(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default milestone trigger: 10,000 monthly downloads.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Outside Contributors Threshold
            </label>
            <input
              type="number"
              min="1"
              value={contributors}
              onChange={(e) => setContributors(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default milestone trigger: 1 outside contributor.</p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-2xs transition-colors"
            >
              {saving ? 'Saving...' : 'Save Thresholds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
