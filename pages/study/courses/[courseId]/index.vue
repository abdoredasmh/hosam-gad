<template>
  <div class="container mx-auto px-4 py-8 md:py-12">

    <!-- 1. Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner class="w-12 h-12 mx-auto text-primary" />
      <p class="mt-4 text-base text-gray-600 dark:text-gray-400">جارٍ تحميل تفاصيل الدورة...</p>
    </div>

    <!-- 2. Error or Not Found State -->
     <div v-else-if="error || !course" class="error-display">
          <div class="flex justify-center items-center text-red-600 dark:text-red-400 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
             <h2 class="text-xl font-semibold ms-2">
                 {{ error?.statusCode === 404 || !course ? 'الدورة غير متاحة' : (error?.data?.statusMessage || error?.message || 'حدث خطأ') }}
             </h2>
         </div>
        <p class="text-sm text-red-700 dark:text-red-300 mb-5">
             {{ error?.data?.message || error?.message || 'لم نتمكن من العثور على الدورة المطلوبة أو حدث خطأ غير متوقع أثناء تحميلها.' }}
        </p>
        <NuxtLink to="/study" class="button-secondary error-button inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-1" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" /></svg>
            <span>العودة لقائمة الدورات</span>
        </NuxtLink>
     </div>

    <!-- 3. Course Details - Success State -->
    <div v-else-if="!pending && course" class="course-details space-y-8 md:space-y-12">
       <!-- Header Section -->
       <header class="md:flex md:items-start md:gap-8 p-4 sm:p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-lg shadow-sm border dark:border-gray-700/50">
          <!-- Course Image -->
          <div class="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mb-4 md:mb-0">
             <img :src="getCourseImageUrl(course.image_url)" :alt="`غلاف دورة: ${course.title}`" class="w-full aspect-video object-cover rounded-lg shadow-md">
          </div>
          <!-- Course Info & Actions -->
          <div class="flex-grow">
             <h1 class="text-3xl font-bold text-brown-dark dark:text-beige-light mb-3">{{ course.title }}</h1>
             <p v-if="categoryName" class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                الفئة: <span class="font-medium text-gray-700 dark:text-gray-300">{{ categoryName }}</span>
             </p>
             <p v-if="course.description" class="text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">{{ course.description }}</p>

             <ClientOnly>
                 <div class="space-y-4">
                     <!-- Enrollment Section -->
                     <div v-if="isLoggedIn">
                         <!-- Not Enrolled -->
                         <button v-if="!isEnrolled" @click="handleEnroll(course?.id)" :disabled="enrollLoading" class="button-enroll w-full sm:w-auto">
                              <LoadingSpinner v-if="enrollLoading" class="w-4 h-4 me-1.5 inline-block animate-spin" />
                              <span v-else>انتسب الآن</span>
                         </button>
                         <!-- Enrolled -->
                         <div v-else class="space-y-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-700/50">
                             <p class="text-green-700 dark:text-green-300 font-semibold text-base flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-1.5 flex-shrink-0" aria-hidden="true"><path fill-rule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.48 4.774L6.52 10.91a.75.75 0 1 0-1.04 1.08l2.18 2.108a.75.75 0 0 0 1.076-.015l4.145-5.682Z" clip-rule="evenodd" /></svg>
                                  أنت منتسب لهذه الدورة
                             </p>
                             <!-- Progress Bar Section -->
                             <div v-if="totalLessonsCount > 0" class="progress-section pt-2">
                                  <div class="flex justify-between mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                                     <span>التقدم</span>
                                     <span>{{ progressPercentage }}%</span>
                                  </div>
                                  <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                                     <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" :style="{ width: progressPercentage + '%' }"></div>
                                  </div>
                                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1"> {{ completedLessonsCount }} / {{ totalLessonsCount }} درس مكتمل</p>
                             </div>
                             <div v-else class="text-xs text-gray-500 dark:text-gray-400 italic pt-2"> (لم تتم إضافة دروس لهذه الدورة بعد)</div>
                             <!-- Actions -->
                             <div class="flex items-center gap-4 pt-3 mt-2 border-t border-green-200 dark:border-green-700/50">
                                  <button @click="navigateToLastAccessed" :disabled="totalLessonsCount === 0" class="button-secondary flex-grow sm:flex-grow-0 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1.5" aria-hidden="true"><path fill-rule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z" clip-rule="evenodd" /></svg>
                                      {{ enrollment?.last_accessed_lesson_id ? 'استئناف التعلم' : 'ابدأ التعلم' }}
                                  </button>
                                  <!-- Modified Unenroll button to trigger modal -->
                                  <button @click="triggerUnenrollConfirmation(course?.id)" :disabled="enrollLoading" class="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 underline disabled:opacity-50 disabled:cursor-not-allowed">
                                     <LoadingSpinner v-if="enrollLoading && !showConfirmUnenroll" class="w-3 h-3 me-1 inline-block animate-spin" />
                                     إلغاء الانتساب
                                  </button>
                             </div>
                         </div>
                     </div>
                     <!-- Not Logged In -->
                     <NuxtLink v-else :to="`/login?redirect=${encodeURIComponent(route.fullPath)}`" class="button-enroll w-full sm:w-auto">سجل الدخول للانتساب</NuxtLink>

                     <!-- Course Level Quizzes Section -->
                     <div v-if="isEnrolled && courseLevelQuizzes.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                         <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">الاختبارات النهائية للدورة:</h3>
                         <div class="flex flex-wrap gap-2">
                             <!-- Quiz Button Logic -->
                             <button
                                 v-for="quiz in courseLevelQuizzes"
                                 :key="quiz.id"
                                 @click="handleQuizClick(quiz.id)"
                                 :class="['button-quiz-base button-quiz-course', { 'attempted': getLatestAttemptForQuiz(quiz.id) }]"
                                 :title="getQuizButtonTitle(quiz)"
                                 :disabled="enrollLoading"
                              >
                                 {{ quiz.title || 'الاختبار النهائي' }}
                                 <span v-if="getLatestAttemptForQuiz(quiz.id)" class="ms-1.5 text-xxs opacity-80">
                                     (عرض النتيجة)
                                 </span>
                                  <span v-else class="ms-1.5 text-xxs opacity-80">
                                     (ابدأ الاختبار)
                                  </span>
                             </button>
                         </div>
                     </div>
                 </div>
                 <template #fallback>
                      <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-full sm:w-40"></div>
                 </template>
              </ClientOnly>
          </div>
       </header>

       <!-- Course Content Section -->
       <section class="course-content">
          <h2 class="text-2xl font-semibold text-brown-dark dark:text-beige-light mb-6">محتوى الدورة</h2>
          <!-- No Content -->
          <div v-if="groupedContent.length === 0" class="no-content-display">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
              سيتم إضافة محتوى لهذه الدورة قريبًا إن شاء الله.
          </div>

          <!-- Modules Loop -->
          <div v-else class="space-y-6">
            <div v-for="moduleGroup in groupedContent" :key="moduleGroup.moduleNumber ?? 'general'" class="module-section">
                <!-- Module Header -->
                <div class="module-header">
                    <h3 class="text-lg font-semibold text-primary dark:text-primary-400">
                        <span v-if="moduleGroup.moduleNumber !== null" class="font-mono me-1.5 text-sm opacity-80">#{{ moduleGroup.moduleNumber }}</span>
                        {{ moduleGroup.moduleTitle }}
                    </h3>
                    <div v-if="isEnrolled && moduleGroup.quizzes.length > 0" class="flex flex-wrap gap-2">
                       <!-- Quiz Button Logic -->
                       <button
                           v-for="quiz in moduleGroup.quizzes"
                           :key="quiz.id"
                           @click="handleQuizClick(quiz.id)"
                           :class="['button-quiz-base button-quiz-module', { 'attempted': getLatestAttemptForQuiz(quiz.id) }]"
                           :title="getQuizButtonTitle(quiz)"
                           :disabled="enrollLoading"
                       >
                            {{ quiz.title || `اختبار الوحدة ${moduleGroup.moduleNumber}` }}
                            <span v-if="getLatestAttemptForQuiz(quiz.id)" class="ms-1.5 text-xxs opacity-80">
                                (عرض النتيجة)
                            </span>
                             <span v-else class="ms-1.5 text-xxs opacity-80">
                                (ابدأ الاختبار)
                            </span>
                       </button>
                    </div>
                </div>

                <!-- Lessons List -->
                <ul v-if="moduleGroup.lessons.length > 0" class="space-y-2 mt-4">
                    <li v-for="(lesson, index) in moduleGroup.lessons" :key="lesson.id" class="lesson-item-wrapper" :class="[isLessonCompleted(lesson.id) ? 'lesson-completed' : 'lesson-incomplete']">
                        <div class="flex items-center space-x-3 rtl:space-x-reverse flex-grow min-w-0">
                            <span :class="['lesson-status-icon', isLessonCompleted(lesson.id) ? 'completed' : 'incomplete']" aria-hidden="true">
                               <svg v-if="isLessonCompleted(lesson.id)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.208Z" clip-rule="evenodd" /></svg>
                               <span v-else class="font-mono">{{ lesson.lesson_order ?? index + 1 }}</span>
                            </span>
                            <NuxtLink :to="lessonLink(lesson.id)" @click.prevent="handleLessonClick(lesson.id)" class="lesson-title-link flex-1 min-w-0">
                                <span class="truncate">{{ lesson.title }}</span>
                            </NuxtLink>
                        </div>
                         <div v-if="isEnrolled && lessonQuizzesMap.get(lesson.id) && lessonQuizzesMap.get(lesson.id)!.length > 0" class="lesson-quiz-section">
                            <!-- Quiz Button Logic -->
                            <button
                                v-for="quiz in lessonQuizzesMap.get(lesson.id)"
                                :key="quiz.id"
                                @click="handleQuizClick(quiz.id)"
                                :class="['button-quiz-base button-quiz-lesson', { 'attempted': getLatestAttemptForQuiz(quiz.id) }]"
                                :title="getQuizButtonTitle(quiz)"
                                :disabled="enrollLoading"
                            >
                                {{ quiz.title || 'اختبار الدرس' }}
                                <span v-if="getLatestAttemptForQuiz(quiz.id)" class="ms-1 text-xxs opacity-80">
                                    (عرض النتيجة)
                                </span>
                                 <span v-else class="ms-1 text-xxs opacity-80">
                                    (ابدأ الاختبار)
                                </span>
                            </button>
                         </div>
                         <div v-else class="lesson-quiz-placeholder"></div>
                    </li>
                </ul>
                 <p v-else class="no-lessons-text">لا توجد دروس في هذه الوحدة بعد.</p>
            </div>
          </div>
       </section>
    </div>

    <!-- *** CORRECTED Confirmation Modal Component Call *** -->
    <ConfirmationModal
      v-model="showConfirmUnenroll"   
      :config="confirmationConfig"   
      :is-loading="enrollLoading"     
      @confirm="executeUnenroll"     
      @close="confirmationConfig = null; unenrollCourseId = null" 
     
    />
   

  </div>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed, watch, shallowRef } from 'vue';
