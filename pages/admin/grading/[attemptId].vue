<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Back Link -->
    <NuxtLink
      to="/admin/grading"
      class="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition-colors duration-150 ease-in-out group"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-1 transform transition-transform duration-150 ease-in-out group-hover:-translate-x-0.5">
        <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clip-rule="evenodd" />
      </svg>
      العودة لقائمة التصحيح
    </NuxtLink>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-16">
      <LoadingSpinner class="w-10 h-10 text-primary mx-auto" />
      <p class="mt-4 text-lg text-gray-500 dark:text-gray-400">جارٍ تحميل تفاصيل المحاولة...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError || !attemptData" class="error-box p-6">
      <h2 class="text-xl font-semibold text-red-800 dark:text-red-300 mb-3">خطأ في التحميل</h2>
      <p class="text-red-700 dark:text-red-400">{{ loadErrorReason || 'حدث خطأ غير متوقع أثناء تحميل بيانات المحاولة.' }}</p>
      <!-- Display Supabase error message if available and different -->
      <pre v-if="loadError && loadError.message && loadErrorReason !== loadError.message" class="mt-2 text-sm bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-x-auto">{{ loadError.message }}</pre>
      <NuxtLink to="/admin/grading" class="button-secondary mt-6">العودة للقائمة</NuxtLink>
    </div>

    <!-- Grading Interface -->
    <div v-else class="space-y-8">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        تصحيح محاولة: <span class="font-mono text-2xl text-primary-600 dark:text-primary-400">#{{ attemptData.id }}</span>
      </h1>

      <!-- Attempt, Quiz & Student Info Box -->
      <div class="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700">
        <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 pb-2">تفاصيل المحاولة والمعلومات الأساسية</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm mt-4">
          <!-- Column 1: Attempt Info -->
          <div class="space-y-2">
            <InfoItem label="معرف المحاولة:" :value="`#${attemptData.id}`" valueClass="font-mono"/>
            <InfoItem label="تاريخ الإرسال:" :value="formatDate(attemptData.submitted_at)"/>
            <InfoItem label="الحالة الحالية:">
                <span :class="getStatusBadgeClass(attemptData.grading_status)">
                    {{ getGradingStatusText(attemptData.grading_status) }}
                </span>
            </InfoItem>
            
          </div>
          <!-- Column 2: Student & Quiz Info -->
          <div class="space-y-2">
            <InfoItem label="الطالب:">
              <span class="font-medium text-gray-900 dark:text-gray-100">{{ studentData?.full_name ?? `مستخدم (${attemptData.user_id.substring(0, 8)}...)` }}</span>
            </InfoItem>
             <InfoItem label="الاختبار:">
               <span class="font-medium text-gray-900 dark:text-gray-100">{{ quizData?.title ?? 'اختبار غير متاح' }}</span>
             </InfoItem>
             <InfoItem label="الدورة التدريبية:">
               <span class="font-medium text-gray-900 dark:text-gray-100">{{ courseData?.title ?? 'غير محدد' }}</span>
             </InfoItem>
          </div>
          <!-- Column 3: Score Info -->
          <div class="space-y-2">
            <InfoItem label="الدرجة الآلية:" :value="`${attemptData.score ?? 0} / ${autoGradablePoints}`" />
            <InfoItem label="الدرجة اليدوية (المسجلة):" :value="`${attemptData.manual_score ?? '-'} / ${manualGradablePoints}`" v-if="attemptData.grading_status === 'graded'" />
            <InfoItem label="الدرجة الإجمالية (المسجلة):" :value="`${attemptData.total_score ?? '-'} / ${totalPossiblePoints}`" v-if="attemptData.grading_status === 'graded'" />
            <InfoItem label="إجمالي نقاط الاختبار:" :value="totalPossiblePoints.toString()" />
            <InfoItem label="علامة النجاح:" :value="`${quizData?.pass_mark_percentage ?? 'N/A'}%`" />
             <InfoItem label="نتيجة الاختبار (المسجلة):" v-if="attemptData.grading_status === 'graded'">
                <span :class="attemptData.passed ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-red-600 dark:text-red-400 font-semibold'">
                    {{ attemptData.passed ? 'ناجح' : 'راسب' }}
                </span>
            </InfoItem>
          </div>
        </div>
      </div>

      <!-- Written Questions Grading Area -->
      <form @submit.prevent="submitManualGrades" class="space-y-6">
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700">
            الأسئلة الكتابية
            <span v-if="questionsToGrade.length > 0">(مطلوب تصحيح {{ questionsToGrade.length }} سؤال)</span>
            <span v-else-if="writtenQuestions.length > 0 && questionsToGrade.length === 0">(جميع الأسئلة الكتابية مصححة)</span>
        </h2>

         <div v-if="writtenQuestions.length === 0" class="info-box">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-gray-400 mb-2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
             لا توجد أسئلة كتابية في هذا الاختبار.
         </div>
         <div v-else-if="questionsToGrade.length === 0 && attemptData.grading_status === 'graded'" class="info-box">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-green-500 mb-2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
             تم تصحيح جميع الأسئلة الكتابية لهذه المحاولة بالفعل.
         </div>

        <!-- Loop through written questions that need grading (or display already graded ones) -->
        <div
          v-for="(question, index) in writtenQuestions"
          :key="question.id"
          class="p-4 md:p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 shadow-sm transition-all duration-150 ease-in-out"
          :class="{
            'border-primary-500 dark:border-primary-600 ring-1 ring-primary-500 dark:ring-primary-600': isQuestionGraded(question.id), // Highlight graded
            'border-red-500 dark:border-red-600 ring-1 ring-red-500 dark:ring-red-600': scoreErrors[question.id] // Highlight errors
          }"
        >
          <!-- Question Header -->
          <div class="flex justify-between items-baseline mb-3 border-b dark:border-gray-600 pb-2">
             <p class="question-number text-sm font-semibold text-gray-600 dark:text-gray-400">
               السؤال الكتابي #{{ index + 1 }} <span class="text-xs font-mono text-gray-400 dark:text-gray-500">({{ question.id }})</span>
             </p>
             <span class="text-xs font-medium text-gray-500 dark:text-gray-300">النقاط المتاحة: {{ question.points ?? 1 }}</span>
          </div>

          <!-- Question Text (Rendered Markdown) -->
          <div class="question-text text-base font-medium text-gray-800 dark:text-gray-200 mb-4 prose prose-sm dark:prose-invert max-w-none" v-html="renderMarkdown(question.question_text ?? '')"></div>
          <!-- Optional: Display model answer if available
          <div v-if="question.model_answer" class="model-answer-box mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
             <p class="text-xs font-medium text-blue-600 dark:text-blue-300 mb-1">الإجابة النموذجية:</p>
             <p class="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{{ question.model_answer }}</p>
           </div>
          -->

          <!-- Student Answer -->
          <div class="student-answer-box mt-3 mb-4">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">إجابة الطالب:</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap min-h-[40px]">
              {{ studentAnswerForQuestion(question.id) || '-- لا توجد إجابة --' }}
            </p>
          </div>

          <!-- Grading Input Area -->
           <div class="grading-input-area mt-4">
                <label :for="`score-${question.id}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الدرجة الممنوحة:</label>
                <div class="flex items-center">
                    <input
                      type="number"
                      :id="`score-${question.id}`"
                      v-model.number="manualScores[question.id]"
                      :max="question.points ?? 1"
                      min="0"
                      step="0.5"
                      required
                      class="input-field w-28 text-center text-base font-medium appearance-none"
                      :class="{ 'border-red-500 dark:border-red-600 ring-1 ring-red-500 dark:ring-red-600 focus:ring-red-500 focus:border-red-500': scoreErrors[question.id] }"
                      :disabled="isSaving || attemptData.grading_status === 'graded'"
                      @input="validateScore(question.id, question.points ?? 1)"
                      aria-describedby="score-error-{{question.id}}"
                      placeholder="0"
                    />
                    <span class="text-base font-medium text-gray-500 dark:text-gray-400 ms-2"> / {{ question.points ?? 1 }}</span>
                </div>
                 <p v-if="scoreErrors[question.id]" :id="`score-error-${question.id}`" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ scoreErrors[question.id] }}</p>
                 <p v-else-if="isQuestionGraded(question.id)" class="mt-1 text-xs text-green-600 dark:text-green-400">تم حفظ الدرجة.</p>
           </div>
        </div>

        <!-- Submit Button Area (Only if grading is pending) -->
        <div v-if="attemptData.grading_status !== 'graded' && writtenQuestions.length > 0" class="pt-6 border-t dark:border-gray-700 sticky bottom-0 bg-gradient-to-t from-white dark:from-gray-900 pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div class="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg mb-4 border dark:border-gray-600 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div class="text-center sm:text-right">
                  <p class="text-sm text-gray-600 dark:text-gray-300">النتيجة النهائية (تقديرية):</p>
                  <p class="text-2xl font-bold text-primary-700 dark:text-primary-400">
                      {{ calculatedFinalScore }} / {{ totalPossiblePoints }}
                      <span class="text-lg font-medium text-gray-500 dark:text-gray-400">({{ calculatedPercentage }}%)</span>
                  </p>
                  <p v-if="passStatus !== null" :class="['text-sm font-medium', passStatus ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400']">
                    {{ passStatus ? 'ناجح' : 'راسب' }} (علامة النجاح: {{ quizData?.pass_mark_percentage ?? 'N/A' }}%)
                  </p>
              </div>
               <div class="flex-shrink-0 w-full sm:w-auto">
                 <button
                   type="submit"
                   class="button-primary w-full sm:w-auto"
                   :disabled="isSaving ||  Object.values(scoreErrors).some(e => e !== null) || !allScoresEnteredForPending"
                   aria-label="حفظ التصحيح وإنهاء المراجعة"
                 >
                     <LoadingSpinner v-if="isSaving" class="w-5 h-5 me-2 animate-spin" />
                     {{ isSaving ? 'جارٍ الحفظ...' : (questionsToGrade.length > 0 ? `حفظ تصحيح ${questionsToGrade.length} سؤال` : 'حفظ التصحيح وإنهاء المراجعة') }}
                 </button>
               </div>
          </div>
           <p v-if="!allScoresEnteredForPending && questionsToGrade.length > 0" class="text-yellow-700 dark:text-yellow-400 text-xs text-center sm:text-right mt-1">
               يجب إدخال درجة لجميع الأسئلة المطلوب تصحيحها.
            </p>
           <p v-if="saveError" class="text-red-600 dark:text-red-400 text-sm text-center sm:text-right mt-1">{{ saveError }}</p>
        </div>
         <div v-else-if="attemptData.grading_status === 'graded'" class="text-center mt-6">
            <p class="text-lg font-medium text-green-700 dark:text-green-400">تم تصحيح هذه المحاولة بالكامل.</p>
            <!-- Optionally add a button to re-grade if needed -->
            <!-- <button type="button" @click="enableReGrading" class="button-secondary mt-4">السماح بإعادة التصحيح</button> -->
        </div>
      </form>

    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, shallowRef, watch, reactive } from 'vue';
