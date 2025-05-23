<template>
  <div class="container mx-auto px-4 py-8 md:py-12">

    <!-- 1. Loading State (Includes Redirect Check) -->
    <div v-if="pending || isRedirecting" class="text-center py-20">
      <LoadingSpinner class="w-12 h-12 mx-auto text-primary" />
      <p class="mt-4 text-gray-600 dark:text-gray-400">
        {{ isRedirecting ? 'جاري التحقق من المحاولات السابقة...' : 'جارٍ تحميل بيانات الاختبار...' }}
      </p>
    </div>

    <!-- 2. Error State -->
    <div v-else-if="loadError" class="error-display">
      <div class="flex justify-center items-center text-red-600 dark:text-red-400 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
        <h2 class="text-xl font-semibold ms-2">
          {{ loadError.message || 'لا يمكن الوصول للاختبار' }}
        </h2>
      </div>
      <p class="text-sm text-red-700 dark:text-red-300 mb-6">
        {{ loadError.details || 'تعذر تحميل الاختبار المطلوب أو أنك لا تملك الصلاحية اللازمة لبدئه.' }}
      </p>
      <NuxtLink :to="getBackLink()" class="button-secondary">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true"><path fill-rule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.878a.75.75 0 0 1 0 1.5H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.086l-5.5-5.25a.75.75 0 0 1 0-1.086l5.5-5.25a.75.75 0 0 1 1.06.025Z" clip-rule="evenodd" /></svg>
        <span>العودة</span>
      </NuxtLink>
    </div>

    <!-- 3. Quiz Interface -->
    <div v-else-if="quizData.quiz && quizData.questions && quizData.isAuthorized" class="quiz-interface max-w-4xl mx-auto">

      <!-- Quiz Header -->
      <div class="quiz-header">
        <!-- Related Link (Course/Lesson) -->
        <div v-if="quizData.relatedLink" class="related-link-container">
          <NuxtLink :to="quizData.relatedLink.to" class="related-link">
            ← العودة إلى: {{ quizData.relatedLink.text }}
          </NuxtLink>
        </div>
        <!-- Title & Description -->
        <h1 class="quiz-title">{{ quizData.quiz.title }}</h1>
        <p v-if="quizData.quiz.description" class="quiz-description">
          {{ quizData.quiz.description }}
        </p>
      </div>

      <!-- Timer Display (Sticky) -->
      <div v-if="isTimerActive" class="timer-display" :class="{ 'low-time': isTimeLow }">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 inline-block me-1.5 relative -top-px"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
        الوقت المتبقي: <span class="font-semibold tabular-nums">{{ formattedTimeRemaining }}</span>
      </div>

      <!-- Quiz Form -->
      <form @submit.prevent="() => handleSubmitAttempt(false)" class="space-y-6 md:space-y-8">

        <!-- Loop Through Questions -->
        <div v-for="(question, index) in quizData.questions" :key="question.id" class="question-block">
          <div class="question-header">
              <p class="question-number">
                  السؤال {{ index + 1 }} <span class="text-gray-400 dark:text-gray-500">/ {{ quizData.questions.length }}</span>
              </p>
              <span v-if="question.points && question.points > 1" class="question-points">({{ question.points }} نقاط)</span>
              <span v-else class="question-points">(نقطة واحدة)</span>
          </div>

          <!-- Question Text (Rendered Markdown) -->
          <div class="question-text" v-html="renderMarkdown(question.question_text ?? '')"></div>

          <!-- Answer Area -->
          <div class="answer-area">

            <!-- Multiple Choice (MCQ) -->
            <fieldset v-if="question.type === 'mcq'" class="space-y-3">
              <legend class="sr-only">خيارات السؤال {{ index + 1 }}</legend>
              <div v-if="question.question_options && question.question_options.length > 0">
                <label
                  v-for="option in question.question_options"
                  :key="option.id"
                  :for="`option-${option.id}`"
                  class="option-wrapper"
                  :class="{ 'selected-option': userAnswers[question.id] === option.id }"
                >
                  <div class="radio-input-wrapper">
                    <input
                      type="radio"
                      :id="`option-${option.id}`"
                      :name="`question-${question.id}`"
                      :value="option.id"
                      v-model="userAnswers[question.id]"
                      :disabled="isSubmitting"
                      required
                      class="radio-input"
                    />
                  </div>
                  <div class="option-label-wrapper">
                    <span class="option-label">{{ option.option_text }}</span>
                  </div>
                </label>
              </div>
              <p v-else class="text-sm text-red-600 dark:text-red-400 italic">(لا توجد خيارات لهذا السؤال)</p>
            </fieldset>

            <!-- True/False (TF) -->
            <fieldset v-else-if="question.type === 'true_false' || question.type === 'tf'" class="space-y-3">
              <legend class="sr-only">اختر صح أو خطأ للسؤال {{ index + 1 }}</legend>
              <template v-if="question.question_options && question.question_options.length === 2">
                <label
                  v-for="option in question.question_options"
                  :key="option.id"
                  :for="`option-${option.id}`"
                  class="option-wrapper"
                  :class="{ 'selected-option': userAnswers[question.id] === option.id }"
                >
                  <div class="radio-input-wrapper">
                    <input
                      type="radio"
                      :id="`option-${option.id}`"
                      :name="`question-${question.id}`"
                      :value="option.id"
                      v-model="userAnswers[question.id]"
                      :disabled="isSubmitting"
                      required
                      class="radio-input"
                    />
                  </div>
                  <div class="option-label-wrapper">
                    <span class="option-label">{{ option.option_text }}</span>
                  </div>
                </label>
              </template>
              <p v-else class="text-sm text-red-600 dark:text-red-400 italic">
                (خطأ في تكوين السؤال: يجب أن يحتوي سؤال الصح/الخطأ على خيارين بالضبط مُعرفين في قاعدة البيانات)
              </p>
            </fieldset>

            <!-- Written Answer -->
            <div v-else-if="question.type === 'written'">
              <label :for="`written-${question.id}`" class="sr-only">إجابة السؤال {{ index + 1 }}</label>
              <textarea
                :id="`written-${question.id}`"
                rows="5"
                v-model="userAnswers[question.id]"
                :disabled="isSubmitting"
                required
                class="textarea-input"
                placeholder="اكتب إجابتك هنا..."
              ></textarea>
            </div>

            <!-- Unsupported Question Type -->
            <div v-else class="text-sm text-gray-500 dark:text-gray-400 italic">(نوع سؤال غير مدعوم حالياً: {{ question.type }})</div>
          </div>
        </div>

        <!-- Submission Section -->
        <div class="submit-section">
          <p v-if="submitError" class="submit-error">{{ submitError }}</p>
          <button type="submit" :disabled="isSubmitting || !allQuestionsAnswered" class="button-submit">
            <LoadingSpinner v-if="isSubmitting" class="w-5 h-5 me-2 animate-spin" />
            <span>{{ isSubmitting ? 'جارٍ الإرسال...' : 'إرسال الإجابات النهائية' }}</span>
          </button>
          <p v-if="!allQuestionsAnswered && !isSubmitting" class="unanswered-prompt">
            * يرجى الإجابة على جميع الأسئلة قبل الإرسال.
          </p>
        </div>
      </form>
    </div>

    <!-- 4. Fallback: No Data State (after loading finished, no error, not redirecting) -->
    <div v-else-if="!pending && !loadError && !isRedirecting" class="text-center py-10 text-gray-500 dark:text-gray-400">
      لا توجد بيانات لعرضها أو أن الاختبار غير متاح حاليًا.
    </div>
  </div>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed, watch, shallowRef, nextTick, onUnmounted, onMounted } from 'vue';
