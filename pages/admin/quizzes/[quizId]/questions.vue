<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Loading State for Initial Data -->
    <div v-if="pendingQuiz || pendingQuestions" class="text-center py-10">
      <LoadingSpinner />
      <p class="mt-2 text-gray-500 dark:text-gray-400">جارٍ تحميل بيانات الاختبار والأسئلة...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="fetchErrorQuiz || fetchErrorQuestions" class="my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <strong class="font-bold">خطأ!</strong>
      <p>حدث خطأ أثناء تحميل البيانات:</p>
      <ul class="list-disc list-inside mt-1 text-sm">
        <li v-if="fetchErrorQuiz">فشل تحميل بيانات الاختبار: {{ fetchErrorQuiz.message }}</li>
        <li v-if="fetchErrorQuestions">فشل تحميل الأسئلة: {{ fetchErrorQuestions.message }}</li>
      </ul>
       <NuxtLink to="/admin/quizzes" class="mt-3 inline-block text-indigo-600 hover:underline">العودة لقائمة الاختبارات</NuxtLink>
    </div>

     <!-- Not Found State -->
     <div v-else-if="!quiz" class="my-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-center">
        لم يتم العثور على الاختبار المطلوب (ID: {{ quizId }}).
        <NuxtLink to="/admin/quizzes" class="mt-3 block text-indigo-600 hover:underline">العودة لقائمة الاختبارات</NuxtLink>
     </div>

    <!-- Main Content Area -->
    <div v-else>
      <!-- Header: Quiz Title and Add Question Button -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 pb-4 border-b dark:border-gray-700">
        <div>
            <NuxtLink to="/admin/quizzes" class="text-sm text-gray-500 dark:text-gray-400 hover:underline flex items-center gap-1 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25H13.25A.75.75 0 0 1 14 8Z" clip-rule="evenodd" /></svg>
                <span>الاختبارات</span>
            </NuxtLink>
            <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">إدارة أسئلة الاختبار: {{ quiz.title }}</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ formatQuizType(quiz.type) }}
                 <span v-if="quiz.type === 'lesson'"> للدرس: {{ quiz.lessons?.title }}</span>
                 <span v-if="quiz.type === 'module'"> للوحدة {{quiz.module_number}} في دورة: {{ quiz.study_courses?.title }}</span>
                 <span v-if="quiz.type === 'final'"> لدورة: {{ quiz.study_courses?.title }}</span>
            </p>
        </div>
        <button
          @click="openAddQuestionModal"
          class="flex-shrink-0 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 -ml-1 mr-2 rtl:ml-2 rtl:-mr-1"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z" clip-rule="evenodd" /></svg>
          إضافة سؤال جديد
        </button>
      </div>

       <!-- Action Feedback Messages -->
       <div v-if="actionMessage" :class="['mb-4 p-3 border rounded text-sm', actionMessageType === 'success' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700']">
           {{ actionMessage }}
       </div>

      <!-- Questions List -->
      <div v-if="questions && questions.length > 0" class="space-y-4">
          <div v-for="(question, index) in questions" :key="question.id" class="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div class="flex-1 min-w-0">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    السؤال {{ index + 1 }} ({{ formatQuestionType(question.type) }} - {{ question.points }} {{ question.points === 1 ? 'نقطة' : 'نقاط' }})
                </p>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 break-words mb-2">{{ question.question_text }}</p>
               
                 <div v-if="(question.type === 'mcq' || question.type === 'true_false') && question.question_options && question.question_options.length > 0" class="mt-2 space-y-1 text-xs pl-4 rtl:pr-4 border-t dark:border-gray-700 pt-2">
                     <h5 class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">الخيارات:</h5>
                     <div v-for="option in question.question_options" :key="option.id" :class="['flex items-center gap-2', option.is_correct ? 'text-green-700 dark:text-green-300 font-medium' : 'text-gray-600 dark:text-gray-400']">
                      
                         <span class="flex-shrink-0 w-3 h-3">
                            <svg v-if="option.is_correct" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.35 2.35 4.492-6.738a.75.75 0 0 1 1.04-.208Z" clip-rule="evenodd" /></svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14Zm2.78-4.22a.75.75 0 0 0-1.06-1.06L8 11.44l-1.72-1.72a.75.75 0 0 0-1.06 1.06L6.94 12.5l-1.72 1.72a.75.75 0 1 0 1.06 1.06L8 13.56l1.72 1.72a.75.75 0 1 0 1.06-1.06L9.06 12.5l1.72-1.72Z" /></svg>
                         </span>
                         <span>{{ option.option_text }}</span>
                     </div>
                 </div>
              </div>
         
              <div class="flex-shrink-0 flex flex-col sm:flex-row gap-2 items-end sm:items-center mt-2 sm:mt-0">
                <button @click="openEditQuestionModal(question)" class="text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3"><path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774v2.475h2.475l4.263-4.262a1.75 1.75 0 0 0 0-2.474Z" /><path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9.81a.75.75 0 0 0-1.5 0v1.44c0 .138-.112.25-.25.25h-6.5a.25.25 0 0 1-.25-.25v-6.5c0-.138.112-.25.25-.25h1.44a.75.75 0 0 0 0-1.5H4.75Z" /></svg>
                    <span>تعديل</span>
                </button>
                <button @click="confirmDeleteQuestion(question)" class="text-xs text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3"><path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.5-.75v.75h1V2.5h-1Z" clip-rule="evenodd" /></svg>
                    <span>حذف</span>
                </button>
              </div>
          </div>
      </div>
       <div v-else-if="!pendingQuestions" class="text-center py-10 text-gray-500 dark:text-gray-400">
           لم يتم إضافة أي أسئلة لهذا الاختبار بعد.
           <button @click="openAddQuestionModal" class="ml-2 text-indigo-600 hover:underline">إضافة أول سؤال</button>
       </div>

       <!-- Add/Edit Question Modal -->
       <AdminAddEditQuestionModal
            v-model="showQuestionModal"
            :quiz-id="quizIdNumber"
            :question-data="selectedQuestionForEdit"
            @saved="handleQuestionSaved"
       />

        <!-- Confirmation Modal for Question Delete -->
       <AdminConfirmationModal
         v-model="showDeleteQuestionConfirm"
         :config="deleteQuestionConfirmConfig"
         @confirm="deleteQuestion"
         @close="questionToDelete = null"
     />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
