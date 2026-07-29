@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
html { scroll-behavior: smooth; }
body { margin: 0; min-width: 320px; background: #06101d; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.light { color-scheme: light; }
* { box-sizing: border-box; }
button, input, select, textarea { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
.text-balance { text-wrap: balance; }
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { scrollbar-width: none; }
.icon-btn { @apply rounded-xl border border-slate-700 p-2.5 transition hover:border-slate-500 hover:bg-slate-800 light:border-slate-300 light:hover:bg-slate-200; }
.trust-pill { @apply rounded-full border border-white/5 bg-white/5 px-3 py-2 text-slate-300 light:border-slate-300 light:bg-white/70 light:text-slate-700; }
.control-select { @apply appearance-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm font-semibold outline-none transition hover:border-slate-500 light:border-slate-300 light:bg-white; }
.label { @apply mb-2 block text-sm font-bold text-slate-300 light:text-slate-700; }
.control-select-native {
  @apply rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold outline-none transition hover:border-slate-500 light:border-slate-300 light:bg-white;
  appearance: auto;
  -webkit-appearance: menulist;
  background-image: none;
}
.category-arrow {
  @apply grid h-10 w-10 place-items-center rounded-full border border-slate-700 bg-slate-900/95 text-slate-300 shadow-lg transition hover:border-emerald-400 hover:bg-emerald-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-30 light:border-slate-300 light:bg-white light:text-slate-700;
}
