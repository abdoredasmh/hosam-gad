<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Header and Add Button -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">إدارة الاختبارات</h1>
      <button
        @click="openCreateModal"
        class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 -ml-1 mr-2 rtl:ml-2 rtl:-mr-1"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z" clip-rule="evenodd" /></svg>
        إنشاء اختبار جديد
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="courseFilter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    تصفية حسب الدورة
                </label>
                <select
                    id="courseFilter"
                    v-model="selectedCourseId"
                    @change="applyFilter"
                    :disabled="coursesLoading || !courses.length"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:focus:ring-offset-gray-800"
                >
                    <option value="">جميع الدورات</option>
                    <option v-if="coursesLoading" value="" disabled>جارٍ تحميل الدورات...</option>
                    <option v-for="course in courses" :key="course.id" :value="course.id">
                        {{ course.title }}
                    </option>
                </select>
                <p v-if="courseFetchError" class="mt-1 text-xs text-red-600 dark:text-red-400">
                    فشل تحميل الدورات: {{ courseFetchError.message }}
                     <button @click="fetchCourses" class="ml-1 text-red-700 dark:text-red-300 underline">إعادة المحاولة</button>
                </p>
                 <p v-if="!coursesLoading && !courseFetchError && !courses.length" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    لا توجد دورات متاحة.
                </p>
            </div>
            <!-- Add more filters here if needed -->
        </div>
    </div>

    <!-- Loading & Error States -->
    <div v-if="quizzesLoading" class="text-center py-10">
      <LoadingSpinner />
      <p class="mt-2 text-gray-500 dark:text-gray-400">جارٍ تحميل الاختبارات...</p>
    </div>
     <div v-if="quizFetchError" class="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
      <strong class="font-bold">خطأ!</strong>
      <span class="block sm:inline"> حدث خطأ أثناء جلب الاختبارات. ({{ quizFetchError.message }})</span>
       <button @click="refreshQuizzes" class="ml-4 text-red-800 underline">إعادة المحاولة</button>
    </div>
     <div v-if="actionMessage" :class="['my-4 p-3 border rounded text-sm', actionMessageType === 'success' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700']">
        {{ actionMessage }}
    </div>

    <!-- Quizzes Table -->
    <div
        v-if="quizzes && quizzes.length > 0 && !quizzesLoading"
        class="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg"
        :aria-busy="quizzesLoading"
    >
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">العنوان</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">النوع</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">مرتبط بـ</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الحالة</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">تاريخ الإنشاء</th>
            <th scope="col" class="relative px-6 py-3"><span class="sr-only">الإجراءات</span></th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="quiz in quizzes" :key="quiz.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ quiz.title }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{{ quiz.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatQuizType(quiz.type) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <span v-if="quiz.type === 'lesson'">درس: {{ quiz.lessons?.title || quiz.lesson_id }}</span>
                <span v-else-if="quiz.type === 'module'">وحدة {{ quiz.module_number }} في دورة: {{ quiz.study_courses?.title || quiz.course_id }}</span>
                <span v-else-if="quiz.type === 'final'">دورة: {{ quiz.study_courses?.title || quiz.course_id }}</span>
                <span v-else-if="quiz.type === 'practice'">تدريبي</span>
                <span v-else>--</span>
            </td>
             <td class="px-6 py-4 whitespace-nowrap text-center">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', quiz.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300']">
                {{ quiz.is_active ? 'نشط' : 'غير نشط' }}
              </span>
            </td>
             <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatDate(quiz.created_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium rtl:text-right space-x-2 rtl:space-x-reverse">
              <NuxtLink :to="`/admin/quizzes/${quiz.id}/questions`" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" title="إدارة الأسئلة">الأسئلة</NuxtLink>
              <button @click="openEditModal(quiz)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="تعديل الاختبار">تعديل</button>
              <button @click="confirmDelete(quiz)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="حذف الاختبار">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="!quizzesLoading && !quizFetchError && (!quizzes || quizzes.length === 0)" class="text-center py-10 text-gray-500 dark:text-gray-400">
       <span v-if="selectedCourseId">لا توجد اختبارات تطابق الفلتر المحدد.</span>
       <span v-else>لا توجد اختبارات تم إنشاؤها بعد.</span>
       <button v-if="!selectedCourseId" @click="openCreateModal" class="ml-2 text-indigo-600 hover:underline">إنشاء أول اختبار</button>
       <button v-else @click="resetFilter" class="ml-2 text-indigo-600 hover:underline">عرض كل الاختبارات</button>
    </div>

    <!-- Pagination (Optional - Add later if needed) -->
    <!-- <div v-if="totalPages > 1" class="mt-6 ..."> ... Pagination Controls ... </div> -->

    <!-- Create/Edit Modal -->
    <LazyAdminQuizCreateEditModal
        v-model="showModal"
        :quiz-data="selectedQuizForEdit"
        @saved="handleQuizSaved"
        @closed="handleModalClosed"
    />

     <!-- Confirmation Modal for Delete -->
     <LazyAdminConfirmationModal
         v-model="showDeleteConfirm"
         :config="deleteConfirmConfig"
         @confirm="deleteQuiz"
         @close="quizToDelete = null"
     />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Database, Tables, Enums } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
