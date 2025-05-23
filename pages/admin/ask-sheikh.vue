<!-- pages/admin/ask-sheikh.vue -->
<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">إدارة أسئلة المستخدمين (اسأل الشيخ)</h1>

    <!-- Filters, Search, and Actions Row -->
    <div class="mb-6 flex flex-wrap gap-4 items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-gray-700">
      <!-- Filter by Status -->
      <div class="flex items-center gap-2">
        <label for="filter-status" class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">الحالة:</label>
        <select
          id="filter-status"
          v-model="filterStatus"
          :disabled="pending"
          class="block w-full sm:w-36 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70"
        >
          <option value="pending">المعلقة</option>
          <option value="answered">المجابة</option>
          <option value="all">الكل</option>
        </select>
      </div>

      <!-- Search Input -->
      <div class="flex items-center gap-2 flex-grow min-w-[200px]">
         <label for="search-term" class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">بحث:</label>
        <input
          id="search-term"
          type="text"
          v-model="searchTerm"
          :disabled="pending"
          placeholder="ابحث في نص السؤال..."
          @input="handleSearchInput"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-70"
        />
         <button v-if="searchTerm" @click="clearSearch" :disabled="pending" class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 1.06L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.78Z" clip-rule="evenodd" /></svg>
         </button>
      </div>

       <!-- Sort Order -->
      <div class="flex items-center gap-2">
        <label for="sort-order" class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">ترتيب:</label>
        <select
          id="sort-order"
          v-model="sortOrder"
          :disabled="pending"
          class="block w-full sm:w-36 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70"
        >
          <option value="asc">الأقدم أولاً</option>
          <option value="desc">الأحدث أولاً</option>
        </select>
      </div>

      <!-- Refresh Button -->
      <button
        @click="() => fetchQuestions(1)"
        :disabled="pending"
        title="تحديث القائمة"
        class="px-3 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" :class="['w-4 h-4', pending ? 'animate-spin' : '']">
          <path fill-rule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V5.562l-2.504 2.503a.75.75 0 0 1-1.06 0l-.47-.47a.75.75 0 0 1 0-1.061l2.503-2.503h-.938a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75Zm-2.161 7.899L9.172 7.872a.75.75 0 0 0-1.06 0l-.47.47a.75.75 0 0 0 0 1.061l2.504 2.503v.938a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75ZM2.75 4.25a.75.75 0 0 0 0 1.5h.938l2.503 2.504a.75.75 0 0 0 0 1.06l.47.471a.75.75 0 0 0 1.06 0l2.504-2.504v.938a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0 0 1.5h.938l-2.503 2.504a.75.75 0 0 1-1.06 0l-.47-.471a.75.75 0 0 1 0-1.06L6.188 5.75h.938a.75.75 0 0 0 0-1.5H2.75Z" clip-rule="evenodd" />
        </svg>
        <span class="hidden sm:inline">تحديث</span>
      </button>
    </div>

     <!-- Status Messages -->
     <div v-if="successMessage" class="my-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded text-sm transition-opacity duration-300 ease-out"> {{ successMessage }} </div>
     <div v-if="actionError || replyError" class="my-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm transition-opacity duration-300 ease-out"> {{ actionError || replyError }} </div>
     <div v-if="fetchError" class="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
      <strong class="font-bold">خطأ!</strong>
      <span class="block sm:inline"> حدث خطأ أثناء جلب الأسئلة. الرجاء المحاولة مرة أخرى. ({{ fetchError.message }})</span>
    </div>

    <!-- Loading State for List -->
    <div v-if="pending && !questions" class="text-center py-10">
      <LoadingSpinner />
      <p class="mt-2 text-gray-500 dark:text-gray-400">جارٍ تحميل الأسئلة...</p>
    </div>

    <!-- Main Layout: List and Detail/Reply View -->
    <div v-else class="flex flex-col md:flex-row gap-6">

      <!-- Questions List & Pagination -->
      <div class="w-full md:w-2/5 lg:w-1/3 flex-shrink-0 flex flex-col">
         <div class="flex justify-between items-center mb-3">
             <h2 class="text-lg font-semibold text-gray-600 dark:text-gray-300">
                 قائمة الأسئلة ({{ totalQuestions }})
             </h2>
              <!-- Loading indicator for list updates -->
              <LoadingSpinner v-if="pending" class="w-4 h-4 text-indigo-500" />
         </div>
        <div class="flex-grow space-y-1 overflow-y-auto border dark:border-gray-700 rounded-md p-1 bg-white dark:bg-gray-800 shadow-sm min-h-[300px] max-h-[70vh]" ref="questionListContainer">
          <template v-if="questions && questions.length > 0">
            <button
              v-for="q in questions"
              :key="q.id"
              @click="selectQuestion(q)"
              class="block w-full text-right p-3 rounded-md transition-all duration-150 text-sm border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"
              :class="[
                selectedQuestion?.id === q.id
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-1 ring-indigo-500 shadow-inner'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700',
                q.is_answered ? 'opacity-80' : 'opacity-100' // Slightly dim answered questions
              ]"
            >
              <p class="font-medium text-gray-800 dark:text-gray-100 truncate" :class="{'!font-semibold': !q.is_answered}">{{ q.profiles?.full_name || `مستخدم غير مسجل` }}</p>
              <p class="text-gray-600 dark:text-gray-400 truncate text-xs mt-1">{{ q.question_text }}</p>
              <div class="flex justify-between items-center mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                <span>{{ formatDate(q.submitted_at) }}</span>
                <span v-if="q.is_answered" class="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 rounded-full text-xs font-medium">مجاب</span>
                <span v-else class="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-full text-xs font-medium">معلق</span>
              </div>
            </button>
          </template>
          <p v-else-if="!pending" class="text-sm text-center text-gray-500 dark:text-gray-400 mt-8 px-4 italic">
            {{ searchTerm ? 'لا توجد أسئلة تطابق بحثك.' : 'لا توجد أسئلة تطابق الفلتر الحالي.' }}
          </p>
           <!-- Skeleton Loader while pending -->
          <div v-if="pending && !questions?.length" class="space-y-2 p-2">
            <div v-for="i in 5" :key="i" class="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-md"></div>
          </div>
        </div>

        <!-- Pagination Controls -->
       <div v-if="totalPages > 1" class="mt-4 flex justify-center items-center space-x-2 rtl:space-x-reverse border-t dark:border-gray-700 pt-3">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1 || pending"
            class="px-3 py-1 text-sm rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
           >
            السابق
          </button>
          <span class="text-sm text-gray-700 dark:text-gray-300">
            صفحة {{ currentPage }} من {{ totalPages }}
          </span>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages || pending"
            class="px-3 py-1 text-sm rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
           >
            التالي
          </button>
       </div>
      </div>

      <!-- Question Detail and Reply Area -->
      <div class="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow relative">
         <!-- Loading overlay for reply area -->
         <div v-if="isSubmitting" class="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10 rounded-lg">
             <LoadingSpinner class="w-8 h-8 text-indigo-600" />
         </div>
        <div v-if="selectedQuestion">
          <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-3">تفاصيل السؤال والرد</h2>

          <!-- Question Details -->
          <div class="mb-6 space-y-3 text-sm">
             <p><strong class="font-medium text-gray-700 dark:text-gray-300">السائل:</strong> {{ selectedQuestion.profiles?.full_name || 'غير معروف' }}</p>
             <p><strong class="font-medium text-gray-700 dark:text-gray-300">تاريخ الإرسال:</strong> {{ formatDate(selectedQuestion.submitted_at) }}</p>
             <div class="mt-3">
                <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">نص السؤال:</p>
                <p class="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 p-3 rounded border dark:border-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto">{{ selectedQuestion.question_text }}</p>
             </div>
          </div>

          <!-- Reply Form -->
          <form @submit.prevent="submitReply">
            <div class="mb-4">
              <label for="answer_text" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نص الإجابة *</label>
              <textarea
                id="answer_text"
                v-model="replyForm.answer_text"
                rows="8"
                required
                placeholder="اكتب ردك هنا..."
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70"
                :disabled="isSubmitting"
              ></textarea>
              <p v-if="replyError" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ replyError }}</p>
            </div>

            <!-- Category Select Field -->
            <div class="mb-4">
              <label for="reply-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">تصنيف السؤال (اختياري)</label>
              <div v-if="isLoadingCategories" class="mt-1 text-sm text-gray-500">جار تحميل التصنيفات...</div>
              <select
                v-else
                id="reply-category"
                v-model="replyForm.category_id"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70"
                :disabled="isSubmitting"
              >
                <option :value="null">-- بدون تصنيف --</option>
                <template v-if="categories && categories.length > 0">
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </template>
                <option v-else disabled>-- لا توجد تصنيفات متاحة --</option>
              </select>
            </div>

            <!-- Publishing Options -->
            <div class="mb-6 space-y-2">
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">خيارات النشر:</label>
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-x-6 gap-y-2">
                    <div class="flex items-center">
                        <input id="is_public" type="checkbox" v-model="replyForm.is_public" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" :disabled="isSubmitting">
                        <label for="is_public" class="ms-2 block text-sm text-gray-900 dark:text-gray-300">نشر الإجابة للعامة</label>
                    </div>
                     <div class="flex items-center">
                         <input id="send_private" type="checkbox" v-model="replyForm.send_private" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" :disabled="isSubmitting">
                         <label for="send_private" class="ms-2 block text-sm text-gray-900 dark:text-gray-300">إرسال رد خاص للسائل</label>
                     </div>
                </div>
                <p v-if="!replyForm.is_public && !replyForm.send_private" class="mt-2 text-xs text-yellow-600 dark:text-yellow-400">تنبيه: يجب اختيار خيار واحد على الأقل (نشر عام أو إرسال خاص).</p>
            </div>

            <!-- Submit Button Area -->
            <div class="flex justify-end border-t dark:border-gray-700 pt-4">
              <button
                type="submit"
                :disabled="isSubmitting || (!replyForm.is_public && !replyForm.send_private) || !replyForm.answer_text.trim()"
                class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <LoadingSpinner v-if="isSubmitting" class="w-5 h-5 text-white -ms-1 me-2" />
                <span>{{ isSubmitting ? 'جاري الإرسال...' : 'إرسال الرد' }}</span>
              </button>
            </div>
          </form>

        </div>
        <!-- Placeholder when no question is selected -->
        <div v-else class="text-center py-16 text-gray-500 dark:text-gray-400">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-4 text-gray-400">
             <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
           </svg>
           <p>الرجاء اختيار سؤال من القائمة لعرض تفاصيله والرد عليه.</p>
           <p v-if="!pending && questions && questions.length === 0" class="mt-2 text-sm">(لا توجد أسئلة لعرضها بناءً على الفلاتر الحالية)</p>
        </div>
      </div>

    </div> <!-- End Flex Layout -->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive, nextTick } from 'vue';