import { useRoute, useSupabaseClient, useAsyncData, definePageMeta, createError, navigateTo, useHead } from '#imports';
import type { Database, Tables, Json, Enums } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // تأكد من المسار الصحيح
// Use DOMPurify for safer HTML rendering if markdown source is potentially untrusted
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// --- Types ---
type GradingStatus = Enums<'grading_status_enum'>;
// Define a more specific type for parsed answers, including the manual score map
type ParsedAnswers = Record<string | number, any> & {
  manual_score_map?: Record<string | number, number>;
  // feedback_map?: Record<string | number, string>; // Example if feedback is added later
};
type QuizAttemptFull = Omit<Tables<'quiz_attempts'>, 'answers'> & {
    answers: Json; // Keep original JSON type for DB compatibility
    answers_parsed?: ParsedAnswers; // Add the parsed version
};
type QuizFull = Tables<'quizzes'> & { study_courses?: Pick<Tables<'study_courses'>, 'id' | 'title'> | null }; // Allow nested course to be possibly null
type StudentProfile = Pick<Tables<'profiles'>, 'id' | 'full_name'>;
type WrittenQuestion = Tables<'quiz_questions'> & { type: 'written' };
type CourseInfo = Pick<Tables<'study_courses'>, 'id' | 'title'> | null;
type FetchedGradingData = {
  attempt: QuizAttemptFull | null;
  quiz: QuizFull | null;
  student: StudentProfile | null;
  allQuestions: Tables<'quiz_questions'>[];
  course: CourseInfo;
};

