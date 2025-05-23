<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-cream-gray dark:border-gray-700/50 overflow-hidden group transition-shadow duration-300 hover:shadow-lg flex flex-col">
    <!-- Course Image -->
    <NuxtLink :to="courseLink" class="block relative aspect-video overflow-hidden">
      <img
        :src="imageUrl"
        :alt="`غلاف دورة: ${course.title}`"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        decoding="async"
        @error="onImageError"
      />
       <!-- Placeholder for missing image -->
       <div v-if="imageLoadError" class="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm16.5-5.818V18" /></svg>
       </div>
    </NuxtLink>

    <!-- Course Content -->
    <div class="p-4 flex flex-col flex-grow">
      <NuxtLink :to="courseLink">
         <h3 class="font-semibold text-lg mb-1 line-clamp-2 text-brown-dark dark:text-beige-light group-hover:text-olive-green transition-colors duration-200">
            {{ course.title }}
         </h3>
      </NuxtLink>
      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 flex-grow">
        {{ course.description || '...' }}
      </p>
      <!-- Course Meta (e.g., lesson count) -->
      <div class="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between mt-2">
         <span v-if="lessonCount !== undefined">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5 inline-block align-middle me-1"><path d="M2 2.75C2 1.784 2.784 1 3.75 1h8.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25V2.75Z"></path><path d="M4.75 5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5ZM4 9.75A.75.75 0 0 1 4.75 9h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 9.75Z"></path></svg>
            {{ lessonCount }} {{ lessonCount === 1 ? 'درس' : (lessonCount <= 10 ? 'دروس' : 'درس') }}
         </span>
         <!-- Optionally add category name -->
         <!-- <span v-if="course.category_id">{{ getCategoryName(course.category_id) }}</span> -->
      </div>
    </div>

    <!-- Action Button -->
    <div class="px-4 pb-4 mt-auto">
      <button v-if="!isEnrolled" @click="emitEnroll" :disabled="enrollLoading"
              class="w-full button-enroll">
         <span v-if="!enrollLoading">انتساب للدورة</span>
         <span v-else>جاري الانتساب...</span>
      </button>
       <NuxtLink v-else :to="courseLink" class="w-full button-view">
           عرض الدورة
       </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Tables } from '~/types/database.types';

type Course = Tables<'study_courses'>;

const props = defineProps<{
  course: Course;
  lessonCount?: number | null;
  isEnrolled: boolean; // Passed from parent page
}>();

const emit = defineEmits<{
  (e: 'enroll', courseId: number): void;
}>();

const imageLoadError = ref(false);
const enrollLoading = ref(false); // Simple loading state for enroll button

const imageUrl = computed(() => props.course.image_url || '/images/placeholder-course.jpg');
const courseLink = computed(() => `/study/courses/${props.course.id}`);

function onImageError() {
  imageLoadError.value = true;
}

function emitEnroll() {
  // You could set enrollLoading to true here, but the parent handles the actual API call
  // and disabling the button should happen based on the parent's loading state if needed.
  // For simplicity, we just emit.
  emit('enroll', props.course.id);
}

</script>

<style scoped>
/* Add specific card styles if needed */
 .button-enroll {
    @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green disabled:opacity-50 disabled:cursor-not-allowed;
 }
 .button-view {
    @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
 }
</style>