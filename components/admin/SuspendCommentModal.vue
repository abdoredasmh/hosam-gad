<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-40">
      <!-- ... (Backdrop similar to ConfirmationModal) ... -->
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
         <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
       </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3">
                إيقاف التعليقات للمستخدم: {{ user?.full_name || user?.auth_email }}
              </DialogTitle>

              <form @submit.prevent="suspendComments">
                 <div class="mt-4 space-y-4">
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        حدد مدة إيقاف المستخدم عن إضافة تعليقات جديدة. سيتمكن من التعليق مرة أخرى بعد انتهاء المدة.
                    </p>
                   <div>
                     <label for="suspension-duration" class="block text-sm font-medium text-gray-700 dark:text-gray-300">مدة الإيقاف *</label>
                     <select id="suspension-duration" v-model="durationValue" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                       <option value="1_day">يوم واحد</option>
                       <option value="3_days">3 أيام</option>
                       <option value="1_week">أسبوع واحد</option>
                       <option value="1_month">شهر واحد</option>
                       <option value="custom">مدة مخصصة (تاريخ الانتهاء)</option>
                     </select>
                   </div>
                   <div v-if="durationValue === 'custom'">
                     <label for="suspension-until" class="block text-sm font-medium text-gray-700 dark:text-gray-300">تاريخ انتهاء الإيقاف *</label>
                     <input type="datetime-local" id="suspension-until" v-model="customUntilDate" required :min="minDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                   </div>
                   <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
                 </div>

                 <div class="mt-6 flex justify-start gap-3">
                    <button
                      type="submit"
                      :disabled="isLoading || (durationValue === 'custom' && !customUntilDate)"
                      class="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                    >
                       <LoadingSpinner v-if="isLoading" class="w-5 h-5 text-white -ml-1 mr-2" />
                      {{ isLoading ? 'جارٍ الإيقاف...' : 'إيقاف التعليقات' }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      @click="closeModal"
                      :disabled="isLoading"
                    >
                      إلغاء
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
import { ref, watch, computed, type PropType } from 'vue';
import {
  Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild
} from '@headlessui/vue';
import type { Database, Tables } from '~/types/database.types';
import { useSupabaseClient } from '#imports';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import { addDays, addWeeks, addMonths } from 'date-fns'; // For calculating dates

// Define the user type expected by the modal
type UserProp = {
    id: string;
    full_name: string | null;
    auth_email?: string | null;
} | null;

const props = defineProps({
  user: {
    type: Object as PropType<UserProp>,
    required: true,
  },
  modelValue: { // For v-model support
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['close', 'suspended', 'update:modelValue']);

const supabase = useSupabaseClient<Database>();
const isOpen = ref(props.modelValue);
const durationValue = ref<'1_day' | '3_days' | '1_week' | '1_month' | 'custom'>('1_day');
const customUntilDate = ref('');
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

// Minimum date for custom input (today)
const minDate = computed(() => {
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset()); // Adjust for local timezone for input
    return today.toISOString().slice(0, 16); // Format for datetime-local
});


watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal;
  if (newVal) {
    // Reset form when modal opens
    durationValue.value = '1_day';
    customUntilDate.value = '';
    errorMessage.value = null;
    isLoading.value = false;
  }
});

function closeModal() {
  if (isLoading.value) return;
  isOpen.value = false;
  emit('update:modelValue', false);
  emit('close');
}

async function suspendComments() {
  if (!props.user || isLoading.value) return;

  let suspendUntil: Date | null = null;
  const now = new Date();

  try {
    switch (durationValue.value) {
        case '1_day': suspendUntil = addDays(now, 1); break;
        case '3_days': suspendUntil = addDays(now, 3); break;
        case '1_week': suspendUntil = addWeeks(now, 1); break;
        case '1_month': suspendUntil = addMonths(now, 1); break;
        case 'custom':
            if (!customUntilDate.value) {
                errorMessage.value = "الرجاء تحديد تاريخ انتهاء الإيقاف.";
                return;
            }
            suspendUntil = new Date(customUntilDate.value);
            if (isNaN(suspendUntil.getTime()) || suspendUntil <= now) {
                errorMessage.value = "تاريخ الانتهاء يجب أن يكون في المستقبل.";
                return;
            }
            break;
        default:
             errorMessage.value = "مدة إيقاف غير صالحة.";
             return;
    }
  } catch (e) {
      errorMessage.value = "تنسيق التاريخ غير صالح.";
      return;
  }


  isLoading.value = true;
  errorMessage.value = null;

  try {
      const suspendUntilISO = suspendUntil.toISOString();

      const { error } = await supabase
          .from('profiles')
          .update({ comment_suspended_until: suspendUntilISO })
          .eq('id', props.user.id);

      if (error) throw error;

      emit('suspended', props.user.id, true, suspendUntilISO); // Emit success with user ID and expiry date
      closeModal();

  } catch (err: any) {
      
      errorMessage.value = err.message || "فشل إيقاف تعليقات المستخدم.";
      // Optionally emit failure: emit('suspended', props.user.id, false, null, errorMessage.value);
  } finally {
      isLoading.value = false;
  }
}
</script>