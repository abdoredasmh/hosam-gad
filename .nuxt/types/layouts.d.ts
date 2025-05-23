import type { ComputedRef, MaybeRef } from 'vue'
export type LayoutKey = "admin" | "default"
declare module "../../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}