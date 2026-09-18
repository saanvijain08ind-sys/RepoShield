import React from 'react';
import { Bell, Sparkles, Shield, ArrowRight, X } from 'lucide-react';
import { SecurityAssessmentNotification } from '../types/index.ts';

interface Props {
  notification: SecurityAssessmentNotification;
  onInitiateScan: (notificationId: string) => void;
  onDismiss: (notificationId: string) => void;
  isScanning?: boolean;
}

export const NotificationCard: React.FC<Props> = ({
  notification,
  onInitiateScan,
  onDismiss,
  isScanning,
}) => {
  return (
    <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 shadow-2xs relative overflow-hidden transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-[#fff8c5] dark:bg-[#633c01]/30 border border-[#d4a72c]/40 text-[#9a6700] dark:text-[#eac54f] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-[#bf8700] dark:text-[#d29922]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9a6700] dark:text-[#eac54f] bg-[#fff8c5] dark:bg-[#633c01]/40 border border-[#d4a72c]/40 px-2 py-0.5 rounded-full">
                Growth Milestone Reached
              </span>
              <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                {new Date(notification.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h4 className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f6fc] leading-snug">
              {notification.title}
            </h4>
            <p className="text-xs text-[#656d76] dark:text-[#8b949e] leading-relaxed">
              {notification.milestoneMessage}
            </p>

            <div className="p-3 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs text-[#1f2328] dark:text-[#c9d1d9] space-y-1 mt-2">
              <div className="flex items-center gap-1.5 font-medium text-[#0969da] dark:text-[#58a6ff]">
                <Shield className="w-3.5 h-3.5" />
                <span>Educational Security Recommendation</span>
              </div>
              <p className="text-[#656d76] dark:text-[#8b949e] text-[11px] leading-relaxed">
                {notification.recommendation}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDismiss(notification.id)}
          title="Dismiss advisory"
          className="text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc] p-1 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 pt-3 border-t border-[#d0d7de] dark:border-[#30363d] flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] flex items-center gap-1.5">
          <span>Target website for assessment:</span>
          <code className="text-[#0969da] dark:text-[#58a6ff] font-mono text-xs bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] px-1.5 py-0.5 rounded">
            {notification.websiteUrl}
          </code>
        </div>

        <button
          id="initiate-scan-btn"
          onClick={() => onInitiateScan(notification.id)}
          disabled={isScanning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] border border-[#1b1f24]/15 rounded-md transition-all shadow-xs disabled:opacity-50 hover:gap-2"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{isScanning ? 'Scan in progress...' : 'Initiate Website Security Scan'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

