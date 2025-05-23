<template>
  <div class="container mx-auto px-4 py-8">

    <!-- 1. Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل بيانات الدرس...</p>
    </div>

    <!-- 2. Error State -->
    <div v-else-if="error || !lesson" class="text-center py-20 max-w-2xl mx-auto">
       <h2 class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
        {{ error?.data?.statusMessage || error?.message || 'خطأ في الوصول للدرس' }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        لم نتمكن من العثور على الدرس المطلوب ضمن هذه الدورة، أو أن الدورة غير نشطة، أو أنك لا تملك صلاحية الوصول إليه. يرجى التأكد من الرابط أو العودة للدورة.
      </p>
      <NuxtLink
        :to="courseIdParam ? `/study/courses/${courseIdParam}` : '/study'"
        class="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" /></svg>
        <span>العودة للدورة</span>
      </NuxtLink>
    </div>

    <!-- 3. Lesson Details Display -->
    <div v-else class="lesson-details max-w-5xl mx-auto space-y-6">

      <!-- Course Context Header -->
      <div v-if="courseInfo" class="mb-4 text-sm text-center md:text-right">
        <NuxtLink :to="`/study/courses/${courseInfo.id}`" class="text-gray-600 dark:text-gray-400 hover:text-olive-green transition-colors duration-200">
          دورة: {{ courseInfo.title }}
        </NuxtLink>
      </div>

      <!-- Lesson Title -->
      <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark text-center sm:text-right">
        {{ lesson.title || 'درس بدون عنوان' }}
      </h1>

      <!-- Video Section with Integrated Navigation (Corrected) -->
      <div class="video-section flex items-center gap-2 sm:gap-4">
        <!-- Previous Lesson Button -->
        <div class="flex-shrink-0">
          <NuxtLink v-if="previousLesson && courseIdParam" :to="`/study/courses/${courseIdParam}/lessons/${previousLesson.id}`" class="nav-button" :title="`الدرس السابق: ${previousLesson.title}`" aria-label="الدرس السابق">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="nav-icon" aria-hidden="true"> <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" /></svg>
          </NuxtLink>
          <div v-else class="nav-placeholder" aria-hidden="true"></div>
        </div>

        <!-- Video Player Container -->
        <div class="flex-grow min-w-0">
          <div v-if="youtubeVideoId" class="relative w-full rounded-lg overflow-hidden shadow-lg bg-black aspect-video">
            <iframe
              :src="`https://www.youtube.com/embed/${youtubeVideoId}`"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
              class="absolute inset-0 w-full h-full"
              title="مشغل فيديو الدرس"
              aria-label="مشغل فيديو الدرس"
            ></iframe>
          </div>
          <div v-else-if="lesson.youtube_url" class="video-error-box p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-md">
             <p class="font-semibold">رابط يوتيوب غير صالح أو غير متوفر.</p>
             <p class="mt-1 text-sm">الرجاء التأكد من أن الرابط في قاعدة البيانات هو رابط يوتيوب صحيح (مثل youtube.com/watch?v=... أو youtu.be/... أو youtube.com/embed/... أو youtube.com/shorts/...).</p>
             <p class="mt-1 text-sm">الرابط المسجل حالياً:</p>
             <code class="block break-all mt-1 text-xs bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{{ lesson.youtube_url }}</code>
          </div>
          <div v-else class="video-error-box p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-md">
            <p>لا يوجد رابط فيديو متاح لهذا الدرس.</p>
          </div>
        </div>

        <!-- Next Lesson Button -->
        <div class="flex-shrink-0">
          <NuxtLink v-if="nextLesson && courseIdParam" :to="`/study/courses/${courseIdParam}/lessons/${nextLesson.id}`" class="nav-button" :title="`الدرس التالي: ${nextLesson.title}`" aria-label="الدرس التالي">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="nav-icon" aria-hidden="true"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>
          </NuxtLink>
          <div v-else class="nav-placeholder" aria-hidden="true"></div>
        </div>
      </div>

      <!-- Action Buttons Section (Completion & Quiz) -->
      <ClientOnly>
        <div class="action-buttons-section text-center mt-6 space-y-4">

            <!-- Case 1: Logged in AND Enrolled -->
            <div v-if="isLoggedIn && isEnrolledInCourse">
              <!-- Mark as Complete / Completed Status -->
              <div class="completion-status">
                  <button v-if="!isLessonCompleted" @click="markLessonComplete" :disabled="completeLoading" class="button-complete">
                    <span v-if="completeLoading">
                      <LoadingSpinner class="w-5 h-5 inline me-2 animate-spin" aria-hidden="true" />
                      جاري التحديث...
                    </span>
                    <span v-else class="inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-1" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" /></svg>
                      تمييز الدرس كمكتمل
                    </span>
                  </button>
                  <div v-else class="inline-flex items-center px-4 py-2 border border-green-300 dark:border-green-700 rounded-md text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true"><path fill-rule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.48 4.774L6.52 10.91a.75.75 0 1 0-1.04 1.08l2.18 2.108a.75.75 0 0 0 1.076-.015l4.145-5.682Z" clip-rule="evenodd" /></svg>
                    تم إكمال هذا الدرس
                  </div>
                  <p v-if="completeError" class="text-xs text-red-500 dark:text-red-400 mt-2">{{ completeError }}</p>
              </div>

              <!-- **** START: Lesson Quiz Button **** -->
              <div v-if="lessonQuiz" class="quiz-link mt-4">
                 <NuxtLink
                   :to="`/quizzes/${lessonQuiz.id}`"
                   class="button-quiz inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-muted hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-muted dark:bg-blue-muted dark:hover:opacity-90 dark:focus:ring-offset-gray-800 dark:text-gray-900 transition-opacity duration-150 ease-in-out"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-1" aria-hidden="true"><path fill-rule="evenodd" d="M15.962 2.61a.75.75 0 0 0-.61-.21L4.04 4.357a.75.75 0 0 0-.61.846l.727 3.474a.75.75 0 0 0 .756.623H6.75V13a.75.75 0 0 0 .75.75h5.5a.75.75 0 0 0 .75-.75V9.3H15.5a.75.75 0 0 0 .756-.623l.727-3.474a.75.75 0 0 0-.021-.592Zm-1.02 4.04-.484 2.31H7.5v-2.7l7.958-1.307.484 2.31Z" clip-rule="evenodd" /><path d="M4.5 10.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z" /><path d="M15.5 10.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5a.75.75 0 0 1 .75-.75Z" /></svg>
                   <span>ابدأ اختبار الدرس</span>
                 </NuxtLink>
              </div>
              <!-- **** END: Lesson Quiz Button **** -->

            </div>
            <!-- Case 2: Logged in BUT NOT Enrolled -->
            <div v-else-if="isLoggedIn && !isEnrolledInCourse && courseIdParam" class="enroll-prompt p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg max-w-md mx-auto">
              <p class="text-sm text-yellow-800 dark:text-yellow-200">يجب الانتساب للدورة أولاً لتتمكن من تتبع تقدمك وتقديم الاختبارات.</p>
              <button @click="handleEnroll(courseIdParam)" :disabled="enrollLoading" class="button-enroll mt-3">
                <span v-if="enrollLoading">
                  <LoadingSpinner class="w-5 h-5 inline me-2 animate-spin" aria-hidden="true" />
                  جاري الانتساب...
                </span>
                <span v-else>انتسب للدورة الآن</span>
              </button>
              <p v-if="enrollError" class="text-xs text-red-500 dark:text-red-400 mt-1">{{ enrollError }}</p>
            </div>
            <!-- Case 3: Not Logged In -->
            <div v-else-if="!isLoggedIn" class="login-prompt p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg max-w-md mx-auto">
              <p class="text-sm text-blue-800 dark:text-blue-200 mb-3">سجل الدخول أو أنشئ حساباً لتتمكن من الانتساب لهذه الدورة وتتبع تقدمك.</p>
              <NuxtLink :to="`/login?redirect=${route.fullPath}`" class="button-login">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-1" aria-hidden="true"><path fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z" clip-rule="evenodd" /></svg>
                تسجيل الدخول / إنشاء حساب
              </NuxtLink>
            </div>

        </div>
        <template #fallback>
          <div class="text-center mt-6 h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md max-w-xs mx-auto"></div>
        </template>
      </ClientOnly>

      <!-- Description Section -->
      <div class="description-section pt-6 border-t border-gray-200 dark:border-gray-700" v-if="lesson.description">
           <h2 class="text-2xl font-semibold text-brown-dark dark:text-beige-light mb-3">عن الدرس:</h2>
           <div class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
             {{ lesson.description }}
           </div>
      </div>
      <div v-else class="description-section pt-6 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 italic">لا يوجد وصف متاح لهذا الدرس.</div>

      <!-- Downloads & Linked Books Section -->
      <div v-if="linkedBooks && linkedBooks.length > 0" class="downloads-section p-5 bg-beige-light dark:bg-cream-gray rounded-lg shadow-sm border border-cream-gray dark:border-gray-700">
         <h3 class="text-lg font-semibold text-brown-dark dark:text-brown-dark mb-4">ملفات وكتب مرتبطة:</h3>
         <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
           <div v-for="book in linkedBooks" :key="book.id">
             <button v-if="book.storage_path" @click="openPdfModal(book.storage_path, book.title)" class="button-secondary inline-flex items-center gap-2 text-sm">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" aria-hidden="true"><path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 8.75a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M9 3.5a.5.5 0 0 0-.5.5v2.75A1.75 1.75 0 0 0 10.25 8.5h2.75a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-3ZM11 5.75v1.75a.25.25 0 0 0 .25.25h1.75a.25.25 0 0 0 .25-.25V5.75H11Z" clip-rule="evenodd" /></svg>
               <span>عرض: {{ book.title }} <span class="text-xs opacity-75">({{ getBookType(book) }})</span></span>
             </button>
             <span v-else class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 italic px-4 py-2">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 opacity-50" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clip-rule="evenodd" /></svg>
               <span>{{ book.title }} (لا يوجد ملف مرفق)</span>
             </span>
           </div>
         </div>
      </div>

      <!-- Comments Section -->
      <ClientOnly>
        <CommentSection v-if="lesson?.id" :lesson-id="lesson.id" class="pt-6 border-t border-gray-200 dark:border-gray-700"/>
        <template #fallback>
            <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div class="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
              <div class="h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
        </template>
      </ClientOnly>

    </div>

    <!-- PDF Viewer Modal -->
    <ClientOnly>
      <LazyPdfViewerModal
        :show="showPdfModal"
        :storage-path="selectedPdfPath"
        :book-title="selectedBookTitle"
        @close="closePdfModal"
      />
       <template #fallback>
         <div></div>
      </template>
    </ClientOnly>

  </div>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed, watch, shallowRef, defineAsyncComponent } from 'vue';
