<template>
  <div>
 
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-6">
      <h1 class="text-2xl font-semibold shrink-0">إدارة الكتب والأبحاث</h1>
      <button
        @click="openAddModal"
        class="button-primary whitespace-nowrap w-full sm:w-auto" 
        :disabled="loadingRelated"
      >
        <span v-if="loadingRelated">تحميل بيانات الدروس...</span>
        <span v-else>إضافة كتاب/بحث جديد</span>
      </button>
    </div>

    <!-- Search and Filters - Responsive Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
      <!-- Search Input (Title) - Spans 2 cols on sm+, full width below -->
      <div class="sm:col-span-2 lg:col-span-2">
        <label for="search-book" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">بحث بالعنوان</label>
        <input
          type="text"
          id="search-book"
          v-model="searchQuery"
          placeholder="ابحث عن عنوان كتاب..."
          class="input-field w-full"
          aria-label="بحث بعنوان الكتاب"
        />
      </div>

      <!-- Type Filter -->
      <div>
        <label for="filter-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">فلتر بالنوع</label>
        <select id="filter-type" v-model="selectedType" class="input-field w-full" aria-label="فلتر حسب نوع الكتاب">
          <option value="all">الكل</option>
          <option value="book">كتاب</option>
          <option value="research">بحث</option>
          <option value="transcript">تفريغ</option>
        </select>
      </div>

      <!-- Lesson Filter (Using Searchable Component) -->
      <div>
         <SearchableLessonSelect
           v-model="selectedLessonId"
           label="فلتر بالدرس"
           placeholder="ابحث عن درس..."
           :disabled="loadingRelated"
           aria-label="فلتر حسب الدرس المرتبط"
         />
      </div>

      <!-- Clear Filters Button - Spans all columns, but content justifies end -->
      <div class="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-end mt-2" v-if="isAnyFilterActive">
         <button @click="clearFiltersAndSearch" class="button-secondary text-sm w-full sm:w-auto"> <!-- Full width on mobile -->
           مسح البحث والفلاتر
         </button>
       </div>
    </div>

    <!-- Loading Indicator (Initial Load) -->
    <div v-if="loadingList && books.length === 0" class="text-center py-10">
      <LoadingSpinner />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">جارٍ تحميل قائمة الكتب...</p>
    </div>

    <!-- Empty State / No Results -->
    <div v-else-if="books.length === 0 && !loadingList" class="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
       <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
         <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
       </svg>
       <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
           {{ noResultsMessage }}
       </h3>
       <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ noResultsSuggestion }}
       </p>
       <div class="mt-6" v-if="isAnyFilterActive">
           <button @click="clearFiltersAndSearch" class="button-secondary w-full sm:w-auto"> 
               مسح البحث والفلاتر وعرض الكل
           </button>
       </div>
       <div class="mt-6" v-else-if="!isInitialLoadState">
            <button @click="openAddModal" class="button-primary w-full sm:w-auto" :disabled="loadingRelated"> 
                <span v-if="loadingRelated">تحميل بيانات الدروس...</span>
                <span v-else>إضافة كتاب/بحث جديد</span>
            </button>
       </div>
    </div>

    <!-- Books Table Container with Horizontal Scroll -->
    <!-- ====> هذا العنصر هو المسؤول عن تمرير الجدول أفقيًا فقط <==== -->
    <div v-else class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" class="table-header px-4 sm:px-6 py-3">العنوان</th>
            <th scope="col" class="table-header px-4 sm:px-6 py-3">النوع</th>
            <th scope="col" class="table-header px-4 sm:px-6 py-3">مرتبط بدرس</th>
            <th scope="col" class="table-header sortable-header px-4 sm:px-6 py-3" @click="toggleSort('created_at')">
              تاريخ الإضافة
              <SortIcon :direction="sortBy === 'created_at' ? (sortAsc ? 'asc' : 'desc') : 'none'" />
            </th>
            <th scope="col" class="relative px-4 sm:px-6 py-3">
              <span class="sr-only">إجراءات</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="book in books" :key="book.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
            <td class="table-cell font-medium text-gray-900 dark:text-white px-4 sm:px-6 py-4">{{ book.title }}</td>
            <td class="table-cell px-4 sm:px-6 py-4">
              <span v-if="book.is_research" class="badge-blue">بحث</span>
              <span v-else-if="book.is_transcript" class="badge-yellow">تفريغ</span>
              <span v-else class="badge-green">كتاب</span>
            </td>
            <td class="table-cell px-4 sm:px-6 py-4">{{ getLessonTitleSync(book.linked_lesson_id) || 'غير مرتبط' }}</td>
            <td class="table-cell px-4 sm:px-6 py-4">{{ formatDate(book.created_at) }}</td>
            <td class="table-cell text-right font-medium space-x-2 rtl:space-x-reverse px-4 sm:px-6 py-4">
              <button @click="openEditModal(book)" class="button-icon text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" title="تعديل">تعديل</button>
              <button @click="requestDeleteConfirmation(book)" class="button-icon text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" title="حذف">   حذف  </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Infinite Scroll Trigger -->
      <div ref="loadMoreTrigger" class="h-20 flex justify-center items-center">لا توجد كتب اخرى</div>
    </div>

    <!-- Modals -->
    <LazyAdminBookAddModal v-if="showAddModal" @close="closeAddModal" @book-added="handleBookAdded" />
    <LazyAdminBookEditModal v-if="showEditModal && selectedBookForEdit" :book="selectedBookForEdit" @close="closeEditModal" @book-updated="handleBookUpdated" />
    <LazyConfirmationModal v-if="showDeleteConfirmModal" v-model="showDeleteConfirmModal" :config="deleteModalConfig" @confirm="confirmDelete" @close="cancelDelete" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, defineAsyncComponent, nextTick } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import type { Database } from '~/types/database.types';
