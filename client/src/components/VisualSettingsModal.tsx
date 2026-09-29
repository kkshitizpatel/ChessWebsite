import React from 'react';
import { X, Check } from 'lucide-react';

export const BOARD_THEMES: Record<string, { light: string, dark: string }> = {
  green: { light: '#ebecd0', dark: '#779556' },
  wood: { light: '#f0d9b5', dark: '#b58863' },
  blue: { light: '#dee3e6', dark: '#4e79a7' },
  charcoal: { light: '#8c8c8c', dark: '#404040' },
  purple: { light: '#e9d8fd', dark: '#6b46c1' }
};

export const PIECE_STYLES = ['cburnett', 'neo', 'alpha', 'merida', 'kosal'];

type VisualSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  boardTheme: string;
  setBoardTheme: (theme: string) => void;
  pieceStyle: string;
  setPieceStyle: (style: string) => void;
  usePieceIcons: boolean;
  setUsePieceIcons: (v: boolean) => void;
};

export function VisualSettingsModal({
  isOpen,
  onClose,
  boardTheme,
  setBoardTheme,
  pieceStyle,
  setPieceStyle,
  usePieceIcons,
  setUsePieceIcons
}: VisualSettingsModalProps) {
  if (!isOpen) return null;

  const themes = [
    { id: 'green', label: 'Green', colors: ['#ebecd0', '#779556', '#779556', '#ebecd0'] },
    { id: 'wood', label: 'Wood', colors: ['#f0d9b5', '#b58863', '#b58863', '#f0d9b5'] },
    { id: 'blue', label: 'Blue', colors: ['#dee3e6', '#4e79a7', '#4e79a7', '#dee3e6'] },
    { id: 'charcoal', label: 'Dark', colors: ['#8c8c8c', '#404040', '#404040', '#8c8c8c'] },
    { id: 'purple', label: 'Purple', colors: ['#e9d8fd', '#6b46c1', '#6b46c1', '#e9d8fd'] }
  ];

  const pieces = [
    { 
      id: 'cburnett', label: 'cburnett', defaultTag: true, desc: 'Standard lichess tournament style',
      svg1: <svg className="w-5 h-5 fill-white stroke-[#121212]" strokeWidth="1.2" viewBox="0 0 45 45"><path d="M 22,10 C 27,10 32.5,13 32.5,13 C 32.5,13 31.5,15.5 30.5,16.5 C 31,18 31.5,19.5 31.5,21.5 C 30.5,21.5 29.5,21 29,20.5 C 28.5,20 28,19 28,18 C 26,17.5 24,17.5 22.5,18.5 C 21.5,19.5 21,21 21,22.5 C 21,24 21.5,25.5 22.5,26.5 C 23.5,27.5 24,28.5 24.5,29.5 C 25,30.5 25.5,31.5 25.5,32.5 L 14,32.5 C 14.5,29.5 15,26.5 14,24.5 C 13,22.5 10.5,20.5 9,19 C 9,17.5 10,16 11,15 C 12,14 13.5,13 15,13 C 16.5,13 17.5,14 19,14 C 19.5,13 20.5,11.5 22,10 z"></path></svg>,
      svg2: <svg className="w-4 h-4 fill-white stroke-[#121212]" strokeWidth="1.2" viewBox="0 0 45 45"><path d="M 22.5,9 C 19.5,9 17,11.5 17,14.5 C 17,16.5 18,18 19.5,19 C 16.5,20.5 14.5,23.5 14.5,27 L 30.5,27 C 30.5,23.5 28.5,20.5 25.5,19 C 27,18 28,16.5 28,14.5 C 28,11.5 25.5,9 22.5,9 z"></path></svg>
    },
    { 
      id: 'neo', label: 'neo', defaultTag: false, desc: 'Smooth, modern rounded silhouettes',
      svg1: <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M19 19H5V17H19V19M17 10C17 10.7 16.8 11.4 16.4 12H19V14H15.8C14.8 15.2 13.5 16 12 16H8V14C8 12.9 8.9 12 10 12H11C11.6 12 12 11.6 12 11V10H9.5C8.1 10 7 8.9 7 7.5C7 6.1 8.1 5 9.5 5H12V3H14V5C15.7 5 17 6.3 17 8V10Z"></path></svg>,
      svg2: <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M19 19H5V17H19V19M15 15H9C9 13.5 10 12.3 11.3 12C10.5 11.6 10 10.9 10 10C10 8.9 10.9 8 12 8S14 8.9 14 10C14 10.9 13.5 11.6 12.7 12C14 12.3 15 13.5 15 15Z"></path></svg>
    },
    { 
      id: 'alpha', label: 'alpha', defaultTag: false, desc: 'Distinct heavy borders and high visibility',
      svg1: <svg className="w-5 h-5 fill-none stroke-white stroke-[2.2]" viewBox="0 0 24 24"><path d="M18 18H6M14 6L11 8L9 6v4l2 1v3h4v-3l1-1V6zM15 14H9v4h6v-4z"></path></svg>,
      svg2: <svg className="w-4 h-4 fill-none stroke-white stroke-[2.2]" viewBox="0 0 24 24"><circle cx="12" cy="7" r="3"></circle><path d="M7 17h10v-3l-2-2h-6l-2 2v3z"></path></svg>
    },
    { 
      id: 'merida', label: 'merida', defaultTag: false, desc: 'Fine, classic european wood carving style',
      svg1: <svg className="w-5 h-5 fill-white stroke-[#222]" strokeWidth="1" viewBox="0 0 24 24"><path d="M6 18h12v-2H6v2zm3-3h6v-1c0-2-3-3-3-5 0-1 .7-2 1.5-2 .8 0 1.5 1 1.5 2h2c0-2.2-1.8-4-4-4s-4 1.8-4 4c0 2.5 3 3.5 3 5v1H9v0z"></path></svg>,
      svg2: <svg className="w-4 h-4 fill-white stroke-[#222]" strokeWidth="1" viewBox="0 0 24 24"><path d="M12 4a3 3 0 00-3 3c0 1.3.8 2.4 2 2.8V12h-2l-2 3v2h10v-2l-2-3h-2V9.8c1.2-.4 2-1.5 2-2.8a3 3 0 00-3-3z"></path></svg>
    },
    { 
      id: 'kosal', label: 'kosal', defaultTag: false, desc: 'Simple, elegant curves for modern players',
      svg1: <svg className="w-5 h-5 fill-none stroke-white stroke-[2]" viewBox="0 0 24 24"><path d="M6 18h12v-2H6v2zM9 16l1-5h4l1 5H9zM12 11a2 2 0 100-4 2 2 0 000 4z"></path></svg>,
      svg2: <svg className="w-4 h-4 fill-none stroke-white stroke-[2]" viewBox="0 0 24 24"><circle cx="12" cy="8" r="2"></circle><path d="M9 16h6l-1-4h-4l-1 4z"></path></svg>
    }
  ];

  return (
    <>
      {/* Click-away overlay (transparent, no blur) */}
      <div className="fixed inset-0 z-[100]" onClick={onClose}></div>
      {/* Container aligned to the right side */}
      <div className="fixed top-16 right-4 md:right-8 z-[101] pointer-events-none">
        <section aria-labelledby="modal-title" aria-modal="true" className="relative w-full max-w-[440px] bg-chess-surface border border-chess-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all pointer-events-auto" role="dialog">
          <header className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-chess-border/80 bg-chess-surface/90 backdrop-blur sticky top-0 z-20">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-chess-green/10 text-chess-green">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <h2 className="text-base font-bold text-white tracking-wide" id="modal-title">Visual Settings</h2>
              </div>
              <p className="text-xs text-chess-muted mt-0.5">Customize board themes, piece styles and animations</p>
            </div>
            <button onClick={onClose} aria-label="Close dialog" className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-chess-green" type="button">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
          </header>

          <div className="overflow-y-auto custom-scrollbar px-5 py-3 space-y-4 flex-1">
            <section aria-label="Board Theme">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Board Theme</label>
                <span className="text-[11px] text-chess-muted">5 options</span>
              </div>
              <div className="grid grid-cols-5 gap-2" role="radiogroup">
                {themes.map(t => {
                  const isSelected = boardTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setBoardTheme(t.id)}
                      aria-checked={isSelected}
                      className={`group relative flex flex-col items-center p-1.5 rounded-xl transition hover:scale-[1.02] ${isSelected ? 'bg-chess-card border-2 border-chess-green shadow-[0_0_12px_rgba(129,182,76,0.25)]' : 'bg-chess-card/70 border border-chess-border hover:border-neutral-500 hover:bg-chess-card'}`}
                      role="radio"
                      type="button"
                    >
                      <div className="w-full aspect-square rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 border border-black/20">
                        <span style={{ backgroundColor: t.colors[0] }}></span>
                        <span style={{ backgroundColor: t.colors[1] }}></span>
                        <span style={{ backgroundColor: t.colors[2] }}></span>
                        <span style={{ backgroundColor: t.colors[3] }}></span>
                      </div>
                      <span className={`mt-1.5 text-[11px] ${isSelected ? 'font-semibold text-white' : 'text-neutral-300 font-medium'}`}>{t.label}</span>
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 bg-chess-green text-black rounded-full p-0.5 shadow">
                          <svg className="w-3 h-3 stroke-black stroke-[3] fill-none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section aria-label="Piece Style">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Piece Style</label>
                <span className="text-[11px] text-chess-muted">5 options</span>
              </div>
              <div className="grid grid-cols-5 gap-2" role="radiogroup">
                {pieces.map(p => {
                  const isSelected = pieceStyle === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPieceStyle(p.id)}
                      aria-checked={isSelected}
                      className={`group relative flex flex-col items-center p-1.5 rounded-xl transition hover:scale-[1.02] ${isSelected ? 'bg-chess-card border-2 border-chess-green shadow-[0_0_12px_rgba(129,182,76,0.25)]' : 'bg-chess-card/70 border border-chess-border hover:border-neutral-500 hover:bg-chess-card'}`}
                      role="radio"
                      type="button"
                    >
                      <div className={`w-full aspect-square rounded-md overflow-hidden flex items-center justify-center border border-white/5 ${isSelected ? 'bg-black/40' : 'bg-black/30'}`}>
                        {p.svg1}
                      </div>
                      <span className={`mt-1.5 text-[11px] ${isSelected ? 'font-semibold text-white' : 'text-neutral-300 font-medium'}`}>{p.label}</span>
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 bg-chess-green text-black rounded-full p-0.5 shadow">
                          <svg className="w-3 h-3 stroke-black stroke-[3] fill-none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section aria-label="Move Notation" className="pt-2 border-t border-chess-border/30">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Move Notation</label>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-2.5 bg-chess-card/70 border border-chess-border rounded-xl hover:bg-chess-card hover:border-neutral-500 transition w-full">
                <input type="checkbox" checked={usePieceIcons} onChange={e => setUsePieceIcons(e.target.checked)} className="accent-chess-green w-4 h-4" />
                <span className="text-[12px] font-medium text-neutral-300">Use Piece Icons in Move List (e.g. ♞f3 instead of Nf3)</span>
              </label>
            </section>
          </div>

          <footer className="px-5 py-3.5 bg-[#171615] border-t border-chess-border/80 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-chess-muted">
              <span>Piece sets are open source from <a className="text-neutral-300 hover:underline" href="https://lichess.org" rel="noreferrer" target="_blank">Lichess</a>.</span>
              <button className="text-chess-muted hover:text-neutral-200 transition underline underline-offset-2" type="button" onClick={() => { setBoardTheme('green'); setPieceStyle('cburnett'); }}>Reset defaults</button>
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-neutral-700 transition focus:outline-none" type="button">
                Cancel
              </button>
              <button onClick={onClose} className="px-5 py-2 text-xs font-bold rounded-xl bg-chess-green hover:bg-chess-green-hover active:bg-chess-green-dark text-black transition shadow-lg shadow-chess-green/20 focus:outline-none focus:ring-2 focus:ring-chess-green/50" type="button">
                Save Preferences
              </button>
            </div>
          </footer>
        </section>
      </div>
    </>
  );
}