import { useRoute, useSupabaseClient, useAsyncData, useHead, showError, navigateTo, createError } from '#imports';
import type { Database, Tables, Enums } from '~/types/database.types';
import { useUserStore } from '~/stores/user';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import CommentSection from '~/components/CommentSection.vue';
const LazyPdfViewerModal = defineAsyncComponent(() => import('~/components/PdfViewerModal.client.vue'));

// --- Composables & Store ---
const route = useRoute();
const supabase = useSupabaseClient<Database>();
const userStore = useUserStore();
const { profile, isLoggedIn } = storeToRefs(userStore);

console.log(`--- LESSON PAGE [${route.params.lessonId}] SETUP STARTED ---`);

// --- Types ---
type Lesson = Tables<'lessons'>;
type Book = Tables<'books'>;
type NavLessonInfo = Pick<Tables<'lessons'>, 'id' | 'title'> | null;
type CourseInfo = Pick<Tables<'study_courses'>, 'id' | 'title'> | null;
type LessonCompletion = Pick<Tables<'lesson_completions'>, 'lesson_id'>;
type CourseEnrollment = Tables<'course_enrollments'>;
type LessonQuizInfo = Pick<Tables<'quizzes'>, 'id' | 'title' | 'is_active'> | null;

// --- Route Params with Validation ---
const courseIdParam = computed<number | null>(() => {
    const rawParam = route.params.courseId as string;
    if (!rawParam) {
        showError({ statusCode: 400, statusMessage: 'معرف الدورة مفقود من الرابط.', fatal: true });
        return null;
    }
    const id = parseInt(rawParam, 10);
    if (isNaN(id) || id <= 0) {
        showError({ statusCode: 400, statusMessage: `معرف الدورة غير صالح: "${rawParam}"`, fatal: true });
        return null;
    }
    return id;
});
const lessonIdParam = computed<number | null>(() => {
    const rawParam = route.params.lessonId as string;
     if (!rawParam) {
        showError({ statusCode: 400, statusMessage: 'معرف الدرس مفقود من الرابط.', fatal: true });
        return null;
    }
    const id = parseInt(rawParam, 10);
    if (isNaN(id) || id <= 0) {
        showError({ statusCode: 400, statusMessage: `معرف الدرس غير صالح: "${rawParam}"`, fatal: true });
        return null;
    }
    return id;
});

