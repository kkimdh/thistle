export default defineNuxtRouteMiddleware(async (to) => {
  const openPages = ['/login', '/confirm', '/blocked']
  if (openPages.includes(to.path)) return

  const user = useSupabaseUser()
  if (!user.value) return

  const allowed = useState<boolean | null>('allowed', () => null)
  if (allowed.value === null) {
    const supabase = useSupabaseClient()
    const { data } = await supabase.rpc('is_allowed')
    allowed.value = data === true
  }

  if (!allowed.value) return navigateTo('/blocked')
})