// --- Page Meta & Middleware ---
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
});

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const route = useRoute();
// TODO: Implement a proper notification store (e.g., using Pinia and a toast library)
// const notificationStore = useNotificationStore();

// --- Attempt ID ---
const attemptId = computed<number>(() => {
    const id = parseInt(route.params.attemptId as string, 10);
    if (isNaN(id) || id <= 0) {
         throw createError({ statusCode: 400, statusMessage: 'معرف المحاولة غير صالح أو مفقود.', fatal: true });
    }
    return id;
});

// --- Reactive State ---
// Use shallowRef for potentially large/complex objects fetched from DB if deep reactivity isn't strictly needed for the object itself
const attemptData = shallowRef<QuizAttemptFull | null>(null);
const quizData = shallowRef<QuizFull | null>(null);
const studentData = shallowRef<StudentProfile | null>(null);
const allQuestions = shallowRef<Tables<'quiz_questions'>[]>([]);
const courseData = shallowRef<CourseInfo>(null);

// Use reactive for objects where reactivity of individual properties (keys) is essential
const manualScores = reactive<Record<string | number, number | null>>({});
const scoreErrors = reactive<Record<string | number, string | null>>({});

const isSaving = ref(false);
const saveError = ref<string | null>(null);
const loadErrorReason = ref<string | null>(null); // Specific reason for loading failure

