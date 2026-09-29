const fs = require('fs');

const modalPath = 'src/components/VisualSettingsModal.tsx';
let modalContent = fs.readFileSync(modalPath, 'utf8');

const pieceStyleSectionEndRegex = /<\/section>\s*<\/div>\s*<footer/s;

const additionalSection = `</section>

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

          <footer`;

if (!modalContent.includes('Use Piece Icons in Move List')) {
  modalContent = modalContent.replace(pieceStyleSectionEndRegex, additionalSection);
  fs.writeFileSync(modalPath, modalContent, 'utf8');
  console.log("Added to modal");
} else {
  console.log("Already in modal");
}