import type { Database, Tables, Enums } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import { useSupabaseClient, definePageMeta } from '#imports';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

// --- Constants ---
const ADMIN_PAGE_SIZE = 15; // Number of questions per page in admin panel
const SEARCH_DEBOUNCE_MS = 400; // Delay for search input

// --- Define Types ---
type QuestionCategory = Tables<'question_categories'>;
type Question = Tables<'questions_to_sheikh'> & {
  profiles: Pick<Tables<'profiles'>, 'full_name'> | null;
};

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });

// --- Composables ---
const supabase = useSupabaseClient<Database>() as SupabaseClient<Database>; // Ensure correct typing

// --- State ---

// List Loading & Data
const pending = ref(true); // Indicates list or categories are loading
const fetchError = ref<PostgrestError | null>(null); // For list fetch errors
const questions = ref<Question[] | null>(null); // Holds the list of questions for the current page
const totalQuestions = ref(0); // Total questions matching the current filter/search

// Filters & Sorting
const filterStatus = ref<Enums<'question_status_enum'> | 'all'>('pending'); // Filter state ('pending', 'answered', 'all')
const sortOrder = ref<'asc' | 'desc'>('asc'); // Sort order for submitted_at
const searchTerm = ref(''); // Search term state
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null; // For debouncing search input

