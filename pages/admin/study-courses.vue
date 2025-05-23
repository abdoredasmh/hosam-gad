<template>
  <!-- Responsive Padding -->
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Page Header (Responsive) -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-cream-gray dark:border-gray-700 pb-3 gap-3 flex-wrap">
      <h1 class="text-2xl font-bold text-brown-dark dark:text-beige-light">
        إدارة الدورات الدراسية
        <!-- Display count from useAsyncData data -->
        <span v-if="courseData" class="text-gray-500 dark:text-gray-400 text-lg">({{ courseData.length }})</span>
      </h1>
      <button
        @click="openAddCourseModal"
        class="button-primary"
        :disabled="loadingFilters || pending"
      >
        <span v-if="loadingFilters || pending">تحميل...</span>
        <span v-else>إضافة دورة جديدة</span>
      </button>
    </div>

    <!-- Loading Indicator (Uses pending from useAsyncData) -->
    <div v-if="pending" class="text-center py-10">
      <LoadingSpinner />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">جارٍ تحميل قائمة الدورات...</p>
    </div>

    <!-- Error Loading (Uses error from useAsyncData) -->
     <div v-else-if="error" class="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md mx-auto">
        <p class="text-red-600 dark:text-red-400 font-semibold mb-2">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 inline-block align-middle me-1" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
         خطأ تحميل الدورات
        </p>
        <pre class="mt-1 text-xs text-left bg-red-100 dark:bg-red-800/30 p-2 rounded border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 whitespace-pre-wrap">{{ error.message }}</pre>
        <button @click="refresh" class="mt-4 px-4 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900 transition-colors text-sm font-medium">
          إعادة المحاولة
        </button>
     </div>

    <!-- Empty State (Uses courseData from useAsyncData) -->
    <div v-else-if="!pending && Array.isArray(courseData) && courseData.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto mb-2 text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
      لا توجد دورات دراسية مضافة حتى الآن.
    </div>

    <!-- Courses Table (Uses courseData from useAsyncData) -->
    <div v-else-if="!pending && Array.isArray(courseData) && courseData.length > 0" class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
             <th scope="col" class="table-header w-20">صورة</th>
            <th scope="col" class="table-header min-w-[200px]">العنوان</th>
            <th scope="col" class="table-header min-w-[120px]">الفئة</th>
             <th scope="col" class="table-header text-center min-w-[100px]">الحالة</th>
            <th scope="col" class="table-header min-w-[150px]">تاريخ الإضافة</th>
            <th scope="col" class="relative px-6 py-3 min-w-[120px]"><span class="sr-only">إجراءات</span></th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
           <!-- Loop directly over courseData.value -->
          <tr v-for="course in courseData" :key="course.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="px-4 py-2 whitespace-nowrap">
              <img :src="getCourseImageUrl(course.image_url)" :alt="course.title ?? 'صورة الدورة'" class="h-10 w-16 object-cover rounded border border-gray-200 dark:border-gray-700" v-if="course.image_url"/>
              <div v-else class="h-10 w-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm16.5-5.818V18" /></svg></div>
            </td>
            <td class="table-cell font-medium text-gray-900 dark:text-white">{{ course.title }}</td>
            <td class="table-cell">{{ getCategoryName(course.category_id) || '-' }}</td>
             <td class="table-cell text-center">
               <button @click="triggerToggleStatusConfirmation(course)" :title="course.is_active ? 'إلغاء تفعيل الدورة' : 'تفعيل الدورة'" :disabled="isTogglingStatus === course.id" class="relative">
                 <LoadingSpinner v-if="isTogglingStatus === course.id" class="absolute inset-0 m-auto w-4 h-4 text-primary" />
                 <span :class="[{'opacity-0': isTogglingStatus === course.id}, course.is_active ? 'badge-green' : 'badge-red']">{{ course.is_active ? 'نشط' : 'غير نشط' }}</span>
               </button>
             </td>
            <td class="table-cell">{{ formatDate(course.created_at) }}</td>
            <td class="table-cell text-right font-medium space-x-2 rtl:space-x-reverse whitespace-nowrap">
               <button @click="openEditCourseModal(course)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 px-1 py-1" :disabled="isDeleting === course.id || isTogglingStatus === course.id">تعديل</button>
               <button @click="triggerDeleteConfirmation(course)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 relative px-1 py-1" :disabled="isDeleting === course.id || isTogglingStatus === course.id">
                 <LoadingSpinner v-if="isDeleting === course.id" class="absolute inset-0 m-auto w-4 h-4 text-red-500" />
                 <span :class="{'opacity-0': isDeleting === course.id}">حذف</span>
               </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Fallback/Unknown state -->
     <div v-else-if="!pending && !error">
        <p class="text-center py-10 text-gray-400">حالة غير متوقعة.</p>
     </div>

  
    <LazyAdminCourseAddEditModal
       v-if="showCourseModal"
       v-model="showCourseModal"
       :course-data="selectedCourseForEdit"
       :categories="filterCategories" 
       @saved="handleCourseSaved"
       @close="closeCourseModal"
    />

    <!-- Confirmation Modal Instance -->
    <LazyAdminConfirmationModal
      v-if="showConfirmationModal"
      v-model="showConfirmationModal"
      :config="confirmationConfigObject"
      @confirm="handleConfirmation"
      @close="handleConfirmationClose"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent, watch } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import { useSupabaseClient, useAsyncData, useNuxtApp } from '#imports';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import type { ConfirmationConfig } from '~/components/admin/ConfirmationModal.vue'; // Verify path