import { useRoute, useRouter, navigateTo, createError, useError, useHead, showError } from '#app';
import type { Database, Tables, Enums, Json } from '~/types/database.types';
import { useUserStore } from '~/stores/user';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// --- Composables & Store ---
const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient<Database>();
// const user = useSupabaseUser(); // profile.value.id is used instead
const userStore = useUserStore();
const { profile, isLoggedIn } = storeToRefs(userStore);

// --- Constants ---
const LOCAL_STORAGE_TIMER_KEY_PREFIX = 'quizTimer_'; // Prefix for localStorage key

// --- Types ---
type OptionPojo = Pick<Tables<'question_options'>, 'id' | 'question_id' | 'option_text' | 'is_correct' | 'option_order'>;
type QuestionBasePojo = Pick<Tables<'quiz_questions'>, 'id' | 'quiz_id' | 'question_text' | 'type' | 'question_order' | 'points'>;
type QuestionWithOptionsPojo = QuestionBasePojo & { question_options: OptionPojo[] };
type QuizPojo = Pick<Tables<'quizzes'>, 'id' | 'title' | 'description' | 'is_active' | 'course_id' | 'lesson_id' | 'time_limit_minutes' | 'type' | 'pass_mark_percentage'> & {
    course?: Pick<Tables<'study_courses'>, 'id' | 'title'> | null;
    lesson?: Pick<Tables<'lessons'>, 'id' | 'title' | 'course_id'> | null;
};
type RelatedLink = { to: string; text: string } | null;
type QuizTakeData = {
  quiz: QuizPojo | null;
  questions: QuestionWithOptionsPojo[] | null;
  isEnrolled: boolean;
  existingAttemptId: number | null;
  relatedLink: RelatedLink;
  isAuthorized: boolean;
  authFailReason: string;
};
type LoadError = { message: string; details?: string; statusCode?: number };
// Type for timer data stored in localStorage
type TimerStorageData = {
    startTime: number;      // Timestamp when timer was first started
    durationSeconds: number; // Original duration
    userId: string;         // User ID associated with this timer
};