// --- Data Fetching (`useAsyncData`) ---
// Use a more descriptive key, especially if fetching multiple attempts elsewhere
const { data: fetchedData, pending, error: loadError } = await useAsyncData<FetchedGradingData>(
  `admin-grading-attempt-details-${attemptId.value}`,
  async () => {
    const currentAttemptId = attemptId.value;
    
    loadErrorReason.value = null; // Reset load error reason

    // 1. Fetch the attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', currentAttemptId)
      .maybeSingle();

    if (attemptError) {
        console.error("Error fetching attempt:", attemptError);
        loadErrorReason.value = 'فشل في جلب بيانات المحاولة من قاعدة البيانات.';
        // Throw non-fatal error to show error box in the component
        throw createError({ statusCode: 500, message: loadErrorReason.value, fatal: false });
    }
    if (!attempt) {
        loadErrorReason.value = 'لم يتم العثور على المحاولة المطلوبة بالمعرف المحدد.';
        throw createError({ statusCode: 404, message: loadErrorReason.value, fatal: false });
    }

    // Parse student answers from JSONB safely
    let parsedAnswers: ParsedAnswers = {};
    if (attempt.answers && typeof attempt.answers === 'object' && !Array.isArray(attempt.answers)) {
      // Shallow copy is usually sufficient here
      parsedAnswers = { ...(attempt.answers as Record<string, any>) };
    } else if (attempt.answers) {
        console.warn(`Attempt ${attempt.id} has non-object 'answers' field:`, attempt.answers);
    }
    (attempt as QuizAttemptFull).answers_parsed = parsedAnswers;


    // 2. Fetch related data in parallel
    const [quizRes, studentRes, questionsRes] = await Promise.all([
      // Select course directly via relationship for efficiency
      supabase.from('quizzes').select('*, study_courses(id, title)').eq('id', attempt.quiz_id).maybeSingle(),
      supabase.from('profiles').select('id, full_name').eq('id', attempt.user_id).maybeSingle(),
      supabase.from('quiz_questions').select('*').eq('quiz_id', attempt.quiz_id).order('question_order'),
    ]).catch(err => {
        console.error("Error during parallel fetches:", err);
        loadErrorReason.value = 'حدث خطأ أثناء جلب البيانات المرتبطة (الاختبار، الطالب، أو الأسئلة).';
        throw createError({ statusCode: 500, message: loadErrorReason.value, fatal: false });
    });

    // Handle results and potential errors/null data gracefully
    const quizData = quizRes?.data ?? null;
    if (quizRes?.error) console.error("Error fetching quiz:", quizRes.error);

    const studentProfile = studentRes?.data ?? null;
    if (studentRes?.error) console.error("Error fetching student profile:", studentRes.error);

    const questionsList = questionsRes?.data ?? [];
    if (questionsRes?.error) console.error("Error fetching questions:", questionsRes.error);

    // Extract course data (already selected via the quiz query)
    const courseInfo = quizData?.study_courses ?? null;

    if (!quizData) console.warn(`Quiz data not found for quiz ID: ${attempt.quiz_id}`);
    if (!studentProfile) console.warn(`Student profile not found for user ID: ${attempt.user_id}`);

    return {
      attempt: attempt as QuizAttemptFull,
      quiz: quizData,
      student: studentProfile,
      allQuestions: questionsList,
      course: courseInfo
    };
  }, {
    default: () => ({ attempt: null, quiz: null, student: null, allQuestions: [], course: null }),
    watch: [attemptId] // Re-fetch if the attempt ID changes dynamically (less likely here)
  }
);