// --- State ---
const lesson = shallowRef<Lesson | null>(null);
const linkedBooks = shallowRef<Book[]>([]);
const previousLesson = shallowRef<NavLessonInfo>(null);
const nextLesson = shallowRef<NavLessonInfo>(null);
const courseInfo = shallowRef<CourseInfo>(null);
const lessonCompletion = shallowRef<LessonCompletion | null>(null);
const enrollment = shallowRef<CourseEnrollment | null>(null);
const lessonQuiz = shallowRef<LessonQuizInfo>(null);

const completeLoading = ref(false);
const completeError = ref<string | null>(null);
const enrollLoading = ref(false);
const enrollError = ref<string | null>(null);
const showPdfModal = ref(false);
const selectedPdfPath = ref<string | null>(null);
const selectedBookTitle = ref<string | null>(null);

if (courseIdParam.value === null || lessonIdParam.value === null) {
     console.error("Lesson Page Setup: Halting due to invalid route parameters detected earlier.");
}

// --- Data Fetching with useAsyncData ---
const { data, pending, error, refresh } = await useAsyncData(
  `lessonData-${courseIdParam.value}-${lessonIdParam.value}-${profile.value?.id ?? 'guest'}`,
  async () => {
    const currentLessonId = lessonIdParam.value;
    const currentCourseId = courseIdParam.value;
    const currentUserId = profile.value?.id;

    if (currentCourseId === null || currentLessonId === null) {
      console.error("Fetcher Error: Invalid course or lesson ID at fetch time.");
      throw createError({ statusCode: 400, statusMessage: 'المعرفات المطلوبة غير صالحة لجلب البيانات.', fatal: true });
    }
    console.log(`--- Fetching lesson data for Course ${currentCourseId}, Lesson ${currentLessonId}, User ${currentUserId || 'Guest'} ---`);

    try {
      // 1. Fetch Primary Lesson Data
      const { data: lessonCourseData, error: lessonCourseError } = await supabase
        .from('lessons')
        .select(`*, course:study_courses!inner (id, title, is_active)`)
        .eq('id', currentLessonId)
        .eq('course_id', currentCourseId)
        .eq('course.is_active', true)
        .maybeSingle();

      if (lessonCourseError) {
        console.error("DB Error fetching lesson/course:", lessonCourseError);
        throw createError({ statusCode: 500, statusMessage: `خطأ في جلب بيانات الدرس الرئيسية: ${lessonCourseError.message}`, fatal: true });
      }
      if (!lessonCourseData) {
        console.warn(`Lesson ${currentLessonId} not found in active course ${currentCourseId}, or course inactive.`);
        throw createError({ statusCode: 404, statusMessage: 'الدرس المطلوب غير موجود أو لا ينتمي لدورة نشطة.', fatal: true });
      }

      const fetchedLesson: Lesson = lessonCourseData;
      const fetchedCourseInfo: CourseInfo = lessonCourseData.course as CourseInfo;
      const currentOrder: number | null = fetchedLesson.lesson_order;

      // 2. Fetch Secondary Data in Parallel
      const fetchPromises = [
        supabase.from('books').select('*').eq('linked_lesson_id', currentLessonId),
        currentOrder !== null ? supabase.from('lessons').select('id, title').eq('course_id', currentCourseId).lt('lesson_order', currentOrder).order('lesson_order', { ascending: false }).limit(1).maybeSingle() : Promise.resolve({ data: null, error: null }),
        currentOrder !== null ? supabase.from('lessons').select('id, title').eq('course_id', currentCourseId).gt('lesson_order', currentOrder).order('lesson_order', { ascending: true }).limit(1).maybeSingle() : Promise.resolve({ data: null, error: null }),
        isLoggedIn.value && currentUserId ? supabase.from('lesson_completions').select('lesson_id').eq('user_id', currentUserId).eq('lesson_id', currentLessonId).maybeSingle() : Promise.resolve({ data: null, error: null }),
        isLoggedIn.value && currentUserId ? supabase.from('course_enrollments').select('*').eq('user_id', currentUserId).eq('course_id', currentCourseId).maybeSingle() : Promise.resolve({ data: null, error: null }),
        supabase.from('quizzes')
            .select('id, title, is_active')
            .eq('lesson_id', currentLessonId)
            .eq('type', 'lesson' as Enums<'quiz_type'>)
            .eq('is_active', true)
            .maybeSingle()
      ];

      const results = await Promise.allSettled(fetchPromises);

      const processResult = <T>(index: number, name: string, defaultValue: T): T => {
        const result = results[index];
        if (result.status === 'fulfilled') {
            if (result.value.error) {
                 console.error(`Supabase Error fetching ${name}:`, result.value.error.message);
                 return defaultValue;
            }
            return result.value.data ?? defaultValue;
        } else {
            console.error(`Failed fetching ${name} (Promise rejected):`, result.reason);
            return defaultValue;
        }
      };

      const fetchedBooks = processResult<Book[]>(0, 'linked books', []);
      const fetchedPreviousLesson = processResult<NavLessonInfo>(1, 'previous lesson', null);
      const fetchedNextLesson = processResult<NavLessonInfo>(2, 'next lesson', null);
      const fetchedCompletion = processResult<LessonCompletion | null>(3, 'completion status', null);
      const fetchedEnrollment = processResult<CourseEnrollment | null>(4, 'enrollment status', null);
      const fetchedLessonQuiz = processResult<LessonQuizInfo>(5, 'lesson quiz', null);

      // 3. Update Last Accessed Lesson
      if (fetchedEnrollment?.id && fetchedLesson.id) {
          console.log(`Attempting to update last accessed lesson for enrollment ${fetchedEnrollment.id} to lesson ${fetchedLesson.id}`);
          supabase
            .from('course_enrollments')
            .update({ last_accessed_lesson_id: fetchedLesson.id, updated_at: new Date().toISOString() })
            .eq('id', fetchedEnrollment.id)
            .then(({ error: updateError }) => {
                if (updateError) console.error('Failed to update last_accessed_lesson_id:', updateError.message);
                else console.log(`Successfully updated last_accessed_lesson_id.`);
            });
      } else if (isLoggedIn.value && fetchedLesson.id) {
           console.log('User is logged in but not enrolled in this course, skipping last_accessed_lesson update.');
      }

      console.log('--- Lesson data fetch successful ---');
      // 4. Return the combined data structure
      return {
          lesson: fetchedLesson,
          linkedBooks: fetchedBooks,
          previousLesson: fetchedPreviousLesson,
          nextLesson: fetchedNextLesson,
          courseInfo: fetchedCourseInfo,
          lessonCompletion: fetchedCompletion,
          enrollment: fetchedEnrollment,
          lessonQuiz: fetchedLessonQuiz
      };

    } catch (err: any) {
        console.error('!!! CRITICAL ERROR in useAsyncData lesson fetch !!!:', err);
        if (err.statusCode && err.fatal) {
            throw err;
        }
        throw createError({
          statusCode: err.statusCode || 500,
          statusMessage: `حدث خطأ غير متوقع أثناء تحميل بيانات الدرس: ${err.message || 'خطأ غير معروف'}`,
          fatal: true
        });
    }
  }, {
    default: () => ({
        lesson: null, linkedBooks: [], previousLesson: null, nextLesson: null,
        courseInfo: null, lessonCompletion: null, enrollment: null,
        lessonQuiz: null
    }),
    watch: [() => profile.value?.id, () => route.params.lessonId, () => route.params.courseId]
  }
);