const LazyAdminCourseAddEditModal = defineAsyncComponent(() => import('~/components/admin/CourseAddEditModal.vue'));
const LazyAdminConfirmationModal = defineAsyncComponent(() => import('~/components/admin/ConfirmationModal.vue'));

// Define Types
type Course = Tables<'study_courses'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;

definePageMeta({ layout: 'admin', middleware: 'admin' });
useHead({ title: 'إدارة الدورات الدراسية' });

const supabase = useSupabaseClient<Database>();
const { $toast } = useNuxtApp();

// --- State ---
// Remove local 'courses' ref, rely on courseData directly
// const courses = ref<Course[]>([]);
const filterCategories = ref<Category[]>([]); // Still needed for dropdowns/display
const showCourseModal = ref(false);
const selectedCourseForEdit = ref<Course | null>(null);
const loadingFilters = ref(true); // For category loading
const isDeleting = ref<number | null>(null);
const isTogglingStatus = ref<number | null>(null);

// Confirmation Modal State
const showConfirmationModal = ref(false);
const confirmationConfigObject = ref<ConfirmationConfig | null>(null);
const itemToAction = ref<Course | null>(null);
const confirmationAction = ref<'delete' | 'toggleStatus' | null>(null);

// Fetch Courses using useAsyncData
const { data: courseData, pending, error, refresh: refreshCourses } = useAsyncData(
    'adminCourses',
    async () => {
        
         const { data, error: fetchError } = await supabase
            .from('study_courses')
            .select('*')
            .order('created_at', { ascending: false });
         if (fetchError) {
            
            throw fetchError; // Let useAsyncData handle the error state
         }
         
         // Ensure data is always an array, even if null/undefined is returned
         return (data || []) as Course[];
    }, {
        // Use default to prevent errors when accessing courseData.value before fetch completes
        default: () => [] as Course[],
        // server: false // Optional: Fetch only on client
    }
);

// Fetch Categories (still needed for modal/display) using useAsyncData
 const { pending: catPending, error: catError, refresh: refreshCategories } = useAsyncData(
    'adminCourseCategories',
    async () => {
        
        const { data, error: fetchCatError } = await supabase
            .from('categories')
            // .eq('type', 'study_course') // Optional filter
            .select('id, name')
            .order('name');
         if (fetchCatError) {
             
             throw fetchCatError;
         }
         
         filterCategories.value = data || []; // Update local ref for dropdown
         return data || [];
    }, {
        default: () => [],
        // server: false
    }
 );

// Watch category loading state
watch(catPending, (newPending) => { loadingFilters.value = newPending; }, { immediate: true });
// Watch for category fetch errors (optional: display specific error)
watch(catError, (newError) => { if(newError) showToast('error', `خطأ تحميل التصنيفات: ${newError.message}`); });


// --- Toast Helper ---
function showToast(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    if ($toast && typeof $toast[type] === 'function') { $toast[type](message); }
    else { console[type === 'error' ? 'error' : 'log'](`[Toast Fallback] ${type}: ${message}`); }
}

// Helper Functions
function getCategoryName(categoryId: number | null): string | null {
    if (!categoryId || !Array.isArray(filterCategories.value)) return null;
    const category = filterCategories.value.find(c => c.id === categoryId);
    return category ? category.name : `فئة #${categoryId}`;
}
function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return 'تاريخ غير صالح'; }
}
function getCourseImageUrl(imageUrl: string | null): string { return imageUrl || '/images/placeholder-course.jpg'; } // Adjust placeholder