// Categories
const categories = ref<QuestionCategory[]>([]); // State for categories
const isLoadingCategories = ref(true); // State for category loading (usually only once)

// Pagination
const currentPage = ref(1);
const pageSize = ref(ADMIN_PAGE_SIZE);

// Selection & Reply
const selectedQuestion = ref<Question | null>(null); // Holds the currently selected question
const isSubmitting = ref(false); // For reply submission loading state
const replyError = ref<string | null>(null); // For reply submission errors (validation or API)
const successMessage = ref<string | null>(null); // For general success feedback
const actionError = ref<string | null>(null); // For errors during actions (like failing to send private message)

// UI Refs
const questionListContainer = ref<HTMLElement | null>(null); // Ref for scrolling list

// Reply Form State
const replyForm = reactive({
    answer_text: '',
    is_public: false,
    send_private: true, // Default to sending private message
    category_id: null as number | null // For selected category ID
});

// --- Computed Properties ---
const totalPages = computed(() => {
  if (totalQuestions.value === 0) return 1;
  return Math.ceil(totalQuestions.value / pageSize.value);
});

// --- Functions ---

/** Debounced search handler */
const handleSearchInput = () => {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
    searchDebounceTimer = setTimeout(() => {
        // Trigger fetch only if search term actually changed perspective (trimmed)
        // The watch effect on searchTerm will handle the fetch
        if (currentPage.value !== 1) {
            currentPage.value = 1; // Reset to first page on new search
        } else {
            // If already on page 1, trigger fetch directly via watch
            fetchQuestions(1);
        }
    }, SEARCH_DEBOUNCE_MS);
};

