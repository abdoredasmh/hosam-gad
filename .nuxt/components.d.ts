
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T extends DefineComponent> = T & DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>>
type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = (T & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>)
interface _GlobalComponents {
      'AppFooter': typeof import("../components/AppFooter.vue")['default']
    'AppHeader': typeof import("../components/AppHeader.vue")['default']
    'BaseCard': typeof import("../components/BaseCard.vue")['default']
    'BookCard': typeof import("../components/BookCard.vue")['default']
    'CommentActions': typeof import("../components/CommentActions.vue")['default']
    'CommentItem': typeof import("../components/CommentItem.vue")['default']
    'CommentSection': typeof import("../components/CommentSection.vue")['default']
    'ConfirmationModal': typeof import("../components/ConfirmationModal.vue")['default']
    'CourseCard': typeof import("../components/CourseCard.vue")['default']
    'LessonCard': typeof import("../components/LessonCard.vue")['default']
    'LoadingSpinner': typeof import("../components/LoadingSpinner.vue")['default']
    'NotificationsDropdown': typeof import("../components/NotificationsDropdown.vue")['default']
    'PdfViewerModal': typeof import("../components/PdfViewerModal.client.vue")['default']
    'ReplyItem': typeof import("../components/ReplyItem.vue")['default']
    'UserAvatar': typeof import("../components/UserAvatar.vue")['default']
    'AdminAddEditQuestionModal': typeof import("../components/admin/AddEditQuestionModal.vue")['default']
    'AdminLessonModal': typeof import("../components/admin/AdminLessonModal.vue")['default']
    'AdminSidebar': typeof import("../components/admin/AdminSidebar.vue")['default']
    'AdminStatCardVue': typeof import("../components/admin/AdminStatCard.vue.vue")['default']
    'AdminUserActions': typeof import("../components/admin/AdminUserActions.vue")['default']
    'AdminBookAddModal': typeof import("../components/admin/BookAddModal.vue")['default']
    'AdminBookEditModal': typeof import("../components/admin/BookEditModal.vue")['default']
    'AdminCategoryModal': typeof import("../components/admin/CategoryModal.vue")['default']
    'AdminConfirmationModal': typeof import("../components/admin/ConfirmationModal.vue")['default']
    'AdminCourseAddEditModal': typeof import("../components/admin/CourseAddEditModal.vue")['default']
    'AdminInfoItem': typeof import("../components/admin/InfoItem.vue")['default']
    'AdminQuizCreateEditModal': typeof import("../components/admin/QuizCreateEditModal.vue")['default']
    'AdminSearchableLessonSelect': typeof import("../components/admin/SearchableLessonSelect.vue")['default']
    'AdminSendMessageModal': typeof import("../components/admin/SendMessageModal.vue")['default']
    'AdminSuspendCommentModal': typeof import("../components/admin/SuspendCommentModal.vue")['default']
    'AdminVideoPreviewModal': typeof import("../components/admin/VideoPreviewModal.vue")['default']
    'CommonSortIcon': typeof import("../components/common/SortIcon.vue")['default']
    'NuxtWelcome': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-error-boundary")['default']
    'ClientOnly': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../node_modules/.pnpm/@nuxt+image@1.10.0_db0@0.3.1_ioredis@5.6.0_magicast@0.3.5/node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']
    'NuxtPicture': typeof import("../node_modules/.pnpm/@nuxt+image@1.10.0_db0@0.3.1_ioredis@5.6.0_magicast@0.3.5/node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']
    'ColorScheme': typeof import("../node_modules/.pnpm/@nuxtjs+color-mode@3.5.2_magicast@0.3.5/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']
    'NuxtPage': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtIsland': typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'PdfViewerModal': IslandComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'NuxtRouteAnnouncer': IslandComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
      'LazyAppFooter': LazyComponent<typeof import("../components/AppFooter.vue")['default']>
    'LazyAppHeader': LazyComponent<typeof import("../components/AppHeader.vue")['default']>
    'LazyBaseCard': LazyComponent<typeof import("../components/BaseCard.vue")['default']>
    'LazyBookCard': LazyComponent<typeof import("../components/BookCard.vue")['default']>
    'LazyCommentActions': LazyComponent<typeof import("../components/CommentActions.vue")['default']>
    'LazyCommentItem': LazyComponent<typeof import("../components/CommentItem.vue")['default']>
    'LazyCommentSection': LazyComponent<typeof import("../components/CommentSection.vue")['default']>
    'LazyConfirmationModal': LazyComponent<typeof import("../components/ConfirmationModal.vue")['default']>
    'LazyCourseCard': LazyComponent<typeof import("../components/CourseCard.vue")['default']>
    'LazyLessonCard': LazyComponent<typeof import("../components/LessonCard.vue")['default']>
    'LazyLoadingSpinner': LazyComponent<typeof import("../components/LoadingSpinner.vue")['default']>
    'LazyNotificationsDropdown': LazyComponent<typeof import("../components/NotificationsDropdown.vue")['default']>
    'LazyPdfViewerModal': LazyComponent<typeof import("../components/PdfViewerModal.client.vue")['default']>
    'LazyReplyItem': LazyComponent<typeof import("../components/ReplyItem.vue")['default']>
    'LazyUserAvatar': LazyComponent<typeof import("../components/UserAvatar.vue")['default']>
    'LazyAdminAddEditQuestionModal': LazyComponent<typeof import("../components/admin/AddEditQuestionModal.vue")['default']>
    'LazyAdminLessonModal': LazyComponent<typeof import("../components/admin/AdminLessonModal.vue")['default']>
    'LazyAdminSidebar': LazyComponent<typeof import("../components/admin/AdminSidebar.vue")['default']>
    'LazyAdminStatCardVue': LazyComponent<typeof import("../components/admin/AdminStatCard.vue.vue")['default']>
    'LazyAdminUserActions': LazyComponent<typeof import("../components/admin/AdminUserActions.vue")['default']>
    'LazyAdminBookAddModal': LazyComponent<typeof import("../components/admin/BookAddModal.vue")['default']>
    'LazyAdminBookEditModal': LazyComponent<typeof import("../components/admin/BookEditModal.vue")['default']>
    'LazyAdminCategoryModal': LazyComponent<typeof import("../components/admin/CategoryModal.vue")['default']>
    'LazyAdminConfirmationModal': LazyComponent<typeof import("../components/admin/ConfirmationModal.vue")['default']>
    'LazyAdminCourseAddEditModal': LazyComponent<typeof import("../components/admin/CourseAddEditModal.vue")['default']>
    'LazyAdminInfoItem': LazyComponent<typeof import("../components/admin/InfoItem.vue")['default']>
    'LazyAdminQuizCreateEditModal': LazyComponent<typeof import("../components/admin/QuizCreateEditModal.vue")['default']>
    'LazyAdminSearchableLessonSelect': LazyComponent<typeof import("../components/admin/SearchableLessonSelect.vue")['default']>
    'LazyAdminSendMessageModal': LazyComponent<typeof import("../components/admin/SendMessageModal.vue")['default']>
    'LazyAdminSuspendCommentModal': LazyComponent<typeof import("../components/admin/SuspendCommentModal.vue")['default']>
    'LazyAdminVideoPreviewModal': LazyComponent<typeof import("../components/admin/VideoPreviewModal.vue")['default']>
    'LazyCommonSortIcon': LazyComponent<typeof import("../components/common/SortIcon.vue")['default']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-error-boundary")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../node_modules/.pnpm/@nuxt+image@1.10.0_db0@0.3.1_ioredis@5.6.0_magicast@0.3.5/node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']>
    'LazyNuxtPicture': LazyComponent<typeof import("../node_modules/.pnpm/@nuxt+image@1.10.0_db0@0.3.1_ioredis@5.6.0_magicast@0.3.5/node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']>
    'LazyColorScheme': LazyComponent<typeof import("../node_modules/.pnpm/@nuxtjs+color-mode@3.5.2_magicast@0.3.5/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']>
    'LazyNuxtPage': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtIsland': LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyPdfViewerModal': LazyComponent<IslandComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']>>
    'LazyNuxtRouteAnnouncer': LazyComponent<IslandComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']>>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export const AppFooter: typeof import("../components/AppFooter.vue")['default']
export const AppHeader: typeof import("../components/AppHeader.vue")['default']
export const BaseCard: typeof import("../components/BaseCard.vue")['default']
export const BookCard: typeof import("../components/BookCard.vue")['default']
export const CommentActions: typeof import("../components/CommentActions.vue")['default']
export const CommentItem: typeof import("../components/CommentItem.vue")['default']
export const CommentSection: typeof import("../components/CommentSection.vue")['default']
export const ConfirmationModal: typeof import("../components/ConfirmationModal.vue")['default']
export const CourseCard: typeof import("../components/CourseCard.vue")['default']
export const LessonCard: typeof import("../components/LessonCard.vue")['default']
export const LoadingSpinner: typeof import("../components/LoadingSpinner.vue")['default']
export const NotificationsDropdown: typeof import("../components/NotificationsDropdown.vue")['default']
export const PdfViewerModal: typeof import("../components/PdfViewerModal.client.vue")['default']
export const ReplyItem: typeof import("../components/ReplyItem.vue")['default']
export const UserAvatar: typeof import("../components/UserAvatar.vue")['default']
export const AdminAddEditQuestionModal: typeof import("../components/admin/AddEditQuestionModal.vue")['default']
export const AdminLessonModal: typeof import("../components/admin/AdminLessonModal.vue")['default']
export const AdminSidebar: typeof import("../components/admin/AdminSidebar.vue")['default']
export const AdminStatCardVue: typeof import("../components/admin/AdminStatCard.vue.vue")['default']
export const AdminUserActions: typeof import("../components/admin/AdminUserActions.vue")['default']
export const AdminBookAddModal: typeof import("../components/admin/BookAddModal.vue")['default']
export const AdminBookEditModal: typeof import("../components/admin/BookEditModal.vue")['default']
export const AdminCategoryModal: typeof import("../components/admin/CategoryModal.vue")['default']
export const AdminConfirmationModal: typeof import("../components/admin/ConfirmationModal.vue")['default']
export const AdminCourseAddEditModal: typeof import("../components/admin/CourseAddEditModal.vue")['default']
export const AdminInfoItem: typeof import("../components/admin/InfoItem.vue")['default']
export const AdminQuizCreateEditModal: typeof import("../components/admin/QuizCreateEditModal.vue")['default']
export const AdminSearchableLessonSelect: typeof import("../components/admin/SearchableLessonSelect.vue")['default']
export const AdminSendMessageModal: typeof import("../components/admin/SendMessageModal.vue")['default']
export const AdminSuspendCommentModal: typeof import("../components/admin/SuspendCommentModal.vue")['default']
export const AdminVideoPreviewModal: typeof import("../components/admin/VideoPreviewModal.vue")['default']
export const CommonSortIcon: typeof import("../components/common/SortIcon.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-error-boundary")['default']
export const ClientOnly: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/.pnpm/@nuxt+image@1.10.0_db0@0.3.1_ioredis@5.6.0_magicast@0.3.5/node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']
export const NuxtPicture: typeof import("../node_modules/.pnpm/@nuxt+image@1.10.0_db0@0.3.1_ioredis@5.6.0_magicast@0.3.5/node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']
export const ColorScheme: typeof import("../node_modules/.pnpm/@nuxtjs+color-mode@3.5.2_magicast@0.3.5/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']
export const NuxtPage: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const PdfViewerModal: IslandComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const NuxtRouteAnnouncer: IslandComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyAppFooter: LazyComponent<typeof import("../components/AppFooter.vue")['default']>
export const LazyAppHeader: LazyComponent<typeof import("../components/AppHeader.vue")['default']>
export const LazyBaseCard: LazyComponent<typeof import("../components/BaseCard.vue")['default']>
export const LazyBookCard: LazyComponent<typeof import("../components/BookCard.vue")['default']>
export const LazyCommentActions: LazyComponent<typeof import("../components/CommentActions.vue")['default']>
export const LazyCommentItem: LazyComponent<typeof import("../components/CommentItem.vue")['default']>
export const LazyCommentSection: LazyComponent<typeof import("../components/CommentSection.vue")['default']>
export const LazyConfirmationModal: LazyComponent<typeof import("../components/ConfirmationModal.vue")['default']>
export const LazyCourseCard: LazyComponent<typeof import("../components/CourseCard.vue")['default']>
export const LazyLessonCard: LazyComponent<typeof import("../components/LessonCard.vue")['default']>
export const LazyLoadingSpinner: LazyComponent<typeof import("../components/LoadingSpinner.vue")['default']>
export const LazyNotificationsDropdown: LazyComponent<typeof import("../components/NotificationsDropdown.vue")['default']>
export const LazyPdfViewerModal: LazyComponent<typeof import("../components/PdfViewerModal.client.vue")['default']>
export const LazyReplyItem: LazyComponent<typeof import("../components/ReplyItem.vue")['default']>
export const LazyUserAvatar: LazyComponent<typeof import("../components/UserAvatar.vue")['default']>
export const LazyAdminAddEditQuestionModal: LazyComponent<typeof import("../components/admin/AddEditQuestionModal.vue")['default']>
export const LazyAdminLessonModal: LazyComponent<typeof import("../components/admin/AdminLessonModal.vue")['default']>
export const LazyAdminSidebar: LazyComponent<typeof import("../components/admin/AdminSidebar.vue")['default']>
export const LazyAdminStatCardVue: LazyComponent<typeof import("../components/admin/AdminStatCard.vue.vue")['default']>
export const LazyAdminUserActions: LazyComponent<typeof import("../components/admin/AdminUserActions.vue")['default']>
export const LazyAdminBookAddModal: LazyComponent<typeof import("../components/admin/BookAddModal.vue")['default']>
export const LazyAdminBookEditModal: LazyComponent<typeof import("../components/admin/BookEditModal.vue")['default']>
export const LazyAdminCategoryModal: LazyComponent<typeof import("../components/admin/CategoryModal.vue")['default']>
export const LazyAdminConfirmationModal: LazyComponent<typeof import("../components/admin/ConfirmationModal.vue")['default']>
export const LazyAdminCourseAddEditModal: LazyComponent<typeof import("../components/admin/CourseAddEditModal.vue")['default']>
export const LazyAdminInfoItem: LazyComponent<typeof import("../components/admin/InfoItem.vue")['default']>
export const LazyAdminQuizCreateEditModal: LazyComponent<typeof import("../components/admin/QuizCreateEditModal.vue")['default']>
export const LazyAdminSearchableLessonSelect: LazyComponent<typeof import("../components/admin/SearchableLessonSelect.vue")['default']>
export const LazyAdminSendMessageModal: LazyComponent<typeof import("../components/admin/SendMessageModal.vue")['default']>
export const LazyAdminSuspendCommentModal: LazyComponent<typeof import("../components/admin/SuspendCommentModal.vue")['default']>
export const LazyAdminVideoPreviewModal: LazyComponent<typeof import("../components/admin/VideoPreviewModal.vue")['default']>
export const LazyCommonSortIcon: LazyComponent<typeof import("../components/common/SortIcon.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-error-boundary")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/.pnpm/@nuxt+image@1.10.0_db0@0.3.1_ioredis@5.6.0_magicast@0.3.5/node_modules/@nuxt/image/dist/runtime/components/NuxtImg.vue")['default']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/.pnpm/@nuxt+image@1.10.0_db0@0.3.1_ioredis@5.6.0_magicast@0.3.5/node_modules/@nuxt/image/dist/runtime/components/NuxtPicture.vue")['default']>
export const LazyColorScheme: LazyComponent<typeof import("../node_modules/.pnpm/@nuxtjs+color-mode@3.5.2_magicast@0.3.5/node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyPdfViewerModal: LazyComponent<IslandComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']>>
export const LazyNuxtRouteAnnouncer: LazyComponent<IslandComponent<typeof import("../node_modules/.pnpm/nuxt@3.16.2_@parcel+watcher_202260b4ad80513664e8a42424ac5d44/node_modules/nuxt/dist/app/components/server-placeholder")['default']>>

export const componentNames: string[]
