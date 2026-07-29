import { useCallback, useEffect, useState } from 'react'
import { Bell, LoaderCircle, Power, Trash2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { getManagedAlerts, updateManagedAlert } from '../lib/store'

export default function ManageAlertsPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [data, setData] = useState({ email: '', alerts: [] })
  const [status, setStatus] = useState('loading')
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')

  const refresh = useCallback(async () => {
    if (!token) { setStatus('error'); return }
    try {
      setData(await getManagedAlerts(token))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [token])

  useEffect(() => { refresh() }, [refresh])

  async function change(alert, operation) {
    const key = `${alert.id}:${operation}`
    setBusy(key)
    setNotice('')
    try {
      await updateManagedAlert(token, alert.id, operation)
      await refresh()
      setNotice(operation === 'delete' ? 'Alerte supprimée.' : operation === 'enable' ? 'Alerte réactivée.' : 'Alerte désactivée.')
    } catch {
      setNotice('Impossible de modifier cette alerte.')
    } finally {
      setBusy('')
    }
  }

  return (
    <main className="min-h-screen bg-[#06101d] p-5 text-slate-100">
      <section className="mx-auto mt-10 max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400 text-slate-950"><Bell size={21}/></span>
          <div><h1 className="text-2xl font-black">Mes alertes</h1>{data.email && <p className="text-sm text-slate-400">Alertes liées à {data.email}</p>}</div>
        </div>

        {status === 'loading' && <div className="grid place-items-center py-16"><LoaderCircle className="animate-spin text-emerald-400"/></div>}
        {status === 'error' && <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">Ce lien est invalide ou ne correspond à aucune alerte.</div>}
        {status === 'ready' && data.alerts.length === 0 && <p className="mt-8 rounded-2xl bg-slate-950/60 p-5 text-slate-400">Tu n’as plus aucune alerte enregistrée.</p>}

        {status === 'ready' && data.alerts.length > 0 && <div className="mt-7 space-y-3">
          {data.alerts.map(alert => <article key={alert.id} className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/55 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-black">{alert.service}</h2><p className={`mt-1 text-sm font-bold ${alert.active ? 'text-emerald-400' : 'text-slate-500'}`}>{alert.active ? 'Alerte active' : 'Alerte désactivée'}</p></div>
            <div className="flex gap-2">
              <button disabled={busy!==''} onClick={()=>change(alert, alert.active ? 'disable' : 'enable')} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-bold hover:border-emerald-400 disabled:opacity-50"><Power size={16}/>{alert.active ? 'Désactiver' : 'Réactiver'}</button>
              <button disabled={busy!==''} onClick={()=>change(alert, 'delete')} className="grid h-11 w-11 place-items-center rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-50" aria-label="Supprimer"><Trash2 size={17}/></button>
            </div>
          </article>)}
        </div>}

        {notice && <p className="mt-5 rounded-xl bg-emerald-400/10 p-3 text-sm font-bold text-emerald-300">{notice}</p>}
        <Link className="mt-7 inline-block rounded-xl bg-emerald-400 px-4 py-3 font-black text-slate-950" to="/">Retour au catalogue</Link>
      </section>
    </main>
  )
}