import type { Database, Tables } from '~/types/database.types'; // Adjust path if needed
import { useSupabaseClient, useAsyncData, useRoute, useHead, navigateTo, createError, showError, useNuxtApp } from '#imports';
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // Adjust path if needed
// Ensure correct import of component and type
import ConfirmationModal, { type ConfirmationConfig } from '~/components/admin/ConfirmationModal.vue'; // Adjust path if needed
import { useUserStore } from '~/stores/user'; // Adjust path if needed
import { storeToRefs } from 'pinia';

// --- Types ---
type CategoryInfo = Pick<Tables<'categories'>, 'name'>;
type CourseModuleInfo = Pick<Tables<'course_modules'>, 'id' | 'title' | 'module_number'>;
type LessonInfo = Pick<Tables<'lessons'>, 'id' | 'title' | 'lesson_order' | 'module_number' | 'created_at'>;
type QuizInfo = Pick<Tables<'quizzes'>, 'id' | 'title' | 'lesson_id' | 'module_number' | 'course_id' | 'is_active'>;
type CourseEnrollment = Tables<'course_enrollments'>;
type LessonCompletionInfo = Pick<Tables<'lesson_completions'>, 'lesson_id'>;
type QuizAttemptInfo = Pick<Tables<'quiz_attempts'>, 'id' | 'quiz_id' | 'passed' | 'submitted_at'>;
type RelatedLink = { to: string; text: string } | null; // Keep this if used in data fetch

