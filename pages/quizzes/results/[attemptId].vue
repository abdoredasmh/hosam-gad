<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- === Loading State === -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner class="w-12 h-12 text-primary-600 mx-auto" />
      <p class="mt-4 text-xl text-gray-600 dark:text-gray-400">جارٍ تحميل نتيجة الاختبار...</p>
    </div>

    <!-- === Error State === -->
    <div v-else-if="error || !attempt" class="error-box p-6 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto text-red-400 mb-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
      <h2 class="text-2xl font-semibold text-red-800 dark:text-red-300 mb-3">خطأ في عرض النتيجة</h2>
      <p class="text-red-700 dark:text-red-400 mb-6">{{ error?.message || 'لم نتمكن من العثور على نتيجة المحاولة المطلوبة أو ليس لديك صلاحية لعرضها.' }}</p>
      <!-- Link back to course if course details were successfully fetched -->
      <NuxtLink v-if="quiz?.course_id && quiz?.study_courses?.title" :to="`/study/courses/${quiz.course_id}`" class="button-secondary">
          <ArrowUturnLeftIcon class="w-4 h-4 me-2" />
          العودة إلى الدورة
      </NuxtLink>
      <!-- Generic link back to my courses otherwise -->
      <NuxtLink v-else to="/my-courses" class="button-secondary">
          <ArrowUturnLeftIcon class="w-4 h-4 me-2" />
          العودة إلى دوراتي
      </NuxtLink>
    </div>

    <!-- === Results Display === -->
    <div v-else class="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
      <!-- Header Section -->
      <header class="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/80 border-b dark:border-gray-700">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <!-- Quiz Info -->
          <div class="flex-1">
            <!-- Display Course Link if course info is fetched successfully -->
            <NuxtLink v-if="quiz?.course_id && quiz?.study_courses?.title" :to="`/study/courses/${quiz.course_id}`" class="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-1 block font-medium">
              <ArrowRightCircleIcon class="inline-block w-4 h-4 me-1 align-middle" />
              {{ quiz.study_courses.title }}
            </NuxtLink>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              نتيجة اختبار: {{ quiz?.title || '...' }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              تم الإرسال في: {{ formatDate(attempt.submitted_at) }}
            </p>
          </div>

          <!-- Score / Pass-Fail Status Box -->
          <div class="text-center sm:text-right flex-shrink-0 p-4 rounded-md border"
               :class="getGradingStatusClasses(attempt.grading_status, attempt.passed)">
            <p class="text-sm font-medium mb-0.5" :class="getTextColorClass(attempt.grading_status)">النتيجة النهائية</p>

            <!-- Final Score (Only if fully graded) -->
            <p v-if="attempt.grading_status === 'graded'" class="text-4xl font-bold"
               :class="attempt.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
              {{ attempt.total_score ?? 0 }} / {{ totalPossiblePoints }}
            </p>
             <!-- Auto Score (If only auto-graded but not fully graded yet) -->
             <p v-else-if="attempt.grading_status === 'auto_graded'" class="text-4xl font-bold text-blue-600 dark:text-blue-400">
                 {{ attempt.score ?? 0 }} / {{ totalPossiblePoints }}
                 <span class="text-xs block">(الدرجة التلقائية)</span>
             </p>
             <!-- Pending Status -->
             <p v-else-if="attempt.grading_status === 'pending_manual'" class="text-2xl font-semibold text-orange-600 dark:text-orange-400 py-2">
                 في انتظار التصحيح
             </p>
             <!-- Default or other statuses -->
             <p v-else class="text-2xl font-semibold text-gray-500 dark:text-gray-400 py-2">
                 --
             </p>


            <!-- Pass/Fail Status (Only shown if grading is complete or auto_graded provides enough info) -->
            <p v-if="(attempt.grading_status === 'graded' || attempt.grading_status === 'auto_graded') && attempt.passed !== null"
               class="text-sm font-semibold mt-1"
               :class="attempt.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
               {{ attempt.passed ? 'ناجح' : 'راسب' }}
               <span class="text-xs font-normal text-gray-500 dark:text-gray-400">(علامة النجاح: {{ quiz?.pass_mark_percentage ?? 'N/A' }}%)</span>
            </p>
             <!-- Pending Manual Grading message -->
             <p v-else-if="attempt.grading_status === 'pending_manual'" class="text-xs font-medium mt-1 text-orange-700 dark:text-orange-300">
                 تحتاج لتصحيح يدوي لتحديد النتيجة
             </p>
          </div>
        </div>
      </header>

      <!-- Answers Details Section -->
      <div class="p-6 md:p-8 space-y-8">
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-6 border-b dark:border-gray-700 pb-3">
          تفاصيل الإجابات
        </h2>

        <!-- Loop through questions -->
        <div
          v-for="(question, index) in questionsWithOptions"
          :key="question.id"
          class="pb-8 border-b border-gray-200 dark:border-gray-700 last:border-b-0 question-item"
        >
          <!-- Question Header -->
          <div class="flex justify-between items-start mb-4 gap-4">
             <!-- Question Title & Points -->
            <p class="font-semibold text-gray-800 dark:text-gray-200 flex-grow">
              <span class="text-lg">السؤال {{ index + 1 }}</span>
              <span class="block text-xs text-gray-400 dark:text-gray-500 font-normal mt-0.5">({{ question.points ?? 1 }} نقطة)</span>
            </p>
            <!-- Correctness/Score Indicator -->
            <div class="text-sm font-medium text-right flex-shrink-0 space-y-1">
              <!-- Auto-Graded Question Status (MCQ/TF) -->
              <span v-if="question.type === 'mcq' || question.type === 'true_false'"
                    :class="[
                        'px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1',
                        isAutoQuestionCorrect(question)
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    ]">
                  <CheckCircleIcon v-if="isAutoQuestionCorrect(question)" class="w-4 h-4"/>
                  <XCircleIcon v-else class="w-4 h-4"/>
                  {{ isAutoQuestionCorrect(question) ? 'صحيحة' : 'خاطئة' }}
                  <span class="font-normal">({{ isAutoQuestionCorrect(question) ? question.points ?? 1 : 0 }}/{{ question.points ?? 1 }})</span>
              </span>
              <!-- Written Question Status -->
              <span v-else-if="question.type === 'written'"
                    :class="[
                      'px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1',
                      attempt.grading_status === 'pending_manual' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : (attempt.grading_status === 'graded' || attempt.grading_status === 'auto_graded') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' // Default for other states
                    ]">
                    <PencilSquareIcon class="w-4 h-4" />
                    <!-- Show score if graded -->
                    <span v-if="attempt.grading_status === 'graded'">
                      الدرجة: {{ attempt.manual_score ?? '--' }} / {{ question.points ?? 1 }}
                    </span>
                    <!-- Show pending if pending manual -->
                     <span v-else-if="attempt.grading_status === 'pending_manual'" class="italic">
                       في انتظار التصحيح
                    </span>
                    <!-- Show placeholder if auto_graded (meaning manual score not yet added) or other states -->
                     <span v-else>
                      الدرجة: -- / {{ question.points ?? 1 }}
                    </span>
              </span>
              <!-- Placeholder for potentially unknown question types -->
               <span v-else
                    class="px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>
                    نوع غير معروف
               </span>
            </div>
          </div>

          <!-- Question Text (Rendered Markdown) -->
          <div class="question-text prose prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 mb-5" v-html="renderMarkdown(question.question_text ?? '')"></div>

          <!-- Answer Area -->
          <div class="mt-4 space-y-3">
            <!-- === Multiple Choice / True/False === -->
            <template v-if="question.type === 'mcq' || question.type === 'true_false'">
              <!-- Defensive check for options before looping -->
              <template v-if="question.options && question.options.length > 0">
                <div
                  v-for="option in question.options"
                  :key="option.id"
                  class="p-3 rounded-md border flex items-start text-sm transition-colors duration-150 relative"
                  :class="getOptionClasses(question, option)"
                >
                  <!-- Icon Indicator (Correct / Incorrect Choice) -->
                  <span class="flex-shrink-0 w-5 h-5 me-3 mt-0.5">
                    <CheckCircleIcon v-if="option.is_correct" class="w-5 h-5 text-green-500 dark:text-green-400" aria-label="الإجابة الصحيحة" />
                    <XCircleIcon v-else-if="isOptionSelectedByStudent(question.id, option.id)" class="w-5 h-5 text-red-500 dark:text-red-400" aria-label="إجابتك الخاطئة" />
                    <!-- Placeholder for alignment if neither correct nor wrongly selected -->
                    <span v-else class="w-5 h-5 block opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-gray-400 dark:text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    </span>
                  </span>
                  <!-- Option Text -->
                  <span class="flex-grow">{{ option.option_text }}</span>
                  <!-- 'Your Answer' Badge -->
                  <span v-if="isOptionSelectedByStudent(question.id, option.id)" class="absolute top-1.5 end-1.5 text-xs font-medium px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                    إجابتك
                  </span>
                </div>
              </template>
              <!-- Message if options are missing for some reason -->
              <p v-else class="text-sm text-red-600 dark:text-red-400 italic">
                  (لا توجد خيارات لعرضها لهذا السؤال)
              </p>
            </template>

            <!-- === Written Answer === -->
            <template v-if="question.type === 'written'">
              <!-- Student's Answer -->
              <div class="student-answer-box relative">
                <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">إجابتك:</p>
                <p class="text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap min-h-[50px] pb-6">
                  {{ studentAnswerForQuestion(question.id) || '-- لم تقدم إجابة --' }}
                </p>
                <!-- Display Manual Score/Status at the bottom -->
                <div class="absolute bottom-0 left-0 right-0 px-3 py-2 border-t border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/70 text-xs text-gray-500 dark:text-gray-400 text-right">
                    <!-- Show score if fully graded -->
                    <span v-if="attempt.grading_status === 'graded'">
                        الدرجة الممنوحة: <span class="font-semibold text-gray-700 dark:text-gray-200">{{ attempt.manual_score ?? '--' }} / {{ question.points ?? 1 }}</span>
                    </span>
                    <!-- Show pending if pending manual grading -->
                    <span v-else-if="attempt.grading_status === 'pending_manual'" class="italic text-orange-600 dark:text-orange-400">
                        في انتظار التصحيح اليدوي
                    </span>
                     <!-- Show placeholder for other states (e.g., auto_graded but not fully graded) -->
                     <span v-else class="italic">
                         --
                    </span>
                </div>
              </div>
              <!-- Model Answer section removed as 'model_answer' column doesn't exist -->
            </template>
          </div> <!-- End Answer Area -->
        </div> <!-- End Question Loop -->

      </div> <!-- End Content Padding -->

      <!-- Footer Section -->
      <footer class="p-6 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 text-center">
        <NuxtLink v-if="quiz?.course_id && quiz?.study_courses?.title" :to="`/study/courses/${quiz.course_id}`" class="button-secondary">
            <ArrowUturnLeftIcon class="w-4 h-4 me-2" />
            العودة إلى الدورة
        </NuxtLink>
        <NuxtLink v-else to="/my-courses" class="button-secondary ms-3">
             <ArrowUturnLeftIcon class="w-4 h-4 me-2" />
            العودة إلى دوراتي
        </NuxtLink>
      </footer>

    </div> <!-- End Card -->
  </div> <!-- End Container -->
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, watch } from 'vue';
import { useRoute, useSupabaseClient, useAsyncData, definePageMeta, createError, navigateTo, useHead } from '#imports';
// IMPORTANT: Re-generate your types file after DB schema changes
// npx supabase gen types typescript --local > types/database.types.ts
import type { Database, Tables, Json, Enums } from '~/types/database.types'; // Adjust path if needed
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // Adjust path if needed
import { CheckCircleIcon, XCircleIcon, PencilSquareIcon, ArrowRightCircleIcon, ArrowUturnLeftIcon } from '@heroicons/vue/24/outline';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// --- Types (Reflect actual DB schema confirmed earlier) ---
type QuizAttemptFull = Tables<'quiz_attempts'> & {
    answers_parsed?: Record<string | number, any>;
};
type QuizOption = Tables<'question_options'>;
type QuizQuestion = Tables<'quiz_questions'>; // No model_answer
// Type combining question with its options, ensuring options is an array
type QuestionWithOptions = QuizQuestion & { question_options: QuizOption[] };
// Type for Quiz including related course (based on course_id)
type QuizFull = Tables<'quizzes'> & {
    study_courses?: Pick<Tables<'study_courses'>, 'id' | 'title'> | null
};
// Type for the data returned by useAsyncData
type FetchedResultData = {
  attempt: QuizAttemptFull | null;
  quiz: QuizFull | null;
  questionsWithOptions: QuestionWithOptions[];
};
// Type for grading status enum (replace 'string' if enum is defined in database.types.ts)
type GradingStatus = Enums<'grading_status_enum'> | string;

