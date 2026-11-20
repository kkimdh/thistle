export default defineNuxtPlugin(() => {
  const paused = useState('dbPaused', () => false)
  const { url, key } = useRuntimeConfig().public.supabase as { url: string; key: string }

  const check = async () => {
    try {
      const res = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key } })
      paused.value = !res.ok && res.status >= 500
    } catch {
      paused.value = true
    }
  }

  check()
})
