<template>
  <div class="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen" :aria-busy="isLoading">
    <div class="flex justify-between items-center mb-6 gap-4">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 shrink-0">
        📊 لوحة الإحصائيات
      </h1>
      <button
        @click="forceRefresh"
        :disabled="isLoading"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shrink-0"
      >
        <!-- Loading Spinner -->
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <!-- Refresh Icon -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0115.357 2m0 0H15" />
        </svg>
        <span class="whitespace-nowrap">{{ isLoading ? 'جاري التحديث...' : 'تحديث' }}</span>
      </button>
    </div>

    <transition name="fade" mode="out-in">
      <!-- الحالة: تحميل أولي (لا توجد بيانات بعد) -->
      <div v-if="isInitialLoading" key="loading-skeleton" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <!-- Skeleton Card - Mimics AdminStatCard structure -->
        <div v-for="n in 12" :key="`skel-${n}`" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse">
          <div class="flex items-center justify-between mb-3">
             <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5"></div> <!-- Skeleton Title -->
             <div class="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div> <!-- Skeleton Icon -->
          </div>
          <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div> <!-- Skeleton Value -->
          <div class="mt-3 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div> <!-- Skeleton Link Placeholder -->
        </div>
      </div>

      <!-- الحالة: خطأ -->
      <div v-else-if="error" key="error-message" class="text-center text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-6 rounded-lg shadow border border-red-200 dark:border-red-700" role="alert" aria-live="polite">
        <div class="flex justify-center items-center mb-3">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           <h3 class="text-lg font-semibold">حدث خطأ!</h3>
        </div>
        <p class="mb-4">لم نتمكن من جلب بيانات لوحة الإحصائيات.</p>
        <p class="text-sm text-gray-600 dark:text-gray-500 mb-4">الخطأ: {{ error.message || 'غير معروف' }}</p>
        <button
          @click="forceRefresh"
          :disabled="isLoading"
          class="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0115.357 2m0 0H15" />
          </svg>
          إعادة المحاولة
        </button>
      </div>

      <!-- الحالة: عرض الإحصائيات (بيانات موجودة، حتى لو كان التحديث جارياً) -->
      <div v-else key="stats-content" class="space-y-8">
        <!-- قسم المستخدمين والنشاط -->
        <section aria-labelledby="users-activity-heading">
          <h2 id="users-activity-heading" class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700">
            المستخدمون والتفاعل
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AdminStatCard title="إجمالي المستخدمين" :value="stats.totalUsers" icon="users" link-to="/admin/users" :is-loading="isLoading" tooltip="إجمالي عدد المستخدمين المسجلين" />
            <AdminStatCard title="إجمالي التعليقات" :value="stats.totalComments" icon="comments" link-to="/admin/comments" :is-loading="isLoading" tooltip="إجمالي عدد التعليقات على الدروس"/>
            <AdminStatCard title="التسجيلات بالدورات" :value="stats.totalEnrollments" icon="graduation-cap" link-to="/admin/enrollments" :is-loading="isLoading" tooltip="إجمالي عدد مرات تسجيل المستخدمين في الدورات" />
            <AdminStatCard title="إكمالات الدروس" :value="stats.totalCompletions" icon="check-circle" link-to="/admin/completions" :is-loading="isLoading" tooltip="إجمالي عدد الدروس التي تم إكمالها بواسطة المستخدمين"/>
          </div>
        </section>

        <!-- قسم المحتوى -->
        <section aria-labelledby="content-heading">
          <h2 id="content-heading" class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700">
            المحتوى التعليمي
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AdminStatCard title="إجمالي الكتب" :value="stats.totalBooks" icon="book" link-to="/admin/books" :is-loading="isLoading" tooltip="إجمالي عدد الكتب المتاحة"/>
            <AdminStatCard title="إجمالي الدروس" :value="stats.totalLessons" icon="video" link-to="/admin/lessons" :is-loading="isLoading" tooltip="إجمالي عدد الدروس المتاحة"/>
            <AdminStatCard title="إجمالي الدورات" :value="stats.totalCourses" icon="chalkboard-teacher" link-to="/admin/courses" :is-loading="isLoading" tooltip="إجمالي عدد الدورات التدريبية المتاحة"/>
            <AdminStatCard title="إجمالي الاختبارات" :value="stats.totalQuizzes" icon="question-circle" link-to="/admin/quizzes" :is-loading="isLoading" tooltip="إجمالي عدد الاختبارات المتاحة"/>
          </div>
        </section>

        <!-- قسم التفاعل والاستفسارات -->
        <section aria-labelledby="interaction-heading">
          <h2 id="interaction-heading" class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700">
            الاستفسارات والتنبيهات
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AdminStatCard title="أسئلة للشيخ" :value="stats.totalQuestionsToSheikh" icon="question" link-to="/admin/questions-sheikh" :is-loading="isLoading" tooltip="إجمالي الأسئلة الموجهة للشيخ"/>
            <AdminStatCard
              title="أسئلة بانتظار الرد"
              :value="stats.unansweredQuestions"
              icon="clock"
              :warning="!!stats.unansweredQuestions && stats.unansweredQuestions > 0"
              link-to="/admin/questions-sheikh?filter=unanswered"
              :is-loading="isLoading"
              tooltip="عدد الأسئلة الموجهة للشيخ ولم يتم الرد عليها بعد"
            />
            <AdminStatCard
              title="إشعارات غير مقروءة"
              :value="stats.unreadNotifications"
              icon="bell"
              :warning="!!stats.unreadNotifications && stats.unreadNotifications > 0"
              link-to="/admin/notifications"
              :is-loading="isLoading"
              tooltip="عدد الإشعارات الهامة التي لم يتم الاطلاع عليها"
            />
            <AdminStatCard title="محاولات الاختبارات" :value="stats.totalQuizAttempts" icon="file-alt" link-to="/admin/quiz-attempts" :is-loading="isLoading" tooltip="إجمالي عدد المحاولات التي أجراها المستخدمون للاختبارات"/>
          </div>
        </section>

        <!-- قسم إحصائيات الموقع (اختياري) -->
        <section v-if="shouldShowSiteStatsSection" aria-labelledby="site-stats-heading">
          <h2 id="site-stats-heading" class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700">
            إحصائيات الموقع
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AdminStatCard v-if="stats.totalLessonViews !== null" title="مشاهدات الدروس" :value="stats.totalLessonViews" icon="eye" :is-loading="isLoading" tooltip="إجمالي عدد مرات مشاهدة الدروس"/>
            <AdminStatCard v-if="stats.totalBookDownloads !== null" title="تحميلات الكتب" :value="stats.totalBookDownloads" icon="download" :is-loading="isLoading" tooltip="إجمالي عدد مرات تحميل الكتب"/>
            <!-- Add more site stats cards as needed -->
          </div>
        </section>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSupabaseClient } from '#imports';
