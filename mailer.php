export const categoryIcons = {
  'Streaming vidéo': '🍿', Musique: '🎵', 'VPN & Sécurité': '🔒',
  'Productivité & Logiciels': '💼', IA: '🤖', 'Jeux vidéo': '🎮',
  'Presse & Lecture': '📰', 'Bien-être / Sport / Santé': '💪',
  Maison: '🏠', Cloud: '☁️', Autre: '📦',
}

const groups = {
  'Streaming vidéo': ['Netflix','Disney+','YouTube Premium','Amazon Prime Video','CANAL+','HBO Max','Crunchyroll','Apple TV+','Paramount+','ADN','DAZN','Starz','Plex','SkyShowtime','OCS','Ligue 1+','Molotov','MUBI','beIN SPORTS CONNECT','Eurosport'],
  Musique: ['Spotify','Deezer','Apple Music','YouTube Music','Tidal','Qobuz','Amazon Music'],
  'VPN & Sécurité': ['NordVPN','Surfshark','ExpressVPN','CyberGhost','PureVPN','Proton VPN','Dashlane','Bitdefender','AdGuard','Avast','LastPass','hide.me','FastestVPN'],
  'Productivité & Logiciels': ['Microsoft 365','Canva','Google One','Dropbox','Notion','Envato Elements','CapCut','Setapp','Adobe Creative Cloud','Antidote','GitHub Copilot','Lovable','Replit Core'],
  IA: ['ChatGPT','Google AI / Gemini','Claude','Midjourney','Copy AI','Quillbot','Textfocus','Perplexity','Cursor','Grok','Runway','ElevenLabs'],
  'Jeux vidéo': ['Nintendo Switch Online','Xbox Game Pass','PlayStation Plus','Blacknut','Apple Arcade','Chess.com','Discord Nitro','Google Play Pass','EA Play','Ubisoft+'],
  'Presse & Lecture': ['Le Monde','Le Figaro','Cafeyn','Scribd','Readly','Blinkist','ePresse','UFC Que Choisir','Ouest-France','Bookbeat','Nextory','Izneo','L’Équipe','Mediapart'],
  'Bien-être / Sport / Santé': ['Strava','Headspace','Calm','Petit Bambou','Cookidoo','Hypnoledge','iFit','Duolingo','MasterClass','Babbel','Gaia','Rouvy'],
  Maison: ['Amazon Prime','Cdiscount','Uber One','Deliveroo Plus'],
  Cloud: ['iCloud+','pCloud','MEGA','Leviia','Jottacloud','kDrive'],
  Autre: ['Apple One'],
}

export function serviceId(name = '') {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/\+/g, ' plus ').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

export const serviceCatalog = Object.entries(groups).flatMap(([category, services]) =>
  services.map((name) => ({ id: serviceId(name), name, category, icon: categoryIcons[category] })),
)

export const featuredServiceIds = [
  'netflix', 'spotify', 'chatgpt', 'apple_one', 'nordvpn', 'microsoft_365',
  'disney_plus', 'amazon_music', 'google_one', 'playstation_plus', 'cafeyn', 'uber_one',
]

export const categories = ['Toutes', ...Object.keys(categoryIcons)]
