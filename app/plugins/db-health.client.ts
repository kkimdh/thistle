type DbStatus = 'ok' | 'paused' | 'offline'

export default defineNuxtPlugin(() => {
  const status = useState<DbStatus>('dbStatus', () => 'ok')
  const { url, key } = useRuntimeConfig().public.supabase as { url: string; key: string }

  const RETRIES = 3
  const RETRY_GAP = 2000
  const TIMEOUT = 8000
  const PAUSED_RECHECK = 15000

  let checking = false
  let recheckTimer: ReturnType<typeof setTimeout> | null = null

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const tryFetch = async (input: string, init?: RequestInit) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    try {
      return await fetch(input, { cache: 'no-store', ...init, signal: controller.signal })
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }

  const dbAlive = async () => {
    const res = await tryFetch(`${url}/auth/v1/health`, { headers: { apikey: key } })
    return !!res && res.status < 500
  }

  const scheduleRecheck = () => {
    if (recheckTimer) clearTimeout(recheckTimer)
    recheckTimer = status.value === 'ok' ? null : setTimeout(check, PAUSED_RECHECK)
  }

  const check = async () => {
    if (checking) return
    checking = true
    try {
      for (let i = 0; i < RETRIES; i++) {
        if (navigator.onLine && (await dbAlive())) {
          status.value = 'ok'
          return
        }
        if (i < RETRIES - 1) await sleep(RETRY_GAP)
      }
      if (!navigator.onLine) {
        status.value = 'offline'
        return
      }
      const site = await tryFetch(`/favicon-32x32.png?t=${Date.now()}`)
      status.value = site?.ok ? 'paused' : 'offline'
    } finally {
      checking = false
      scheduleRecheck()
    }
  }

  check()
  window.addEventListener('online', check)
  window.addEventListener('offline', () => {
    status.value = 'offline'
    scheduleRecheck()
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check()
  })
})