// Lazy load modals
const QuizCreateEditModal = resolveComponent('LazyAdminQuizCreateEditModal');
const ConfirmationModal = resolveComponent('LazyAdminConfirmationModal');
import { type ConfirmationConfig } from '~/components/admin/ConfirmationModal.vue'; // Import config type
import { useSupabaseClient, definePageMeta, useNuxtApp } from '#imports';
import type { PostgrestError } from '@supabase/supabase-js';

// --- Define Types ---
type Quiz = Tables<'quizzes'>;
type Course = Pick<Tables<'study_courses'>, 'id' | 'title'>;
// Extend Quiz type to include related data names fetched from Supabase
type QuizView = Quiz & {
  lessons?: Pick<Tables<'lessons'>, 'title'> | null;
  study_courses?: Pick<Tables<'study_courses'>, 'title'> | null;
};

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const { $toast } = useNuxtApp();

// --- State ---

// Data State
const quizzes = ref<QuizView[]>([]); // Array to hold quizzes
const courses = ref<Course[]>([]); // Array to hold courses for filter

// Loading States
const quizzesLoading = ref(true);
const coursesLoading = ref(true);

// Error States
const quizFetchError = ref<PostgrestError | null>(null);
const courseFetchError = ref<PostgrestError | null>(null);

// Filter State
const selectedCourseId = ref<string>(''); // Holds the ID of the selected course for filtering

// Modal State
const showModal = ref(false);
const selectedQuizForEdit = ref<QuizView | null>(null); // Quiz data for editing
const showDeleteConfirm = ref(false);
const quizToDelete = ref<QuizView | null>(null);
const deleteConfirmConfig = ref<ConfirmationConfig | null>(null);

// Action Feedback State
const actionMessage = ref<string | null>(null);
const actionMessageType = ref<'success' | 'error'>('success');

// --- Data Fetching ---

const fetchCourses = async () => {
    coursesLoading.value = true;
    courseFetchError.value = null;
    try {
        const { data, error } = await supabase
            .from('study_courses')
            .select('id, title')
            .order('title', { ascending: true });

        if (error) throw error;
        courses.value = data || [];
    } catch (err: any) {
        
        courseFetchError.value = err as PostgrestError;
        courses.value = []; // Clear courses on error
    } finally {
        coursesLoading.value = false;
    }
};

const fetchQuizzes = async () => {
  quizzesLoading.value = true;
  quizFetchError.value = null;
  clearActionMessage(); // Clear previous action messages on new fetch

  try {
    let query = supabase
      .from('quizzes')
      .select(`
        *,
        lessons ( title ),
        study_courses ( title )
      `)
      .order('created_at', { ascending: false }); // Order by creation date

    // Apply course filter if a course is selected
    if (selectedCourseId.value) {
        // We only want to filter quizzes directly linked to the selected course (module or final types)
        query = query.eq('course_id', selectedCourseId.value);
        // Optionally, you could also filter by type if needed, but eq('course_id') often suffices
        // query = query.in('type', ['module', 'final']);
    }

    const { data, error } = await query;

    if (error) throw error;
    quizzes.value = (data || []) as QuizView[];

  } catch (err: any) {
    
    quizFetchError.value = err as PostgrestError;
    quizzes.value = []; // Clear quizzes on error
  } finally {
    quizzesLoading.value = false;
  }
};

// --- Modal Handling ---
const openCreateModal = () => {
    selectedQuizForEdit.value = null;
    showModal.value = true;
};