/** Clear search term and refetch */
const clearSearch = () => {
    searchTerm.value = '';
    // The watch effect on searchTerm will reset page and refetch
};


/** Fetch questions based on current filters, search, sort, and pagination */
const fetchQuestions = async (page = currentPage.value) => {
  pending.value = true;
  fetchError.value = null;
  // Don't clear selectedQuestion here, allow viewing while list updates unless filter changes
  clearMessages(false); // Clear messages but keep potential replyError

  const rangeFrom = (page - 1) * pageSize.value;
  const rangeTo = rangeFrom + pageSize.value - 1;

  try {
    // --- Fetch Categories (only if needed) ---
    if (categories.value.length === 0 && isLoadingCategories.value) {
      const { data: catData, error: catError } = await supabase
        .from('question_categories')
        .select('id, name')
        .order('name');
      if (catError) {
        
        setActionError('فشل تحميل تصنيفات الأسئلة.'); // Inform user
      } else {
        categories.value = catData || [];
      }
      isLoadingCategories.value = false; // Mark as attempted
    }

    // --- Build Questions Query ---
    let query = supabase
      .from('questions_to_sheikh')
      .select(`
        id, user_id, question_text, submitted_at, is_answered, is_public,
        answer_text, category_id, answered_at,
        profiles ( full_name )
      `, { count: 'exact' }) // Request total count
      .order('submitted_at', { ascending: sortOrder.value === 'asc' })
      .range(rangeFrom, rangeTo);

    // Apply status filter
    if (filterStatus.value !== 'all') {
        const isAnsweredFilter = filterStatus.value === 'answered';
        query = query.eq('is_answered', isAnsweredFilter);
    }

    // Apply search filter (on question_text)
    const trimmedSearch = searchTerm.value.trim();
    if (trimmedSearch) {
        // Use ilike for case-insensitive search. Adjust if full-text search is set up.
        query = query.ilike('question_text', `%${trimmedSearch}%`);
    }

    // --- Execute Query ---
    const { data, error, count } = await query;

    if (error) throw error;

    questions.value = (data || []) as Question[];
    totalQuestions.value = count ?? 0;
    currentPage.value = page; // Update current page state

    // Auto-scroll list to top after fetching new page/filter results
    await nextTick();
    questionListContainer.value?.scrollTo({ top: 0, behavior: 'smooth' });

    // If current page becomes invalid after fetch (e.g., > totalPages), go to last page
     if (page > totalPages.value && totalPages.value > 0) {
        changePage(totalPages.value); // This will trigger another fetch via watch
     }


  } catch (err: any) {
    
    fetchError.value = err as PostgrestError;
    questions.value = null; // Clear questions on error
    totalQuestions.value = 0;
  } finally {
    pending.value = false;
  }
};