type FetchedCoursePageData = {
    course: Tables<'study_courses'> | null;
    modules: CourseModuleInfo[];
    lessons: LessonInfo[];
    quizzes: QuizInfo[];
    attempts: QuizAttemptInfo[];
    categoryName: string | null;
    enrollment: CourseEnrollment | null;
    completions: LessonCompletionInfo[];
};

interface ModuleGroup {
  moduleNumber: number | null;
  moduleTitle: string;
  lessons: LessonInfo[];
  quizzes: QuizInfo[];
}

// --- Composables & Store ---
const supabase = useSupabaseClient<Database>();
const route = useRoute();
const userStore = useUserStore();
const { profile, isLoggedIn } = storeToRefs(userStore);
const { $toast } = useNuxtApp(); // Inject $toast

// --- Course ID Validation ---
const courseId = computed<number>(() => {
    const id = parseInt(route.params.courseId as string, 10);
    if (isNaN(id) || id <= 0) {
      showError({ statusCode: 400, statusMessage: `معرف الدورة غير صالح: "${route.params.courseId}"`, fatal: true });
      return NaN;
    }
    return id;
});

// --- State ---
const course = shallowRef<Tables<'study_courses'> | null>(null);
const courseModulesData = shallowRef<CourseModuleInfo[]>([]);
const courseLessonsData = shallowRef<LessonInfo[]>([]);
const courseQuizzesData = shallowRef<QuizInfo[]>([]);
const userQuizAttempts = shallowRef<QuizAttemptInfo[]>([]);
const categoryName = shallowRef<string | null>(null);
const enrollment = shallowRef<CourseEnrollment | null>(null);
const completedLessonIds = shallowRef<number[]>([]);
const enrollLoading = ref(false);
const showConfirmUnenroll = ref(false); // For v-model binding
const confirmationConfig = ref<ConfirmationConfig | null>(null); // Holds the config object for the modal
const unenrollCourseId = ref<number | null>(null); // Stores the ID temporarily when triggering unenroll

