<template>
  <!-- Responsive Padding -->
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Page Header (Responsive) -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-cream-gray dark:border-gray-700 pb-3 gap-3 flex-wrap">
      <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">إدارة الدروس <span class="text-gray-500 dark:text-gray-400 text-lg">({{ totalLessons }})</span></h1>
      <button
        @click="openAddModal"
        class="button-primary inline-flex items-center"
        :disabled="isListLoading || isDeleting !== null"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-1.5" aria-hidden="true"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
        إضافة درس جديد
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 p-4 rounded-lg border dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="min-w-0">
          <label for="search-term" class="admin-label">بحث بالعنوان:</label>
          <input id="search-term" v-model="searchTerm" type="text" :disabled="isListLoading" placeholder="ابحث..." class="admin-input w-full" />
        </div>
        <div class="min-w-0">
          <label for="filter-category" class="admin-label">التصنيف:</label>
          <select id="filter-category" v-model="filterCategory" :disabled="isListLoading || isLoadingFilters" class="admin-select w-full">
            <option :value="null">الكل</option>
            <option v-if="isLoadingFilters" disabled>جاري التحميل...</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            <option v-if="!isLoadingFilters && categories.length === 0" disabled>لا توجد تصنيفات</option>
          </select>
        </div>
        <div class="min-w-0">
          <label for="filter-course" class="admin-label">الدورة الدراسية:</label>
          <select id="filter-course" v-model="filterCourse" :disabled="isListLoading || isLoadingFilters" class="admin-select w-full">
            <option :value="null">الكل</option>
            <option :value="NO_COURSE_VALUE">-- دروس عامة (بلا دورة) --</option>
            <option v-if="isLoadingFilters" disabled>جاري التحميل...</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
            <option v-if="!isLoadingFilters && courses.length === 0" disabled>لا توجد دورات</option>
          </select>
        </div>
        <div class="min-w-0">
          <label for="sort-by" class="admin-label">ترتيب حسب:</label>
          <div class="flex gap-2 w-full">
            <select id="sort-by" v-model="sortBy" :disabled="isListLoading" class="admin-select w-full">
              <option value="created_at">تاريخ الإنشاء</option>
              <option value="title">العنوان</option>
              <option value="course_id">الدورة</option>
              <option value="category_id">التصنيف</option>
              <option value="module_number">الوحدة</option>
              <option value="lesson_order">الترتيب</option>
            </select>
            <select v-model="sortOrder" :disabled="isListLoading" class="admin-select w-24"><option value="desc">تنازلي</option><option value="asc">تصاعدي</option></select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State for List -->
    <div v-if="isListLoading && !lessons?.length" class="text-center py-16">
      <LoadingSpinner class="w-10 h-10" />
      <p class="mt-3 text-gray-500 dark:text-gray-400">جاري تحميل الدروس...</p>
    </div>

    <!-- Fetch Error Message -->
    <div v-else-if="fetchError" class="error-box" role="alert">
      <strong class="font-bold">خطأ في جلب البيانات!</strong>
      <span class="block sm:inline"> {{ fetchError.message || 'حدث خطأ أثناء جلب الدروس.' }}</span>
       <button @click="() => fetchLessons(1)" class="ml-2 mt-2 sm:mt-0 underline text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">إعادة المحاولة</button>
    </div>

    <!-- Status Messages Removed (Using Toast now) -->
    <!-- <Transition name="fade"> ... </Transition> -->

    <!-- Lessons Table Container -->
    <div v-if="lessons && lessons.length > 0" class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border dark:border-gray-700 relative">
        <Transition name="fade">
           <div v-if="isListLoading || isDeleting !== null" class="absolute inset-0 bg-white/60 dark:bg-gray-800/60 flex items-center justify-center z-10 backdrop-blur-sm rounded-lg">
               <LoadingSpinner class="w-8 h-8 text-primary-500" />
           </div>
        </Transition>
      <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                 <th scope="col" class="w-24 px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">معاينة</th>
                <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">العنوان</th>
                <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">التصنيف</th>
                 <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">الدورة</th>
                 <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell whitespace-nowrap">الوحدة/الترتيب</th>
                <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell whitespace-nowrap">تاريخ الإنشاء</th>
                <th scope="col" class="relative px-4 py-3"><span class="sr-only">الإجراءات</span></th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="lesson in lessons" :key="lesson.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 group" :class="{'opacity-40 pointer-events-none': isDeleting === lesson.id}">
                 <td class="px-3 py-2 whitespace-nowrap text-center">
                   <button v-if="lesson.youtube_url && getYoutubeThumbnail(lesson.youtube_url)" @click="openVideoPreviewModal(lesson.youtube_url)" class="w-20 h-12 overflow-hidden rounded-md group/thumb relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 block mx-auto shadow-sm" :title="`معاينة فيديو: ${lesson.title}`" :disabled="isDeleting === lesson.id" aria-label="معاينة الفيديو">
                      <img :src="getYoutubeThumbnail(lesson.youtube_url)" :alt="`معاينة درس ${lesson.title}`" class="w-full h-full object-cover transition-transform duration-200 ease-in-out group-hover/thumb:scale-110" loading="lazy" />
                      <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 text-white/80"><path fill-rule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z" clip-rule="evenodd" /></svg></div>
                   </button>
                   <div v-else class="w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs italic mx-auto">بلا فيديو</div>
                 </td>
                <td class="px-4 py-3">
                   <div class="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs" :title="lesson.title">
                    <NuxtLink :to="getLessonPublicLink(lesson)" target="_blank" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors group-hover:underline underline-offset-2">
                     {{ lesson.title }}
                     <span class="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity inline-block ms-1" aria-hidden="true"> (مشاهدة)</span>
                    </NuxtLink>
                   </div>
                   <div class="text-xs text-gray-500 dark:text-gray-400 lg:hidden mt-1">{{ formatDate(lesson.created_at, true) }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ lesson.categories?.name || '-' }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                   <NuxtLink v-if="lesson.course_id && lesson.study_courses?.title" :to="`/study/courses/${lesson.course_id}`" target="_blank" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{{ lesson.study_courses.title }}</NuxtLink>
                   <span v-else class="text-gray-400 dark:text-gray-500 italic">عام</span>
                </td>
                 <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    <span v-if="lesson.module_number" class="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">#{{ lesson.module_number }}</span>
                    <span v-else class="text-gray-400 dark:text-gray-500 text-xs italic">عام</span>
                    <span v-if="lesson.lesson_order" class="text-xs"> / {{ lesson.lesson_order }}</span>
                 </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">{{ formatDate(lesson.created_at) }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-left text-sm font-medium">
                  <div class="flex justify-end items-center gap-2">
                      <button @click="openEditModal(lesson)" class="admin-action-button text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200" :disabled="isDeleting === lesson.id || isListLoading" title="تعديل الدرس" aria-label="تعديل الدرس"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.886 1.343Z" /></svg></button>
                      <!-- Delete Button triggers confirmation modal -->
                      <button @click="triggerDeleteConfirmation(lesson)" class="admin-action-button text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200" :disabled="isDeleting === lesson.id || isListLoading" title="حذف الدرس" aria-label="حذف الدرس">
                         <LoadingSpinner v-if="isDeleting === lesson.id" class="w-5 h-5" />
                         <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.326.418C2.482 4.958 2 5.752 2 6.596v3.073c0 .844.482 1.638 1.274 2.014 1.106.527 2.283.9 3.476 1.146A6.997 6.997 0 0 0 10 18.25a6.997 6.997 0 0 0 3.25-.518c1.193-.246 2.37-.619 3.476-1.146C17.518 11.207 18 10.413 18 9.67V6.596c0-.844-.482-1.638-1.274-2.014-.746-.198-1.531-.341-2.326-.418V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM7.5 3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.415c-.885.102-1.745.276-2.55.5a.75.75 0 0 1-.4 0c-.805-.224-1.665-.398-2.55-.5V3.75Z" clip-rule="evenodd" /></svg>
                      </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
      </div>
    </div>

    <!-- Message when no lessons match filters -->
    <div v-else-if="!isListLoading && (!lessons || lessons.length === 0)" class="text-center py-16 text-gray-500 dark:text-gray-400 border border-dashed dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/20">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
        <p v-if="searchTerm || filterCategory !== null || filterCourse !== null">لا توجد دروس تطابق معايير البحث أو الفلترة الحالية.</p>
        <p v-else>لا توجد دروس لعرضها حالياً. قم بإضافة درس جديد.</p>
    </div>

     <!-- Pagination Controls -->
     <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center space-x-2 rtl:space-x-reverse">
         <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1 || isListLoading" class="pagination-button">السابق</button>
         <span class="text-sm text-gray-700 dark:text-gray-300 px-2 font-medium">صفحة {{ currentPage }} من {{ totalPages }} <span class="text-gray-500 dark:text-gray-400">({{ totalLessons }} درس)</span></span>
         <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages || isListLoading" class="pagination-button">التالي</button>
      </div>

   <!-- Lesson Add/Edit Modal -->
   <AdminLessonModal :show="showModal" :lesson-data="selectedLesson" :preselected-course-id="preselectedCourseIdForModal" @close="closeModal" @saved="handleSave" />

   <!-- Video Preview Modal -->
   <VideoPreviewModal :show="showVideoPreview" :video-url="previewVideoUrl" @close="closeVideoPreviewModal" />

   <!-- *** Confirmation Modal for Delete *** -->
   <LazyAdminConfirmationModal
     v-if="showConfirmationModal"
     v-model="showConfirmationModal"
     :config="confirmationConfigObject"
     @confirm="handleDeleteConfirmation"
     @close="showConfirmationModal = false"
   />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'; // Removed reactive
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import AdminLessonModal from '~/components/admin/AdminLessonModal.vue';
import VideoPreviewModal from '~/components/admin/VideoPreviewModal.vue';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { useDebounceFn } from '@vueuse/core';
// Import the config interface - **Verify path**
import type { ConfirmationConfig } from '~/components/admin/ConfirmationModal.vue';