import type { Database } from '~/types/database.types'; // Adjust path if needed
import type { PostgrestError } from '@supabase/supabase-js';
import AdminStatCard from '~/components/admin/AdminStatCard.vue'; // Adjust path if needed

// Define the structure for dashboard statistics
interface DashboardStats {
  totalUsers: number | null;
  totalComments: number | null;
  totalEnrollments: number | null;
  totalCompletions: number | null;
  totalBooks: number | null;
  totalLessons: number | null;
  totalCourses: number | null;
  totalQuizzes: number | null;
  totalQuestionsToSheikh: number | null;
  unansweredQuestions: number | null;
  unreadNotifications: number | null;
  totalQuizAttempts: number | null;
  totalLessonViews: number | null; // Optional stat
  totalBookDownloads: number | null; // Optional stat
}

// Layout & Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'admin', // Ensure this middleware handles authentication/authorization
});

const supabase = useSupabaseClient<Database>();

// Reactive state variables
const stats = ref<DashboardStats>({
  totalUsers: null,
  totalComments: null,
  totalEnrollments: null,
  totalCompletions: null,
  totalBooks: null,
  totalLessons: null,
  totalCourses: null,
  totalQuizzes: null,
  totalQuestionsToSheikh: null,
  unansweredQuestions: null,
  unreadNotifications: null,
  totalQuizAttempts: null,
  totalLessonViews: null,
  totalBookDownloads: null,
});
const isLoading = ref(true); // Tracks if *any* fetch operation is in progress
const error = ref<Error | PostgrestError | null>(null);
const lastFetched = ref<number | null>(null); // Timestamp of the last successful fetch
const dataLoadedAtLeastOnce = ref(false); // Tracks if data has been loaded successfully at least once

// Configuration
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache

// Computed property to determine if we should show the initial loading skeleton
const isInitialLoading = computed(() => isLoading.value && !dataLoadedAtLeastOnce.value);

// Computed property to determine if the site stats section should be visible
const shouldShowSiteStatsSection = computed(() =>
    stats.value.totalLessonViews !== null || stats.value.totalBookDownloads !== null
);

/**
 * Fetches the count for a specific Supabase table, optionally applying filters.
 * Uses `head: true` for efficiency.
 * @param tableName - The name of the table to count.
 * @param filter - An optional function to apply filters to the query.
 * @returns Promise<number> - The count of records.
 * @throws {PostgrestError | Error} - Throws on Supabase error or unexpected error.
 */
async function fetchCount(
    tableName: keyof Database['public']['Tables'],
    filter?: (query: any) => any
): Promise<number> {
  try {
    let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
    if (filter) {
      query = filter(query);
    }
    const { count, error: countError } = await query;

    if (countError) {
      
      throw countError; // Re-throw the error to be caught by Promise.allSettled
    }
    return count ?? 0;
  } catch (err: unknown) {
    
    // Ensure we throw an Error object
    throw err instanceof Error ? err : new Error(`Failed to fetch count for ${tableName}`);
  }
}

