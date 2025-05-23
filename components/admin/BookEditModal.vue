<template>
  <TransitionRoot appear :show="true" as="div"> <!-- استخدام as="div" -->
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <!-- Backdrop -->
      <TransitionChild as="div" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75" />
      </TransitionChild>

      <!-- Modal Container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">

          <TransitionChild as="div" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <!-- Modal Panel -->
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-end shadow-xl transition-all flex flex-col max-h-[90vh]">
              <!-- Header -->
              <DialogTitle as="h3" class="text-xl font-semibold leading-6 text-gray-900 dark:text-white mb-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 flex-shrink-0">
                 <span class="truncate">تعديل الكتاب: {{ initialData.title }}</span>
                 <button type="button" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none" @click="closeModal" aria-label="إغلاق">
                   <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                 </button>
              </DialogTitle>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="mt-4 flex-grow space-y-4 overflow-y-auto px-1">
                <!-- Title -->
                <div>
                  <label for="edit-book-title" class="form-label">العنوان *</label>
                  <input type="text" id="edit-book-title" v-model="formData.title" required class="input-field mt-1">
                </div>

                <!-- Description -->
                <div>
                  <label for="edit-book-description" class="form-label">الوصف</label>
                  <textarea id="edit-book-description" v-model="formData.description" rows="3" class="input-field mt-1"></textarea>
                </div>

                <!-- Type (Research/Transcript) -->
                <div class="flex space-x-4 rtl:space-x-reverse">
                   <div class="flex items-center">
                     <input id="edit-is_research" v-model="formData.is_research" type="checkbox" class="checkbox-field">
                     <label for="edit-is_research" class="ms-2 form-label-inline">هل هو بحث؟</label>
                   </div>
                   <div class="flex items-center">
                     <input id="edit-is_transcript" v-model="formData.is_transcript" type="checkbox" class="checkbox-field">
                     <label for="edit-is_transcript" class="ms-2 form-label-inline">هل هو تفريغ؟</label>
                   </div>
                </div>

                <!-- Linked Lesson (Using Searchable Component) -->
                <div>
                  <SearchableLessonSelect
                    v-model="formData.linked_lesson_id"
                    label="ربط بدرس (اختياري)"
                    placeholder="ابحث عن درس للربط أو الغاء الربط..."
                  />
                </div>

                <!-- PDF File Upload -->
                <div>
                  <label for="edit-book-file" class="form-label">
                     ملف الكتاب (PDF)
                     <span class="text-xs text-gray-500 dark:text-gray-400">(اختياري: اختر ملفًا جديدًا لاستبدال الملف الحالي)</span>
                  </label>
                  <input ref="fileInputRef" type="file" id="edit-book-file" @change="handleFileChange" accept=".pdf" class="file-input mt-1">
                  <p v-if="newBookFile" class="mt-1 text-xs text-indigo-600 dark:text-indigo-400">الملف الجديد المختار: {{ newBookFile.name }}</p>
                  <p v-else-if="initialData.storage_path" class="mt-1 text-xs text-green-600 dark:text-green-400">الملف الحالي: {{ getFileName(initialData.storage_path) }}</p>
                  <p v-else class="mt-1 text-xs text-red-500 dark:text-red-400">لا يوجد ملف مرفق حاليًا.</p>
                </div>

                <!-- Inline Error Message for immediate feedback -->
                <div v-if="inlineErrorMessage" class="text-red-600 dark:text-red-400 text-sm">
                  {{ inlineErrorMessage }}
                </div>

              <!-- Form Actions -->
               <div class="pt-5 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                 <button type="button" @click="closeModal" :disabled="formLoading" class="button-secondary">
                   إلغاء
                 </button>
                 <button type="submit" :disabled="formLoading" class="button-primary">
                   <span v-if="formLoading">جاري الحفظ...</span>
                   <span v-else>حفظ التعديلات</span>
                 </button>
               </div>
              </form> <!-- End Form -->
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
      <!-- تم إزالة مودال التأكيد من هنا -->
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'; // تم إزالة defineAsyncComponent
import {
  TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle,
} from '@headlessui/vue';
import type { Database } from '~/types/database.types';
import SearchableLessonSelect from '~/components/admin/SearchableLessonSelect.vue';

// تم إزالة استيراد مودال التأكيد

// Define Types
type Book = Database['public']['Tables']['books']['Row'];
type BookUpdate = Database['public']['Tables']['books']['Update'];

// Props definition
const props = defineProps<{
  book: Book;
}>();

// Emits definition
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'book-updated', successMessage: string): void; // <-- تمرير رسالة النجاح
}>();

// --- NuxtApp for Toast ---
const { $toast } = useNuxtApp(); // استخدام Toast

// Supabase and State
const supabase = useSupabaseClient<Database>();
const formLoading = ref(false);
const inlineErrorMessage = ref('');
const newBookFile = ref<File | null>(null);
const initialData = reactive({ ...props.book });
const fileInputRef = ref<HTMLInputElement | null>(null);