// --- Constants ---
const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 400;
const NO_COURSE_VALUE = -1;

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });
useHead({ title: 'إدارة الدروس' });

// --- Composables ---
const supabase = useSupabaseClient<Database>() as SupabaseClient<Database>;
const { $toast } = useNuxtApp(); // Use toast for feedback

// --- State ---
const isListLoading = ref(true);
const fetchError = ref<PostgrestError | null>(null);
const lessons = ref<LessonWithRelations[] | null>(null);
const totalLessons = ref(0);
const searchTerm = ref('');
const filterCategory = ref<number | null>(null);
const filterCourse = ref<number | null | typeof NO_COURSE_VALUE>(null);
const sortBy = ref<'created_at' | 'title' | 'course_id' | 'category_id' | 'module_number' | 'lesson_order'>('created_at');
const sortOrder = ref<'asc' | 'desc'>('desc');
const categories = ref<Tables<'categories'>[]>([]);
const courses = ref<Tables<'study_courses'>[]>([]);
const isLoadingFilters = ref(true);
const currentPage = ref(1);
const isDeleting = ref<number | null>(null);
// Removed successMessage and actionError, using toast now
const showModal = ref(false); // For Add/Edit Lesson Modal
const selectedLesson = ref<LessonWithRelations | null>(null);
const showVideoPreview = ref(false);
const previewVideoUrl = ref<string | null>(null);
const preselectedCourseIdForModal = computed(() =>
    filterCourse.value !== null && filterCourse.value !== NO_COURSE_VALUE ? filterCourse.value : null
);
// --- Confirmation Modal State ---
const showConfirmationModal = ref(false);
const confirmationConfigObject = ref<ConfirmationConfig | null>(null);
const itemToDelete = ref<LessonWithRelations | null>(null); // Store lesson context for delete