// --- Update Local State when Async Data Changes ---
 watch(data, (newData) => {
    console.log("Lesson page useAsyncData watcher triggered. New data received:", !!newData);
    if (newData) {
        lesson.value = newData.lesson;
        linkedBooks.value = newData.linkedBooks;
        previousLesson.value = newData.previousLesson;
        nextLesson.value = newData.nextLesson;
        courseInfo.value = newData.courseInfo;
        lessonCompletion.value = newData.lessonCompletion;
        enrollment.value = newData.enrollment;
        lessonQuiz.value = newData.lessonQuiz;
    } else if (!pending.value && !error.value) {
        lesson.value = null;
        linkedBooks.value = [];
        previousLesson.value = null;
        nextLesson.value = null;
        courseInfo.value = null;
        lessonCompletion.value = null;
        enrollment.value = null;
        lessonQuiz.value = null;
    }
 }, { immediate: true });

// --- Computed Properties ---
const isEnrolledInCourse = computed(() => !!enrollment.value);
const isLessonCompleted = computed(() => !!lessonCompletion.value);
const youtubeVideoId = computed<string | null>(() => {
   const url = lesson.value?.youtube_url;
   if (!url) return null;
   try {
     const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/;
     const match = url.match(regex);
     return (match && match[1]) ? match[1] : null;
   } catch (e) {
     console.error("Error parsing YouTube URL:", url, e);
     return null;
   }
});