// --- Data Fetching ---
const { data, pending, error, refresh } = await useAsyncData<FetchedCoursePageData>(
    `course-page-data-${courseId.value}-${profile.value?.id ?? 'guest'}`,
    async () => {
        const currentCourseId = courseId.value;
        if (isNaN(currentCourseId)) { throw createError({ statusCode: 400, message: 'معرف الدورة غير صالح.', fatal: true }); }
        const currentUserId = profile.value?.id;
        console.log(`[AsyncData] Fetching data for course ${currentCourseId}, User ${currentUserId ?? 'Guest'}`);
        try {
            const { data: courseBaseData, error: courseFetchError } = await supabase.from('study_courses').select(`*, category:categories(name), modules:course_modules!course_id(id, title, module_number), lessons:lessons!course_id(id, title, lesson_order, module_number, created_at)`).eq('id', currentCourseId).eq('is_active', true).single();
            if (courseFetchError) { throw createError({ statusCode: 500, statusMessage: `فشل جلب الدورة: ${courseFetchError.message}`, fatal: true }); }
            if (!courseBaseData) { throw createError({ statusCode: 404, message: 'الدورة غير موجودة أو غير نشطة حاليًا.', fatal: true }); }
            const { category, modules, lessons, ...fetchedCourse } = courseBaseData;
            const fetchedModules = modules?.sort((a, b) => (a.module_number ?? Infinity) - (b.module_number ?? Infinity)) ?? [];
            const fetchedLessons = lessons?.sort((a, b) => (a.module_number ?? Infinity) - (b.module_number ?? Infinity) || (a.lesson_order ?? Infinity) - (b.lesson_order ?? Infinity) || new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()) ?? [];
            const fetchedCategoryName = category?.name ?? null;
            const lessonIds = fetchedLessons.map(l => l.id);
            let fetchedQuizzes: QuizInfo[] = [];
            const { data: courseOrModuleQuizzes, error: cqError } = await supabase.from('quizzes').select('id, title, lesson_id, module_number, course_id, is_active').eq('course_id', currentCourseId).eq('is_active', true);
            if (cqError) console.error("[AsyncData] Error fetching course/module quizzes:", cqError.message); else fetchedQuizzes = fetchedQuizzes.concat(courseOrModuleQuizzes ?? []);
            if (lessonIds.length > 0) {
                const { data: lessonQuizzes, error: lqError } = await supabase.from('quizzes').select('id, title, lesson_id, module_number, course_id, is_active').in('lesson_id', lessonIds).eq('is_active', true);
                if (lqError) console.error("[AsyncData] Error fetching lesson quizzes:", lqError.message); else fetchedQuizzes = fetchedQuizzes.concat(lessonQuizzes ?? []);
            }
            fetchedQuizzes = Array.from(new Map(fetchedQuizzes.map(q => [q.id, q])).values());
            let fetchedEnrollment: CourseEnrollment | null = null; let fetchedCompletions: LessonCompletionInfo[] = []; let fetchedAttempts: QuizAttemptInfo[] = [];
            const quizIds = fetchedQuizzes.map(q => q.id);
            if (isLoggedIn.value && currentUserId) {
                const [enrollRes, compRes, attRes] = await Promise.all([
                    supabase.from('course_enrollments').select('*').eq('user_id', currentUserId).eq('course_id', currentCourseId).maybeSingle(),
                    lessonIds.length > 0 ? supabase.from('lesson_completions').select('lesson_id').eq('user_id', currentUserId).in('lesson_id', lessonIds) : Promise.resolve({ data: [], error: null }),
                    quizIds.length > 0 ? supabase.from('quiz_attempts').select('id, quiz_id, passed, submitted_at').eq('user_id', currentUserId).in('quiz_id', quizIds) : Promise.resolve({ data: [], error: null })
                ]);
                if (enrollRes.error) console.error("[AsyncData] Enrollment fetch error:", enrollRes.error.message); else fetchedEnrollment = enrollRes.data;
                if (compRes.error) console.error("[AsyncData] Completions fetch error:", compRes.error.message); else fetchedCompletions = compRes.data ?? [];
                if (attRes.error) console.error("[AsyncData] Attempts fetch error:", attRes.error.message); else fetchedAttempts = attRes.data ?? [];
            }
            return { course: fetchedCourse, modules: fetchedModules, lessons: fetchedLessons, quizzes: fetchedQuizzes, categoryName: fetchedCategoryName, enrollment: fetchedEnrollment, completions: fetchedCompletions, attempts: fetchedAttempts };
        } catch (err: any) {
            console.error("[useAsyncData] CRITICAL FETCH ERROR:", err);
             showError({ statusCode: err.statusCode || 500, statusMessage: `خطأ في تحميل بيانات الدورة`, message: `حدث خطأ أثناء محاولة تحميل تفاصيل الدورة. ${err.message || ''}`, fatal: true });
             return { course: null, modules: [], lessons: [], quizzes: [], attempts: [], categoryName: null, enrollment: null, completions: [] };
        }
    },
    { default: (): FetchedCoursePageData => ({ course: null, modules: [], lessons: [], quizzes: [], attempts: [], categoryName: null, enrollment: null, completions: [] }), watch: [() => profile.value?.id] }
);