// --- Define Types ---
type LessonBase = Tables<'lessons'>;
type LessonWithRelations = LessonBase & {
  categories: Pick<Tables<'categories'>, 'name'> | null;
  study_courses: Pick<Tables<'study_courses'>, 'title'> | null;
};

// --- Computed Properties ---
const totalPages = computed(() => {
  if (!totalLessons.value || totalLessons.value <= 0) return 1;
  return Math.ceil(totalLessons.value / PAGE_SIZE);
});

// --- Toast Helper ---
function showToast(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    if ($toast && typeof $toast[type] === 'function') {
        $toast[type](message);
    } else {
        console[type === 'error' ? 'error' : 'log'](`[Toast Fallback] ${type}: ${message}`);
    }
}

// --- Functions ---
const fetchFilterOptions = async () => {
  
  isLoadingFilters.value = true; // Set loading state for filters
  try {
    const [catResult, courseResult] = await Promise.allSettled([
      supabase.from('categories').select('id, name').order('name'),
      supabase.from('study_courses').select('id, title').order('title')
    ]);
    if (catResult.status === 'fulfilled' && !catResult.value.error) { categories.value = catResult.value.data || []; }
    else {  showToast("error", "فشل تحميل قائمة التصنيفات."); }
    if (courseResult.status === 'fulfilled' && !courseResult.value.error) { courses.value = courseResult.value.data || []; }
    else {  showToast("error", "فشل تحميل قائمة الدورات."); }
    
  } catch (err: any) {  showToast("error", "خطأ غير متوقع في تحميل بيانات الفلاتر."); }
  finally { isLoadingFilters.value = false; } // Clear loading state
};