import type { PostgrestError } from '@supabase/supabase-js';
import type { ConfirmationConfig } from '~/components/admin/ConfirmationModal.vue';

// NuxtApp for Toast
const { $toast } = useNuxtApp();

// Import Components
const LazyAdminBookAddModal = defineAsyncComponent(() => import('~/components/admin/BookAddModal.vue'));
const LazyAdminBookEditModal = defineAsyncComponent(() => import('~/components/admin/BookEditModal.vue'));
const LazyConfirmationModal = defineAsyncComponent(() => import('~/components/admin/ConfirmationModal.vue'));
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import SortIcon from '~/components/common/SortIcon.vue';
import SearchableLessonSelect from '~/components/admin/SearchableLessonSelect.vue';

// Define Types
type Book = Database['public']['Tables']['books']['Row'];
type Lesson = Pick<Database['public']['Tables']['lessons']['Row'], 'id' | 'title'>;
interface FetchBooksParams { page?: number; pageSize?: number; search?: string; type?: 'book' | 'research' | 'transcript'; lessonId?: number | null; sortBy?: 'created_at' | 'title'; sortAsc?: boolean; }

// Nuxt Page Meta & Head
definePageMeta({ layout: 'admin', middleware: 'admin' });
useHead({ title: 'إدارة الكتب والأبحاث' });

// Supabase
const supabase = useSupabaseClient<Database>();

// Reactive State
const showAddModal = ref(false); const showEditModal = ref(false); const showDeleteConfirmModal = ref(false);
const selectedBookForEdit = ref<Book | null>(null); const bookToDelete = ref<Book | null>(null);
const deleteModalConfig = ref<ConfirmationConfig | null>(null); const books = ref<Book[]>([]);
const loadingList = ref(true); const loadingMore = ref(false); const lessons = ref<Lesson[]>([]);
const lessonTitleCache = ref<Map<number, string>>(new Map()); const loadingRelated = ref(true);
const isInitialLoadState = ref(true);

// Search, Filter, and Sort State
const searchQuery = ref(''); const selectedType = ref<'all' | 'book' | 'research' | 'transcript'>('all');
const selectedLessonId = ref<number | 'all' | null>('all'); const sortBy = ref<'created_at' | 'title'>('created_at');
const sortAsc = ref(false);

// Pagination State
const currentPage = ref(1); const pageSize = ref(25); const hasMoreItems = ref(true);
const loadMoreTrigger = ref<HTMLDivElement | null>(null); let observer: IntersectionObserver | null = null;

// Configuration
const STORAGE_BUCKET_NAME = 'book-files';

// Computed Properties
const isAnyFilterActive = computed(() => searchQuery.value !== '' || selectedType.value !== 'all' || (selectedLessonId.value !== 'all' && selectedLessonId.value !== null));
const noResultsMessage = computed(() => { if (isInitialLoadState.value && loadingList.value) return 'جارٍ التحميل...'; if (isInitialLoadState.value && !loadingList.value && books.value.length === 0) return 'لا توجد كتب أو أبحاث مضافة بعد.'; if (!isInitialLoadState.value && books.value.length === 0) { return isAnyFilterActive.value ? 'لا توجد نتائج تطابق بحثك.' : 'لا توجد كتب لعرضها.'; } return ''; });
const noResultsSuggestion = computed(() => { if (isInitialLoadState.value && !loadingList.value && books.value.length === 0) return 'ابدأ بإضافة كتاب أو بحث جديد.'; if (!isInitialLoadState.value && books.value.length === 0) { return isAnyFilterActive.value ? 'جرّب تعديل معايير البحث أو الفلترة.' : 'يمكنك إضافة عنصر جديد.'; } return ''; });