// --- Route Param Validation ---
const quizIdParam = computed<number | null>(() => {
    const rawParam = route.params.id as string;
    if (!rawParam) { return null; }
    const id = parseInt(rawParam, 10);
    if (isNaN(id) || id <= 0) { return null; }
    return id;
});

// --- State ---
const quizData = shallowRef<Partial<QuizTakeData>>({});
const userAnswers = ref<Record<number, number | string | null>>({});
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);
const loadError = ref<LoadError | null>(null);
const isRedirecting = ref(false);

// --- Timer State ---
const timerInterval = ref<NodeJS.Timeout | number | null>(null);
const timeRemainingSeconds = ref(0);
const isTimerActive = ref(false);
// let quizStartTime: number | null = null; // Replaced by logic using localStorage

// --- Timer Functions & Handler ---

/** Generates the localStorage key for the timer data. */
function getTimerStorageKey(quizId: number, userId: string): string {
    return `${LOCAL_STORAGE_TIMER_KEY_PREFIX}${userId}_${quizId}`;
}

/** Clears timer data from localStorage. */
function clearTimerFromStorage(quizId: number, userId: string) {
    if (process.client) {
        const key = getTimerStorageKey(quizId, userId);
        localStorage.removeItem(key);
        
    }
}

/** Saves timer start time and duration to localStorage. */
function saveTimerToStorage(quizId: number, userId: string, durationMinutes: number) {
    if (process.client && durationMinutes > 0) {
        const key = getTimerStorageKey(quizId, userId);
        const data: TimerStorageData = {
            startTime: Date.now(), // Record the exact start moment
            durationSeconds: durationMinutes * 60,
            userId: userId
        };
        localStorage.setItem(key, JSON.stringify(data));
        
    }
}

/** Attempts to initialize and start the timer based on localStorage data. */
function initializeTimerFromStorage(quizId: number, userId: string): boolean {
    if (!process.client) return false; // Can't access localStorage on server

    const key = getTimerStorageKey(quizId, userId);
    const storedDataRaw = localStorage.getItem(key);

    if (storedDataRaw) {
        try {
            const storedData: TimerStorageData = JSON.parse(storedDataRaw);

            // Validate stored data (basic check)
            if (storedData.startTime && storedData.durationSeconds && storedData.userId === userId) {
                const elapsedTimeSeconds = Math.floor((Date.now() - storedData.startTime) / 1000);
                const remaining = storedData.durationSeconds - elapsedTimeSeconds;

                

                if (remaining > 0) {
                    // Start timer with remaining time
                    startTimerInternal(remaining);
                    return true; // Timer resumed successfully
                } else {
                    // Time already expired while user was away
                    
                    timeRemainingSeconds.value = 0; // Ensure UI shows 00:00
                    isTimerActive.value = true; // Briefly set active for UI consistency before submit
                    handleSubmitAttempt(true); // Trigger auto-submission immediately
                    // Don't clear storage here, handleSubmitAttempt will call stopTimer which clears it
                    return true; // Indicate timer logic was handled (even if expired)
                }
            } else {
                 
                 clearTimerFromStorage(quizId, userId); // Clear invalid data
            }
        } catch (e) {
            
            clearTimerFromStorage(quizId, userId); // Clear corrupted data
        }
    }
     
    return false; // No timer resumed
}

/** Handles browser 'beforeunload' event. */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (isTimerActive.value && !isSubmitting.value) {
    const message = 'هل أنت متأكد أنك تريد مغادرة الصفحة؟ سيستمر وقت الاختبار بالعد وقد لا يتم حفظ تقدمك إذا أغلقت الصفحة قبل انتهاء الوقت أو الإرسال.';
    event.preventDefault();
    event.returnValue = message;
    return message;
  }
};

/** Stops the timer interval and removes the 'beforeunload' listener. Does NOT clear localStorage here. */
function stopTimerInterval() {
    if (timerInterval.value) { clearInterval(timerInterval.value as any); timerInterval.value = null; }
    isTimerActive.value = false;
    if (process.client) { window.removeEventListener('beforeunload', handleBeforeUnload); }
    
}

