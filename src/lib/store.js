const API = '/api/index.php'
async function request(action, options={}) {
  const r = await fetch(`${API}?action=${encodeURIComponent(action)}`, { credentials:'same-origin', headers:{'Content-Type':'application/json',...(options.headers||{})}, ...options })
  const data = await r.json().catch(()=>({}))
  if (!r.ok) { const e=new Error(data.error||`Erreur ${r.status}`); e.code=data.error; throw e }
  return data
}
const post=(action,payload)=>request(action,{method:'POST',body:JSON.stringify(payload)})
export const listOffers=async()=> (await request('list')).offers||[]
export const getPublicMeta=()=>request('public-meta')
export const createOffer=async o=>(await post('create',o)).offer
export async function reportOffer(id,reason){let visitor=localStorage.getItem('gosharesplit-visitor');if(!visitor){visitor=crypto.randomUUID();localStorage.setItem('gosharesplit-visitor',visitor)}return post('report',{id,visitor,reason})}
export const createSuggestion=p=>post('suggest',p)
export const createAlert=p=>post('alert',p)
export const requestAlertManagement=email=>post('request-alert-management',{email})
export const getManagedAlerts=async token=>{const r=await fetch(`${API}?action=manage-alerts&token=${encodeURIComponent(token)}`,{credentials:'same-origin'});const d=await r.json();if(!r.ok)throw Object.assign(new Error(d.error),{code:d.error});return d}
export const updateManagedAlert=(token,id,operation)=>post('manage-alert-update',{token,id,operation})
export const unsubscribeAlert=token=>post('unsubscribe',{token})
export const getAdminSession=()=>request('session')
export const adminLogin=(username,password)=>post('login',{username,password})
export const adminLogout=csrf=>post('logout',{csrf})
export const adminGet=action=>request(action)
export const adminPost=(action,payload,csrf)=>post(action,{...payload,csrf})
export const listAdminOffers=async()=> (await request('admin-list')).offers||[]
export const updateOffer=(id,offer,csrf)=>adminPost('admin-update',{id,...offer},csrf)
export const deleteOffer=(id,csrf)=>adminPost('admin-delete',{id},csrf)
export const listAdminSuggestions=async()=> (await request('admin-suggestions')).suggestions||[]
export const deleteSuggestion=(id,csrf)=>adminPost('admin-suggestion-delete',{id},csrf)