// --- Watcher to Update Local State & Initialize Scores ---
watch(fetchedData, (newData) => {
  // Reset state before applying new data to prevent potential inconsistencies
  attemptData.value = null;
  quizData.value = null;
  studentData.value = null;
  allQuestions.value = [];
  courseData.value = null;
  // Clear reactive objects carefully
  Object.keys(manualScores).forEach(key => delete manualScores[key]);
  Object.keys(scoreErrors).forEach(key => delete scoreErrors[key]);

  if (newData?.attempt && newData.allQuestions) {
    
    attemptData.value = newData.attempt;
    quizData.value = newData.quiz;
    studentData.value = newData.student;
    allQuestions.value = newData.allQuestions; // Update the source for computed props
    courseData.value = newData.course;

    // Initialize scores based on the *newly fetched* data's written questions
    const currentWrittenQuestions = newData.allQuestions.filter(q => q.type === 'written') as WrittenQuestion[];
    if (currentWrittenQuestions.length > 0) {
        
        const existingScores = newData.attempt.answers_parsed?.manual_score_map ?? {};
        currentWrittenQuestions.forEach(q => {
            if (q.id !== undefined && q.id !== null) {
                // Initialize with saved score if exists, otherwise null
                manualScores[q.id] = typeof existingScores[q.id] === 'number' ? existingScores[q.id] : null;
                scoreErrors[q.id] = null; // Reset potential errors
            } else {
                 console.warn("Watcher: Question found without a valid ID during score initialization:", q);
            }
        });
        
    } else {
        
    }
  } else if (!loadError.value) {
     
  } else {
      
  }
}, { immediate: true }); // Run immediately to initialize state on load

// --- Computed Properties ---

// All written questions in the quiz
const writtenQuestions = computed<WrittenQuestion[]>(() => {
  return allQuestions.value.filter(q => q.type === 'written') as WrittenQuestion[];
});

// Written questions that *still need* a score entered by the admin
const questionsToGrade = computed<WrittenQuestion[]>(() => {
  if (attemptData.value?.grading_status === 'graded') return []; // Don't require grading if already finalized
  return writtenQuestions.value.filter(q => manualScores[q.id] === null || manualScores[q.id] === undefined);
});

// Total possible points for the entire quiz
const totalPossiblePoints = computed<number>(() => {
  return allQuestions.value.reduce((sum, q) => sum + (q.points ?? 1), 0);
});

// Total points from non-written (auto-graded) questions
const autoGradablePoints = computed<number>(() => {
    return allQuestions.value
        .filter(q => q.type !== 'written')
        .reduce((sum, q) => sum + (q.points ?? 1), 0);
});

// Total points from written (manually graded) questions
const manualGradablePoints = computed<number>(() => {
    return writtenQuestions.value.reduce((sum, q) => sum + (q.points ?? 1), 0);
});


// Dynamically calculates the sum of currently entered valid manual scores
const calculatedManualScore = computed<number>(() => {
    return Object.entries(manualScores).reduce((sum, [key, score]) => {
        // Check if the key corresponds to a written question and the score is valid
        const questionExists = writtenQuestions.value.some(q => q.id.toString() === key);
        if (questionExists && typeof score === 'number' && !isNaN(score) && scoreErrors[key] === null) {
            return sum + score;
        }
        return sum;
    }, 0);
});

// Calculates the potential final score based on auto-score + current valid manual scores
const calculatedFinalScore = computed<number>(() => {
    const autoScore = attemptData.value?.score ?? 0;
    return autoScore + calculatedManualScore.value;
});

// Calculates the percentage based on the dynamic final score
const calculatedPercentage = computed<number>(() => {
    const total = totalPossiblePoints.value;
    if (total <= 0) return 0;
    const percentage = (calculatedFinalScore.value / total) * 100;
    // Round to one decimal place for display
    return Math.round(percentage * 10) / 10;
});

// Determines pass/fail status based on the dynamic percentage
const passStatus = computed<boolean | null>(() => {
    if (!quizData.value || typeof quizData.value.pass_mark_percentage !== 'number') return null;
    return calculatedPercentage.value >= quizData.value.pass_mark_percentage;
});