// --- Page Meta & Middleware ---
definePageMeta({
  layout: 'default', // Assuming you have a default layout
  middleware: ['auth'] // Assuming you have an auth middleware
});

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const route = useRoute();
const user = useSupabaseUser();

// --- Attempt ID Computation ---
const attemptId = computed<number>(() => {
    const id = parseInt(route.params.attemptId as string, 10);
    if (isNaN(id) || id <= 0) {
         // Using Nuxt's built-in error handling
         throw createError({
           statusCode: 400,
           statusMessage: 'معرف المحاولة غير صالح أو مفقود.',
           fatal: true // Stop navigation/rendering
         });
    }
    return id;
});

// --- Reactive State ---
const attempt = shallowRef<QuizAttemptFull | null>(null);
const quiz = shallowRef<QuizFull | null>(null);
const questionsWithOptions = shallowRef<QuestionWithOptions[]>([]);

// --- Data Fetching with useAsyncData ---
const { data: fetchedData, pending, error } = await useAsyncData<FetchedResultData>(
  // Unique key for caching based on attempt ID
  `quiz-result-${attemptId.value}`,
  // Async function to fetch data
  async () => {
    const currentAttemptId = attemptId.value;
    const currentUserId = user.value?.id;

    // Ensure user is logged in
    if (!currentUserId) {
        throw createError({ statusCode: 401, message: 'المستخدم غير مسجل الدخول.', fatal: true });
    }

    // 1. Fetch the specific quiz attempt
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*') // Select all columns (includes score, manual_score, total_score, etc.)
      .eq('id', currentAttemptId)
      .maybeSingle(); // Use maybeSingle to handle not found case gracefully

    // Handle errors fetching the attempt
    if (attemptError) {
        
        throw createError({ statusCode: 500, message: `خطأ في جلب بيانات المحاولة: ${attemptError.message}`, fatal: false });
    }
    // Handle attempt not found
     if (!attemptData) {
        throw createError({ statusCode: 404, message: 'المحاولة المطلوبة غير موجودة.', fatal: false });
     }
      // Security check: Ensure the fetched attempt belongs to the logged-in user
     if (attemptData.user_id !== currentUserId) {
         
         throw createError({ statusCode: 403, message: 'ليس لديك الصلاحية لعرض نتيجة هذه المحاولة.', fatal: false });
     }

    // Parse the 'answers' JSONB column to easily access student's selections later
    let parsedAnswers: Record<string | number, any> = {};
    if (attemptData.answers && typeof attemptData.answers === 'object' && !Array.isArray(attemptData.answers)) {
      parsedAnswers = { ...(attemptData.answers as Record<string, any>) };
    }
    // Add the parsed answers to the attempt object (client-side only)
    (attemptData as QuizAttemptFull).answers_parsed = parsedAnswers;

    // Get the quiz ID from the attempt data
    const quizId = attemptData.quiz_id;

    // 2. Fetch Quiz details (including related course) and Questions (including related options) in parallel
    const [quizRes, questionsRes] = await Promise.all([
       // Fetch Quiz and try to join study_courses using the 'course_id' foreign key
       // Assumes a relationship named 'study_courses' is defined in Supabase from quizzes.course_id -> study_courses.id
       supabase.from('quizzes')
               .select('*, study_courses(id, title)') // Standard way to fetch related data if relation is named like the table
               // If the above fails, try specifying the FK explicitly (syntax might need adjustment based on relation setup):
               // .select('*, study_courses:course_id(id, title)')
               .eq('id', quizId)
               .single(), // Expecting only one quiz

       // Fetch Questions and their related Options using the explicit column selection method
       supabase.from('quiz_questions')
               .select(`
                   id, quiz_id, question_text, type, question_order, points, created_at, updated_at,
                   question_options ( id, question_id, option_text, is_correct, option_order )
               `)
               .eq('quiz_id', quizId)
               .order('question_order', { ascending: true }) // Order questions by their defined order
               .order('id', { referencedTable: 'question_options', ascending: true }) // Order options consistently by ID
    ]).catch(err => {
         // Catch potential errors during the parallel fetch
         
         throw createError({ statusCode: 500, message: 'خطأ في جلب تفاصيل الاختبار أو الأسئلة.', fatal: false });
    });


    // Process quiz results, handling potential failure to fetch course details gracefully
    let processedQuizData: QuizFull | null = null;
    if (quizRes.error) {
        
        // Check if the error is specifically about the 'study_courses' relation failing
        if (quizRes.error.message.includes('relation') && quizRes.error.message.includes('study_courses')) {
             
             // Attempt to fetch just the quiz data without the relation as a fallback
             const { data: quizOnlyData, error: quizOnlyError } = await supabase.from('quizzes').select('*').eq('id', quizId).single();
             if (quizOnlyError) {
                 // If even fetching the basic quiz fails, throw an error
                 throw createError({ statusCode: 500, message: `خطأ فادح في جلب الاختبار الأساسي: ${quizOnlyError.message}`, fatal: false });
             }
             processedQuizData = quizOnlyData as QuizFull | null; // Use quiz data without course details
        } else {
            // If it's a different error fetching the quiz, throw it
            throw createError({ statusCode: 500, message: `خطأ في جلب بيانات الاختبار: ${quizRes.error.message}`, fatal: false });
        }
    } else {
      processedQuizData = quizRes.data as QuizFull | null; // Use the successfully fetched data
    }

    // Handle errors fetching questions
    if (questionsRes.error) {
      
      throw createError({ statusCode: 500, message: `خطأ في جلب أسئلة الاختبار: ${questionsRes.error.message}`, fatal: false });
    }

    // Prepare the final data structure
    // Ensure questionsData is an array, even if the response was empty
    const questionsData = (questionsRes.data as QuestionWithOptions[]) || [];

    // Return the fetched and processed data
    return {
      attempt: attemptData as QuizAttemptFull,
      quiz: processedQuizData,
      questionsWithOptions: questionsData
    };
  },
  {
     // Default value while fetching or if fetch fails before state is set
     default: () => ({ attempt: null, quiz: null, questionsWithOptions: [] }),
     // Re-run the fetch if the attemptId parameter changes
     watch: [attemptId]
  }
);