// Use Auto-import for Modals and Components
// import AdminAddEditQuestionModal from '~/components/admin/AddEditQuestionModal.vue'; // Auto-imported likely
// import AdminConfirmationModal from '~/components/admin/ConfirmationModal.vue'; // Auto-imported likely
import { type ConfirmationConfig } from '~/components/admin/ConfirmationModal.vue'; // Still need type
import { useSupabaseClient, definePageMeta, useNuxtApp, useRoute, navigateTo } from '#imports';
import type { PostgrestError } from '@supabase/supabase-js';

// --- Define Types ---
type QuizView = Tables<'quizzes'> & {
  lessons?: Pick<Tables<'lessons'>, 'title'> | null;
  study_courses?: Pick<Tables<'study_courses'>, 'title'> | null;
};
type QuestionOption = Tables<'question_options'>; // Define Option type
type QuestionView = Tables<'quiz_questions'> & {
    question_options?: QuestionOption[]; // Use defined Option type
};

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const { $toast } = useNuxtApp();
const route = useRoute();
const quizId = computed(() => route.params.quizId as string);
// Validate quizId is a number early
const quizIdNumber = computed(() => {
    const id = parseInt(quizId.value, 10);
    return isNaN(id) ? null : id;
});

// --- State ---
const pendingQuiz = ref(true);
const pendingQuestions = ref(true);
const fetchErrorQuiz = ref<PostgrestError | { message: string } | null>(null); // Allow custom error message
const fetchErrorQuestions = ref<PostgrestError | { message: string } | null>(null);
const quiz = ref<QuizView | null>(null);
const questions = ref<QuestionView[]>([]);

// Modal State
const showQuestionModal = ref(false);
const selectedQuestionForEdit = ref<QuestionView | null>(null);
const showDeleteQuestionConfirm = ref(false);
const questionToDelete = ref<QuestionView | null>(null);
const deleteQuestionConfirmConfig = ref<ConfirmationConfig | null>(null);

// Action Feedback
const actionMessage = ref<string | null>(null);
const actionMessageType = ref<'success' | 'error'>('success');

// --- Fetch Data ---
const fetchQuizDetails = async () => {
  pendingQuiz.value = true; fetchErrorQuiz.value = null; quiz.value = null;
  if (quizIdNumber.value === null) {
    fetchErrorQuiz.value = { message: 'معرف الاختبار في الرابط غير صالح.' }; pendingQuiz.value = false; return;
  }
  try {
    const { data, error } = await supabase.from('quizzes').select(`*, lessons (title), study_courses (title)`).eq('id', quizIdNumber.value).single();
    if (error) throw error; if (!data) throw new Error('لم يتم العثور على الاختبار.'); quiz.value = data as QuizView;
  } catch (err: any) { console.error("Error fetching quiz details:", err); fetchErrorQuiz.value = (err as PostgrestError) ?? { message: 'خطأ غير معروف.' };
  } finally { pendingQuiz.value = false; }
};