// Checks if scores have been entered for all questions *that need grading*
const allScoresEnteredForPending = computed<boolean>(() => {
    return questionsToGrade.value.every(q => typeof manualScores[q.id] === 'number');
});

// --- Helper Functions ---

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'; // Use N/A or 'غير محدد'
  try {
      return new Date(dateString).toLocaleString('ar-SA', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true // Example options
      });
   } catch {
      console.warn("Failed to format date:", dateString);
      return dateString; // Fallback to original string if formatting fails
   }
};

const getGradingStatusText = (status: GradingStatus | null | undefined): string => {
     switch (status) {
        case 'pending': return 'قيد المراجعة (آلي)';
        case 'auto_graded': return 'تم التصحيح آليًا';
        case 'pending_manual': return 'يحتاج تصحيحًا يدويًا';
        case 'graded': return 'تم التصحيح بالكامل';
        default: return 'غير معروف';
     }
};

const getStatusBadgeClass = (status: GradingStatus | null | undefined): string => {
  const baseClass = 'px-2.5 py-0.5 rounded-full text-xs font-medium inline-block';
   switch (status) {
    case 'pending_manual': return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700`;
    case 'graded': return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200 border border-green-300 dark:border-green-700`;
    case 'auto_graded': return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 border border-blue-300 dark:border-blue-700`;
    case 'pending': return `${baseClass} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600`;
    default: return `${baseClass} bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400 border border-gray-400 dark:border-gray-500`;
  }
};

const studentAnswerForQuestion = (questionId: string | number): string | null => {
    // Access the parsed answers safely
    return attemptData.value?.answers_parsed?.[questionId] ?? null;
};

// Function to check if a specific question has a score saved in the DB (based on initialization)
const isQuestionGraded = (questionId: string | number): boolean => {
    return typeof attemptData.value?.answers_parsed?.manual_score_map?.[questionId] === 'number';
};


// Renders Markdown and sanitizes the output
const renderMarkdown = (text: string): string => {
    if(!text) return '';
    // Configure marked (optional, defaults are often okay)
    marked.setOptions({
      breaks: true, // Convert single line breaks to <br>
      gfm: true,    // Enable GitHub Flavored Markdown
      // Consider adding a syntax highlighter if needed
    });
    const rawHtml = marked.parse(text);
    // Sanitize the HTML output to prevent XSS attacks, especially if question_text could contain user input
    // Allow basic formatting tags, adjust as needed
    return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
};

// --- Validation ---
const validateScore = (questionId: string | number, maxPoints: number) => {
    const score = manualScores[questionId];

    // Allow null/empty temporarily, validation happens fully on submit attempt
    if (score === null || score === undefined || score === '') {
        scoreErrors[questionId] = null;
        return;
    }

    // Check if it's a valid number
    if (isNaN(score)) {
         scoreErrors[questionId] = `الدرجة يجب أن تكون رقماً.`;
         return;
    }

    // Check range
    if (score < 0 || score > maxPoints) {
        scoreErrors[questionId] = `الدرجة يجب أن تكون بين 0 و ${maxPoints}.`;
        return;
    }

    // Optional: Check step validity (e.g., only allow increments of 0.5)
    // Multiply by 10 and check remainder with 5 to handle floating point inaccuracies
    if ((score * 10) % 5 !== 0) {
         scoreErrors[questionId] = `الدرجة يجب أن تكون بمضاعفات 0.5 (مثل 0, 0.5, 1, 1.5...).`;
         return;
    }

    // If all checks pass, clear the error
    scoreErrors[questionId] = null;
};

// Validates all scores required for submission
const validateAllScoresForSubmit = (): boolean => {
    let isValid = true;
    // Only validate questions that are supposed to be graded in this submission
    writtenQuestions.value.forEach(q => {
        // We only *need* to validate if a score is entered or if it was previously null/invalid
        const score = manualScores[q.id];
        const maxPoints = q.points ?? 1;

        // If the question is still pending grading, it must have a score
        if (questionsToGrade.value.some(pendingQ => pendingQ.id === q.id)) {
            if (score === null || score === undefined || score === '') {
                scoreErrors[q.id] = 'الدرجة مطلوبة لهذا السؤال.';
                isValid = false;
            } else {
                // If a score is entered, run the detailed validation
                validateScore(q.id, maxPoints);
                if (scoreErrors[q.id] !== null) {
                    isValid = false;
                }
            }
        } else {
            // If the question is *not* in questionsToGrade (meaning it has a score already),
            // still run validation in case the user changed it to something invalid.
             if (score !== null && score !== undefined && score !== '') {
                 validateScore(q.id, maxPoints);
                 if (scoreErrors[q.id] !== null) {
                     isValid = false;
                 }
             } else {
                 // This case (already graded but score removed) might need specific handling
                 // depending on desired behavior (allow un-grading?). For now, assume we only submit valid scores.
                 console.warn(`Question ${q.id} was likely graded but score is now empty. Ignoring for submission.`);
                 // Ensure no error is set for this case if we ignore it
                 scoreErrors[q.id] = null;
             }
        }
    });
    return isValid;
};


// --- Form Submission ---
const submitManualGrades = async () => {
  // Ensure essential data is loaded and not already saving
  if (!attemptData.value || !quizData.value || isSaving.value) {
      console.warn("Submission blocked: Missing data or already saving.");
      return;
  }
  // Prevent submission if already fully graded
  if (attemptData.value.grading_status === 'graded') {
      saveError.value = "لا يمكن الإرسال، تم تصحيح هذه المحاولة بالفعل.";
      return;
  }
  // Prevent submission if there are no written questions at all
  if (writtenQuestions.value.length === 0) {
      saveError.value = "لا توجد أسئلة كتابية لتصحيحها في هذا الاختبار.";
      return;
  }

  saveError.value = null; // Clear previous save errors

  // Validate all relevant scores before proceeding
  if (!validateAllScoresForSubmit()) {
    saveError.value = "يرجى مراجعة الدرجات المدخلة وتصحيح الأخطاء المميزة.";
    // Focus the first input field with an error for better UX
    const firstErrorId = Object.keys(scoreErrors).find(key => scoreErrors[key] !== null);
    if (firstErrorId) {
        const element = document.getElementById(`score-${firstErrorId}`);
        element?.focus();
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // Ensure all questions *requiring* grading have scores
  if (!allScoresEnteredForPending.value) {
      saveError.value = "يرجى إدخال درجة لجميع الأسئلة الكتابية التي لم يتم تصحيحها بعد.";
       // Focus the first *pending* input field
       const firstPendingQuestion = questionsToGrade.value[0];
       if(firstPendingQuestion) {
            const element = document.getElementById(`score-${firstPendingQuestion.id}`);
            element?.focus();
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
      return;
  }


  isSaving.value = true;

  try {
      // Use computed properties for final calculations
      const finalManualScore = calculatedManualScore.value;
      const finalTotalScore = calculatedFinalScore.value;
      const finalPassedStatus = passStatus.value ?? false; // Default to false if calculation somehow fails

      // Prepare the map of manual scores for storage, ensuring only valid numbers are included
      const manualScoresMapForStorage: Record<string, number> = {};
      Object.entries(manualScores).forEach(([key, score]) => {
          // Include if it's a valid number score and belongs to a written question
          if (typeof score === 'number' && !isNaN(score) && writtenQuestions.value.some(q => q.id.toString() === key)) {
              manualScoresMapForStorage[key] = score;
          }
      });

      // Ensure we have the latest parsed answers to merge with
      const currentParsedAnswers = attemptData.value.answers_parsed ?? {};

      // Data for Supabase update
      const updateData: Partial<Tables<'quiz_attempts'>> & { answers?: Json } = {
        manual_score: finalManualScore,
        total_score: finalTotalScore,
        grading_status: 'graded', // Mark as fully graded upon successful manual submission
        passed: finalPassedStatus,
        // Record the time of manual grading completion
        // Update the 'answers' JSONB field:
        // Preserve existing answers and merge/overwrite the manual_score_map
        answers: {
          ...currentParsedAnswers, // Spread existing parsed data first
          manual_score_map: manualScoresMapForStorage, // Add/update the manual scores
          // feedback_map: manualFeedback.value // Add feedback map here if implemented
        }
      };

      


        // 1. Update the quiz attempt record
        const { error: updateError } = await supabase
          .from('quiz_attempts')
          .update(updateData)
          .eq('id', attemptData.value!.id) // Use ! because we checked attemptData.value earlier
          .select('id')
          .single(); // Expect a single row update

        if (updateError) {
            throw updateError; // Throw to be caught by the catch block
        }

        

        // ***** START: Notification Logic *****
        // Check again if attemptData and user_id are valid before sending notification
        if (attemptData.value && attemptData.value.user_id) {
            const notificationPayload = {
                user_id: attemptData.value.user_id,
                message: `تم تصحيح اختبارك "${quizData.value?.title ?? 'غير مسمى'}" ويمكنك الآن الاطلاع على النتيجة.`,
                // IMPORTANT: Ensure this link works in your user-facing frontend
                link: `/quizzes/results/${attemptData.value.id}`,
                is_read: false
            };

            const { error: notificationError } = await supabase
                .from('notifications')
                .insert(notificationPayload);

            if (notificationError) {
                console.error("Error creating grading notification:", notificationError);
                // Handle notification error - maybe show a warning, but don't stop the flow
                // Using alert as placeholder - replace with your notification system
                alert("تم حفظ التصحيح بنجاح، لكن فشل إرسال الإشعار للطالب. الخطأ: " + notificationError.message);
            } else {
                
                // Success message including notification
                alert("تم حفظ التصحيح بنجاح وتم إرسال إشعار للطالب."); // Placeholder
            }
        } else {
             console.warn("Could not send notification: attemptData or user_id missing after update success.");
             // Success message without notification confirmation
             alert("تم حفظ التصحيح بنجاح (لم يتم إرسال إشعار - بيانات الطالب مفقودة)."); // Placeholder
        }
        // ***** END: Notification Logic *****


        // Navigate back after successful save and notification attempt
        await navigateTo('/admin/grading');

    } catch (err: any) {
      console.error("Error saving manual grades:", err);
      saveError.value = `فشل حفظ التصحيح: ${err.message || 'حدث خطأ غير متوقع في الاتصال بالخادم.'}`;
      // Consider more specific error handling based on err.code or err.details if needed
      // e.g., check for permission errors (403), network errors, etc.
    } finally {
      isSaving.value = false;
    }
};

// --- Meta Tags ---
useHead({
  // Use a function for dynamic title based on loaded data
  title: computed(() => {
      if (pending.value) return 'جاري تحميل التصحيح...';
      if (attemptData.value) return `تصحيح محاولة #${attemptData.value.id}`;
      return 'تصحيح محاولة';
  }),
  meta: [
      { name: 'description', content: 'صفحة لتصحيح المحاولات الكتابية للاختبارات' }
  ]
});