const fetchLessons = async (page = currentPage.value) => {
  isListLoading.value = true; fetchError.value = null;
  
  const rangeFrom = (page - 1) * PAGE_SIZE; const rangeTo = rangeFrom + PAGE_SIZE - 1;
  try {
    let query = supabase.from('lessons').select(`id, title, description, youtube_url, category_id, course_id, created_at, module_number, lesson_order, categories ( name ), study_courses ( title )`, { count: 'exact' });
    if (filterCategory.value !== null) query = query.eq('category_id', filterCategory.value);
    if (filterCourse.value !== null) query = filterCourse.value === NO_COURSE_VALUE ? query.is('course_id', null) : query.eq('course_id', filterCourse.value);
    const trimmedSearch = searchTerm.value.trim(); if (trimmedSearch) query = query.ilike('title', `%${trimmedSearch}%`);
    query = query.order(sortBy.value, { ascending: sortOrder.value === 'asc', nullsFirst: false });
    if (sortBy.value !== 'created_at') query = query.order('created_at', { ascending: false }); // Secondary sort
    query = query.range(rangeFrom, rangeTo);
    const { data, error, count } = await query;
    
    if (error) throw error;
    lessons.value = data as LessonWithRelations[] | null; totalLessons.value = count ?? 0; currentPage.value = page;
    // Redirect to last page if current page becomes invalid after delete/filter
    if (page > totalPages.value && totalPages.value > 0) {  }
  } catch (err: any) {  fetchError.value = err as PostgrestError; lessons.value = null; totalLessons.value = 0; showToast('error', `خطأ جلب الدروس: ${fetchError.value?.message || 'غير معروف'}`); }
  finally { isListLoading.value = false; }
};

const debouncedSearch = useDebounceFn(() => {
  if (currentPage.value !== 1) { currentPage.value = 1; } else { fetchLessons(1); }
}, SEARCH_DEBOUNCE_MS);
const changePage = (newPage: number) => { if (newPage >= 1 && newPage <= totalPages.value && newPage !== currentPage.value && !isListLoading.value) { currentPage.value = newPage; } };
const openAddModal = () => { if (!isListLoading.value && isDeleting.value === null) { selectedLesson.value = null; showModal.value = true; } };
const openEditModal = (lesson: LessonWithRelations) => { if (!isListLoading.value && isDeleting.value === null) { selectedLesson.value = { ...lesson }; showModal.value = true; } };
const closeModal = () => { showModal.value = false; selectedLesson.value = null; };
const openVideoPreviewModal = (url: string | null | undefined) => { if (url && !isDeleting.value) { previewVideoUrl.value = url; showVideoPreview.value = true; } };
const closeVideoPreviewModal = () => { showVideoPreview.value = false; previewVideoUrl.value = null; };

const handleSave = async () => {
  closeModal();
 // showToast('success', 'تم حفظ الدرس بنجاح.');
  await fetchLessons(currentPage.value); // Refresh current page
};

// --- Delete Handling (Uses Confirmation Modal) ---
// 1. Trigger confirmation modal
const triggerDeleteConfirmation = (lesson: LessonWithRelations) => {
    if (isDeleting.value !== null) return; // Prevent double trigger
    itemToDelete.value = lesson; // Store context
    confirmationConfigObject.value = {
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من رغبتك في حذف الدرس "${lesson.title}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: 'تأكيد الحذف',
      cancelText: 'إلغاء',
      confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    };
    showConfirmationModal.value = true; // Show the modal
};
// 2. Handle confirmation modal confirm event
const handleDeleteConfirmation = () => {
    const lessonToDel = itemToDelete.value; // Store locally before clearing state
    showConfirmationModal.value = false; // Close modal first
    itemToDelete.value = null;
    confirmationConfigObject.value = null;
    if (lessonToDel) {
        handleDelete(lessonToDel.id); // Proceed with actual delete
    }
};
// 3. Actual delete function (called after confirmation)
const handleDelete = async (id: number) => {
  if (isDeleting.value !== null) return; // Prevent double delete
  isDeleting.value = id;
  try {
    
    const { error: deleteError } = await supabase.from('lessons').delete().eq('id', id);
    if (deleteError) throw deleteError;
    
    showToast('success', 'تم حذف الدرس بنجاح.');
    // Fetch potentially adjusted current page after delete
    await fetchLessons(currentPage.value);
  } catch (err: any) {
    
    showToast('error', `فشل حذف الدرس: ${err.message || 'خطأ غير معروف'}.`);
  } finally {
    isDeleting.value = null;
  }
};


