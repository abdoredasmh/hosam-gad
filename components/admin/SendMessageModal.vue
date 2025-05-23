<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-40">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      </TransitionChild>

      <!-- Full-screen container to center the panel -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <!-- Modal panel -->
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all">
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
              >
                إرسال رسالة خاصة إلى {{ user?.full_name || 'المستخدم المحدد' }}
              </DialogTitle>

              <form @submit.prevent="sendMessage">
                 <div class="mt-4 space-y-4">
                   <div>
                     <label for="message-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">عنوان الرسالة *</label>
                     <input
                       type="text"
                       id="message-title"
                       v-model="messageTitle"
                       required
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                       :disabled="isLoading"
                     />
                   </div>
                   <div>
                     <label for="message-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">محتوى الرسالة *</label>
                     <textarea
                       id="message-content"
                       v-model="messageContent"
                       rows="6"
                       required
                       placeholder="اكتب رسالتك هنا..."
                       class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                       :disabled="isLoading"
                     ></textarea>
                   </div>
                   <!-- Display Error Message Directly -->
                   <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded border border-red-300 dark:border-red-700">
                     {{ errorMessage }}
                   </p>
                 </div>

                 <div class="mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-4">
                    <button
                      type="submit"
                      :disabled="isLoading || !isFormValid"
                      class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <LoadingSpinner v-if="isLoading" class="w-5 h-5 text-white -ml-1 mr-2 rtl:ml-2 rtl:-mr-1" />
                      {{ isLoading ? 'جارٍ الإرسال...' : 'إرسال الرسالة' }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-70"
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

// --- Types ---
type UserProp = {
    id: string;
    full_name: string | null;
    // Include email just in case full_name is null, for display
    auth_email?: string | null;
} | null;

type PrivateMessage = Tables<'user_private_messages'>;
// Define the exact type for the insert payload using Omit
type PrivateMessageInsert = Omit<PrivateMessage, 'id' | 'created_at' | 'is_read' | 'related_question_id' | 'user_reply_text' | 'user_replied_at' | 'admin_read_reply'>;

// --- Props ---
const props = defineProps({
  user: {
    type: Object as PropType<UserProp>,
    required: true,
  },
  modelValue: { // For v-model support to control visibility
    type: Boolean,
    default: false,
  }
});

// --- Emits ---
// Define the 'sent' event signature clearly
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:modelValue', value: boolean): void;
  (e: 'sent', success: true, messageData: PrivateMessage): void; // On success, pass the full message object
  (e: 'sent', success: false, messageData: null, errorMsg: string): void; // On failure, pass null for data and the error message
}>();

// --- Composables ---
const supabase = useSupabaseClient<Database>();

// --- State ---
const isOpen = ref(props.modelValue);
const messageTitle = ref('');
const messageContent = ref('');
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

// --- Computed ---
const isFormValid = computed(() => {
  return messageTitle.value.trim().length > 0 && messageContent.value.trim().length > 0;
});

// --- Watchers ---
// Watch v-model changes to control modal visibility
watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal;
  if (newVal) {
    // Reset form and errors when modal opens
    messageTitle.value = '';
    messageContent.value = '';
    errorMessage.value = null;
    isLoading.value = false; // Ensure loading state is reset
  }
});

// --- Methods ---
function closeModal() {
  if (isLoading.value) return; // Prevent closing while submitting
  isOpen.value = false;
  emit('update:modelValue', false); // Sync v-model
  emit('close');
}

async function sendMessage() {
  // 1. Validation
  if (!props.user) {
    errorMessage.value = "خطأ: بيانات المستخدم غير متوفرة.";
    return;
  }
  if (!isFormValid.value) {
      errorMessage.value = "الرجاء ملء حقلي العنوان والمحتوى.";
      return;
  }
  if (isLoading.value) return; // Prevent double submission

  // 2. Set Loading State & Clear Error
  isLoading.value = true;
  errorMessage.value = null;

  try {
      // 3. Prepare Payload
      const payload: PrivateMessageInsert = {
          user_id: props.user.id,
          title: messageTitle.value.trim(),
          content: messageContent.value.trim(),
          source: 'admin_direct_message' // Indicate it's a direct message from admin
          // is_read defaults to false in DB or via policy? Assuming false needed.
          // other fields like reply info will be null/default
      };

      // 4. *** CRITICAL STEP: Insert AND Select the new row ***
      const { data: insertedMessage, error } = await supabase
          .from('user_private_messages')
          .insert(payload)
          .select() // Select all columns of the inserted row
          .single(); // Expect exactly one row back

      // 5. Handle Potential Errors from Supabase
      if (error) {
          
          throw new Error(error.message || "فشل إرسال الرسالة إلى قاعدة البيانات.");
      }

      // 6. Verify Data was Returned and Emit Success
      if (insertedMessage) {
          // *** SUCCESS: Emit 'sent' with true and the full message data ***
          emit('sent', true, insertedMessage);
          closeModal(); // Close modal on successful send
      } else {
           // This case is unlikely if no error occurred, but handle defensively
          
          throw new Error("حدث خطأ غير متوقع: لم يتم استلام تأكيد الإرسال.");
      }

  } catch (err: any) {
      // 7. Handle Any Errors (Network, Supabase, Verification)
      
      const displayError = typeof err.message === 'string' ? err.message : "حدث خطأ غير متوقع أثناء الإرسال.";
      errorMessage.value = displayError;
      // *** FAILURE: Emit 'sent' with false, null data, and the error message ***
      emit('sent', false, null, displayError);
  } finally {
      // 8. Reset Loading State Regardless of Outcome
      isLoading.value = false;
  }
}
</script>

<style scoped>
/* Add any specific styles if needed, e.g., for scrollbars if content overflows */
</style>