import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { unsubscribeAlert } from '../lib/store'

export default function UnsubscribePage() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const token = params.get('token') || ''

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    unsubscribeAlert(token).then(() => setStatus('done')).catch(() => setStatus('error'))
  }, [token])

  const message = status === 'loading'
    ? 'Désinscription en cours…'
    : status === 'done'
      ? 'Ton alerte a bien été désactivée. Tu ne recevras plus d’e-mails pour ce service.'
      : 'Ce lien de désinscription est invalide ou a déjà expiré.'

  return <main className="grid min-h-screen place-items-center bg-slate-950 p-5 text-slate-100"><section className="max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center"><h1 className="text-2xl font-black">Désinscription</h1><p className="mt-3 text-slate-400">{message}</p><Link className="mt-6 inline-block rounded-xl bg-emerald-400 px-4 py-3 font-bold text-slate-950" to="/">Retour au catalogue</Link></section></main>
}