// --- Helper Functions ---
const formatDate = (dateString: string | null, short = false): string => { if (!dateString) return '-'; try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'تاريخ غير صالح'; const options: Intl.DateTimeFormatOptions = short ? { year: 'numeric', month: 'short', day: 'numeric' } : { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }; return date.toLocaleDateString('ar-EG', options); } catch (e) { return 'خطأ تنسيق'; } };
const getYoutubeVideoId = (url: string | null | undefined): string | null => { if (!url) return null; const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/; const match = url.match(regex); return match?.[1] || null; };
const getYoutubeThumbnail = (url: string | null | undefined): string | null => { const videoId = getYoutubeVideoId(url); return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null; };
// Removed setSuccessMessage, setActionError, clearMessages as toast is used directly or via showToast
const getLessonPublicLink = (lesson: LessonWithRelations): string => { return lesson.course_id ? `/study/courses/${lesson.course_id}/lessons/${lesson.id}` : '#'; };


// --- Watchers ---
watch(searchTerm, () => { debouncedSearch(); });
watch([filterCategory, filterCourse, sortBy, sortOrder], () => { if (currentPage.value !== 1) { currentPage.value = 1; } else { fetchLessons(1); } }, { deep: true });
watch(currentPage, (newPage, oldPage) => { if (newPage !== oldPage) { fetchLessons(newPage); } });

// --- Lifecycle Hooks ---
onMounted(async () => {
  
  isListLoading.value = true;
  isLoadingFilters.value = true;
  // Use Promise.allSettled to avoid one failing stopping the other
  const results = await Promise.allSettled([fetchLessons(1), fetchFilterOptions()]);
  
});

</script>
<style scoped>
/* Styles from previous response */
.admin-select {
  @apply block w-full pr-10 px-3 py-2 text-sm rounded-md shadow-sm
         border border-gray-300 dark:border-gray-600
         bg-white dark:bg-gray-700
         text-gray-900 dark:text-gray-100
         placeholder-gray-400 dark:placeholder-gray-500
         focus:ring-1 focus:ring-offset-0 focus:ring-primary focus:border-primary
         focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg fill='none' stroke='gray' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25em 1.25em;
}
.admin-input {
  @apply block w-full px-3 py-2 text-sm rounded-md shadow-sm
         border border-gray-300 dark:border-gray-600
         bg-white dark:bg-gray-700
         text-gray-900 dark:text-gray-100
         placeholder-gray-400 dark:placeholder-gray-500
         focus:ring-1 focus:ring-offset-0 focus:ring-primary focus:border-primary
         focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed;
}
.admin-label { @apply block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1; }
.error-box { @apply bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-300; }
.admin-action-button { @apply p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1; }
.pagination-button { @apply px-3 py-1 text-sm rounded border bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
.max-w-xs { max-width: 20rem; }
.button-base { @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150; }
.button-primary { @apply button-base border-transparent text-white bg-primary hover:bg-opacity-85 focus:ring-primary; }
.button-secondary { @apply button-base border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-muted; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
/* Styles specific to announcements page */
.table-th { @apply px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider; }
.table-td { @apply px-6 py-4 whitespace-nowrap text-sm; }
.table-tr:hover { @apply bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-150; }
.form-error-message { @apply p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-md text-sm; }
.modal-button-primary { @apply w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ms-3 sm:text-sm disabled:opacity-50 dark:focus:ring-offset-gray-800 transition-colors duration-150; }
.modal-button-secondary { @apply w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm transition-colors duration-150 disabled:opacity-70; }
.modal-button-secondary.mt-3 { margin-top: 0.75rem; }
@screen sm { .modal-button-secondary.mt-3 { margin-top: 0; } }
.animate-pulse { animation: pulse-light 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulse-light { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
#modal-send_notification + label { cursor: pointer; }
</style>