import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell, CheckCircle2, ChevronLeft, ChevronRight, LayoutGrid, List, LockKeyhole, Moon,
  Plus, Search, ShieldCheck, Sparkles, Sun, Wrench, X
} from 'lucide-react'
import { categories, categoryIcons, featuredServiceIds, serviceCatalog } from '../data/catalog'
import { createAlert, createOffer, createSuggestion, listOffers, reportOffer, requestAlertManagement } from '../lib/store'
import { detectPlatform, invalidLinkMessage } from '../lib/platform'
import Modal from '../components/Modal'
import OfferCard from '../components/OfferCard'

const initialForm = { link:'', service:'', serviceId:'', plan:'', price:'1.00', seats:1, category:'Autre', platform:'', icon:'📦' }
const initialAlert = { email:'', service:'', serviceId:'' }
const initialSuggestion = { name:'', category:'Autre', website:'', source:'menu' }

function normalize(value='') { return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase() }
function isExpired(offer) { return new Date(offer.expires_at).getTime() <= Date.now() }
function shuffleStable(items) {
  const key = 'gosharesplit-session-order'
  let order = JSON.parse(sessionStorage.getItem(key) || '{}')
  for (const item of items) if (!(item.id in order)) order[item.id] = Math.random()
  sessionStorage.setItem(key, JSON.stringify(order))
  return [...items].sort((a,b) => order[a.id] - order[b.id])
}
function randomServices(limit=14) {
  const key = 'gosharesplit-random-services'
  const saved = sessionStorage.getItem(key)
  if (saved) {
    const ids = JSON.parse(saved)
    return ids.map(id => serviceCatalog.find(item => item.id === id)).filter(Boolean).slice(0, limit)
  }
  const items = [...serviceCatalog].sort(() => Math.random() - 0.5).slice(0, limit)
  sessionStorage.setItem(key, JSON.stringify(items.map(item => item.id)))
  return items
}
function matchingServices(query, limit=14, selectedCategory='Autre') {
  const q = normalize(query).trim()
  const pool = selectedCategory === 'Autre'
    ? serviceCatalog
    : serviceCatalog.filter(item => item.category === selectedCategory)
  if (!q) {
    if (selectedCategory === 'Autre') return randomServices(limit)
    return pool.slice(0, limit)
  }
  return pool
    .filter(item => normalize(`${item.name} ${item.category}`).includes(q))
    .sort((a,b) => {
      const aStart = normalize(a.name).startsWith(q) ? 1 : 0
      const bStart = normalize(b.name).startsWith(q) ? 1 : 0
      return bStart - aStart || a.name.localeCompare(b.name, 'fr')
    }).slice(0, limit)
}