/** Change page and trigger fetch */
const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value && newPage !== currentPage.value && !pending.value) {
    // The watch effect on currentPage will trigger fetchQuestions
    currentPage.value = newPage;
  }
}

/** Select a question, reset form, and clear errors */
const selectQuestion = (question: Question) => {
    selectedQuestion.value = question;
    replyForm.answer_text = question.answer_text || '';
    replyForm.is_public = question.is_public || false;
    // Default send_private: true if not answered, or if answered but *not* public
    replyForm.send_private = !question.answered_at || !question.is_public;
    replyForm.category_id = question.category_id; // Pre-fill category
    clearMessages(); // Clear all feedback messages on new selection
};
// داخل <script setup lang="ts"> في pages/admin/ask-sheikh.vue

// ... (باقي الكود: imports, state, computed, fetchQuestions, etc.)

/** Submit the reply */
const submitReply = async () => {
    if (!selectedQuestion.value || isSubmitting.value) return;

    // Basic Validation
    replyError.value = null; // Clear previous reply errors
    if (!replyForm.answer_text.trim()) { replyError.value = "نص الإجابة لا يمكن أن يكون فارغًا."; return; }
    // Ensure at least one option is chosen (This validation is already handled by the button's :disabled state)
    // if (!replyForm.is_public && !replyForm.send_private) { replyError.value = "يجب تحديد خيار للنشر (عام أو خاص)."; return; }

    isSubmitting.value = true;
    clearMessages(false); // Clear general messages, keep potential replyError

    try {
        const updatePayload = {
            answer_text: replyForm.answer_text.trim(),
            answered_at: new Date().toISOString(),
            is_answered: true,
            is_public: replyForm.is_public,
            // Ensure category_id is number or null
            category_id: replyForm.category_id ? Number(replyForm.category_id) : null
        };

        // 1. Update the question itself
        const { error: updateError } = await supabase
            .from('questions_to_sheikh')
            .update(updatePayload)
            .eq('id', selectedQuestion.value.id);

        if (updateError) throw new Error(`فشل تحديث السؤال: ${updateError.message}`);

        let messageSentSuccessfully = true; // For private message
        let notificationSentSuccessfully = true; // For notification

        // 2. Handle Private Reply (Message & Notification) if requested and user exists
        if (replyForm.send_private && selectedQuestion.value.user_id) {

            // 2a. Send Private Message (Existing Logic)
            const messagePayload = {
                user_id: selectedQuestion.value.user_id,
                title: `رد على سؤالك: "${selectedQuestion.value.question_text?.substring(0, 30) ?? ''}..."`,
                content: `**السؤال:**\n${selectedQuestion.value.question_text}\n\n**الإجابة:**\n${replyForm.answer_text.trim()}`, // Include question for context
                source: 'ask_sheikh_reply',
                related_question_id: selectedQuestion.value.id,
                is_read: false // Ensure message starts as unread
            };
            const { error: messageError } = await supabase.from('user_private_messages').insert(messagePayload);

            if (messageError) {
                
                setActionError(`تحذير: تم حفظ الرد، لكن فشل إرسال الرسالة الخاصة. الخطأ: ${messageError.message}`);
                messageSentSuccessfully = false;
            }

            // 2b. Create Notification (NEW LOGIC)
            // Only attempt if the user ID is valid
            const notificationPayload = {
                user_id: selectedQuestion.value.user_id, // Target user
                message: `تم الرد على سؤالك في قسم "اسأل الشيخ".`, // Notification text
                // IMPORTANT: Ensure this link works in your frontend routing
                link: `/my-questions/${selectedQuestion.value.id}`,
                is_read: false // Starts as unread
                // created_at is handled by Supabase default
            };

            const { error: notificationError } = await supabase
                .from('notifications')
                .insert(notificationPayload);

            if (notificationError) {
                
                // Log the error, maybe add a specific warning if needed, but don't stop the process
                // Example: Add to existing actionError or create a separate warning state
                setActionError( (actionError.value ? actionError.value + " " : "") + `فشل إنشاء تنبيه الرد.` );
                 notificationSentSuccessfully = false;
            }
        } // End if send_private

        // 3. Set Success Message based on overall outcome
        if (messageSentSuccessfully && notificationSentSuccessfully) {
             setSuccessMessage('تم حفظ الرد وإرسال الإشعار/الرسالة بنجاح.');
        } else if (messageSentSuccessfully && !replyForm.send_private) {
             // Handle case where only public reply was saved successfully
             setSuccessMessage('تم حفظ الرد العام بنجاح.');
        }
        // Note: The setActionError handles cases where message/notification failed partially

        // --- Success Routine ---
        selectedQuestion.value = null; // Clear selection
        // Reset form to defaults
        replyForm.answer_text = '';
        replyForm.is_public = false;
        replyForm.send_private = true;
        replyForm.category_id = null;

        // Refetch the *current* page to reflect changes (especially status change)
        await fetchQuestions(currentPage.value);


    } catch (err: any) {
        
        replyError.value = err.message || "حدث خطأ غير متوقع أثناء إرسال الرد.";
    } finally {
        isSubmitting.value = false;
    }
};



