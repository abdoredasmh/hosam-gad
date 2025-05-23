<!-- components/admin/CategoryModal.vue -->
<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild as="div" class="fixed inset-0 bg-black/30 backdrop-blur-sm" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0" />
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 mb-4">
                {{ isEditing ? 'تعديل الفئة' : 'إضافة فئة جديدة' }}
              </DialogTitle>
              <form @submit.prevent="saveCategory" class="mt-4 space-y-4">
                <!-- Name Field -->
                <div>
                  <label for="cat-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم الفئة *</label>
                  <input type="text" id="cat-name" v-model="form.name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <!-- Description Field -->
                <div>
                  <label for="cat-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الوصف</label>
                  <textarea id="cat-description" rows="3" v-model="form.description" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                </div>
                 <!-- Type Field -->
                 <div>
                   <label for="cat-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300">النوع *</label>
                   <!-- يمكنك استخدام select إذا كانت الأنواع محدودة أو input عادي -->
                   <input type="text" id="cat-type" v-model="form.type" required placeholder="مثل: lesson, study_course, book, sermon..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                   <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">يُستخدم لتصنيف المحتوى العام (مطلوب).</p>
                 </div>

                 <!-- Error Message -->
                <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">خطأ: {{ errorMessage }}</p>

                <!-- Action Buttons -->
                <div class="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse">
                  <button type="button" @click="closeModal" class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">إلغاء</button>
                  <button type="submit" :disabled="isSaving" class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50">
                     <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {{ isSaving ? 'جاري الحفظ...' : (isEditing ? 'حفظ التعديلات' : 'إضافة الفئة') }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import type { Database, Tables } from '~/types/database.types';

type Category = Tables<'categories'>;

const props = defineProps<{ show: boolean; categoryData: Category | null; }>();
const emit = defineEmits(['close', 'saved']);
const supabase = useSupabaseClient<Database>();

const form = ref<Partial<Category>>({});
const isSaving = ref(false);
const errorMessage = ref<string | null>(null);
const isEditing = computed(() => !!props.categoryData && !!props.categoryData.id);

watch(() => props.categoryData, (newData) => {
  if (newData) {
    form.value = { ...newData };
  } else {
    form.value = { name: '', description: '', type: '' }; // Reset for add
  }
  errorMessage.value = null;
}, { immediate: true, deep: true });

function closeModal() { if (!isSaving.value) emit('close'); }

async function saveCategory() {
  isSaving.value = true;
  errorMessage.value = null;

  // Basic validation
  if (!form.value.name?.trim() || !form.value.type?.trim()) {
      errorMessage.value = "اسم الفئة ونوعها حقول مطلوبة.";
      isSaving.value = false;
      return;
  }

  const payload: Omit<Category, 'id' | 'created_at'> = { // Omit fields managed by DB
    name: form.value.name,
    description: form.value.description || null,
    type: form.value.type,
  };

  try {
    let error: any;
    if (isEditing.value && form.value.id) {
      const result = await supabase.from('categories').update(payload).eq('id', form.value.id).select();
      error = result.error;
    } else {
      const result = await supabase.from('categories').insert(payload).select();
      error = result.error;
    }
    if (error) throw error;
    emit('saved');
  } catch (err: any) {
    
    errorMessage.value = `فشل حفظ الفئة: ${err.message || 'خطأ غير متوقع'}`;
  } finally {
    isSaving.value = false;
  }
}
</script>