const fetchQuestions = async () => {
  pendingQuestions.value = true; fetchErrorQuestions.value = null; questions.value = [];
  if (quizIdNumber.value === null) {
     fetchErrorQuestions.value = { message: 'معرف الاختبار غير صالح لتحميل الأسئلة.' }; pendingQuestions.value = false; return;
  }
  try {
     const { data, error } = await supabase.from('quiz_questions').select(`*, question_options (*)`).eq('quiz_id', quizIdNumber.value).order('question_order', { ascending: true, nulls: 'last' }).order('created_at', { ascending: true });
     if (error) throw error; questions.value = (data || []) as QuestionView[];
  } catch (err: any) { console.error("Error fetching questions:", err); fetchErrorQuestions.value = err as PostgrestError;
  } finally { pendingQuestions.value = false; }
};

// --- Modal Handling ---
const openAddQuestionModal = () => { selectedQuestionForEdit.value = null; showQuestionModal.value = true; };
const openEditQuestionModal = (question: QuestionView) => { selectedQuestionForEdit.value = { ...question, question_options: [...(question.question_options ?? [])] }; showQuestionModal.value = true; }; // Deep copy options
const handleQuestionSaved = (savedQuestion: QuestionView) => {
    showToast('تم حفظ السؤال بنجاح!', 'success'); showQuestionModal.value = false; refreshQuestions();
};

// --- Delete Handling ---
const confirmDeleteQuestion = (question: QuestionView) => {
    questionToDelete.value = question;
    deleteQuestionConfirmConfig.value = { /* ... as before ... */
        title: 'تأكيد حذف السؤال', message: `هل أنت متأكد من حذف السؤال: "${question.question_text.substring(0, 50)}..."؟ سيتم حذف خياراته أيضًا.`, confirmText: 'نعم، حذف السؤال', confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500', cancelText: 'إلغاء'
    }; showDeleteQuestionConfirm.value = true;
};
const deleteQuestion = async () => {
    if (!questionToDelete.value) return;
    const idToDelete = questionToDelete.value.id; const textToDelete = questionToDelete.value.question_text.substring(0, 30);
    try {
        const { error } = await supabase.from('quiz_questions').delete().eq('id', idToDelete); if (error) throw error;
        questions.value = questions.value.filter(q => q.id !== idToDelete); showToast(`تم حذف السؤال "${textToDelete}..." بنجاح.`, 'success');
    } catch (err: any) { console.error("Error deleting question:", err); showActionMessage(`فشل حذف السؤال: ${err.message}`, 'error');
    } finally { questionToDelete.value = null; showDeleteQuestionConfirm.value = false; }
};

// --- Helper Functions ---
const formatDate = (dateString: string | null | undefined): string => { if (!dateString) return '--'; try { const d=new Date(dateString); return d.toLocaleString('ar-EG',{dateStyle:'short',timeStyle:'short'})} catch{return '!'}};
const formatQuizType = (type: string | null | undefined): string => { switch (type) { case 'lesson': return 'اختبار درس'; case 'module': return 'اختبار وحدة'; case 'final': return 'اختبار نهائي'; case 'practice': return 'اختبار تدريبي'; default: return 'غير محدد'; }};
const formatQuestionType = (type: string | null | undefined): string => { switch (type) { case 'mcq': return 'اختيار من متعدد'; case 'true_false': return 'صح / خطأ'; case 'written': return 'كتابي'; default: return 'غير محدد'; }};
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => { if ($toast?.[type]) $toast[type](message); else console.log(`[${type.toUpperCase()}] ${message}`); };
const showActionMessage = (msg: string, type: 'success' | 'error') => { actionMessage.value = msg; actionMessageType.value = type; setTimeout(() => { actionMessage.value = null; }, 5000); };
const clearActionMessage = () => { actionMessage.value = null; };
const refreshQuestions = () => { fetchQuestions(); };

// --- Lifecycle Hooks & Watchers ---
onMounted(() => { if (quizIdNumber.value !== null) { fetchQuizDetails(); fetchQuestions(); } else { fetchErrorQuiz.value = { message: 'معرف الاختبار في الرابط غير صالح.' }; pendingQuiz.value = false; pendingQuestions.value = false; } });
watch(quizIdNumber, (newId) => { if (newId !== null) { fetchQuizDetails(); fetchQuestions(); } });

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 3px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.8); }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.whitespace-pre-wrap { white-space: pre-wrap; word-wrap: break-word; }
.break-words { word-break: break-word; }
</style>