<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="emitCancel" class="relative z-50">
      <!-- Overlay -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
      </TransitionChild>

      <!-- Modal Content -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all space-y-5 border dark:border-gray-700">
              <!-- Modal Title -->
              <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 border-b dark:border-gray-600 pb-3 flex items-center">
                 <!-- Optional Icon -->
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 me-2 text-red-600 dark:text-red-400">
                   <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                 </svg>
                {{ title }}
              </DialogTitle>

              <!-- Modal Message -->
              <div class="mt-2">
                <p class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {{ message }}
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="mt-6 pt-4 border-t dark:border-gray-600 flex flex-col-reverse sm:flex-row sm:justify-start sm:space-x-3 sm:space-x-reverse gap-3">
                <button
                  type="button"
                  @click="emitConfirm"
                  :class="['button-base w-full sm:w-auto justify-center', confirmButtonClass]"
                >
                  {{ confirmButtonText }}
                </button>
                <button
                  type="button"
                  @click="emitCancel"
                  :class="['button-base w-full sm:w-auto justify-center', cancelButtonClass]"
                  ref="cancelButtonRef"
                >
                  {{ cancelButtonText }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'; // تأكد من تثبيت @headlessui/vue

// --- Props Definition ---
// تعريف الخصائص التي يمكن تمريرها للمودال لتخصيصه
const props = defineProps({
  isOpen: { // حالة الفتح/الإغلاق
    type: Boolean,
    required: true,
  },
  title: { // عنوان المودال
    type: String,
    default: 'تأكيد الإجراء',
  },
  message: { // الرسالة المعروضة للمستخدم
    type: String,
    required: true,
  },
  confirmButtonText: { // نص زر التأكيد
    type: String,
    default: 'تأكيد',
  },
  cancelButtonText: { // نص زر الإلغاء
    type: String,
    default: 'إلغاء',
  },
  confirmButtonVariant: { // نوع زر التأكيد (للتحكم في الألوان)
    type: String as () => 'danger' | 'primary' | 'success', // تحديد الأنواع الممكنة
    default: 'danger', // الافتراضي هو خطر (مثل الحذف)
  },
});

// --- Emits Definition ---
// تعريف الأحداث التي يصدرها المكون للتواصل مع المكون الأب
const emit = defineEmits(['confirm', 'cancel']);

// --- Event Handlers ---
// دالة تصدر حدث التأكيد عند النقر على زر التأكيد
const emitConfirm = () => {
  emit('confirm');
};

// دالة تصدر حدث الإلغاء عند النقر على زر الإلغاء أو إغلاق المودال
const emitCancel = () => {
  emit('cancel');
};

// --- Computed Button Classes ---
// خصائص محسوبة لتحديد كلاسات CSS لأزرار التأكيد والإلغاء بناءً على variant
const confirmButtonClass = computed(() => {
  switch (props.confirmButtonVariant) {
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 border-transparent shadow-sm';
    case 'primary':
      return 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 border-transparent shadow-sm';
    case 'success':
        return 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 border-transparent shadow-sm';
    default:
      return 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 border-transparent shadow-sm'; // الافتراضي danger
  }
});

const cancelButtonClass = computed(() => {
  return 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus-visible:ring-gray-500 shadow-sm';
});

</script>

<style scoped>
/* تعريف كلاس أساسي للأزرار لتقليل التكرار */
.button-base {
  @apply inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-150 ease-in-out disabled:opacity-50;
}
</style>