// Data Fetching Functions
async function fetchBooks(params: FetchBooksParams = {}) {
    const page = params.page ?? 1; const limit = params.pageSize ?? pageSize.value; const isFirstPage = page === 1;
    if (isFirstPage) { loadingList.value = true; books.value = []; hasMoreItems.value = true; } else { loadingMore.value = true; }
    stopObserver();
    try {
        const from = (page - 1) * limit; const to = from + limit - 1;
        let query = supabase.from('books').select('id, title, created_at, is_research, is_transcript, linked_lesson_id, storage_path', { count: 'exact' }).range(from, to);
        if (params.search) query = query.ilike('title', `%${params.search}%`);
        if (params.type && params.type !== 'all') { if (params.type === 'book') query = query.eq('is_research', false).eq('is_transcript', false); else if (params.type === 'research') query = query.eq('is_research', true); else if (params.type === 'transcript') query = query.eq('is_transcript', true); }
        if (params.lessonId !== 'all' && params.lessonId !== undefined) { if(params.lessonId === null) query = query.is('linked_lesson_id', null); else query = query.eq('linked_lesson_id', params.lessonId); }
        const sortColumn = params.sortBy ?? sortBy.value; const ascending = params.sortAsc ?? sortAsc.value; query = query.order(sortColumn, { ascending });
        const { data, error, count } = await query; if (error) throw error;
        const newBooks = data || []; if (isFirstPage) { books.value = newBooks; } else { books.value.push(...newBooks); }
        currentPage.value = page; hasMoreItems.value = newBooks.length === limit;
        if (hasMoreItems.value) { await nextTick(); startObserver(); }
    } catch (err: any) {  $toast.error('فشل تحميل الكتب.', { duration: 4000 }); if (isFirstPage) books.value = []; hasMoreItems.value = false;
    } finally { if (isFirstPage) { loadingList.value = false; if (isInitialLoadState.value) isInitialLoadState.value = false; } else { loadingMore.value = false; } if (hasMoreItems.value) { await nextTick(); startObserver(); } }
}
async function fetchLessons() {
  loadingRelated.value = true;
  try {
    const { data, error } = await supabase.from('lessons').select('id, title').order('title', { ascending: true }).limit(1000);
    if (error) throw error; lessons.value = data || []; lessons.value.forEach(l => lessonTitleCache.value.set(l.id, l.title));
  } catch (err: any) {  $toast.warning('لم تحميل الدروس كاملة.', { duration: 4000 }); lessons.value = [];
  } finally { loadingRelated.value = false; }
}

// Fetch Triggering Functions
function fetchFirstPage() { currentPage.value = 1; hasMoreItems.value = true; const lessonFilterValue = selectedLessonId.value === 'all' ? undefined : selectedLessonId.value; fetchBooks({ page: 1, pageSize: pageSize.value, search: searchQuery.value, type: selectedType.value === 'all' ? undefined : selectedType.value, lessonId: lessonFilterValue, sortBy: sortBy.value, sortAsc: sortAsc.value }); }
const debouncedFetchFirstPage = useDebounceFn(fetchFirstPage, 500);
watch([selectedType, selectedLessonId], fetchFirstPage); watch(searchQuery, debouncedFetchFirstPage);

// Helper Functions
function getFileName(path: string | null): string { if (!path) return ''; return path.substring(path.lastIndexOf('/') + 1); }
function getLessonTitleSync(lessonId: number | null): string | null { if (!lessonId) return null; const lesson = lessons.value.find(l => l.id === lessonId) || lessonTitleCache.value.get(lessonId); if (lesson) return typeof lesson === 'string' ? lesson : lesson.title; return `درس غير معروف #${lessonId}`; }
function formatDate(dateString: string | null): string { if (!dateString) return '-'; try { return new Date(dateString).toLocaleString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }); } catch (e) { return 'تاريخ غير صالح'; } }
function toggleSort(column: 'created_at' | 'title') { if (sortBy.value === column) { sortAsc.value = !sortAsc.value; } else { sortBy.value = column; sortAsc.value = column === 'title'; } fetchFirstPage(); }
function clearFiltersAndSearch() { searchQuery.value = ''; selectedType.value = 'all'; selectedLessonId.value = 'all'; fetchFirstPage(); }