/** Main function to stop the timer, including clearing storage. */
function stopTimerAndClearStorage() {
    stopTimerInterval();
    // Clear storage only if quiz ID and user ID are available
    const currentQuizId = quizData.value.quiz?.id;
    const currentUserId = profile.value?.id;
    if (currentQuizId && currentUserId) {
         clearTimerFromStorage(currentQuizId, currentUserId);
    } else {
        
    }
}


/** Internal function to set up and start the timer interval. */
function startTimerInternal(initialSeconds: number) {
    stopTimerInterval(); // Clear any existing interval first
    if (initialSeconds <= 0) return; // Don't start if time is already zero or less

    timeRemainingSeconds.value = initialSeconds;
    isTimerActive.value = true;
    
    timerInterval.value = setInterval(tickTimer, 1000);
    if (process.client) { window.addEventListener('beforeunload', handleBeforeUnload); }
}


/** Main function called to initiate the timer for a new session. Saves initial state. */
function startNewTimerSession(durationMinutes: number) {
    if (!durationMinutes || durationMinutes <= 0) return;

    const currentQuizId = quizData.value.quiz?.id;
    const currentUserId = profile.value?.id;

    if (currentQuizId && currentUserId && process.client) {
        // Save the *start* of this new session to localStorage
        saveTimerToStorage(currentQuizId, currentUserId, durationMinutes);
        // Start the interval countdown
        startTimerInternal(durationMinutes * 60);
    } else {
         
    }
}

/** Decrements the timer; auto-submits when time runs out. */
function tickTimer() {
    if (timeRemainingSeconds.value > 0) {
        timeRemainingSeconds.value--;
    } else {
        
        stopTimerInterval(); // Stop the interval first
        handleSubmitAttempt(true); // Auto-submit (this will eventually call clear storage)
    }
}

