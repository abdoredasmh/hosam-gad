import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "admin" | "auth"
declare module "../../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}