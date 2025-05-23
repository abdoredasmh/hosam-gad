import { defineNuxtPlugin, useRouter } from '#app'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

export default defineNuxtPlugin(() => {
  const router = useRouter()

  // إعدادات الشكل
  NProgress.configure({ showSpinner: false })

  router.beforeEach(() => {
    NProgress.start()
  })

  router.afterEach(() => {
    NProgress.done()
  })
})