// --- Initial Client-Side Checks ---
onMounted(() => {
    if (!isLoggedIn.value) {
      navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`, { replace: true });
      return;
    }
    if (quizIdParam.value === null) {
      showError({ statusCode: 400, statusMessage: 'معرف اختبار غير صالح.', fatal: true });
    }
});

// --- Data Fetching & Authorization Logic (useAsyncData) ---
const { data, pending, error: asyncDataError, refresh } = await useAsyncData<QuizTakeData>(
    `quizTakeData-${quizIdParam.value}-${profile.value?.id ?? 'guest'}`,
    async () => {
        isRedirecting.value = true;
        loadError.value = null;
        const currentQuizId = quizIdParam.value;
        const currentUser = profile.value;

        // --- Input Validation ---
        if (!currentUser?.id) { throw createError({ statusCode: 401, statusMessage: 'المستخدم غير مسجل الدخول.', fatal: true }); }
        if (currentQuizId === null) { throw createError({ statusCode: 400, statusMessage: 'معرف الاختبار غير صالح.', fatal: true }); }

        

        try {
            // --- Step 1: Check Existing Submitted Attempts ---
            const { data: existingAttempt, error: attemptCheckError } = await supabase
                .from('quiz_attempts').select('id').eq('quiz_id', currentQuizId).eq('user_id', currentUser.id)
                .not('submitted_at', 'is', null).limit(1).maybeSingle();

            if (attemptCheckError) { throw createError({ statusCode: 500, statusMessage: 'فشل التحقق من المحاولات السابقة.' }); }

            const existingAttemptId = existingAttempt?.id ?? null;
            if (existingAttemptId !== null) {
                
                return { quiz: null, questions: null, isEnrolled: false, existingAttemptId, relatedLink: null, isAuthorized: false, authFailReason: 'Attempt exists' };
            }

            // --- Step 2: Fetch Quiz Details ---
             
            const { data: fetchedQuiz, error: quizFetchError } = await supabase
                .from('quizzes').select(`*, course:study_courses(id, title), lesson:lessons(id, title, course_id)`)
                .eq('id', currentQuizId).single();

            if (quizFetchError || !fetchedQuiz) {
                const statusCode = quizFetchError?.code === 'PGRST116' ? 404 : 500;
                const message = statusCode === 404 ? 'الاختبار المطلوب غير موجود.' : 'فشل تحميل بيانات الاختبار.';
                throw createError({ statusCode, statusMessage: message, fatal: true });
            }

            // --- Step 3: Determine Related Link ---
            let relatedLink: RelatedLink = null;
            if (fetchedQuiz.lesson?.id && fetchedQuiz.lesson.course_id) {
                relatedLink = { to: `/study/courses/${fetchedQuiz.lesson.course_id}/lessons/${fetchedQuiz.lesson.id}`, text: `درس: ${fetchedQuiz.lesson.title}` };
            } else if (fetchedQuiz.course?.id) {
                relatedLink = { to: `/study/courses/${fetchedQuiz.course.id}`, text: `دورة: ${fetchedQuiz.course.title}` };
            }

            // --- Step 4: Authorization Checks ---
             
            let isAuthorized = true;
            let authFailReason = '';
            let isEnrolled = true; // Assume true, verify if course-linked

            if (!fetchedQuiz.is_active) {
                authFailReason = 'هذا الاختبار غير نشط حاليًا.'; isAuthorized = false;
            }

            if (fetchedQuiz.course_id && isAuthorized) {
                 
                const { count, error: enrollError } = await supabase
                    .from('course_enrollments').select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUser.id).eq('course_id', fetchedQuiz.course_id);

                if (enrollError) { authFailReason = 'خطأ عند التحقق من الانتساب.'; isAuthorized = false; }
                else {
                    isEnrolled = (count ?? 0) > 0;
                    if (!isEnrolled) { authFailReason = 'يجب الانتساب للدورة المرتبطة أولاً.'; isAuthorized = false; }
                     else {  }
                }
            }

            if (!isAuthorized) { throw createError({ statusCode: 403, statusMessage: authFailReason, fatal: true }); }

            // --- Step 5: Fetch Questions ---
             
            const { data: fetchedQuestionsData, error: questionsFetchError } = await supabase
                .from('quiz_questions').select(`id, quiz_id, question_text, type, question_order, points`)
                .eq('quiz_id', currentQuizId).order('question_order', { ascending: true, nullsFirst: false });

            if (questionsFetchError) { throw createError({ statusCode: 500, statusMessage: 'فشل تحميل أسئلة الاختبار.', details: questionsFetchError.message }); }
            if (!fetchedQuestionsData || fetchedQuestionsData.length === 0) {
                 
                return { quiz: fetchedQuiz as QuizPojo, questions: [], isEnrolled, existingAttemptId: null, relatedLink, isAuthorized: true, authFailReason: '' };
            }

            // --- Step 6: Fetch Options ---
            const questionIds = fetchedQuestionsData.map(q => q.id);
             
            let fetchedOptionsData: OptionPojo[] = [];
            if (questionIds.length > 0) {
                const { data: options, error: optionsFetchError } = await supabase
                    .from('question_options').select(`id, question_id, option_text, is_correct, option_order`)
                    .in('question_id', questionIds).order('option_order', { ascending: true, nullsFirst: false });

                if (optionsFetchError) { throw createError({ statusCode: 500, statusMessage: 'فشل تحميل خيارات الأسئلة.', details: optionsFetchError.message }); }
                fetchedOptionsData = (options || []).map(opt => ({ ...opt }));
            }
             

            // --- Step 7: Map Options to Questions ---
            const optionsMap = new Map<number, OptionPojo[]>();
            fetchedOptionsData.forEach(opt => {
                if (opt.question_id !== null) {
                    const existing = optionsMap.get(opt.question_id) || [];
                    existing.push(opt);
                    optionsMap.set(opt.question_id, existing);
                }
            });

            // --- Step 8: Combine Questions with Options ---
            const questionsWithMappedOptions: QuestionWithOptionsPojo[] = fetchedQuestionsData.map(q => ({
                ...q, question_options: optionsMap.get(q.id) || []
            }));

             // --- Step 9: Prepare Final Data ---
            const sanitizedQuiz: QuizPojo = { ...fetchedQuiz };
             
            return { quiz: sanitizedQuiz, questions: questionsWithMappedOptions, isEnrolled, existingAttemptId: null, relatedLink, isAuthorized: true, authFailReason: '' };

        } catch (err: any) {
            
            const statusCode = err.statusCode || err.code || 500;
            const message = err.data?.message || err.statusMessage || err.message || 'خطأ غير متوقع.';
            const details = err.data?.details || err.details;
            loadError.value = { message, details, statusCode };
            return { quiz: null, questions: null, isEnrolled: false, existingAttemptId: null, relatedLink: null, isAuthorized: false, authFailReason: message };
        } finally {
            isRedirecting.value = false;
             
        }
    },
    { watch: [quizIdParam, () => profile.value?.id] }
);

// --- Watcher for Data Updates, Redirection, State Initialization ---
watch(data, async (newData) => {
    
    stopTimerInterval(); // Stop any existing interval immediately

    // Priority 1: Handle Redirection
    if (newData?.existingAttemptId) {
        if (!isRedirecting.value) {
            isRedirecting.value = true;
            
            await nextTick();
            try {
                await navigateTo(`/quizzes/results/${newData.existingAttemptId}`, { replace: true });
            } catch (navError) {
                
                loadError.value = { message: 'فشل التوجيه لصفحة النتائج.', details: (navError as Error).message };
                isRedirecting.value = false;
            }
        }
        return;
    }

    // Priority 2: Handle Loading Errors
    if (loadError.value) {
      
      quizData.value = {};
      userAnswers.value = {};
      isRedirecting.value = false;
      return;
    }

    // Priority 3: Setup Quiz State
    if (newData?.quiz && newData.questions && newData.isAuthorized) {
        
        quizData.value = newData;

        // Reset answers
        const initialAnswers: Record<number, null> = {};
        (newData.questions || []).forEach(q => { initialAnswers[q.id] = null; });
        userAnswers.value = initialAnswers;

        isSubmitting.value = false;
        submitError.value = null;

        // --- Initialize or Resume Timer ---
        const currentQuizId = newData.quiz.id;
        const currentUserId = profile.value?.id;
        const timeLimit = newData.quiz.time_limit_minutes;

        if (timeLimit && timeLimit > 0 && currentUserId) {
             // Attempt to resume timer from storage first
            const resumed = initializeTimerFromStorage(currentQuizId, currentUserId);
            if (!resumed) {
                 // If not resumed (no valid data in storage), start a new timer session
                 
                 startNewTimerSession(timeLimit);
             }
        } else {
             isTimerActive.value = false; // Ensure timer is off if no time limit
        }

        isRedirecting.value = false;
    }
    // Priority 4: Handle Invalid State
    else if (!pending.value && !isRedirecting.value && !loadError.value) {
         
         loadError.value = { message: 'فشل تحميل الاختبار أو أنك غير مصرح بالدخول.' };
         quizData.value = {};
         userAnswers.value = {};
         isRedirecting.value = false;
    }

}, { immediate: true });

// --- Computed Properties ---

/** Checks if all questions have been answered. */
const allQuestionsAnswered = computed(() => {
    const questions = quizData.value?.questions;
    if (!questions || questions.length === 0) return true;
    return questions.every(q => {
      const answer = userAnswers.value[q.id];
      return answer !== null && answer !== undefined && String(answer).trim() !== '';
    });
});

/** Formats the remaining time in MM:SS. */
const formattedTimeRemaining = computed(() => {
    const minutes = Math.floor(timeRemainingSeconds.value / 60);
    const seconds = timeRemainingSeconds.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

/** Checks if the time remaining is low (e.g., less than 1 minute). */
const isTimeLow = computed(() => isTimerActive.value && timeRemainingSeconds.value < 60);

// --- Helper Functions ---

/** Renders Markdown text to safe HTML. */
const renderMarkdown = (text: string | null | undefined): string => {
  if (!text) return '';
  marked.setOptions({ breaks: true, gfm: true, smartypants: true });
  const dirtyHTML = marked.parse(text);
  if (process.client && typeof window !== 'undefined') {
    return DOMPurify.sanitize(dirtyHTML, { USE_PROFILES: { html: true } });
  }
  return String(dirtyHTML).replace(/<script.*?>.*?<\/script>/gis, '');
};

/** Determines the appropriate back link. */
const getBackLink = (): string => {
  if (quizData.value?.relatedLink?.to) return quizData.value.relatedLink.to;
  if (quizData.value?.quiz?.course_id) return `/study/courses/${quizData.value.quiz.course_id}`;
  return '/study'; // Fallback link
};

// --- Submission Action ---

/** Handles the submission of the quiz attempt. */
async function handleSubmitAttempt(autoSubmitted: boolean = false) {
    if (isSubmitting.value || !quizData.value?.quiz || !profile.value?.id) return;

    // Stop the timer interval BUT DON'T CLEAR STORAGE YET
    // Storage will be cleared upon successful submission or if submission fails definitively.
    stopTimerInterval();

    if (!autoSubmitted && !allQuestionsAnswered.value) {
        submitError.value = `يرجى الإجابة على جميع الأسئلة قبل الإرسال.`;
        // Scroll to first unanswered question (client-side only)
        if (process.client) {
           const firstUnanswered = quizData.value.questions?.find(q => {
              const answer = userAnswers.value[q.id];
              return answer === null || answer === undefined || String(answer).trim() === '';
           });
           if (firstUnanswered) {
               document.querySelector<HTMLElement>(`#written-${firstUnanswered.id}, [name="question-${firstUnanswered.id}"]`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
           }
        }
        // If validation fails, potentially restart the timer *if* it was active
        // This is complex, for now, we just leave it stopped. User needs to fix answers.
        // if (isTimerActive.value) { /* Logic to restart with remaining time if needed */ }
        return;
    }

    isSubmitting.value = true;
    submitError.value = null;
    const currentQuiz = quizData.value.quiz;
    const currentUserId = profile.value.id;
    const needsManualGrading = quizData.value.questions?.some(q => q.type === 'written') ?? false;
    const initialGradingStatus: Enums<'grading_status_enum'> = needsManualGrading ? 'pending_manual' : 'pending';

    const attemptPayload: Omit<Tables<'quiz_attempts'>, 'id' | 'created_at' | 'started_at'> = {
        user_id: currentUserId, quiz_id: currentQuiz.id, submitted_at: new Date().toISOString(),
        answers: userAnswers.value as unknown as Json, attempt_number: 1, // TODO: Handle attempt numbers if needed
        grading_status: initialGradingStatus, score: null, manual_score: null, total_score: null, passed: null,
    };

    

    try {
        const { data: newAttempt, error: insertError } = await supabase
            .from('quiz_attempts').insert(attemptPayload).select('id').single();

        if (insertError) { throw insertError; }
        if (!newAttempt?.id) { throw new Error("لم يتم استلام معرف المحاولة الجديدة بعد الإرسال."); }

        // --- Submission Successful ---
        
        // Clear timer storage ON SUCCESS before navigating away
        clearTimerFromStorage(currentQuiz.id, currentUserId);

        await navigateTo(`/quizzes/results/${newAttempt.id}`, { replace: true });
        // isSubmitting remains true because we are navigating away

    } catch (err: any) {
        
        submitError.value = `فشل إرسال الإجابات: ${err.message || 'خطأ غير متوقع.'}`;
        isSubmitting.value = false; // Re-enable button on failure
        // Decide if timer should be restarted here if it failed? For now, keep it stopped.
        // Clear storage on definitive failure? Maybe not, user might fix and retry.
        // Let's NOT clear storage here, allowing potential resume if user fixes submit issue.
    }
}

