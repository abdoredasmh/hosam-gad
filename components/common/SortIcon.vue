<template>
  <span class="inline-block w-4 h-4 align-middle">
    <svg v-if="direction === 'asc'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
    <svg v-else-if="direction === 'desc'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
    <!-- Optional: Default/Unsorted Icon (subtle lines or dots) -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-gray-400 dark:text-gray-500">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    </svg>


  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  direction: 'asc' | 'desc' | 'none';
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'none',
});
</script>

<style scoped>
/* Add any specific styles if needed, but Tailwind classes should suffice */
</style>