// --- Watcher to update local reactive state ---
 watch(data, (newData) => {
   console.log("[Watcher] Updating local state from fetched data.");
    course.value = newData?.course ?? null;
    courseModulesData.value = Array.isArray(newData?.modules) ? newData.modules : [];
    courseLessonsData.value = Array.isArray(newData?.lessons) ? newData.lessons : [];
    courseQuizzesData.value = Array.isArray(newData?.quizzes) ? newData.quizzes : [];
    userQuizAttempts.value = Array.isArray(newData?.attempts) ? newData.attempts : [];
    categoryName.value = newData?.categoryName ?? null;
    enrollment.value = newData?.enrollment ?? null;
    completedLessonIds.value = Array.isArray(newData?.completions) ? newData.completions.map(c => c.lesson_id) : [];
 }, { immediate: true });

// --- Computed Properties ---
const isEnrolled = computed(() => !!enrollment.value);
const totalLessonsCount = computed(() => courseLessonsData.value.length);
const completedLessonsCount = computed(() => new Set(completedLessonIds.value).size);
const progressPercentage = computed(() => { if (totalLessonsCount.value === 0) return 0; const validCompletedCount = Math.min(completedLessonsCount.value, totalLessonsCount.value); return Math.round((validCompletedCount / totalLessonsCount.value) * 100); });
const lessonQuizzesMap = computed(() => { const map = new Map<number, QuizInfo[]>(); for (const quiz of courseQuizzesData.value) { if (quiz.lesson_id !== null && !isNaN(Number(quiz.lesson_id))) { const lid = Number(quiz.lesson_id); if (!map.has(lid)) map.set(lid, []); map.get(lid)!.push(quiz); } } map.forEach(qs => qs.sort((a, b) => (a.title || '').localeCompare(b.title || ''))); return map; });
const courseLevelQuizzes = computed(() => courseQuizzesData.value.filter(q => q.lesson_id === null && q.module_number === null).sort((a, b) => (a.title || '').localeCompare(b.title || '')));
const groupedContent = computed<ModuleGroup[]>(() => { const map = new Map<number | string, ModuleGroup>(); courseModulesData.value.forEach(m => { if (m.module_number !== null) map.set(m.module_number, { moduleNumber: m.module_number, moduleTitle: m.title || `الوحدة ${m.module_number}`, lessons: [], quizzes: [] }); }); const generalModuleKey = 'general'; map.set(generalModuleKey, { moduleNumber: null, moduleTitle: 'محتويات عامة أو بدون وحدة', lessons: [], quizzes: [] }); courseLessonsData.value.forEach(l => { const key = l.module_number ?? generalModuleKey; const group = map.get(key); if (group) group.lessons.push(l); else { console.warn(`Lesson ${l.id} has module number ${l.module_number} but no matching module found. Assigning to general.`); map.get(generalModuleKey)?.lessons.push(l); } }); courseQuizzesData.value.forEach(q => { if (q.module_number !== null && q.lesson_id === null) { const group = map.get(q.module_number); if (group) group.quizzes.push(q); else { console.warn(`Quiz ${q.id} has module number ${q.module_number} but no matching module found. Assigning to general.`); map.get(generalModuleKey)?.quizzes.push(q); } } }); map.forEach(g => g.quizzes.sort((a, b) => (a.title || '').localeCompare(b.title || ''))); const generalGroup = map.get(generalModuleKey); if (generalGroup && generalGroup.lessons.length === 0 && generalGroup.quizzes.length === 0) map.delete(generalModuleKey); return Array.from(map.values()).sort((a, b) => { if (a.moduleNumber === null) return -1; if (b.moduleNumber === null) return 1; return a.moduleNumber - b.moduleNumber; }); });

 // --- Helper Functions ---