// --- Watcher to update local reactive state when fetchedData changes ---
watch(fetchedData, (newData) => {
    if (newData) {
        attempt.value = newData.attempt;
        quiz.value = newData.quiz;
        // Make sure the 'options' property exists and is an array for each question
        questionsWithOptions.value = (newData.questionsWithOptions || []).map(q => ({
            ...q,
            // Ensure the property name matches the one returned by the Supabase query (`question_options`)
            // and provide an empty array as fallback if it's missing for some reason
            options: q.question_options || []
        }));
    } else {
        // Reset state if data becomes null (e.g., due to error)
        attempt.value = null;
        quiz.value = null;
        questionsWithOptions.value = [];
    }
}, { immediate: true }); // Run the watcher immediately on component mount

// --- Computed Properties ---
const totalPossiblePoints = computed<number>(() => {
  // Calculate total points based on the questions fetched
  return questionsWithOptions.value.reduce((sum, q) => sum + (q.points ?? 1), 0); // Use 1 point if points is null/undefined
});

// --- Helper Functions ---

/**
 * Formats a date string into a localized Arabic format.
 * @param dateString - The date string to format.
 * @returns Formatted date string or 'غير متوفر'.
 */
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'غير متوفر';
  try {
      // Using ar-EG locale for common Arabic date/time format
      return new Date(dateString).toLocaleString('ar-EG', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
      });
   } catch (e) {
     
     return dateString; // Return original string if formatting fails
   }
};

