type DbStatus = 'ok' | 'paused' | 'offline'

export default defineNuxtPlugin(() => {
  const status = useState<DbStatus>('dbStatus', () => 'ok')
  const { url, key } = useRuntimeConfig().public.supabase as { url: string; key: string }

  const tryFetch = async (input: string, init?: RequestInit) => {
    try {
      return await fetch(input, { cache: 'no-store', ...init })
    } catch {
      return null
    }
  }

  const check = async () => {
    if (!navigator.onLine) {
      status.value = 'offline'
      return
    }
    const db = await tryFetch(`${url}/auth/v1/health`, { headers: { apikey: key } })
    if (db && db.status < 500) {
      status.value = 'ok'
      return
    }
    const site = await tryFetch(`/favicon-32x32.png?t=${Date.now()}`)
    status.value = site?.ok ? 'paused' : 'offline'
  }

  check()
  window.addEventListener('online', check)
  window.addEventListener('offline', () => {
    status.value = 'offline'
  })
})
