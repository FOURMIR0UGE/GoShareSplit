import { X } from 'lucide-react'

export default function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-xl'} dark:bg-slate-900 light:border-slate-300 light:bg-slate-100 light:text-slate-900`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-800 light:hover:bg-slate-200" aria-label="Fermer"><X size={20}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}