// --- Actions ---
async function markLessonComplete() {
     if (!isLoggedIn.value || !profile.value?.id || !lesson.value?.id || isLessonCompleted.value || completeLoading.value) return;
     completeLoading.value = true;
     completeError.value = null;
     console.log(`Attempting to mark lesson ${lesson.value.id} as complete for user ${profile.value.id}`);
     try {
         const { data: newCompletion, error: insertError } = await supabase
             .from('lesson_completions')
             .insert({ user_id: profile.value.id, lesson_id: lesson.value.id })
             .select('lesson_id')
             .single();
         if (insertError) {
            if (insertError.code === '23505') {
               console.warn('Lesson already marked complete in DB, syncing local state.');
               if (!lessonCompletion.value) { lessonCompletion.value = { lesson_id: lesson.value.id }; }
            } else { throw insertError; }
         } else if (newCompletion) {
            lessonCompletion.value = newCompletion;
            console.log("Lesson successfully marked complete!");
         }
     } catch (err: any) {
         console.error("Error marking lesson complete:", err);
         completeError.value = `فشل تحديث الحالة: ${err.message || 'حدث خطأ غير متوقع.'}`;
     } finally {
         completeLoading.value = false;
     }
}
async function handleEnroll(id: number | null) {
     if (id === null || !isLoggedIn.value || !profile.value?.id || isEnrolledInCourse.value || enrollLoading.value) return;
     enrollLoading.value = true;
     enrollError.value = null;
     console.log(`Attempting to enroll user ${profile.value.id} in course ${id}`);
     try {
       const { data: newEnrollment, error: enrollSupabaseError } = await supabase
         .from('course_enrollments')
         .insert({ user_id: profile.value.id, course_id: id })
         .select('*')
         .single();
       if (enrollSupabaseError) {
           if (enrollSupabaseError.code === '23505') {
                console.warn("Enrollment conflict detected. Refreshing data.");
                await refresh();
           } else { throw enrollSupabaseError; }
       } else if (newEnrollment) {
           enrollment.value = newEnrollment;
           console.log("Enrollment successful!");
           alert('تم الانتساب بنجاح!');
       }
     } catch (err:any) {
         console.error("Enrollment error on lesson page:", err);
         enrollError.value = `فشل الانتساب: ${err.message || 'حدث خطأ غير متوقع.'}`;
         alert(enrollError.value);
     } finally {
         enrollLoading.value = false;
     }
}

