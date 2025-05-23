<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <h1 class="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">
      🏆 قائمة المتصدرين 🏆
    </h1>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-16">
      <LoadingSpinner class="w-10 h-10 text-primary mx-auto" />
      <p class="mt-4 text-lg text-gray-500 dark:text-gray-400">جارٍ تحميل القائمة...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-box max-w-lg mx-auto p-6 text-center">
      <h2 class="text-xl font-semibold text-red-800 dark:text-red-300 mb-3">خطأ في التحميل</h2>
      <p class="text-red-700 dark:text-red-400">حدث خطأ أثناء تحميل قائمة المتصدرين.</p>
      <pre class="mt-2 text-sm bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-x-auto">{{ error.message }}</pre>
      <button @click="refresh" class="button-secondary mt-6">إعادة المحاولة</button>
    </div>

    <!-- Empty State -->
     <div v-else-if="leaderboard.length === 0" class="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto text-gray-400 mb-3"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
       <p class="mt-3 font-medium text-gray-700 dark:text-gray-300">لا يوجد متصدرون لعرضهم حالياً.</p>
       <p class="text-sm text-gray-500 dark:text-gray-400">شارك وتفاعل في الموقع لتظهر في القائمة!</p>
     </div>

    <!-- Leaderboard List -->
    <div v-else class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 overflow-hidden">
      <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
        <li
          v-for="(user, index) in leaderboard"
          :key="user.id"
          class="px-4 py-4 sm:px-6 flex items-center space-x-4 rtl:space-x-reverse transition-colors duration-150 ease-in-out"
          :class="{
            'bg-yellow-50 dark:bg-yellow-900/30': index === 0, // Highlight first place
            'bg-gray-50 dark:bg-gray-700/40': index === 1,   // Highlight second place
            'bg-blue-50 dark:bg-blue-900/20': index === 2,    // Highlight third place
          }"
        >
          <!-- Rank -->
          <span class="text-lg font-bold w-8 text-center" :class="getRankColor(index + 1)">
            {{ index + 1 }}
          </span>

          <!-- Avatar -->
          <img
            class="h-10 w-10 rounded-full object-cover flex-shrink-0 bg-gray-300 dark:bg-gray-600"
            :src="user.avatar_url || '/images/default-avatar.png'"
            :alt="`صورة ${user.full_name}`"
          >

          <!-- Name -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {{ user.full_name || 'مستخدم' }}
            </p>
            <!-- Optional: Add bio or join date if needed -->
            <!-- <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ user.bio || '' }}</p> -->
          </div>

          <!-- Points -->
          <div class="flex-shrink-0 text-left rtl:text-right">
            <p class="text-sm font-semibold text-primary-600 dark:text-primary-400">
              {{ user.points ?? 0 }}
            </p>
             <p class="text-xs text-gray-500 dark:text-gray-400">نقطة</p>
          </div>
        </li>
      </ul>
    </div>
     <p class="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
       يتم عرض أفضل {{ leaderboard.length }} مشارك حالياً.
     </p>
  </div>
</template>

<script setup lang="ts">
import { useSupabaseClient, useAsyncData, definePageMeta, useHead } from '#imports';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';

// --- تعريف النوع ---
// نختار فقط الأعمدة المطلوبة من جدول profiles
type LeaderboardUser = Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url' | 'points'>;

// --- إعدادات الصفحة (إذا كانت ضمن تخطيط معين) ---
// definePageMeta({
//   layout: 'default', // أو أي تخطيط تستخدمه للصفحات العامة
// });

// --- إعدادات ---
const supabase = useSupabaseClient<Database>();
const LEADERBOARD_LIMIT = 20; // تحديد عدد المستخدمين المطلوب عرضهم

// --- جلب البيانات ---
const { data: leaderboard, pending, error, refresh } = await useAsyncData<LeaderboardUser[]>(
  'leaderboard-top-users', // مفتاح فريد
  async () => {
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, points') // اختيار الأعمدة المطلوبة فقط
      .not('points', 'is', null) // استبعاد المستخدمين الذين ليس لديهم نقاط (اختياري)
      .order('points', { ascending: false }) // الترتيب تنازليًا حسب النقاط
      .limit(LEADERBOARD_LIMIT); // تحديد العدد المطلوب

    if (error) {
      
      throw error; // رمي الخطأ ليتم عرضه في الواجهة
    }
    
    return data ?? []; // إرجاع البيانات أو مصفوفة فارغة
  },
  {
    default: () => [] // القيمة الافتراضية
    // يمكنك إضافة server: false إذا أردت الجلب من جانب العميل فقط
    // server: false,
  }
);

// --- دوال مساعدة ---
const getRankColor = (rank: number): string => {
  if (rank === 1) return 'text-yellow-500 dark:text-yellow-400';
  if (rank === 2) return 'text-gray-500 dark:text-gray-400';
  if (rank === 3) return 'text-orange-600 dark:text-orange-500';
  return 'text-gray-400 dark:text-gray-500'; // باقي المراكز
};

// --- Meta ---
useHead({
  title: 'قائمة المتصدرين',
  meta: [
    { name: 'description', content: 'اطلع على قائمة المستخدمين الأكثر تفاعلاً ونقاطاً في الموقع.' }
  ]
});
</script>

<style scoped>
/* أنماط إضافية إذا لزم الأمر */
.error-box {
  @apply p-4 border border-red-300 bg-red-50 text-red-700 rounded-md dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-300;
}
.button-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150;
}
</style>