// --- Helper Functions ---
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'غير محدد';
  try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'تاريخ غير صالح';
      return date.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short', hour12: true });
  } catch (e) {
      return 'خطأ تنسيق';
  }
};

const setSuccessMessage = (msg: string) => {
    successMessage.value = msg;
    actionError.value = null;
    replyError.value = null; // Also clear replyError on general success
    setTimeout(() => { successMessage.value = null; }, 4000);
};

const setActionError = (msg: string) => {
    actionError.value = msg;
    successMessage.value = null;
    // Don't clear replyError here, it might be relevant
    setTimeout(() => { actionError.value = null; }, 7000);
};

/** Clears feedback messages. Optionally keeps replyError. */
const clearMessages = (clearReplyErr = true) => {
    successMessage.value = null;
    actionError.value = null;
    if (clearReplyErr) {
        replyError.value = null;
    }
};

// --- Watchers ---

// Refetch when filter, sort order, or search term changes, resetting to page 1
watch([filterStatus, sortOrder, searchTerm], () => {
    selectedQuestion.value = null; // Clear selection when filters change drastically
    if (currentPage.value !== 1) {
        currentPage.value = 1; // Reset page, which will trigger the next watcher
    } else {
        fetchQuestions(1); // Fetch page 1 directly if already there
    }
});

// Refetch when current page changes
watch(currentPage, (newPage) => {
    fetchQuestions(newPage);
});

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchQuestions(1); // Fetch initial questions (page 1, default filters)
});

</script>

<style scoped>
/* Custom scrollbar for question list */
.overflow-y-auto::-webkit-scrollbar { width: 6px; }
.overflow-y-auto::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 3px; }
.overflow-y-auto:hover::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.8); }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }

.whitespace-pre-wrap { white-space: pre-wrap; word-wrap: break-word; }

/* Ensure enough height for the list and details */
.min-h-\[300px\] { min-height: 300px; }
.max-h-\[70vh\] { max-height: 70vh; } /* List max height */
.max-h-60 { max-height: 15rem; } /* Question text max height */
</style>