// Modal Handling Functions
function openAddModal() { if (!loadingRelated.value) showAddModal.value = true; else $toast.info('يرجى الانتظار...'); }
function closeAddModal() { showAddModal.value = false; }
function handleBookAdded(successMessage: string = 'تمت إضافة الكتاب بنجاح.') { closeAddModal(); $toast.success(successMessage, { duration: 3000 }); fetchFirstPage(); }
function openEditModal(book: Book) { if (!loadingRelated.value) { selectedBookForEdit.value = { ...book }; showEditModal.value = true; } else $toast.info('يرجى الانتظار...'); }
function closeEditModal() { showEditModal.value = false; selectedBookForEdit.value = null; }
function handleBookUpdated(successMessage: string) { closeEditModal(); $toast.success(successMessage, { duration: 3000 }); fetchFirstPage(); }

// Delete Action
function requestDeleteConfirmation(book: Book) {
    bookToDelete.value = book;
    deleteModalConfig.value = {
        title: 'تأكيد الحذف', message: `هل أنت متأكد من حذف '${book.title}'؟ سيتم حذف الملف المرتبط (${getFileName(book.storage_path) || 'لا يوجد'}) نهائيًا.`,
        confirmText: 'نعم، حذف', cancelText: 'إلغاء', confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
    };
    showDeleteConfirmModal.value = true;
}
function cancelDelete() { showDeleteConfirmModal.value = false; bookToDelete.value = null; deleteModalConfig.value = null; }
async function confirmDelete() {
  if (!bookToDelete.value) return;
  const book = bookToDelete.value; const bookId = book.id; const bookTitle = book.title; const originalStoragePath = book.storage_path;
  showDeleteConfirmModal.value = false; $toast.info(`جاري حذف '${bookTitle}'...`, { duration: 2000 });
  try {
    const { error: dbError } = await supabase.from('books').delete().eq('id', bookId); if (dbError) throw new Error(`فشل حذف السجل: ${dbError.message}`);
    let storageWarning = false;
    if (originalStoragePath) { const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET_NAME).remove([originalStoragePath]); if (storageError) { storageWarning = true;  $toast.warning(`تم حذف السجل، لكن فشل حذف الملف (${getFileName(originalStoragePath)}).`, { duration: 5000 }); } }
    if (!storageWarning) { $toast.success(`تم حذف '${bookTitle}' ${originalStoragePath ? 'وملفه ' : ''}بنجاح.`, { duration: 3000 }); } fetchFirstPage();
  } catch (err: any) {  $toast.error(`خطأ حذف '${bookTitle}': ${err.message || 'Unknown error.'}`, { duration: 5000 });
  } finally { bookToDelete.value = null; deleteModalConfig.value = null; }
}

// Infinite Scroll Logic
function setupIntersectionObserver() { if (!loadMoreTrigger.value) return; const options = { root: null, rootMargin: '0px', threshold: 0.5 }; observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting && !loadingMore.value && hasMoreItems.value) { const lessonFilterValue = selectedLessonId.value === 'all' ? undefined : selectedLessonId.value; fetchBooks({ page: currentPage.value + 1, pageSize: pageSize.value, search: searchQuery.value, type: selectedType.value === 'all' ? undefined : selectedType.value, lessonId: lessonFilterValue, sortBy: sortBy.value, sortAsc: sortAsc.value }); } }); }, options); startObserver(); }
function startObserver() { if (observer && loadMoreTrigger.value) observer.observe(loadMoreTrigger.value); }
function stopObserver() { if (observer && loadMoreTrigger.value) observer.unobserve(loadMoreTrigger.value); }

// Lifecycle Hooks
onMounted(() => { fetchFirstPage(); fetchLessons(); nextTick(() => { setupIntersectionObserver(); }); });
onBeforeUnmount(() => { if (observer) observer.disconnect(); });

</script>

<style scoped>
/* Reusable utility classes */
.input-field { @apply block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
.table-header { @apply px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky top-0 bg-gray-50 dark:bg-gray-800 z-[1]; }
.sortable-header { @apply cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-end space-x-1 rtl:space-x-reverse; }
.table-cell { @apply px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400; }
.badge-base { @apply px-2 inline-flex text-xs leading-5 font-semibold rounded-full; }
.badge-blue { @apply badge-base bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200; }
.badge-yellow { @apply badge-base bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200; }
.badge-green { @apply badge-base bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200; }
.button-primary { @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
.button-secondary { @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors; }
.button-icon { @apply p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center transition-colors; }
</style>