// --- Cleanup Logic ---
onUnmounted(() => {
  // Stop the interval and remove listener, but DON'T clear storage
  // This allows resuming if user navigates away and comes back before time expires / submission
  stopTimerInterval();
  
});

// --- SEO Meta Tags ---
watch([() => quizData.value?.quiz, pending, loadError, isRedirecting],
 ([currentQuiz, loadingState, errorState, redirectState]) => {
    let pageTitle = 'الاختبار';
    let description = 'قم بحل أسئلة الاختبار.';

    if (loadingState || redirectState) { pageTitle = 'جارٍ التحميل...'; description = 'يتم الآن تحميل الاختبار أو التحقق.'; }
    else if (errorState || !currentQuiz) { pageTitle = 'خطأ في الاختبار'; description = errorState?.message || 'تعذر الوصول للاختبار.'; }
    else if (currentQuiz) {
      pageTitle = currentQuiz.title ? `اختبار: ${currentQuiz.title}` : 'اختبار بدون عنوان';
      description = currentQuiz.description?.substring(0, 160) || `اختبر معلوماتك مع اختبار "${pageTitle}".`;
    }

    useHead({
      title: pageTitle,
      meta: [{ name: 'description', content: description }]
    });
 },
 { immediate: true }
);
</script>

<style scoped>
/* --- Base & Layout --- */
.container {
    /* Standard container, potentially add max-width if needed */
}
.quiz-interface {
    @apply space-y-6 md:space-y-8; /* Vertical spacing for sections */
}

