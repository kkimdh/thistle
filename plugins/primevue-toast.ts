import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";

export default defineNuxtPlugin((nuxtApp) => {
  if (!nuxtApp.vueApp.config.globalProperties.$toast) {
    nuxtApp.vueApp.use(ToastService);
  }
  nuxtApp.vueApp.component("pp-toast", Toast);
});
