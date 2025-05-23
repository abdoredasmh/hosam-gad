<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="closeModal">
    <!-- Modal Content -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">إضافة كتاب/بحث جديد</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
          <!-- Title -->
          <div>
            <label for="book-title" class="form-label">العنوان *</label>
            <input type="text" id="book-title" v-model="formData.title" required class="input-field mt-1">
          </div>

          <!-- Description -->
          <div>
            <label for="book-description" class="form-label">الوصف</label>
            <textarea id="book-description" v-model="formData.description" rows="3" class="input-field mt-1"></textarea>
          </div>

          <!-- Type (Research/Transcript) -->
          <div class="flex space-x-4 rtl:space-x-reverse">
            <div class="flex items-center">
              <input id="is_research" v-model="formData.is_research" type="checkbox" class="checkbox-field">
              <label for="is_research" class="ms-2 form-label-inline">هل هو بحث؟</label>
            </div>
            <div class="flex items-center">
              <input id="is_transcript" v-model="formData.is_transcript" type="checkbox" class="checkbox-field">
              <label for="is_transcript" class="ms-2 form-label-inline">هل هو تفريغ؟</label>
            </div>
          </div>

          <!-- Linked Lesson (Using Searchable Component) -->
          <div>
            <!-- Replace the old select with the searchable component -->
            <SearchableLessonSelect
              v-model="formData.linked_lesson_id"
              label="ربط بدرس (اختياري)"
              placeholder="ابحث عن درس للربط..."
            />
            <!-- Remove the old select and the warning paragraph -->
          </div>

          <!-- PDF File Upload -->
          <div>
            <label for="book-file" class="form-label">ملف الكتاب (PDF) *</label>
            <input type="file" id="book-file" @change="handleFileChange" accept=".pdf" required class="file-input mt-1">
            <p v-if="bookFile" class="mt-1 text-xs text-gray-500 dark:text-gray-400">الملف المختار: {{ bookFile.name }}</p>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-600 dark:text-red-400 text-sm">
            {{ errorMessage }}
          </div>

          <!-- Actions -->
          <div class="pt-4 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700">
            <button type="button" @click="closeModal" :disabled="formLoading" class="button-secondary">
              إلغاء
            </button>
            <button type="submit" :disabled="formLoading || !bookFile" class="button-primary">
              <span v-if="formLoading">جاري الحفظ...</span>
              <span v-else>حفظ الكتاب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { Database } from '~/types/database.types'; // Ensure correct path
import SearchableLessonSelect from '~/components/admin/SearchableLessonSelect.vue'; // Import the component

// Types
// type Lesson = Database['public']['Tables']['lessons']['Row']; // No longer needed as prop
type BookInsert = Database['public']['Tables']['books']['Insert'];

// Props
// const props = defineProps<{ lessons: Lesson[] }>(); // Remove lessons prop
const props = defineProps<{}>(); // No props needed anymore

// Emits
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'book-added'): void;
}>();

const supabase = useSupabaseClient<Database>();

// State
const formLoading = ref(false);
const errorMessage = ref('');
const bookFile = ref<File | null>(null);

// Form Data
const formData = reactive<Omit<BookInsert, 'storage_path'>>({
  title: '',
  description: '',
  is_research: false,
  is_transcript: false,
  linked_lesson_id: null, // Now correctly bound to SearchableLessonSelect (will be number or null)
  cover_image_url: null,
});

// File Handling
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    if (target.files[0].type === 'application/pdf') {
      bookFile.value = target.files[0];
      errorMessage.value = '';
    } else {
      bookFile.value = null;
      target.value = '';
      errorMessage.value = 'الرجاء اختيار ملف PDF فقط.';
    }
  } else {
    bookFile.value = null;
  }
}

// Form Submission
async function handleSubmit() {
  if (!bookFile.value) {
    errorMessage.value = 'الرجاء اختيار ملف PDF للكتاب.';
    return;
  }

  formLoading.value = true;
  errorMessage.value = '';

  try {
    // 1. Upload PDF
    const file = bookFile.value;
    const fileExt = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filePath = `${uniqueFileName}`; // Ensure this bucket/path has correct RLS policies

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('book-files') // Correct bucket name
      .upload(filePath, file);

    if (uploadError) {
        if (uploadError.message.includes('Duplicate')) throw new Error('حدث خطأ: اسم الملف موجود مسبقًا. حاول إعادة تسمية الملف أو المحاولة مرة أخرى.');
        if (uploadError.message.includes('policy')) throw new Error('حدث خطأ في الأذونات عند رفع الملف. تحقق من سياسات التخزين.');
        throw new Error(`خطأ في رفع ملف PDF: ${uploadError.message}`);
    }
    const uploadedFilePath = uploadData.path;

    // 2. Prepare data for DB insertion
    const bookDataToInsert: BookInsert = {
      ...formData,
      storage_path: uploadedFilePath,
      // linked_lesson_id is already correctly set to number or null by v-model
    };

    // Remove the explicit check for empty string, as v-model handles null
    // if (bookDataToInsert.linked_lesson_id === '') { ... }

    // 3. Insert into DB
    const { error: insertError } = await supabase
      .from('books')
      .insert(bookDataToInsert);

    if (insertError) {
      // Attempt to remove uploaded file on DB failure
      try { await supabase.storage.from('book-files').remove([uploadedFilePath]); }
      catch (removeError: any) {  }
      throw new Error(`خطأ في حفظ بيانات الكتاب: ${insertError.message}`);
    }

    // 4. Success
    userFeedback.showSuccess('تمت إضافة الكتاب بنجاح!'); // Assuming userFeedback composable exists
    emit('book-added');
    emit('close');

  } catch (err: any) {
    
    errorMessage.value = err.message || 'حدث خطأ غير متوقع.';
  } finally {
    formLoading.value = false;
  }
}

// Close Modal Logic
function closeModal() {
  if (!formLoading.value) {
    emit('close');
  }
}

// Assuming a composable or global helper for user feedback
const useUserFeedback = () => ({
  showSuccess: (message: string) => {  },
  // Add other feedback types if needed
});
const userFeedback = useUserFeedback();

</script>

<style scoped>
/* Shared styles for form elements */
.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}
.form-label-inline {
   @apply block text-sm text-gray-900 dark:text-gray-300;
}

.input-field {
  @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm disabled:opacity-50;
}

.checkbox-field {
   @apply h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-offset-gray-800;
}

.file-input {
   @apply block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-600 dark:file:text-gray-200 dark:hover:file:bg-gray-500;
}

.button-primary {
  @apply inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50;
}
.button-secondary {
   @apply inline-flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 disabled:opacity-50;
}
</style>