/**
 * Renders Markdown text to safe HTML.
 * @param text - The Markdown string.
 * @returns Sanitized HTML string.
 */
const renderMarkdown = (text: string | null | undefined): string => {
    if (!text) return '';
    // Configure marked options (GFM, line breaks)
    marked.setOptions({ breaks: true, gfm: true, smartypants: true });
    const dirtyHTML = marked.parse(text);
    // Sanitize HTML client-side using DOMPurify
    if (typeof window !== 'undefined') {
        return DOMPurify.sanitize(dirtyHTML, { USE_PROFILES: { html: true } });
    }
    // Basic server-side escape (replace with proper library if complex HTML needed in SSR)
    return String(dirtyHTML).replace(/<script.*?>.*?<\/script>/gi, '');
};

/**
 * Retrieves the student's answer for a specific question ID from the parsed answers.
 * @param questionId - The ID of the question.
 * @returns The student's answer or null if not found.
 */
const studentAnswerForQuestion = (questionId: number): any => {
    // Access the parsed answers stored on the attempt object
    return attempt.value?.answers_parsed?.[questionId] ?? null;
};

/**
 * Checks if a specific option was selected by the student for a given question.
 * Handles both single and multiple selection answers.
 * @param questionId - The ID of the question.
 * @param optionId - The ID of the option to check.
 * @returns True if the option was selected, false otherwise.
 */