// --- PDF Modal Functions ---
function openPdfModal(path: string | null | undefined, title: string | null | undefined) {
   if (path) {
     selectedPdfPath.value = path;
     selectedBookTitle.value = title || 'ملف مرتبط';
     showPdfModal.value = true;
     console.log(`Opening PDF modal for path: ${path}`);
   } else {
     console.warn("Attempted to open PDF modal with no path for book:", title);
   }
}
function closePdfModal() {
  showPdfModal.value = false;
  selectedPdfPath.value = null;
  selectedBookTitle.value = null;
  console.log("PDF modal closed.");
}

// --- Utility Functions ---
function getBookType(book: Book): string {
     if (book?.is_research && book?.is_transcript) return 'بحث وتفريغ';
     if (book?.is_research) return 'بحث';
     if (book?.is_transcript) return 'تفريغ';
     return 'كتاب';
}

// --- SEO Meta Tags ---
 watch([lesson, courseInfo, pending, error], ([newLesson, newCourse, loadingState, errorState]) => {
    let pageTitle = 'تفاصيل الدرس';
    let description = 'عرض تفاصيل الدرس والمحتوى المرتبط به ضمن دورات الشيخ.';
    if (loadingState) {
        pageTitle = 'جارٍ تحميل الدرس...';
        description = 'يتم الآن تحميل بيانات الدرس.';
    } else if (errorState || !newLesson) {
        pageTitle = 'الدرس غير متاح';
        description = errorState?.data?.statusMessage || errorState?.message || 'لم يتم العثور على الدرس المطلوب أو حدث خطأ.';
    } else {
        const lessonTitle = newLesson.title || 'درس بدون عنوان';
        const courseTitle = newCourse?.title;
        pageTitle = courseTitle ? `${lessonTitle} - ${courseTitle}` : lessonTitle;
        const lessonDesc = newLesson.description;
        if (lessonDesc) {
            description = lessonDesc.substring(0, 160).trim() + (lessonDesc.length > 160 ? '...' : '');
        } else {
            description = `شاهد درس "${lessonTitle}"${courseTitle ? ` ضمن دورة "${courseTitle}"` : ''}.`;
        }
    }
     useHead({
         title: pageTitle,
         meta: [
            { name: 'description', content: description },
            { property: 'og:title', content: pageTitle },
            { property: 'og:description', content: description },
            { property: 'og:type', content: 'video.other' },
            { property: 'og:url', content: route.fullPath },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: pageTitle },
            { name: 'twitter:description', content: description },
         ]
     });
 }, { immediate: true });