const isLessonCompleted = (lessonId: number | undefined | null): boolean => { if (lessonId === null || lessonId === undefined) return false; return completedLessonIds.value.includes(lessonId); };
const getCourseImageUrl = (url: string | null | undefined): string => url || '/images/placeholder-course.jpg';
const lessonLink = (lessonId: number | undefined | null): string => { if (lessonId === null || lessonId === undefined) return '#'; return `/study/courses/${courseId.value}/lessons/${lessonId}`; }; // Ensure route prefix is correct
const getLatestAttemptForQuiz = (quizId: number | bigint | undefined | null): QuizAttemptInfo | null => { if (quizId === null || quizId === undefined || !isLoggedIn.value) return null; const numId = Number(quizId); const attempts = userQuizAttempts.value.filter(att => att.quiz_id === numId && att.submitted_at).sort((a, b) => new Date(b.submitted_at!).getTime() - new Date(a.submitted_at!).getTime()); return attempts.length > 0 ? attempts[0] : null; };
const getQuizButtonTitle = (quiz: QuizInfo): string => { const latestAttempt = getLatestAttemptForQuiz(quiz.id); const baseTitle = quiz.title || 'الاختبار'; return latestAttempt ? `تم إجراء هذا الاختبار. انقر لعرض نتيجتك لاختبار: ${baseTitle}` : `انقر لبدء الاختبار: ${baseTitle}`; };