const isOptionSelectedByStudent = (questionId: number, optionId: number): boolean => {
    const answer = studentAnswerForQuestion(questionId);
    // If no answer was given, the option wasn't selected
    if (answer === null || answer === undefined) return false;

    const stringOptionId = String(optionId); // Compare as strings for consistency

    // If the answer is an array (multiple selections possible)
    if (Array.isArray(answer)) {
        // Check if any element in the array matches the option ID (as string)
        return answer.some(a => String(a) === stringOptionId);
    }
    // If the answer is a single value
    return String(answer) === stringOptionId;
};

/**
 * Determines if an automatically gradable question (MCQ/true_false) was answered correctly.
 * @param question - The question object, including its options.
 * @returns True if answered correctly, false otherwise.
 */
const isAutoQuestionCorrect = (question: QuestionWithOptions): boolean => {
    // Written questions are not auto-graded
    if (question.type === 'written') return false;

    // Guard clause: Check if options exist and is an array before filtering
    // Uses the 'options' property added in the watcher
    if (!question.options || !Array.isArray(question.options)) {
        // Log a warning if options are missing for an auto-gradable question type
        if(question.type === 'mcq' || question.type === 'true_false') {
           
        }
        return false; // Cannot be correct if options are missing/invalid
    }

    // Filter out the correct options
    const correctAnswerOptions = question.options.filter(o => o.is_correct);
    // Get the IDs of the correct options (as strings for consistent comparison)
    const correctAnswerIds = correctAnswerOptions.map(o => String(o.id));
    // Get the student's answer for this question
    const studentAnswer = studentAnswerForQuestion(question.id);

    // If the student didn't answer, it's incorrect
    if (studentAnswer === null || studentAnswer === undefined) return false;
    // If the question definition is flawed (no correct answer defined), it cannot be correct
    if (correctAnswerIds.length === 0) {
      // 
      return false;
    }

    // Normalize the student's answer(s) to an array of strings
    let studentAnswerIds: string[];
    if (Array.isArray(studentAnswer)) {
        studentAnswerIds = studentAnswer.map(a => String(a));
    } else {
        studentAnswerIds = [String(studentAnswer)];
    }

    // --- Check correctness based on the number of correct answers ---

    // Case 1: Single correct answer question (most common MCQ/TF)
    if (correctAnswerIds.length === 1) {
        // Student must have selected exactly one answer, and it must be the correct one
        return studentAnswerIds.length === 1 && studentAnswerIds[0] === correctAnswerIds[0];
    }
    // Case 2: Multiple correct answers question (e.g., "select all that apply")
    else {
        // Student must select *all* correct answers and *none* of the incorrect ones.
        // The number of selected answers must exactly match the number of correct answers.
        if (studentAnswerIds.length !== correctAnswerIds.length) {
            return false;
        }
        // Check if every correct ID is present in the student's answers
        const correctSet = new Set(correctAnswerIds);
        return studentAnswerIds.every(id => correctSet.has(id));
    }
};