// --- Toggle Course Status ---
function triggerToggleStatusConfirmation(course: Course) {
    if (isTogglingStatus.value !== null) return;
    itemToAction.value = course;
    confirmationAction.value = 'toggleStatus';
    const newStatus = !course.is_active;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    confirmationConfigObject.value = { /* ... same config setup ... */ };
    showConfirmationModal.value = true;
}
async function toggleCourseStatus(courseId: number, newStatus: boolean) {
    isTogglingStatus.value = courseId;
    const actionText = newStatus ? 'تفعيل' : 'إلغاء تفعيل';
    try {
        const { error: updateError } = await supabase
            .from('study_courses').update({ is_active: newStatus }).eq('id', courseId)
             .select('id').single();
        if (updateError) throw updateError;
        showToast('success', `تم ${actionText} الدورة بنجاح.`);
        // **Crucially, refresh the data provided by useAsyncData**
        await refreshCourses();
    } catch (err: any) {
        
        showToast('error', `فشل تغيير حالة الدورة: ${err.message}`);
    } finally {
        isTogglingStatus.value = null;
    }
}

// --- Modal Handling ---
function openAddCourseModal() {
    selectedCourseForEdit.value = null;
    showCourseModal.value = true;
}
function openEditCourseModal(course: Course) {
    selectedCourseForEdit.value = { ...course }; // Pass data to modal
    showCourseModal.value = true;
}
function closeCourseModal() {
    showCourseModal.value = false;
    selectedCourseForEdit.value = null;
}
async function handleCourseSaved() {
    closeCourseModal();
    showToast('success', 'تم حفظ بيانات الدورة بنجاح.');
    // **Refresh the data provided by useAsyncData**
    await refreshCourses();
}

 // --- Delete Action ---
 function triggerDeleteConfirmation(course: Course) {
     if (isDeleting.value !== null) return;
     itemToAction.value = course;
     confirmationAction.value = 'delete';
     confirmationConfigObject.value = { /* ... same config setup ... */ };
     showConfirmationModal.value = true;
 }
 async function handleDeleteCourse(courseId: number) {
     isDeleting.value = courseId;
     try {
         const { error: deleteError } = await supabase
             .from('study_courses').delete().eq('id', courseId);
         if (deleteError) throw deleteError;
         showToast('success', 'تم حذف الدورة بنجاح.');
         // **Refresh the data provided by useAsyncData**
         await refreshCourses();
     } catch (err: any) {
         
         showToast('error', `فشل حذف الدورة: ${err.message}`);
     } finally {
         isDeleting.value = null;
     }
 }

// --- Confirmation Modal Handler ---
function handleConfirmation() {
    const action = confirmationAction.value;
    const item = itemToAction.value;
    showConfirmationModal.value = false; // Close modal first
    confirmationAction.value = null;
    itemToAction.value = null;
    confirmationConfigObject.value = null;
    if (item) {
        if (action === 'delete') { handleDeleteCourse(item.id); }
        else if (action === 'toggleStatus') { toggleCourseStatus(item.id, !item.is_active); }
    }
}
function handleConfirmationClose() {
    showConfirmationModal.value = false;
    confirmationAction.value = null;
    itemToAction.value = null;
    confirmationConfigObject.value = null;
}

// --- Refresh function for error button ---
async function refresh() {
     // Refresh courses and potentially categories if needed
     await Promise.allSettled([ refreshCourses(), refreshCategories() ]);
}

// --- Lifecycle ---
// onMounted is no longer strictly needed for initial fetch thanks to useAsyncData
// but can be kept for other setup if necessary.
onMounted(() => {
    
    // Initial fetch triggered by useAsyncData
});

</script>

<style scoped>
/* Styles from previous response */
.table-header { @apply px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider; }
.table-cell { @apply px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 align-middle; }
.table-cell:first-child { @apply whitespace-normal break-words; } /* Allow title wrap */
.button-primary { @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50; }
.badge-base { @apply px-2.5 py-0.5 inline-block text-xs leading-5 font-semibold rounded-full cursor-pointer transition-opacity duration-150; }
.badge-green { @apply badge-base bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200; }
.badge-red { @apply badge-base bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200; }
.error-box { @apply bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-300; }
/* Add other base styles if missing */
.admin-select, .admin-input, .admin-label { /* ... styles from previous code ... */ }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>