</script>
<style scoped>
/* Basic Error Box Style */
.error-box {
  @apply p-4 border border-red-300 bg-red-50 text-red-700 rounded-md dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-300;
}
/* Basic Info Box Style (for no written questions etc.) */
.info-box {
    @apply text-center text-gray-500 dark:text-gray-400 py-6 bg-gray-50 dark:bg-gray-800/40 rounded-md border dark:border-gray-700;
}

/* Standard Button Styles */
.button-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out;
}
.button-primary {
  @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out;
}

/* Input Field Style */
.input-field {
   @apply shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-70 disabled:cursor-not-allowed dark:disabled:bg-gray-700/50;
}
/* Remove number input spinners (for cleaner look) */
.input-field[type="number"]::-webkit-inner-spin-button,
.input-field[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.input-field[type="number"] {
  -moz-appearance: textfield; /* Firefox */
}

/* Student Answer Box Styling */
.student-answer-box {
  @apply text-sm border p-3 rounded bg-white dark:bg-gray-700/60 border-gray-300 dark:border-gray-600 shadow-inner;
}

.grading-input-area {
    @apply mt-3;
}

/* Styling for Markdown content using Tailwind Typography plugin */
/* Ensure you have @tailwindcss/typography installed and configured */
.question-text {
    /* Base prose styles handle markdown elements like p, strong, em, ul, ol, li */
    /* Adjust max-width if needed, max-w-none removes width constraint */
    @apply prose prose-sm dark:prose-invert max-w-none;
}
/* Specific overrides if needed, though prose usually handles it */
.question-text :deep(p) {
    @apply mb-2 last:mb-0;
}
.question-text :deep(ul),
.question-text :deep(ol) {
    @apply my-3 ms-4; /* Adjust margin/padding as needed */
}

/* Sticky footer container for save button */
/* Applied directly in the template for simplicity, but could be a class */
/* .sticky-footer {
    @apply sticky bottom-0 bg-gradient-to-t from-white dark:from-gray-900 pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 z-10;
} */
</style>