/**
 * Determines the CSS classes for displaying an MCQ/TF option based on correctness and selection.
 * @param question - The question object.
 * @param option - The option object.
 * @returns A string of Tailwind CSS classes.
 */
const getOptionClasses = (question: QuestionWithOptions, option: QuizOption): string => {
    const isSelected = isOptionSelectedByStudent(question.id, option.id);
    const base = 'border '; // Base border class

    // Style for the CORRECT option
    if (option.is_correct) {
        return `${base} bg-green-50 dark:bg-green-900/50 border-green-400 dark:border-green-600 text-green-900 dark:text-green-100 font-medium shadow-sm`;
    }
    // Style for an INCORRECT option that the student SELECTED
    else if (isSelected) {
        return `${base} bg-red-50 dark:bg-red-900/50 border-red-400 dark:border-red-600 text-red-900 dark:text-red-100 font-medium shadow-sm`;
    }
    // Style for other options (incorrect and NOT selected)
    else {
        return `${base} bg-white dark:bg-gray-700/60 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 opacity-90 dark:opacity-80`;
    }
};

/**
 * Determines the CSS classes for the main grading status box in the header.
 * @param status - The current grading status of the attempt.
 * @param passed - The pass/fail status (boolean or null).
 * @returns A string of Tailwind CSS classes for background and border.
 */
