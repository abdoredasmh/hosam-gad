<!-- pages/admin/categories.vue -->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">إدارة الفئات</h1>
      <button
        @click="openModal(null)"
        class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
        :disabled="pending || isProcessing"
      >
        <span class="mr-2">+</span> إضافة فئة جديدة
      </button>
    </div>

    <!-- مؤشر التحميل الأولي -->
    <div v-if="pending" class="text-center py-10">
      <LoadingSpinner />
      <p class="mt-2 text-gray-500 dark:text-gray-400">جاري تحميل الفئات...</p>
    </div>

    <!-- رسالة خطأ الجلب -->
    <div v-else-if="fetchError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">خطأ!</strong>
      <span class="block sm:inline"> حدث خطأ أثناء جلب الفئات: {{ fetchError.message }}</span>
    </div>

     <!-- رسائل الحالة للعمليات -->
     <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
       {{ successMessage }}
     </div>
     <div v-if="actionError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
       {{ actionError }}
     </div>

    <!-- جدول الفئات -->
    <div v-else-if="categories && categories.length > 0" class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              الاسم
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              الوصف
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              النوع
            </th>
             <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              تاريخ الإنشاء
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">الإجراءات</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="category in categories" :key="category.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ category.name }}</div>
            </td>
            <td class="px-6 py-4"> 
              <div class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs" :title="category.description || ''">
                {{ category.description || '-' }}
              </div>
            </td>
             <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ category.type || '-' }}
            </td>
             <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(category.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
              <button
                 @click="openModal(category)"
                 class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50"
                 :disabled="isProcessing === category.id"
              >
                تعديل
              </button>
              <button
                @click="confirmDelete(category)"
                class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                 :disabled="isProcessing === category.id"
               >
                <span v-if="isProcessing === category.id">جاري...</span>
                <span v-else>حذف</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

     <!-- رسالة عند عدم وجود فئات -->
    <div v-else class="text-center py-10 text-gray-500 dark:text-gray-400">
      لا توجد فئات لعرضها حالياً. قم بإضافة فئة جديدة.
    </div>

    <!-- === Modal الإضافة والتعديل للفئات === -->
    <CategoryModal
      :show="showModal"
      :category-data="selectedCategory"
      @close="closeModal"
      @saved="handleSave"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import CategoryModal from '~/components/admin/CategoryModal.vue'; // <-- مودال جديد للفئات

type Category = Tables<'categories'>;

definePageMeta({ layout: 'admin', middleware: 'admin' });

const supabase = useSupabaseClient<Database>();

// State
const pending = ref(true);
const fetchError = ref<any>(null);
const categories = ref<Category[] | null>(null);
const showModal = ref(false);
const selectedCategory = ref<Category | null>(null);
const isProcessing = ref<number | null>(null); // لتتبع الحذف أو الحفظ
const successMessage = ref<string | null>(null);
const actionError = ref<string | null>(null);

// --- Functions ---

const fetchCategories = async () => {
  pending.value = true;
  fetchError.value = null;
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*') // جلب كل الأعمدة
      .order('created_at', { ascending: false });
    if (error) throw error;
    categories.value = data;
  } catch (err: any) {
    
    fetchError.value = err;
    categories.value = null;
  } finally {
    pending.value = false;
  }
};

const openModal = (category: Category | null) => {
  if (isProcessing.value) return;
  selectedCategory.value = category ? { ...category } : null; // Pass copy or null
  showModal.value = true;
  clearMessages();
};

const closeModal = () => {
  showModal.value = false;
  selectedCategory.value = null;
};

const handleSave = async () => {
  closeModal();
  setSuccessMessage('تم حفظ الفئة بنجاح.');
  await fetchCategories(); // أعد جلب القائمة
};

const confirmDelete = async (category: Category) => {
   if (isProcessing.value) return;
   if (window.confirm(`هل أنت متأكد أنك تريد حذف الفئة "${category.name}"؟ قد يؤثر هذا على الدروس أو الدورات المرتبطة بها.`)) {
      isProcessing.value = category.id;
      clearMessages();
      try {
         const { error } = await supabase.from('categories').delete().eq('id', category.id);
         if (error) throw error;
         setSuccessMessage('تم حذف الفئة بنجاح.');
         categories.value = categories.value?.filter(c => c.id !== category.id) ?? null;
         // await fetchCategories(); // اختياري
      } catch (err: any) {
         
         setActionError(`فشل حذف الفئة: ${err.message}. تحقق مما إذا كانت مرتبطة ببيانات أخرى.`);
      } finally {
         isProcessing.value = null;
      }
   }
};

// Helper Functions (formatDate, setSuccessMessage, setActionError, clearMessages - انسخها من lessons.vue أو أعد كتابتها)
// تنسيق التاريخ
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'تاريخ غير صالح';
    }
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
      
      return 'خطأ في التنسيق';
  }
};
// تعيين رسالة نجاح مؤقتة
const setSuccessMessage = (msg: string) => {
    successMessage.value = msg;
    actionError.value = null; // مسح أي خطأ قديم
    setTimeout(() => { successMessage.value = null; }, 4000); // إخفاء الرسالة بعد 4 ثوان
};

// تعيين رسالة خطأ عملية مؤقتة
const setActionError = (msg: string) => {
    actionError.value = msg;
    successMessage.value = null; // مسح أي نجاح قديم
    setTimeout(() => { actionError.value = null; }, 6000); // إخفاء الرسالة بعد 6 ثوان
};

// مسح رسائل الحالة
const clearMessages = () => {
    successMessage.value = null;
    actionError.value = null;
};
// Initial fetch
onMounted(() => {
  fetchCategories();
});

</script>

<style scoped>
/* Add styles if needed */
</style>