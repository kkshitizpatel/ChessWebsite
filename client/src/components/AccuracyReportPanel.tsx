import React from 'react';
import { X } from 'lucide-react';
import {
  AccuracyStatsSummary,
  MOVE_QUALITY_CONFIG,
  MOVE_QUALITY_ORDER,
} from '../lib/moveAnalysisDispatcher';
import { MoveQualityBadge } from './MoveList';

export interface AccuracyReportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  whiteName: string;
  blackName: string;
  whiteAccuracy: number;
  blackAccuracy: number;
  statsSummary: AccuracyStatsSummary;
}

export function AccuracyReportPanel({
  isOpen,
  onClose,
  whiteName,
  blackName,
  whiteAccuracy,
  blackAccuracy,
  statsSummary,
}: AccuracyReportPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="h-[340px] shrink-0 border-t-2 border-[#302e2b] bg-[#1a1917] text-gray-200 flex flex-col overflow-hidden select-none">
      {/* Header Row: "Players" | White Name | Black Name | 'X' Close Button (Excel-style wrap, no truncation) */}
      <div className="min-h-[40px] py-1 shrink-0 px-3 border-b border-[#2b2926] bg-[#161513] flex items-center">
        <div className="w-[88px] shrink-0 text-[11px] font-bold text-[#9e9c99]">
          Players
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-[1fr_24px_1fr] items-center gap-1">
          <span
            className="text-[11px] font-bold text-gray-100 text-center whitespace-normal break-words leading-tight max-w-[110px] px-1"
            title={whiteName}
          >
            {whiteName}
          </span>
          <span />
          <span
            className="text-[11px] font-bold text-gray-300 text-center whitespace-normal break-words leading-tight max-w-[110px] px-1"
            title={blackName}
          >
            {blackName}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-1.5 w-6 h-6 rounded-md flex items-center justify-center text-[#8b8986] hover:text-white hover:bg-[#2b2926] transition shrink-0"
          title="Close Accuracy Report"
          aria-label="Close Accuracy Report"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Accuracy Score Cards Row */}
      <div className="h-[38px] shrink-0 px-3 border-b border-[#2b2926] bg-[#1d1c19] flex items-center">
        <div className="w-[88px] shrink-0 text-[12px] font-bold text-gray-200">
          Accuracy
        </div>
        <div className="flex-1 min-w-0 grid grid-cols-[1fr_24px_1fr] items-center gap-1">
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center min-w-[52px] px-2 py-0.5 rounded-md bg-[#f2f1ef] text-[#1a1917] font-extrabold text-[13px] font-mono shadow-sm">
              {whiteAccuracy.toFixed(1)}
            </span>
          </div>
          <span />
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center min-w-[52px] px-2 py-0.5 rounded-md bg-[#262421] text-gray-100 border border-[#3e3c39] font-extrabold text-[13px] font-mono shadow-sm">
              {blackAccuracy.toFixed(1)}
            </span>
          </div>
        </div>
        {/* Spacer matching close button width for exact column alignment */}
        <div className="ml-1.5 w-6 shrink-0" />
      </div>

      {/* 9-Row Breakdown Table */}
      <div className="flex-1 min-h-0 px-3 py-1.5 flex flex-col justify-between overflow-y-auto">
        {MOVE_QUALITY_ORDER.map((quality) => {
          const cfg = MOVE_QUALITY_CONFIG[quality];
          const wCount = statsSummary.whiteCounts[quality] ?? 0;
          const bCount = statsSummary.blackCounts[quality] ?? 0;

          return (
            <div
              key={quality}
              className="flex items-center min-h-[26px] py-0.5 rounded px-1 hover:bg-[#24221f] transition-colors"
            >
              {/* Category Label */}
              <div className="w-[84px] shrink-0 text-[11px] font-semibold text-[#b8b6b3] truncate">
                {cfg.label}
              </div>

              {/* White Count | Centered Badge Icon | Black Count */}
              <div className="flex-1 min-w-0 grid grid-cols-[1fr_24px_1fr] items-center gap-1">
                <span
                  className={`text-center font-mono text-[15px] font-bold ${
                    wCount > 0 ? cfg.textClass : 'text-[#6e6c69]'
                  }`}
                >
                  {wCount}
                </span>

                <div className="flex items-center justify-center">
                  <MoveQualityBadge quality={quality} size="lg" />
                </div>

                <span
                  className={`text-center font-mono text-[15px] font-bold ${
                    bCount > 0 ? cfg.textClass : 'text-[#6e6c69]'
                  }`}
                >
                  {bCount}
                </span>
              </div>

              {/* Alignment spacer matching header X button */}
              <div className="ml-1.5 w-6 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
