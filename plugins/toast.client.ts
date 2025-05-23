// plugins/toast.client.ts
import Toast, { type PluginOptions, POSITION, useToast } from 'vue-toastification'; // <-- استورد useToast
import 'vue-toastification/dist/index.css';



export default defineNuxtPlugin(nuxtApp => {
  
  const options: PluginOptions = {
    position: POSITION.TOP_LEFT,
    timeout: 2000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: true
  };

  nuxtApp.vueApp.use(Toast, options);

  // *** إضافة nuxtApp.provide كإجراء احتياطي/إجباري ***
  nuxtApp.provide('toast', useToast());
  

 
});