// تم إزالة متغيرات حالة مودال التأكيد

// Form data
const formData = reactive<Omit<BookUpdate, 'id' | 'created_at' | 'storage_path'>>({
  title: '',
  description: '',
  is_research: false,
  is_transcript: false,
  linked_lesson_id: null,
  cover_image_url: null,
});

// Configuration
const STORAGE_BUCKET_NAME = 'book-files';

// --- Initialize Form Data ---
onMounted(() => {
    formData.title = initialData.title;
    formData.description = initialData.description || '';
    formData.is_research = initialData.is_research || false;
    formData.is_transcript = initialData.is_transcript || false;
    formData.linked_lesson_id = initialData.linked_lesson_id;
    formData.cover_image_url = initialData.cover_image_url;
});

// --- Helper to get filename ---
function getFileName(path: string | null): string {
    if (!path) return '';
    return path.substring(path.lastIndexOf('/') + 1);
}

// --- File Handling ---
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  inlineErrorMessage.value = '';
  if (target.files && target.files[0]) {
    if (target.files[0].type === 'application/pdf') {
      newBookFile.value = target.files[0];
    } else {
      newBookFile.value = null;
      if (fileInputRef.value) fileInputRef.value.value = '';
      inlineErrorMessage.value = 'الرجاء اختيار ملف PDF فقط.';
      // يمكن إضافة toast.error هنا أيضًا إذا أردت
      // $toast.error('الرجاء اختيار ملف PDF فقط.', { duration: 3000 });
    }
  } else {
    newBookFile.value = null;
  }
}

// --- Form Submission (Update) ---
async function handleSubmit() {
  formLoading.value = true;
  inlineErrorMessage.value = '';

  let updatedStoragePath = initialData.storage_path;
  const oldStoragePath = initialData.storage_path;

  try {
    // 1. Upload NEW file if selected
    if (newBookFile.value) {
        const file = newBookFile.value;
        const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = `${uniqueFileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET_NAME)
            .upload(filePath, file);

        if (uploadError) {
            if (uploadError.message.includes('Duplicate')) throw new Error('اسم الملف موجود مسبقًا.');
            if (uploadError.message.includes('policy')) throw new Error('خطأ أذونات رفع الملف.');
            throw new Error(`فشل رفع الملف: ${uploadError.message}`);
        }
        updatedStoragePath = uploadData.path;

        // Delete the OLD file AFTER successful upload
        if (oldStoragePath && oldStoragePath !== updatedStoragePath) {
             const { error: deleteError } = await supabase.storage
                 .from(STORAGE_BUCKET_NAME)
                 .remove([oldStoragePath]);
             if (deleteError) {
                 
                 // Show warning using toast
                 $toast.warning( // <-- استخدام toast
                    `تم تحديث الكتاب، لكن فشل حذف الملف القديم (${getFileName(oldStoragePath)}).`,
                    { duration: 5000 } // مدة أطول للتحذير
                 );
             }
        }
    }

    // 2. Prepare data for DB update
    const bookDataToUpdate: BookUpdate = { ...formData, storage_path: updatedStoragePath };

    // 3. Update DB record
    const { error: updateError } = await supabase
      .from('books')
      .update(bookDataToUpdate)
      .eq('id', initialData.id);

    if (updateError) {
         if (newBookFile.value && updatedStoragePath) {
             
         }
         // استخدم رسالة الخطأ من Supabase إن وجدت
         throw new Error(`فشل تحديث الكتاب: ${updateError.message || 'خطأ غير معروف'}`);
    }

    // 4. Success -> Close modal and notify parent with success message
    const successMessage = `تم تحديث الكتاب '${formData.title}' بنجاح.`;
    emit('book-updated', successMessage); // <-- تمرير رسالة النجاح
    emit('close');

  } catch (err: any) {
    
    // Show error using toast
    $toast.error( // <-- استخدام toast
        err.message || 'حدث خطأ غير متوقع أثناء حفظ التعديلات.',
        { duration: 4000 }
    );
  } finally {
    formLoading.value = false;
  }
}

// --- Close Modal ---
function closeModal() {
  if (!formLoading.value) {
    emit('close');
  }
}
</script>

<style scoped>
/* Shared styles for form elements */
.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 text-right mb-1;
}
.form-label-inline {
   @apply block text-sm text-gray-900 dark:text-gray-300;
}
.input-field {
  @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm text-right disabled:opacity-50;
}
.checkbox-field {
   @apply h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-offset-gray-800;
}
.file-input {
   @apply mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-600 dark:file:text-gray-200 dark:hover:file:bg-gray-500;
}
.button-primary {
  @apply inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50;
}
.button-secondary {
   @apply inline-flex justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 disabled:opacity-50;
}
</style>