</script>

<style scoped>
.nav-button {
  @apply p-2 sm:p-3 rounded-full text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900;
}
.nav-icon {
  @apply w-5 h-5 sm:w-6 sm:h-6;
}
.nav-placeholder {
  @apply p-2 sm:p-3 w-[36px] h-[36px] sm:w-[44px] sm:h-[44px];
}
.video-error-box {
  @apply p-4 border rounded-md text-sm;
}
.button-complete {
  @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out;
}
.button-enroll {
  @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out;
}
.button-login {
  @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out;
}
.button-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors duration-150 ease-in-out;
}
.button-quiz {
   @apply bg-blue-muted hover:opacity-90 focus:ring-blue-muted dark:bg-blue-muted dark:hover:opacity-90 dark:focus:ring-offset-gray-800 dark:text-gray-900;
   @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity duration-150 ease-in-out;
}

.prose :where(p):not(:where([class~="not-prose"] *)) { margin-top: 0.75em; margin-bottom: 0.75em; line-height: 1.7; }
code { word-break: break-all; font-size: 0.875em; background-color: rgba(0,0,0,0.05); padding: 0.1em 0.3em; border-radius: 0.25rem; }
.dark code { background-color: rgba(255,255,255,0.1); }
.button-complete .animate-spin, .button-enroll .animate-spin { width: 1.25rem; height: 1.25rem; }
.aspect-video { position: relative; width: 100%; padding-bottom: 56.25%; }
.aspect-video iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
</style>