const openEditModal = (quiz: QuizView) => {
    selectedQuizForEdit.value = { ...quiz }; // Pass a copy
    showModal.value = true;
};

const handleModalClosed = () => {
    selectedQuizForEdit.value = null;
};

const handleQuizSaved = (savedQuiz: QuizView) => {
    showToast('تم حفظ الاختبار بنجاح!', 'success');
    showModal.value = false;
    refreshQuizzes(); // Refresh the list
};

// --- Delete Handling ---
const confirmDelete = (quiz: QuizView) => {
    quizToDelete.value = quiz;
    deleteConfirmConfig.value = {
        title: 'تأكيد الحذف',
        message: `هل أنت متأكد من رغبتك في حذف الاختبار "${quiz.title}"؟ سيتم حذف جميع أسئلته ومحاولات الطلاب المتعلقة به. لا يمكن التراجع عن هذا الإجراء.`,
        confirmText: 'نعم، حذف الاختبار',
        confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        cancelText: 'إلغاء'
    };
    showDeleteConfirm.value = true;
};

const deleteQuiz = async () => {
    if (!quizToDelete.value) return;

    const idToDelete = quizToDelete.value.id;
    const titleToDelete = quizToDelete.value.title;
    // Consider adding a loading state for the delete button if needed

    try {
        const { error } = await supabase
            .from('quizzes')
            .delete()
            .eq('id', idToDelete);

        if (error) throw error;

        // Remove from local list optimistically
        quizzes.value = quizzes.value.filter(q => q.id !== idToDelete);
        showToast(`تم حذف الاختبار "${titleToDelete}" بنجاح.`, 'success');

    } catch (err: any) {
        
        showActionMessage(`فشل حذف الاختبار: ${err.message}`, 'error');
        // Optional: Re-fetch quizzes if optimistic update failed or is not desired
        // refreshQuizzes();
    } finally {
        quizToDelete.value = null;
        showDeleteConfirm.value = false;
        // Reset delete button loading state if implemented
    }
};

// --- Filter Handling ---
const applyFilter = () => {
    // When the select dropdown changes, re-fetch the quizzes
    fetchQuizzes();
};

const resetFilter = () => {
    selectedCourseId.value = '';
    fetchQuizzes();
};

// --- Helper Functions ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '--';
  try {
      const date = new Date(dateString);
      // More robust formatting, handles potential invalid dates better
      if (isNaN(date.getTime())) return 'تاريخ غير صالح';
      return date.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
      return 'تاريخ غير صالح';
  }
};

const formatQuizType = (type: Quiz['type'] | null | undefined): string => {
    switch (type) {
        case 'lesson': return 'اختبار درس';
        case 'module': return 'اختبار وحدة';
        case 'final': return 'اختبار نهائي';
        case 'practice': return 'اختبار تدريبي';
        default: return type || 'غير محدد'; // Return the type itself if unknown but present
    }
};

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Use NuxtApp $toast plugin if available, otherwise fallback to console
    if ($toast && typeof $toast[type] === 'function') {
        $toast[type](message);
    } else {
        
    }
};

const showActionMessage = (msg: string, type: 'success' | 'error') => {
    actionMessage.value = msg;
    actionMessageType.value = type;
    // Automatically clear the message after a delay
    setTimeout(() => {
        clearActionMessage();
    }, 5000); // 5 seconds
};

const clearActionMessage = () => {
    actionMessage.value = null;
};

// Renamed 'refresh' to be more specific
const refreshQuizzes = () => {
    quizFetchError.value = null; // Clear previous fetch error on manual refresh
    fetchQuizzes();
};

// --- Lifecycle Hooks ---
onMounted(async () => {
  // Fetch courses and quizzes when the component mounts
  // Run them concurrently for potentially faster loading
  quizzesLoading.value = true; // Set explicitly before parallel calls
  coursesLoading.value = true;
  await Promise.all([fetchCourses(), fetchQuizzes()]);
});

</script>

<style scoped>
/* Add specific styles if needed */
/* Example: Style the disabled select */
select:disabled {
  background-color: #e5e7eb; /* bg-gray-200 */
  cursor: not-allowed;
}
.dark select:disabled {
   background-color: #374151; /* dark:bg-gray-700 */
   opacity: 0.7;
}
</style>