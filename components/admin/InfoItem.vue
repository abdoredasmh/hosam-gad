<template>
  <div class="info-item flex justify-between items-baseline gap-x-2">
    <!-- Label Section -->
    <dt :class="['text-gray-500 dark:text-gray-400 flex-shrink-0', labelClass]">
      {{ label }}{{ label ? ':' : '' }} <!-- Add colon automatically if label exists -->
    </dt>

    <!-- Value Section -->
    <dd :class="['text-gray-900 dark:text-gray-100 text-left', valueClass]">
      <slot>
        <!-- Default content: Render the value prop if slot is not used -->
        {{ value ?? 'N/A' }} <!-- Display 'N/A' if value is null or undefined -->
      </slot>
    </dd>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

// Define component props using TypeScript interface for better type checking
interface Props {
  /**
   * The text label to display for the information item.
   */
  label: string;

  /**
   * The value to display. This is ignored if the default slot is used.
   * Can be string, number, or null/undefined.
   */
  value?: string | number | null;

  /**
   * Optional CSS classes to apply specifically to the label element (dt).
   */
  labelClass?: string;

  /**
   * Optional CSS classes to apply specifically to the value element (dd).
   */
  valueClass?: string;
}

// Define the props using the interface
// No need for withDefaults if defaults are simple (like handling null/undefined in template)
const props = defineProps<Props>();

</script>

<style scoped>
/* Scoped styles for the component if needed, although primarily using Tailwind */
.info-item {
  /* Ensures that if the value is very long, it wraps correctly */
  /* The text-left on dd helps in RTL/LTR consistency */
}

/* You could add more specific base styles here if desired */
/* For example:
dt {
  font-weight: 500;
}
*/
</style>