export default function HomePage() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Toutes')
  const [sort, setSort] = useState('featured')
  const [view, setView] = useState('grid')
  const [theme, setTheme] = useState(() => localStorage.getItem('gosharesplit-theme') || 'dark')
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(initialForm)
  const [alert, setAlert] = useState(initialAlert)
  const [suggestion, setSuggestion] = useState(initialSuggestion)
  const [error, setError] = useState('')
  const [alertError, setAlertError] = useState('')
  const [manageEmail, setManageEmail] = useState('')
  const [manageSent, setManageSent] = useState(false)
  const [reporting, setReporting] = useState(null)
  const [reportReason, setReportReason] = useState('no_seats')
  const categoriesRef = useRef(null)

  function scrollCategories(direction) {
    categoriesRef.current?.scrollBy({ left: direction * Math.max(260, categoriesRef.current.clientWidth * 0.72), behavior: 'smooth' })
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('gosharesplit-theme', theme)
  }, [theme])

  async function refresh() {
    try { setOffers(await listOffers()) }
    catch (e) { setNotice(`Erreur de chargement : ${e.message}`) }
    finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])
  useEffect(() => { if (!notice) return; const t=setTimeout(()=>setNotice(''),3500); return()=>clearTimeout(t) }, [notice])

  const offerServices = useMemo(() => matchingServices(form.service, 14, form.category), [form.service, form.category])
  const alertServices = useMemo(() => matchingServices(alert.service, 10), [alert.service])

  const visibleOffers = useMemo(() => {
    const q = normalize(search)
    const filtered = offers.filter(o => !o.hidden && !isExpired(o)
      && (category==='Toutes'||o.category===category)
      && (!q || normalize(`${o.service} ${o.plan} ${o.category} ${o.platform}`).includes(q)))

    if (sort === 'newest') return [...filtered].sort((a,b)=>new Date(b.published_at)-new Date(a.published_at))
    if (sort === 'oldest') return [...filtered].sort((a,b)=>new Date(a.published_at)-new Date(b.published_at))
    if (sort === 'price-asc') return [...filtered].sort((a,b)=>Number(a.price)-Number(b.price))
    if (sort === 'price-desc') return [...filtered].sort((a,b)=>Number(b.price)-Number(a.price))
    if (sort === 'seats') return [...filtered].sort((a,b)=>Number(b.seats)-Number(a.seats))

    // Recommandé : 2 plus récentes, puis services populaires, puis aléatoire,
    // avec les annonces les plus signalées repoussées en bas.
    const byDate = [...filtered].sort((a,b)=>new Date(b.published_at)-new Date(a.published_at))
    const recent = byDate.slice(0,2)
    const recentIds = new Set(recent.map(o=>o.id))
    const remaining = filtered.filter(o=>!recentIds.has(o.id))
    const clean = remaining.filter(o=>Number(o.reports_count||0)===0)
    const reported = remaining.filter(o=>Number(o.reports_count||0)>0)
    const popularity = new Map(featuredServiceIds.map((id,index)=>[id, featuredServiceIds.length-index]))
    const popular = clean.filter(o=>popularity.has(o.service_id || normalize(o.service).replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')))
      .sort((a,b)=>{
        const aId = a.service_id || normalize(a.service).replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')
        const bId = b.service_id || normalize(b.service).replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')
        return (popularity.get(bId)||0)-(popularity.get(aId)||0)
      })
    const popularIds = new Set(popular.map(o=>o.id))
    const random = shuffleStable(clean.filter(o=>!popularIds.has(o.id)))
    const reportedLast = [...reported].sort((a,b)=>Number(a.reports_count||0)-Number(b.reports_count||0))
    return [...recent, ...popular, ...random, ...reportedLast]
  }, [offers, search, category, sort])

  function updateLink(link) { setForm(f => ({...f, link, platform:detectPlatform(link)})); setError('') }
  function updateOfferService(value) { setForm(f => ({...f, service:value, serviceId:'', icon:categoryIcons[f.category] || '📦'})); setError('') }
  function chooseOfferService(item) { setForm(f => ({...f, service:item.name, serviceId:item.id, category:item.category, icon:item.icon})); setError('') }
  function clearOfferService() { setForm(f => ({...f, service:'', serviceId:'', icon:categoryIcons[f.category] || '📦'})); setError('') }
  function updateOfferCategory(value) { setForm(f => ({...f, category:value, service:'', serviceId:'', icon:categoryIcons[value] || '📦'})); setError('') }
  function updateAlertService(value) { setAlert(a => ({...a, service:value, serviceId:''})); setAlertError('') }
  function chooseAlertService(item) { setAlert(a => ({...a, service:item.name, serviceId:item.id})); setAlertError('') }
  function openSuggestion(source, name='') {
    setSuggestion({ ...initialSuggestion, source, name:name.trim() })
    setModal('suggest')
  }

  async function submitOffer(e) {
    e.preventDefault(); setError('')
    const detected = detectPlatform(form.link)
    if (!detected) { setError(invalidLinkMessage); return }
    if (!form.serviceId) { setError('Sélectionne obligatoirement un service dans la liste proposée.'); return }
    if (Number(form.price)<=0 || Number(form.seats)<0) { setError('Merci de remplir correctement tous les champs obligatoires.'); return }
    if (offers.some(o => o.link === form.link.trim())) { setError('Cette annonce a déjà été publiée. Merci de ne pas soumettre le même lien plusieurs fois.'); return }
    const now = new Date()
    const payload = {
      service:form.service, plan:form.plan.trim(), price:Number(form.price), seats:Number(form.seats), link:form.link.trim(),
      platform:detected, category:form.category, icon:form.icon, reports_count:0,
      published_at:now.toISOString(), expires_at:new Date(now.getTime()+45*86400000).toISOString(), hidden:false,
    }
    try { await createOffer(payload); await refresh(); setForm(initialForm); setModal(null); setNotice('Votre annonce a été publiée avec succès.') }
    catch (e2) { setError(e2.message?.includes('duplicate') ? 'Cette annonce existe déjà.' : e2.message) }
  }

  async function submitReport() {
    if (!reporting) return
    try {
      await reportOffer(reporting.id, reportReason)
      await refresh()
      setReporting(null)
      setNotice('Signalement enregistré.')
    } catch (e) {
      setNotice(e.message==='already_reported' ? 'Vous avez déjà signalé cette annonce.' : 'Impossible d’enregistrer ce signalement.')
    }
  }

  async function submitSuggestion(e) {
    e.preventDefault()
    await createSuggestion({
      name: suggestion.name.trim(),
      category: suggestion.category,
      website: suggestion.website.trim(),
      source: suggestion.source,
    })
    setSuggestion(initialSuggestion); setModal(null)
    setNotice('Service suggéré. Il sera vérifié avant d’être ajouté au catalogue.')
  }

  async function submitAlert(e) {
    e.preventDefault(); setAlertError('')
    if (!alert.serviceId) { setAlertError('Sélectionne obligatoirement un service dans la liste proposée.'); return }
    await createAlert({ email:alert.email.trim(), service:alert.service, service_id:alert.serviceId, active:true })
    setAlert(initialAlert); setNotice('Alerte enregistrée pour ce service.'); setModal(null)
  }

  async function submitManageAlerts(e) {
    e.preventDefault()
    setManageSent(false)
    try {
      await requestAlertManagement(manageEmail.trim())
      setManageSent(true)
    } catch {
      setManageSent(true)
    }
  }

  const field = 'w-full rounded-2xl border border-slate-700/80 bg-slate-950/55 px-4 py-3.5 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 light:border-slate-300 light:bg-white'
  const servicePill = 'rounded-full border border-slate-700 px-3 py-1.5 text-xs font-bold transition hover:border-emerald-400 hover:bg-emerald-400/10 light:border-slate-300'

  return (
    <div className="min-h-screen bg-[#06101d] text-slate-100 transition-colors light:bg-[#e8edf3] light:text-slate-900">
      {notice && <div className="fixed left-1/2 top-4 z-[80] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-2xl border border-emerald-300/30 bg-emerald-400 px-5 py-3 font-bold text-slate-950 shadow-2xl"><CheckCircle2 size={18}/>{notice}</div>}

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#06101d]/82 backdrop-blur-2xl light:border-slate-300/70 light:bg-[#eef2f6]/88">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5 text-xl font-black tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-300 to-cyan-400 text-slate-950 shadow-glow"><Sparkles size={19}/></span><span>GoShare<span className="text-emerald-400">Split</span></span></a>
          <div className="flex items-center gap-2">
            <button onClick={()=>setTheme(theme==='dark'?'light':'dark')} className="icon-btn" aria-label="Changer de thème">{theme==='dark'?<Sun size={18}/>:<Moon size={18}/>}</button>
            <button onClick={()=>openSuggestion('menu')} className="hidden items-center gap-2 rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-semibold transition hover:border-slate-500 md:flex light:border-slate-300"><Wrench size={17}/>Suggérer un service</button>
            <button onClick={()=>setModal('publish')} className="flex items-center gap-2 rounded-xl bg-emerald-400 px-3.5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-emerald-300"><Plus size={18}/><span className="hidden sm:inline">Proposer une annonce</span><span className="sm:hidden">Publier</span></button>
            <a href="#/admin" className="icon-btn" aria-label="Administration" title="Administration"><LockKeyhole size={18}/></a>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden px-4 pb-14 pt-16 sm:pb-20 sm:pt-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(52,211,153,.18),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,.15),transparent_30%)]"/>
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.18em] text-emerald-300 light:text-emerald-700"><ShieldCheck size={15}/>Le répertoire indépendant</div>
            <h1 className="text-balance text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Tous vos partages d’abonnement, <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 bg-clip-text text-transparent">au même endroit.</span></h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg light:text-slate-600">Trouvez rapidement une place disponible sur Spliiit, Sharesub ou GoSplit. Les paiements restent gérés par les plateformes d’origine.</p>
            <form onSubmit={e=>{e.preventDefault(); document.querySelector('#annonces')?.scrollIntoView()}} className="mx-auto mt-8 flex max-w-2xl gap-2 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-2 shadow-2xl light:border-slate-300 light:bg-white"><Search className="ml-2 self-center text-emerald-400" size={21}/><input value={search} onChange={e=>setSearch(e.target.value)} className="min-w-0 flex-1 bg-transparent px-2 outline-none" placeholder="Rechercher Netflix, Spotify, VPN, ChatGPT…"/><button className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950">Rechercher</button></form>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-bold"><span className="trust-pill">Publication gratuite</span><span className="trust-pill">Paiement sécurisé sur la plateforme</span><span className="trust-pill">Expiration après 45 jours</span></div>
          </div>
        </section>

        <section id="annonces" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="mb-6 min-w-0 overflow-hidden rounded-3xl border border-white/5 bg-slate-900/50 p-4 backdrop-blur-xl light:border-slate-300/70 light:bg-white/70">
            <div className="relative flex min-w-0 items-center gap-2">
              <button type="button" onClick={()=>scrollCategories(-1)} className="category-arrow shrink-0" aria-label="Voir les catégories précédentes"><ChevronLeft size={20}/></button>
              <div ref={categoriesRef} className="flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 py-1 scrollbar-none">
                {categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold transition ${category===c?'bg-emerald-400 text-slate-950':'bg-slate-800/80 text-slate-300 hover:bg-slate-700 light:bg-slate-200 light:text-slate-700 light:hover:bg-slate-300'}`}>{c==='Toutes'?'✨':categoryIcons[c]} {c}</button>)}
              </div>
              <button type="button" onClick={()=>scrollCategories(1)} className="category-arrow shrink-0" aria-label="Voir les catégories suivantes"><ChevronRight size={20}/></button>
            </div>
            <div className="mt-3 grid gap-3 border-t border-white/5 pt-4 lg:grid-cols-[1fr_auto] lg:items-end light:border-slate-300">
              <div><h2 className="text-2xl font-black">Annonces disponibles</h2><p className="text-sm text-slate-500">{visibleOffers.length} résultat{visibleOffers.length>1?'s':''}{search ? ` pour « ${search} »` : ''}</p></div>
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(180px,1fr)_auto]">
                <div className="min-w-0"><select value={sort} onChange={e=>setSort(e.target.value)} className="control-select-native w-full" aria-label="Trier les annonces"><option value="featured">Recommandé</option><option value="newest">Plus récentes</option><option value="oldest">Plus anciennes</option><option value="price-asc">Prix croissant</option><option value="price-desc">Prix décroissant</option><option value="seats">Avec le plus de places</option></select></div>
                <div className="flex justify-self-start rounded-xl border border-slate-700 p-1 sm:justify-self-end light:border-slate-300"><button onClick={()=>setView('grid')} className={`rounded-lg p-2 ${view==='grid'?'bg-slate-700 light:bg-slate-200':''}`} aria-label="Vue grille"><LayoutGrid size={17}/></button><button onClick={()=>setView('list')} className={`rounded-lg p-2 ${view==='list'?'bg-slate-700 light:bg-slate-200':''}`} aria-label="Vue liste"><List size={17}/></button></div>
              </div>
            </div>
          </div>

          {loading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i=><div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-800/60 light:bg-slate-300"/>)}</div>
          : visibleOffers.length ? <div className={view==='grid'?'grid gap-5 md:grid-cols-2 lg:grid-cols-3':'grid gap-4'}>{visibleOffers.map((offer,index)=><OfferCard key={offer.id} offer={offer} onReport={(id)=>setReporting(offers.find(o=>o.id===id)||{id})} featured={sort==='featured'&&index<2} list={view==='list'}/>)}</div>
          : <div className="rounded-3xl border border-dashed border-slate-700 py-20 text-center light:border-slate-400"><Search className="mx-auto mb-4 text-slate-500" size={38}/><h3 className="text-xl font-black">Aucune annonce trouvée</h3><p className="mt-2 text-slate-500">Modifie tes filtres ou crée une alerte.</p><button onClick={()=>setModal('alert')} className="mt-5 rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950">Créer une alerte</button></div>}

          <section className="relative mt-14 overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-400/15 via-slate-900/80 to-sky-400/10 p-6 sm:p-9 light:from-emerald-100 light:via-white light:to-sky-100"><div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div className="max-w-2xl"><div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950"><Bell size={21}/></div><h2 className="text-2xl font-black sm:text-3xl">L’annonce que tu cherches n’est pas encore disponible ?</h2><p className="mt-2 text-slate-400 light:text-slate-600">Choisis un service du catalogue et sois informé dès qu’une annonce correspondante est publiée.</p></div><button onClick={()=>setModal('alert')} className="shrink-0 rounded-2xl bg-emerald-400 px-6 py-4 font-black text-slate-950 transition hover:bg-emerald-300">Créer une alerte gratuite</button></div></section>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-slate-950/35 px-4 py-8 text-center text-sm text-slate-500 light:border-slate-300 light:bg-slate-200/70"><p className="font-black text-slate-300 light:text-slate-700">GoShareSplit</p><p className="mx-auto mt-2 max-w-3xl">Site indépendant. Paiements uniquement sur Spliiit, Sharesub et GoSplit. Les annonces expirent automatiquement après 45 jours.</p></footer>

      {modal==='publish' && <Modal title="Proposer une annonce" onClose={()=>setModal(null)} wide><form onSubmit={submitOffer} className="space-y-5">
        <div className="rounded-2xl border border-sky-400/20 bg-sky-400/8 p-4 text-sm text-sky-200 light:text-sky-800"><strong>Étape 1 :</strong> colle le lien de partage fourni par Spliiit, Sharesub ou GoSplit. La plateforme sera détectée automatiquement.</div>
        <label className="block"><span className="label">Lien de partage *</span><input required className={field} value={form.link} onChange={e=>updateLink(e.target.value)} placeholder="https://…"/></label>
        {form.platform && <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-300 light:text-emerald-700"><CheckCircle2 size={16}/>Plateforme détectée : {form.platform}</div>}
        <div className="grid gap-4 sm:grid-cols-3"><label><span className="label">Catégorie *</span><select required className={field} value={form.category} onChange={e=>updateOfferCategory(e.target.value)}>{categories.filter(c=>c!=='Toutes').map(c=><option key={c}>{c}</option>)}</select></label><label><span className="label">Service *</span><input required className={field} value={form.service} onChange={e=>updateOfferService(e.target.value)} placeholder="Commence à saisir un service…"/></label><label><span className="label">Offre / formule</span><input className={field} value={form.plan} onChange={e=>setForm({...form,plan:e.target.value})} placeholder="Premium 4K, Famille…"/></label></div>
        <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">{offerServices.map(item=><button type="button" key={item.id} onClick={()=>chooseOfferService(item)} className={`${servicePill} ${form.serviceId===item.id?'border-emerald-400 bg-emerald-400/15 text-emerald-300 light:text-emerald-700':''}`}>{item.icon} {item.name}{form.serviceId===item.id && <X onClick={e=>{e.stopPropagation();clearOfferService()}} className="ml-1 inline text-red-400 hover:text-red-300" size={14}/>}</button>)}</div>
        {form.service.trim() && offerServices.length===0 && <button type="button" onClick={()=>openSuggestion('publish', form.service)} className="w-full rounded-2xl border border-dashed border-emerald-400/50 p-4 text-sm font-bold text-emerald-300 hover:bg-emerald-400/10 light:text-emerald-700">Service introuvable ? Suggérer « {form.service} »</button>}
        {form.serviceId && <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300 light:text-emerald-700"><span>✓ {form.service} sélectionné · Catégorie : {form.category}</span><button type="button" onClick={clearOfferService} className="rounded-full p-1 text-red-400 hover:bg-red-400/10" title="Désélectionner le service"><X size={16}/></button></div>}
        <div className="grid gap-4 sm:grid-cols-2"><label><span className="label">Prix mensuel (€) *</span><input required min="0.01" step="0.01" type="number" className={field} value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label><span className="label">Places disponibles *</span><input required min="0" type="number" className={field} value={form.seats} onChange={e=>setForm({...form,seats:e.target.value})}/></label></div>
        {error && <p className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-400">{error}</p>}
        <button className="w-full rounded-2xl bg-emerald-400 px-5 py-4 font-black text-slate-950 transition hover:bg-emerald-300">Publier l’annonce</button><p className="text-center text-xs text-slate-500">Publication immédiate dans le catalogue.</p>
      </form></Modal>}

      {modal==='suggest' && <Modal title="Suggérer un service" onClose={()=>setModal(null)}><form onSubmit={submitSuggestion} className="space-y-4"><p className="text-sm text-slate-400 light:text-slate-600">Le service sera vérifié avant d’être ajouté au catalogue. Une fois accepté, il pourra être utilisé dans les annonces et les alertes.</p><label><span className="label">Nom du service *</span><input required className={field} placeholder="" value={suggestion.name} onChange={e=>setSuggestion({...suggestion,name:e.target.value})}/></label><label><span className="label">Catégorie proposée *</span><select required className={field} value={suggestion.category} onChange={e=>setSuggestion({...suggestion,category:e.target.value})}>{categories.filter(c=>c!=='Toutes').map(c=><option key={c}>{c}</option>)}</select></label><label><span className="label">Site officiel (optionnel)</span><input className={field} placeholder="exemple.com ou toute autre indication" value={suggestion.website} onChange={e=>setSuggestion({...suggestion,website:e.target.value})}/></label><button className="w-full rounded-2xl bg-emerald-400 px-4 py-3.5 font-black text-slate-950">Envoyer la suggestion</button></form></Modal>}

      {modal==='alert' && <Modal title="Créer une alerte" onClose={()=>setModal(null)}><form onSubmit={submitAlert} className="space-y-4"><p className="text-sm text-slate-400 light:text-slate-600">Choisis précisément un service du catalogue. Tu seras ainsi prévenu lorsqu’une annonce pour ce même service sera publiée.</p><label className="block"><span className="label">Adresse e-mail *</span><input required type="email" className={field} value={alert.email} onChange={e=>setAlert({...alert,email:e.target.value})} placeholder="toi@email.fr"/></label><label className="block"><span className="label">Service recherché *</span><input required className={field} value={alert.service} onChange={e=>updateAlertService(e.target.value)} placeholder="Commence à saisir Apple, Netflix…"/></label><div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto pr-1">{alertServices.map(item=><button type="button" key={item.id} onClick={()=>chooseAlertService(item)} className={`${servicePill} ${alert.serviceId===item.id?'border-emerald-400 bg-emerald-400/15 text-emerald-300 light:text-emerald-700':''}`}>{item.icon} {item.name}</button>)}</div>{alert.service.trim() && alertServices.length===0 && <button type="button" onClick={()=>openSuggestion('alert', alert.service)} className="w-full rounded-2xl border border-dashed border-emerald-400/50 p-4 text-sm font-bold text-emerald-300 hover:bg-emerald-400/10 light:text-emerald-700">Aucun service trouvé. Suggérer « {alert.service} »</button>}{alert.serviceId && <p className="text-sm font-semibold text-emerald-300 light:text-emerald-700">✓ Alerte liée exactement à {alert.service}</p>}{alertError && <p className="rounded-2xl bg-red-500/10 p-4 text-sm font-bold text-red-400">{alertError}</p>}<button className="w-full rounded-2xl bg-emerald-400 px-4 py-3.5 font-black text-slate-950">Activer l’alerte</button><button type="button" onClick={()=>{setManageEmail(alert.email);setManageSent(false);setModal('manage-alerts')}} className="w-full text-sm font-bold text-emerald-300 underline-offset-4 hover:underline light:text-emerald-700">Déjà inscrit ? Gérer mes alertes</button></form></Modal>}
      {modal==='manage-alerts' && <Modal title="Gérer mes alertes" onClose={()=>setModal(null)}>{manageSent ? <div className="space-y-4"><p className="rounded-2xl bg-emerald-400/10 p-4 text-sm font-semibold text-emerald-300 light:text-emerald-700">Si cette adresse possède des alertes, un lien sécurisé vient d’être envoyé. Pense à vérifier les courriers indésirables.</p><button onClick={()=>setModal(null)} className="w-full rounded-2xl bg-emerald-400 px-4 py-3.5 font-black text-slate-950">Fermer</button></div> : <form onSubmit={submitManageAlerts} className="space-y-4"><p className="text-sm text-slate-400 light:text-slate-600">Saisis l’adresse utilisée pour tes alertes. Tu recevras un lien personnel, sans mot de passe.</p><label className="block"><span className="label">Adresse e-mail *</span><input required type="email" className={field} value={manageEmail} onChange={e=>setManageEmail(e.target.value)} placeholder="toi@email.fr"/></label><button className="w-full rounded-2xl bg-emerald-400 px-4 py-3.5 font-black text-slate-950">Recevoir mon lien sécurisé</button></form>}</Modal>}
      {reporting && <Modal title="Signaler une annonce" onClose={()=>setReporting(null)}><div className="space-y-3">{[['no_seats','Plus de places'],['invalid_link','Lien invalide'],['wrong_info','Informations erronées']].map(([value,label])=><label key={value} className="flex items-center gap-3 rounded-2xl border border-slate-700 p-4 light:border-slate-300"><input type="radio" name="report-reason" checked={reportReason===value} onChange={()=>setReportReason(value)}/><span className="font-bold">{label}</span></label>)}<button onClick={submitReport} className="w-full rounded-2xl bg-red-500 px-4 py-3.5 font-black text-white">Envoyer le signalement</button></div></Modal>}

    </div>
  )
}
