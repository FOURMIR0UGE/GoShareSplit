import { ExternalLink, Flag, Sparkles, Users } from 'lucide-react'
import { motion } from 'framer-motion'

function daysLeft(expiresAt) { return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000)) }
function cleanPlan(service, plan='') {
  const escaped = service.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return plan.replace(new RegExp(`^${escaped}\\s*[-–—:]?\\s*`, 'i'), '').trim()
}
const platformStyle = {
  Spliiit: 'bg-violet-400/10 text-violet-300 light:text-violet-700',
  Sharesub: 'bg-sky-400/10 text-sky-300 light:text-sky-700',
  GoSplit: 'bg-orange-400/10 text-orange-300 light:text-orange-700',
}

export default function OfferCard({ offer, onReport, featured=false, list=false }) {
  const remaining = daysLeft(offer.expires_at)
  const plan = cleanPlan(offer.service, offer.plan)
  return (
    <motion.article initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} className={`group relative flex h-full overflow-hidden rounded-3xl border bg-slate-900/70 shadow-xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40 light:bg-white/85 ${featured?'border-emerald-400/25':'border-white/5 light:border-slate-300'} ${list?'flex-col p-5 md:flex-row md:items-center md:gap-6':'flex-col p-5'}`}>
      {featured && <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-emerald-400 px-2.5 py-1 text-[11px] font-black text-slate-950"><Sparkles size={12}/>Nouveau</div>}
      <div className={`flex items-start gap-3 ${list?'md:w-1/3':''}`}>
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/5 bg-slate-800/85 text-2xl shadow-inner light:bg-slate-100">{offer.icon || '📦'}</div>
        <div className="min-w-0 pr-16"><h3 className="truncate text-lg font-black">{offer.service}</h3>{plan && <p className="mt-0.5 truncate text-sm text-slate-400 light:text-slate-600">{plan}</p>}<span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-black ${platformStyle[offer.platform]||'bg-slate-700 text-slate-300'}`}>{offer.platform}</span></div>
      </div>
      <div className={`my-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/5 bg-slate-950/45 p-4 light:border-slate-200 light:bg-slate-100/80 ${list?'md:my-0 md:flex-1':''}`}>
        <div><p className="text-xs font-semibold text-slate-500">Prix mensuel</p><p className="mt-1 text-xl font-black text-emerald-300 light:text-emerald-700">{Number(offer.price).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}</p></div>
        <div><p className="text-xs font-semibold text-slate-500">Disponibilité</p><p className="mt-1 flex items-center gap-2 font-bold"><Users size={16}/>{offer.seats > 0 ? `${offer.seats} place${offer.seats>1?'s':''}` : 'Complet'}</p></div>
      </div>
      <div className={`${list?'md:w-72':''}`}>
        <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500"><span>{offer.category}</span><span className={remaining<=7?'font-black text-orange-400':''}>{remaining} j restants</span></div>
        <div className="flex gap-2"><a href={offer.link} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 font-black text-slate-950 transition hover:bg-emerald-300">Voir l’annonce <ExternalLink size={17}/></a><button onClick={() => onReport(offer.id)} title="Signaler une annonce" className="flex items-center gap-1 rounded-xl border border-slate-700 px-3 transition hover:border-red-400 hover:text-red-400 light:border-slate-300"><Flag size={17}/><span className="text-xs">{offer.reports_count || 0}</span></button></div>
      </div>
    </motion.article>
  )
}
