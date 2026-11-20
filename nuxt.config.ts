// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: { port: 3002 },
  modules: ["@nuxt/ui", "@nuxtjs/supabase", "@vite-pwa/nuxt", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  app: {
    head: {
      title: "엉겅퀴",
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        { name: "color-scheme", content: "light" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-title", content: "엉겅퀴" },
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon-32x32.png" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
    },
  },
  pwa: {
    registerType: "autoUpdate",
    workbox: {
      navigateFallback: null,
    },
    manifest: {
      name: "엉겅퀴",
      short_name: "엉겅퀴",
      display: "standalone",
      start_url: "/",
      theme_color: "#1F3A2E",
      background_color: "#1F3A2E",
      icons: [
        { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
  },
  supabase: {
    types: false,
    redirect: true,
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
    },
  },
  ui: {
    colorMode: false,
  },
});
