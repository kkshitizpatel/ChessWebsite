
<section aria-labelledby="modal-title" aria-modal="true" className="relative z-10 w-full max-w-[490px] bg-chess-surface border border-chess-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all" data-purpose="visual-settings-dialog" role="dialog">

<header className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-chess-border/80 bg-chess-surface/90 backdrop-blur sticky top-0 z-20">
<div>
<div className="flex items-center gap-2">
<div className="p-1 rounded-md bg-chess-green/10 text-chess-green">
<svg="0 0 24 24">
<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round"></path>
<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</div>
<h2 className="text-base font-bold text-white tracking-wide" id="modal-title">Visual Settings</h2>
</div>
<p className="text-xs text-chess-muted mt-0.5">Customize board themes, piece styles and animations</p>
</div>

<button aria-label="Close dialog" className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors focus:outline-none focus:ring-1 focus:ring-chess-green" type="button">
<svg="0 0 24 24">
<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>
</button>
</header>


<div className="overflow-y-auto custom-scrollbar px-5 py-3 space-y-4 flex-1">



<section aria-label="Board Theme" data-purpose="board-theme-picker">
<div className="flex items-center justify-between mb-2">
<label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Board Theme</label>
<span className="text-[11px] text-chess-muted">5 options</span>
</div>
<div className="grid grid-cols-5 gap-2" role="radiogroup">

<button aria-checked="true" className="group relative flex flex-col items-center p-1.5 rounded-xl bg-chess-card border-2 border-chess-green shadow-[0_0_12px_rgba(129,182,76,0.25)] transition hover:scale-[1.02]" data-theme-choice="green" role="radio" type="button">

<div className="w-full aspect-square rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 border border-black/20">
<span className="bg-[#ebecd0]"></span>
<span className="bg-[#779556]"></span>
<span className="bg-[#779556]"></span>
<span className="bg-[#ebecd0]"></span>
</div>
<span className="mt-1.5 text-[11px] font-semibold text-white">Green</span>

<div className="absolute -top-1.5 -right-1.5 bg-chess-green text-black rounded-full p-0.5 shadow">
<svg="0 0 24 24"><path d="M5 13l4 4L19 7"></path></svg>
</div>
</button>

<button aria-checked="false" className="group flex flex-col items-center p-1.5 rounded-xl bg-chess-card/70 border border-chess-border hover:border-neutral-500 hover:bg-chess-card transition" data-theme-choice="wood" role="radio" type="button">
<div className="w-full aspect-square rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 border border-black/20">
<span className="bg-[#f0d9b5]"></span>
<span className="bg-[#b58863]"></span>
<span className="bg-[#b58863]"></span>
<span className="bg-[#f0d9b5]"></span>
</div>
<span className="mt-1.5 text-[11px] text-neutral-300 font-medium">Wood</span>
</button>

<button aria-checked="false" className="group flex flex-col items-center p-1.5 rounded-xl bg-chess-card/70 border border-chess-border hover:border-neutral-500 hover:bg-chess-card transition" data-theme-choice="blue" role="radio" type="button">
<div className="w-full aspect-square rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 border border-black/20">
<span className="bg-[#dee3e6]"></span>
<span className="bg-[#4e79a7]"></span>
<span className="bg-[#4e79a7]"></span>
<span className="bg-[#dee3e6]"></span>
</div>
<span className="mt-1.5 text-[11px] text-neutral-300 font-medium">Blue</span>
</button>

<button aria-checked="false" className="group flex flex-col items-center p-1.5 rounded-xl bg-chess-card/70 border border-chess-border hover:border-neutral-500 hover:bg-chess-card transition" data-theme-choice="charcoal" role="radio" type="button">
<div className="w-full aspect-square rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 border border-black/20">
<span className="bg-[#8c8c8c]"></span>
<span className="bg-[#404040]"></span>
<span className="bg-[#404040]"></span>
<span className="bg-[#8c8c8c]"></span>
</div>
<span className="mt-1.5 text-[11px] text-neutral-300 font-medium">Dark</span>
</button>

<button aria-checked="false" className="group flex flex-col items-center p-1.5 rounded-xl bg-chess-card/70 border border-chess-border hover:border-neutral-500 hover:bg-chess-card transition" data-theme-choice="purple" role="radio" type="button">
<div className="w-full aspect-square rounded-md overflow-hidden grid grid-cols-2 grid-rows-2 border border-black/20">
<span className="bg-[#e9d8fd]"></span>
<span className="bg-[#6b46c1]"></span>
<span className="bg-[#6b46c1]"></span>
<span className="bg-[#e9d8fd]"></span>
</div>
<span className="mt-1.5 text-[11px] text-neutral-300 font-medium">Purple</span>
</button>
</div>
</section>