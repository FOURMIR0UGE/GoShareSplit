export function detectPlatform(link = '') {
  if (/^https:\/\/www\.sharesub\.com\/fr\/join\/[A-Za-z0-9_-]+/i.test(link)) return 'Sharesub'
  if (/^https:\/\/www\.gosplit\.com\/share\//i.test(link)) return 'GoSplit'
  if (/^https:\/\/app\.spliiit\.com\/share\/[A-Za-z0-9_-]+/i.test(link)) return 'Spliiit'
  return ''
}

export const invalidLinkMessage = 'Le lien de partage n’est pas valide. Utilisez uniquement un lien Sharesub, GoSplit ou Spliiit au format correct.'