// --- Event Handlers ---

const handleEnroll = async (id: number | undefined | null) => {
  const cid = Number(id);
  if (isNaN(cid) || !isLoggedIn.value || !profile.value?.id || isEnrolled.value || enrollLoading.value) return;
  enrollLoading.value = true;
  try {
      const { error } = await supabase.from('course_enrollments').insert({ user_id: profile.value.id, course_id: cid });
      if (error) throw error;
      $toast.success('تم الانتساب بنجاح!');
      await refresh();
  } catch (err:any) {
      console.error("Enrollment error:", err);
      $toast.error(`فشل الانتساب: ${err.message || 'حدث خطأ غير متوقع.'}`);
  } finally {
      enrollLoading.value = false;
  }
};

const triggerUnenrollConfirmation = (id: number | undefined | null) => {
   const cid = Number(id);
   if (isNaN(cid) || !isEnrolled.value || !profile.value?.id || enrollLoading.value) return;
   unenrollCourseId.value = cid;
   confirmationConfig.value = {
     title: 'تأكيد إلغاء الانتساب',
     message: `هل أنت متأكد من رغبتك في إلغاء الانتساب من دورة "${course.value?.title || ''}"؟ سيفقد تقدمك المحفوظ (مثل إكمال الدروس).`,
     confirmText: 'نعم، إلغاء الانتساب',
     cancelText: 'تراجع',
     confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
   };
   showConfirmUnenroll.value = true;
};

const executeUnenroll = async () => {
    const cid = unenrollCourseId.value;
    if (cid === null || !isEnrolled.value || !profile.value?.id || enrollLoading.value) {
        showConfirmUnenroll.value = false; confirmationConfig.value = null; unenrollCourseId.value = null;
        return;
    }
    enrollLoading.value = true;
    try {
        const { error } = await supabase.from('course_enrollments').delete().match({ user_id: profile.value.id, course_id: cid });
        if (error) throw error;
        $toast.success('تم إلغاء الانتساب بنجاح.');
        await refresh();
    } catch (err: any) {
        console.error("Unenrollment error:", err);
        $toast.error(`فشل إلغاء الانتساب: ${err.message || 'حدث خطأ غير متوقع.'}`);
    } finally {
        enrollLoading.value = false; showConfirmUnenroll.value = false; confirmationConfig.value = null; unenrollCourseId.value = null;
    }
};

const navigateToLastAccessed = () => {
    const cid = courseId.value;
    if (isNaN(cid) || !isEnrolled.value) return;
    const lastId = enrollment.value?.last_accessed_lesson_id;
    const lessons = courseLessonsData.value;
    const firstId = lessons.length > 0 ? lessons[0]?.id : undefined;
    const targetId = lastId && lessons.some(l => l.id === lastId) ? lastId : firstId;
    if (targetId) { navigateTo(lessonLink(targetId)); }
    else { $toast.info("لا توجد دروس متاحة في هذه الدورة بعد."); }
};

const handleQuizClick = (quizId: number | bigint | undefined | null) => {
    if (quizId === null || quizId === undefined) return;
    const numId = Number(quizId);
    const latestAttempt = getLatestAttemptForQuiz(numId);
    if (latestAttempt?.id) { navigateTo(`/quizzes/results/${latestAttempt.id}`); }
    else { navigateTo(`/quizzes/${numId}`); }
};