const getGradingStatusClasses = (status: GradingStatus | null | undefined, passed: boolean | null | undefined): string => {
    switch (status) {
        case 'graded':
            return passed
                ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700';
        case 'pending_manual':
            return 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700';
        case 'auto_graded':
            return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
        default: // Includes 'pending_submission' or null/undefined
            return 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600';
    }
};

/**
 * Determines the text color class for the "النتيجة النهائية" label based on status.
 * @param status - The current grading status.
 * @returns A string of Tailwind CSS classes for text color.
 */
const getTextColorClass = (status: GradingStatus | null | undefined): string => {
     switch (status) {
        case 'pending_manual':
            return 'text-orange-600 dark:text-orange-300';
        case 'graded':
        case 'auto_graded':
            // Use a neutral color, letting the score/pass status dominate visually
            return 'text-gray-600 dark:text-gray-300';
        default:
            return 'text-gray-500 dark:text-gray-400';
     }
};


// --- Meta Tags for SEO and Head ---
useHead({
  // Dynamically set the page title
  title: computed(() => {
      if (pending.value) return 'تحميل النتيجة...';
      if (error.value || !attempt.value) return 'خطأ في عرض النتيجة';
      const baseTitle = `نتيجة: ${quiz.value?.title || 'الاختبار'}`;
      // Add status indication to title if pending manual grading
      if (attempt.value.grading_status === 'pending_manual') {
        return `${baseTitle} (قيد التصحيح)`;
      }
      return baseTitle;
  }),
  // Set page description
  meta: [
    {
      name: 'description',
      content: computed(() => `عرض تفصيلي لنتيجة محاولة اختبار ${quiz.value?.title || ''}.`)
    }
  ]
});

</script>

<style scoped>
/* General Error Box Style */
.error-box {
  @apply border border-red-300 bg-red-50 text-red-700 rounded-lg dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-300 shadow-md;
}

/* Standard Button Styles */
.button-secondary {
  @apply inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out shadow-sm;
}
.button-primary {
  @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out;
}

/* Spacing between questions */
.question-item:not(:last-child) {
     @apply mb-10 pb-10; /* Increased space */
}

/* Styling for Student's Written Answer Box */
.student-answer-box {
  @apply text-base border rounded-md bg-gray-50 dark:bg-gray-700/60 border-gray-300 dark:border-gray-600 shadow-inner overflow-hidden; /* Added overflow hidden */
}
.student-answer-box > p:first-child { /* Label Style */
    @apply px-3 pt-2 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400;
}
.student-answer-box > p:nth-child(2) { /* Answer Text Style */
    @apply px-3 pb-10; /* Add padding bottom to make space for score overlay */
}


/* Improve Tailwind Typography Defaults for Readability */
.prose {
    & :deep(p) { @apply mb-3 leading-relaxed; }
    & :deep(ul), & :deep(ol) { @apply my-4 ms-5; }
    & :deep(li) { @apply mb-1; }
    & :deep(code) { @apply px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono; }
    & :deep(pre) { @apply bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm; }
    & :deep(blockquote) { @apply border-r-4 border-gray-300 dark:border-gray-600 ps-4 italic text-gray-600 dark:text-gray-400 my-4; }
    & :deep(hr) { @apply my-6 border-gray-200 dark:border-gray-600; }
    & :deep(a) { @apply text-primary-600 dark:text-primary-400 hover:underline; }
    & :deep(> :last-child) { margin-bottom: 0; }
}

.question-text {
    @apply prose prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200;
}

/* Model answer box style removed as it's not used */

</style>