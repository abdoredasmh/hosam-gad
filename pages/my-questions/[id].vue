<template>
  <div class="container mx-auto px-4 py-8 max-w-3xl">
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 md:p-8">

      <!-- Page Title & Back Link -->
      <div class="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-700">
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          تفاصيل سؤالي
        </h1>
        <NuxtLink
          to="/ask"
          class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25H13.25A.75.75 0 0 1 14 8Z" clip-rule="evenodd" />
          </svg>
          <span>العودة إلى القائمة</span>
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="text-center py-12">
        <LoadingSpinner class="w-10 h-10 mx-auto text-indigo-600" />
        <p class="mt-3 text-gray-600 dark:text-gray-400">جارٍ تحميل تفاصيل السؤال...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 mx-auto text-red-500 dark:text-red-400 mb-3">
          <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.557 13.004c1.155 2-.29 4.5-2.599 4.5H4.443c-2.308 0-3.753-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
        </svg>
        <p class="text-lg font-semibold text-red-700 dark:text-red-300">حدث خطأ</p>
        <p class="mt-1 text-red-600 dark:text-red-400">{{ error.message || 'لم نتمكن من تحميل تفاصيل السؤال. قد لا يكون موجودًا أو ليس لديك صلاحية لعرضه.' }}</p>
        <button
            @click="fetchQuestionDetails"
            class="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            إعادة المحاولة
          </button>
      </div>

      <!-- Question Details -->
      <div v-else-if="question" class="space-y-6">
        <!-- Question Section -->
        <div>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">سؤالك:</h2>
          <p class="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-md border dark:border-gray-600 whitespace-pre-wrap">
            {{ question.question_text }}
          </p>
          <div class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
            <span>تم الإرسال في: {{ formatDate(question.submitted_at) }}</span>
            <span v-if="question.question_categories" class="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                {{ question.question_categories.name }}
            </span>
          </div>
        </div>

        <!-- Answer Section -->
        <div>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">الإجابة:</h2>
          <div v-if="question.is_answered && question.answer_text" class="border-t border-indigo-200 dark:border-indigo-800 pt-4">
            <p class="text-gray-800 dark:text-gray-100 bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-md border border-indigo-100 dark:border-indigo-700 whitespace-pre-wrap">
              {{ question.answer_text }}
            </p>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              تم الرد في: {{ formatDate(question.answered_at) }}
            </p>
          </div>
          <div v-else class="text-center py-6 px-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
            <p class="text-sm text-yellow-700 dark:text-yellow-300">لم يتم الرد على سؤالك بعد.</p>
          </div>
        </div>
      </div>

    </div> <!-- End Card -->
  </div> <!-- End Container -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import { useRoute, useSupabaseClient, navigateTo, definePageMeta, useHead } from '#imports';
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // Adjust path if needed
import type { PostgrestError } from '@supabase/supabase-js';

// --- Types ---
// Define a specific type for the data we expect, including the joined category
type QuestionDetails = Tables<'questions_to_sheikh'> & {
  question_categories: Pick<Tables<'question_categories'>, 'name'> | null;
};

// --- Page Meta & Head ---
definePageMeta({
  layout: 'default', // Or your main user layout
  middleware: 'auth' // Ensure user is logged in
});

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const route = useRoute();
const user = useSupabaseUser(); // Get current user info

// --- State ---
const pending = ref(true);
const error = ref<PostgrestError | Error | null>(null); // Can be Supabase error or custom Error
const question = ref<QuestionDetails | null>(null);

// --- Computed ---
const questionId = computed(() => {
  const idParam = route.params.id;
  return Array.isArray(idParam) ? idParam[0] : idParam; // Handle array/string param
});

// --- Functions ---

/** Fetches the specific question details from Supabase */
const fetchQuestionDetails = async () => {
  pending.value = true;
  error.value = null;
  question.value = null; // Clear previous data

  if (!questionId.value || !user.value) {
    error.value = new Error('معرف السؤال غير صالح أو المستخدم غير مسجل الدخول.');
    pending.value = false;
    return;
  }

  try {
    const { data, error: dbError } = await supabase
      .from('questions_to_sheikh')
      .select(`
        id,
        question_text,
        submitted_at,
        answer_text,
        answered_at,
        is_answered,
        is_public,
        user_id,
        category_id,
        question_categories ( name )
      `)
      .eq('id', questionId.value)
      // IMPORTANT: RLS Policy should enforce this, but adding client check as safety
      // .eq('user_id', user.value.id)
      .single(); // We expect only one question

    if (dbError) {
        // Check for specific errors like RLS violation or not found
        if (dbError.code === 'PGRST116') { // PostgREST code for "Resource Not Found" or RLS denial
            throw new Error('السؤال غير موجود أو ليس لديك صلاحية الوصول إليه.');
        }
        throw dbError; // Throw other Supabase errors
    }

    if (!data) {
        // Should be caught by PGRST116, but as a fallback
        throw new Error('لم يتم العثور على السؤال.');
    }

    // Final check (optional, relies on RLS primarily)
    if (data.user_id !== user.value.id) {
        
        throw new Error('ليس لديك صلاحية الوصول لهذا السؤال.');
    }


    question.value = data as QuestionDetails; // Assign fetched data

    // Update page title dynamically
    useHead({
        title: `سؤالي: ${question.value?.question_text?.substring(0, 30) ?? 'تفاصيل السؤال'}...`
    });


  } catch (err: any) {
    
    error.value = err; // Set the error state
  } finally {
    pending.value = false;
  }
};

/** Formats a date string */
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'غير محدد';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'تاريخ غير صالح';
    // Adjust locale and options as needed
    return date.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short', hour12: true });
  } catch (e) {
    return 'خطأ تنسيق';
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchQuestionDetails();
});
</script>

<style scoped>
/* Add any specific styles if needed */
.whitespace-pre-wrap {
  white-space: pre-wrap; /* Ensure line breaks are displayed */
  word-wrap: break-word; /* Break long words */
}
</style>