/* --- Loading & Error --- */
.error-display {
    @apply text-center py-10 px-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-700/30 rounded-lg max-w-lg mx-auto shadow-md;
}
.error-display h2 { @apply text-red-700 dark:text-red-300; }
.error-display p { @apply text-red-600 dark:text-red-400; }

/* --- Quiz Header --- */
.quiz-header {
    @apply mb-6 pb-4 border-b border-gray-200 dark:border-gray-700;
}
.related-link-container {
    @apply text-sm text-center sm:text-right mb-3;
}
.related-link {
     @apply text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150;
}
.quiz-title {
    @apply text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center sm:text-right;
}
.quiz-description {
    @apply text-gray-600 dark:text-gray-400 text-center sm:text-right text-sm md:text-base;
}

/* --- Timer --- */
.timer-display {
    @apply text-center font-medium text-base md:text-lg p-3 mb-6 rounded-md shadow
           bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-800 border border-indigo-200
           dark:from-gray-700 dark:to-gray-800 dark:text-indigo-200 dark:border-indigo-700/40
           sticky top-4 z-20 transition-colors duration-300;
}
.timer-display.low-time {
     /* Style for low time warning */
    @apply !from-red-50 !to-orange-50 !text-red-800 !border-red-200
           dark:!from-red-700/30 dark:!to-orange-700/30 dark:!text-red-200 dark:!border-red-600/40
           animate-pulse; /* Optional pulse effect */
}