const handleLessonClick = async (lessonId: number | undefined | null) => {
    const numLid = Number(lessonId);
    const numCid = courseId.value;
    const uid = profile.value?.id;
    if (isNaN(numLid) || isNaN(numCid)) return;
    navigateTo(lessonLink(numLid));
    if (uid && isEnrolled.value) {
      console.log(`Updating last accessed lesson to ${numLid} for user ${uid} in course ${numCid}`);
      try {
          const { error } = await supabase.from('course_enrollments').update({ last_accessed_lesson_id: numLid }).eq('user_id', uid).eq('course_id', numCid);
          if (error) { console.error("Failed to update last accessed lesson:", error.message); }
          else { if(enrollment.value) enrollment.value.last_accessed_lesson_id = numLid; console.log(`Last accessed lesson updated successfully.`); }
      } catch (err) { console.error("Error during last accessed update call:", err); }
    }
};

 // --- Head Management ---
 watch([course, pending, error], ([newCourse, loadingState, errorState]) => {
    let pageTitle = 'تفاصيل الدورة'; let description = 'تصفح محتوى الدورة التدريبية والدروس والاختبارات.';
    if (loadingState) { pageTitle = 'جارٍ تحميل الدورة...'; }
    else if (errorState || !newCourse) { pageTitle = errorState?.data?.statusMessage || errorState?.message || 'خطأ في تحميل الدورة'; description = errorState?.data?.message || errorState?.message || 'حدث خطأ أثناء تحميل بيانات الدورة.'; }
    else { pageTitle = `دورة: ${newCourse.title}`; description = newCourse.description?.substring(0, 160) || `تفاصيل دورة "${newCourse.title}".`; }
    useHead({ title: pageTitle, meta: [ { name: 'description', content: description } ] });
 }, { immediate: true });

</script>

<style scoped>
/* Reuse styles, focusing on the new button state */
.button-primary { @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 dark:focus:ring-offset-gray-900; }
.button-enroll { @apply button-primary; }
.button-secondary { @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150; }
.error-display { @apply text-center py-10 px-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg max-w-lg mx-auto shadow-md; }
.error-button { @apply border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-800/60 hover:bg-red-200 dark:hover:bg-red-700/70 focus:ring-red-500; }

/* Quiz Buttons */
.button-quiz-base { @apply inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap transition-colors duration-150; min-height: 30px; }
.button-quiz-course { @apply button-quiz-base text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500; }
.button-quiz-module { @apply button-quiz-base text-white bg-teal-600 hover:bg-teal-700 focus:ring-teal-500; }
.button-quiz-lesson { @apply button-quiz-base text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900/80 focus:ring-indigo-500 border border-indigo-200 dark:border-indigo-700/70; }

/* Style for Attempted Quiz Buttons (clickable, distinct style) */
.button-quiz-base.attempted { @apply !bg-purple-600 hover:!bg-purple-700 focus:!ring-purple-500 !text-white cursor-pointer; }
.button-quiz-lesson.attempted { @apply !bg-purple-100 dark:!bg-purple-900/60 !text-purple-700 dark:!text-purple-300 !border-purple-300 dark:!border-purple-700/80 cursor-pointer hover:!bg-purple-200 dark:hover:!bg-purple-900/80; }


/* Lesson Item Styles */
.lesson-item-wrapper { @apply flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md transition-colors duration-150 gap-2 sm:gap-4; }
.lesson-completed { @apply bg-green-50 dark:bg-green-900/30 opacity-85 hover:opacity-95; }
.lesson-incomplete { @apply hover:bg-gray-50 dark:hover:bg-gray-700/50; }
.lesson-status-icon { @apply flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-semibold rounded-full; }
.lesson-status-icon.completed { @apply bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100; }
.lesson-status-icon.incomplete { @apply bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300; }
.lesson-status-icon svg { @apply w-4 h-4; }
.lesson-title-link { @apply text-base text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 truncate transition-colors duration-150 cursor-pointer font-medium; } /* Made title slightly bolder */
.lesson-quiz-section { @apply flex flex-wrap gap-1.5 mt-2 sm:mt-0 flex-shrink-0 w-full sm:w-auto justify-start sm:justify-end; } /* Added mt-2 for spacing */
.lesson-quiz-placeholder { @apply h-[30px] flex-shrink-0 w-full sm:w-auto sm:min-w-[100px]; }

/* Other styles */
.text-xxs { font-size: 0.65rem; line-height: 0.8rem; }
.progress-section .bg-primary { transition: width 0.5s ease-out; }
*:focus-visible { outline: 2px solid theme('colors.primary.500'); outline-offset: 2px; }
.no-content-display { @apply text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed dark:border-gray-700; }
.module-section { @apply bg-white dark:bg-gray-800/40 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm; }
.module-header { @apply flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700; }
.no-lessons-text { @apply text-sm text-gray-500 dark:text-gray-400 italic px-3 py-4 text-center; }
</style>