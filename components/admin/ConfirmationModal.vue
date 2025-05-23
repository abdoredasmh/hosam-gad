<template>
  <!-- Root transition for the entire modal -->
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <!-- Background overlay transition -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
      </TransitionChild>

      <!-- Container to center the modal panel -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <!-- Modal panel transition -->
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all">
              <!-- Modal Title -->
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-3 mb-4">
                <!-- Use title from config, fallback to default -->
                {{ config?.title || 'تأكيد الإجراء' }}
              </DialogTitle>

              <!-- Modal Message/Content -->
              <div class="mt-3">
                <p class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  <!-- Use message from config, fallback to default -->
                  {{ config?.message || 'هل أنت متأكد من رغبتك في المتابعة؟' }}
                </p>
              </div>

              <!-- Modal Action Buttons -->
              <div class="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3 justify-center sm:justify-start">
                <!-- Confirm Button -->
                <button
                  type="button"
                  :class="['inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 w-full sm:w-auto', config?.confirmClass || 'bg-red-600 hover:bg-red-700 focus:ring-red-500']"
                  @click="confirmAction"
                >
                  <!-- Use confirm text from config, fallback to default -->
                  {{ config?.confirmText || 'تأكيد' }}
                </button>
                <!-- Cancel Button (Conditionally rendered by parent via config, assumed always shown here based on previous usage) -->
                 <button
                   v-if="showCancelButton" <!-- Optional: Control visibility via prop if needed -->
                   type="button"
                   class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 w-full sm:w-auto mt-3 sm:mt-0"
                   @click="closeModal"
                 >
                   <!-- Use cancel text from config, fallback to default -->
                   {{ config?.cancelText || 'إلغاء' }}
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
import { ref, watch, computed } from 'vue'; // Add computed if needed later
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'; // Ensure @headlessui/vue is installed

// Define the structure for the confirmation configuration object
// This interface is exported so parent components can import it for type safety
export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string; // Optional confirm button text
  cancelText?: string;  // Optional cancel button text
  confirmClass?: string; // Optional classes for the confirm button (e.g., color)
}

// Define component props
const props = defineProps<{
  config: ConfirmationConfig | null; // The configuration object, required for the modal to show meaningful content
  modelValue: boolean; // Required for v-model usage (controls visibility)
  // Optional prop to explicitly control cancel button visibility, if needed
  // If not provided, the cancel button will always show based on the template logic above
  showCancelButton?: boolean;
}>();

// Define component emits
const emit = defineEmits<{
  (e: 'confirm'): void; // Emitted when the confirm button is clicked
  (e: 'close'): void;   // Emitted when the modal is closed (via cancel button or overlay click)
  (e: 'update:modelValue', value: boolean): void; // Required for v-model usage
}>();

// Internal state for modal visibility, synced with modelValue
const isOpen = ref(props.modelValue);

// Watch for changes in the v-model value from the parent
watch(() => props.modelValue, (newVal) => {
  // Update internal state only if the prop changes
  if (newVal !== isOpen.value) {
      isOpen.value = newVal;
  }
});

// Watch for changes in the config object.
// If a new config is provided (and not null), automatically open the modal.
// This is useful if the parent sets the config and expects the modal to appear.
watch(() => props.config, (newConfig) => {
  if (newConfig && !isOpen.value) {
    isOpen.value = true;
    // Emit update back to parent in case v-model wasn't already true
    emit('update:modelValue', true);
  }
  // If config becomes null and modal is open, close it (optional behavior)
  // else if (!newConfig && isOpen.value) {
  //   closeModal();
  // }
}, { immediate: false }); // Don't run immediately on mount based on initial config


// Function to close the modal
function closeModal() {
  isOpen.value = false; // Update internal state
  emit('update:modelValue', false); // Emit update for v-model
  emit('close'); // Emit close event
}

// Function to handle confirm action
function confirmAction() {
  emit('confirm'); // Emit confirm event
  // Let the parent component decide whether to close the modal after confirmation
  // closeModal(); // Usually, you DON'T close it here automatically
}
</script>

<style scoped>
/* Add any specific scoped styles if needed */
</style>