/* --- Question Block --- */
.question-block {
    @apply p-5 md:p-6 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 dark:border-gray-700/60 transition-all duration-200 hover:shadow-lg;
}
.question-block:focus-within {
    @apply ring-2 ring-primary-400 dark:ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900;
}
.question-header {
    @apply flex justify-between items-baseline mb-3 pb-2 border-b border-dashed border-gray-200 dark:border-gray-700/50;
}
.question-number {
    @apply text-base font-semibold text-primary-700 dark:text-primary-400;
}
.question-points {
    @apply text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded;
}
.question-text {
    @apply text-base md:text-lg font-normal text-gray-800 dark:text-gray-100 mb-5 leading-relaxed prose prose-sm sm:prose-base dark:prose-invert max-w-none;
}
.question-text :deep(p) { @apply mb-3 last:mb-0; }
.answer-area {
    @apply mt-5 pt-5 border-t border-gray-100 dark:border-gray-700/50;
}

/* --- Options (MCQ/TF) --- */
.option-wrapper {
    @apply relative flex items-start p-3.5 rounded-lg border-2 border-gray-200 dark:border-gray-600/80
           transition-all duration-150 cursor-pointer bg-white dark:bg-gray-700/30
           hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/30 dark:hover:bg-primary-900/10;
}

.option-wrapper.selected-option .option-label {
    @apply text-primary-800 dark:text-primary-100 font-semibold;
}
.radio-input-wrapper { @apply flex items-center h-5 flex-shrink-0; }
.radio-input {
    @apply focus:ring-primary-600 h-4 w-4 text-primary-600 border-gray-400 dark:border-gray-500
           dark:bg-gray-600 dark:checked:bg-primary-500 dark:focus:ring-offset-gray-800
           disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer;
}
.option-label-wrapper { @apply ms-3 text-sm md:text-base flex-grow; }
.option-label { @apply font-medium text-gray-700 dark:text-gray-200; }

/* --- Written Answer Textarea --- */
.textarea-input {
    @apply shadow-sm block w-full text-sm md:text-base rounded-md min-h-[10rem]
           border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700
           text-gray-900 dark:text-gray-100
           placeholder-gray-400 dark:placeholder-gray-500
           focus:ring-primary-500 focus:border-primary-500
           dark:focus:ring-primary-500 dark:focus:border-primary-500
           disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed;
}

/* --- Submission Section --- */
.submit-section {
    @apply pt-6 mt-8 border-t border-gray-200 dark:border-gray-700 text-center space-y-3;
}
.submit-error {
    @apply text-red-600 dark:text-red-400 text-sm font-medium p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600/30 rounded-md;
}
.button-submit {
    @apply inline-flex items-center justify-center px-10 py-3 border border-transparent
           text-base font-medium rounded-md shadow-lg text-white transform transition hover:scale-105
           bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
           dark:focus:ring-offset-gray-900
           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:bg-gradient-to-r disabled:from-gray-500 disabled:to-gray-600;
}
.unanswered-prompt {
     @apply text-xs text-yellow-600 dark:text-yellow-400;
}

/* --- Base Buttons (for Error Block) --- */
.button-base {
    @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm
           focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
           disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150;
}
.button-secondary {
    @apply button-base border-gray-300 dark:border-gray-600
           text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700
           hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-primary-500;
}

/* --- General Focus Visible --- */
*:focus-visible {
    outline: 2px solid theme('colors.primary.500'); outline-offset: 2px;
}

/* --- Markdown Content Styles --- */
.question-text :deep(strong) { @apply font-semibold text-gray-900 dark:text-gray-50; }
.question-text :deep(em) { @apply italic; }
.question-text :deep(ul), .question-text :deep(ol) { @apply my-4 ms-6 list-outside space-y-1.5; }
/* Removed specific li styling, rely on prose defaults */
.question-text :deep(a) { @apply text-primary-600 dark:text-primary-400 hover:underline font-medium; }
.question-text :deep(code):not(pre code) {
    @apply px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-red-600 dark:text-red-400;
}
.question-text :deep(pre) {
    @apply bg-gray-800 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm my-4 shadow-inner;
}
.question-text :deep(pre code) {
    @apply bg-transparent text-gray-200 dark:text-gray-300 p-0 font-mono text-sm;
}
.question-text :deep(blockquote) {
    @apply border-s-4 border-gray-300 dark:border-gray-500 ps-4 my-4 text-gray-600 dark:text-gray-400 italic;
}
.question-text :deep(hr) {
    @apply my-6 border-gray-200 dark:border-gray-700;
}
</style>