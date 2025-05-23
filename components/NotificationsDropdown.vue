<template>
  <Transition
    enter-active-class="transition duration-100 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-75 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="isOpen"
      class="
        fixed top-16 left-1/2 -translate-x-1/2 /* <-- Changed: Fixed position centered */
        mt-0 /* <-- Removed mt-2 as top is now fixed */
        w-80 max-w-[calc(100vw-2rem)] /* <-- Added max-width to prevent overflow on small screens */
        origin-top /* <-- Changed: Animation origin to top-center */
        rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border dark:border-gray-700
        z-50 /* <-- Added: Ensure it's above other content */
      "
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="notifications-button"
      tabindex="-1"
    >
      <div class="py-1" role="none">
        <!-- Header -->
        <div class="px-4 py-2 flex justify-between items-center border-b dark:border-gray-700">
          <h3 class="text-sm font-semibold text-gray-800 dark:text-gray-200">الإشعارات</h3>
          <button
            v-if="unreadCount > 0"
            @click="markAllRead"
            class="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 font-medium disabled:opacity-50"
            :disabled="isLoading"
          >
            تعليم الكل كمقروء
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading && notifications.length === 0" class="px-4 py-10 text-center">
          <LoadingSpinner class="w-6 h-6 mx-auto text-primary"/>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">جار التحميل...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="px-4 py-3 text-center text-xs text-red-600 dark:text-red-400">
          {{ error }}
        </div>

        <!-- Empty State -->
        <div v-else-if="notifications.length === 0" class="px-4 py-10 text-center">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-gray-400 mb-2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.017 5.454 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">لا توجد إشعارات جديدة.</p>
        </div>

        <!-- Notifications List -->
        <div v-else class="max-h-80 overflow-y-auto custom-scrollbar divide-y dark:divide-gray-700">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            role="menuitem"
            tabindex="-1"
            :class="[
              'block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 transition-colors duration-150 cursor-pointer',
              notification.is_read ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50' : 'bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 font-medium'
            ]"
          >
            <div class="flex items-start space-x-3 rtl:space-x-reverse">
              <!-- Read/Unread Indicator -->
              <div class="flex-shrink-0 pt-1">
                <span class="inline-block h-2 w-2 rounded-full" :class="notification.is_read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-primary-500 dark:bg-primary-400'"></span>
              </div>
              <div class="flex-grow">
                <p class="whitespace-pre-wrap">{{ notification.message }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ formatRelativeTime(notification.created_at) }}
                </p>
              </div>
               <!-- Optional: Explicit "Mark as Read" button -->
               <!-- <button v-if="!notification.is_read" @click.stop="markOneRead(notification.id)" class="...">Mark Read</button> -->
            </div>
          </div>
        </div>

        <!-- Footer Link (Optional) -->
        <!-- <div class="px-4 py-2 border-t dark:border-gray-700 text-center">
          <NuxtLink to="/notifications" @click="$emit('close')" class="text-xs text-primary-600 hover:underline">عرض كل الإشعارات</NuxtLink>
        </div> -->
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationStore } from '~/stores/notifications';
import { useUserStore } from '~/stores/user'; // لاستخدام معرف المستخدم عند الحاجة
import { storeToRefs } from 'pinia';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import { formatDistanceToNowStrict } from 'date-fns'; // لاستخدام تنسيق الوقت النسبي
import { arSA } from 'date-fns/locale'; // لاستخدام اللغة العربية
import { useRouter, navigateTo } from '#imports'; // لاستخدام التوجيه

// --- Props & Emits ---
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(['close']);

// --- Store ---
const notificationStore = useNotificationStore();
const userStore = useUserStore(); // جلب مخزن المستخدم
const { notifications, unreadCount, isLoading, error } = storeToRefs(notificationStore);
const { profile } = storeToRefs(userStore); // الحصول على ملف المستخدم
const router = useRouter();

// --- Actions ---
const markAllRead = () => {
    if (profile.value?.id) {
        notificationStore.markAllAsRead(profile.value.id);
    } else {
        
    }
};

const markOneRead = (id: number) => {
     notificationStore.markAsRead(id);
};

const handleNotificationClick = (notification: typeof notifications.value[0]) => {
    // 1. تعليم كمقروء (إذا لم يكن مقروءًا بالفعل)
    if (!notification.is_read) {
        markOneRead(notification.id);
    }
    // 2. الانتقال إلى الرابط (إذا وجد)
    if (notification.link) {
        // Ensure link is treated as internal if it starts with '/'
        // Or handle external links appropriately if needed
        navigateTo(notification.link);
    }
    // 3. إغلاق القائمة المنسدلة
    emit('close');
};

// --- Helper Functions ---
const formatRelativeTime = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    // Ensure the date is parsed correctly, handling potential timezone issues if necessary
    const date = new Date(dateString);
    // Check if the date is valid after parsing
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return formatDistanceToNowStrict(date, { addSuffix: true, locale: arSA });
  } catch (e) {
    
    return 'منذ زمن'; // Fallback string
  }
};
</script>

<style scoped>
/* تنسيقات مخصصة لشريط التمرير */
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(107, 114, 128, 0.4); border-radius: 10px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(107, 114, 128, 0.6); }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
</style>