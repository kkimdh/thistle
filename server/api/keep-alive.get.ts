export default defineEventHandler(async (event) => {
  const { url, key } = useRuntimeConfig(event).public.supabase as { url: string; key: string }
  setHeader(event, 'Cache-Control', 'no-store')

  const res = await fetch(`${url}/rest/v1/rpc/keep_alive`, {
    method: 'POST',
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: '{}',
  }).catch(() => null)

  if (!res || !res.ok) {
    setResponseStatus(event, 502)
    return { ok: false, status: res?.status ?? 'network' }
  }
  return { ok: true, at: new Date().toISOString() }
})
