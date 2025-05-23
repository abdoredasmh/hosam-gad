// plugins/floating-vue.client.ts
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css'; // Don't forget to import the CSS

export default defineNuxtPlugin((nuxtApp) => {
  // Register the v-tooltip directive globally
  nuxtApp.vueApp.use(FloatingVue);

  // Optional: You can configure default options here if needed
  // FloatingVue.options.themes.tooltip.disabled = window.innerWidth < 768; // Example: disable on mobile
  // See floating-vue documentation for more options: https://floating-vue.starpad.dev/guide/config
});