/**
 * Fetches all dashboard statistics concurrently.
 * Handles caching, loading states, and errors gracefully using Promise.allSettled.
 * @param force - If true, bypasses the cache and forces a refresh.
 */
async function fetchAllStats(force = false) {
  const now = Date.now();

  // Use cache if data is fresh and not forcing refresh
  if (!force && lastFetched.value && (now - lastFetched.value < CACHE_DURATION_MS)) {
    
    // Ensure loading state is false if using cache and not already false
    if (isLoading.value) isLoading.value = false;
    return;
  }

  isLoading.value = true;
  error.value = null; // Reset error state before fetching

  // Define all statistics fetching tasks
  const tasks = [
    { key: 'totalUsers', promise: fetchCount('profiles') },
    { key: 'totalComments', promise: fetchCount('comments') },
    { key: 'totalEnrollments', promise: fetchCount('course_enrollments') },
    { key: 'totalCompletions', promise: fetchCount('lesson_completions') },
    { key: 'totalBooks', promise: fetchCount('books') },
    { key: 'totalLessons', promise: fetchCount('lessons') },
    { key: 'totalCourses', promise: fetchCount('study_courses') },
    { key: 'totalQuizzes', promise: fetchCount('quizzes') },
    { key: 'totalQuestionsToSheikh', promise: fetchCount('questions_to_sheikh') },
    { key: 'unansweredQuestions', promise: fetchCount('questions_to_sheikh', q => q.eq('is_answered', false)) },
    // Fetch unread *general* notifications (user_id is null). Adjust if needed.
    { key: 'unreadNotifications', promise: fetchCount('notifications', q => q.eq('is_read', false).is('user_id', null)) },
    { key: 'totalQuizAttempts', promise: fetchCount('quiz_attempts') },
    // Optional site stats
    { key: 'totalLessonViews', promise: fetchCount('site_stats', q => q.eq('type', 'lesson_view')) },
    { key: 'totalBookDownloads', promise: fetchCount('site_stats', q => q.eq('type', 'book_download')) },
  ] as const; // Use 'as const' for stricter typing of keys

  try {
    const results = await Promise.allSettled(tasks.map(task => task.promise));
    let firstErrorEncountered: Error | PostgrestError | null = null;
    let allSucceeded = true;

    results.forEach((result, index) => {
      const taskKey = tasks[index].key; // Type is inferred correctly due to 'as const'

      if (result.status === 'fulfilled') {
        stats.value[taskKey] = result.value;
      } else {
        // Log the specific error and set the stat value to null
        
        stats.value[taskKey] = null; // Indicate failure for this specific stat
        allSucceeded = false;
        // Store the first error to display a general message
        if (!firstErrorEncountered) {
          firstErrorEncountered = result.reason instanceof Error ? result.reason : new Error(String(result.reason));
        }
      }
    });

    if (firstErrorEncountered) {
        error.value = firstErrorEncountered; // Display the first encountered error
        // Keep old lastFetched time if partial failure, so cache might still be used partially?
        // Or clear it to force full refresh next time? Let's clear it.
        lastFetched.value = null;
    } else {
        // All stats fetched successfully
        lastFetched.value = Date.now(); // Update cache timestamp
        dataLoadedAtLeastOnce.value = true; // Mark that data has been loaded
    }

  } catch (err: unknown) {
     // Catch unexpected errors outside Promise.allSettled (less likely but possible)
     
     if (!error.value) { // Avoid overwriting specific errors from allSettled
        error.value = err instanceof Error ? err : new Error("Unknown error during fetching process");
     }
     lastFetched.value = null; // Invalidate cache on major error
  } finally {
    isLoading.value = false; // Fetching process complete (success or fail)
  }
}

/**
 * Forces a data refresh, bypassing the cache.
 */
function forceRefresh() {
  // Don't trigger if already loading
  if (isLoading.value) return;
  lastFetched.value = null; // Invalidate cache
  fetchAllStats(true); // Force fetch
}

// Fetch data when the component is mounted
onMounted(() => {
  fetchAllStats();
});
</script>

<style scoped>
/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Optional: Add subtle hover effect to cards */
.grid > section > div > * { /* Target AdminStatCard components within sections */
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.grid > section > div > *:hover {
  transform: translateY(-3px);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow); /* Use existing shadow variables */
  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

/* Ensure sections have consistent bottom margin */
section:not(:last-child) {
    margin-bottom: 2rem; /* Equivalent to space-y-8 on the parent */
}

/* Improve focus visibility for buttons */
button:focus-visible {
    outline: 2px solid theme('colors.indigo.500');
    outline-offset: 2px;
}
button.bg-red-600:focus-visible {
     outline-color: theme('colors.red.500');
}
</style>