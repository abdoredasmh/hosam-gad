<template>
  <div
    class="book-card group block bg-white dark:bg-cream-gray rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer"
    role="link"
    tabindex="0"
    @click="goToBook"
    @keydown.enter="goToBook"
    @keydown.space.prevent="goToBook"
    :aria-label="`عرض تفاصيل كتاب ${book.title}`"
  >
    <div class="flex flex-col h-full">
      <!-- Book Cover Image Area -->
      <div class="relative h-48 bg-cream-gray dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <img
          v-if="book.cover_image_url && !imageError"
          :src="book.cover_image_url"
          :alt="`غلاف ${book.title}`"
          class="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          @error.stop="handleImageError"
        />
        <!-- Placeholder Icon -->
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
          aria-hidden="true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="text-6xl text-gray-400 dark:text-gray-500 w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            <title>رمز كتاب بديل</title>
            <path d="M6 4v16c0 .6.4 1 1 1h13v-2H8V5h12V3H7c-.6 0-1 .4-1 1zm3 2h8v2H9V6zm0 4h8v2H9v-2zm0 4h5v2H9v-2z"/>
          </svg>
        </div>

        <!-- Badges -->
        <div v-if="book.is_research || book.is_transcript" class="absolute top-2 start-2 flex gap-1">
          <span
            v-if="book.is_research"
            class="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          >
            بحث
          </span>
          <span
            v-if="book.is_transcript"
            class="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          >
            تفريغ
          </span>
        </div>
      </div>

      <!-- Book Details -->
      <div class="p-4 flex flex-col flex-grow">
        <h3
          class="text-lg font-semibold text-brown-dark dark:text-brown-dark mb-2 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200"
          :title="book.title"
        >
          {{ book.title }}
        </h3>

        <p
          v-if="book.description"
          class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow"
        >
          {{ book.description }}
        </p>
        <!-- Spacer to push actions down if description is short or absent -->
        <div v-else class="flex-grow"></div>

        <!-- Links/Actions -->
        <div class="mt-auto flex flex-col space-y-2">
          <!-- Link to Original Lesson -->
          <NuxtLink
            v-if="book.is_transcript && book.linked_lesson_id"
            :to="`/lessons/${book.linked_lesson_id}`"
            @click.stop
            class="button-secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 me-2" fill="currentColor" viewBox="0 0 20 20">
              <title>عرض الدرس الأصلي</title>
              <path fill-rule="evenodd" d="M12.293 2.293a1 1 0 011.414 0L18 6.586V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h8.586a1 1 0 01.707.293zM11 6a1 1 0 00-1 1v3.586l-.293-.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 10-1.414-1.414L12 10.586V7a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            عرض الدرس الأصلي
          </NuxtLink>

          <!-- View Book Button (using NuxtLink for SPA navigation benefits) -->
          <NuxtLink
            :to="`/books/${book.id}`"
            @click.stop
            class="button-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 me-2" fill="currentColor" viewBox="0 0 20 20">
               <title>عرض الكتاب</title>
               <!-- Icon changed slightly for 'open book' feel, but original is fine too -->
               <path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H7z" clip-rule="evenodd" />
            </svg>
            عرض الكتاب
          </NuxtLink>

          <p v-if="!book.storage_path" class="text-xs text-center text-red-500 dark:text-red-400 mt-1">
            ملف الكتاب غير متاح حاليًا.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue';
import { navigateTo } from '#imports';
import type { Database } from '~/types/database.types';

type Book = Database['public']['Tables']['books']['Row'];

const props = defineProps({
  book: {
    type: Object as PropType<Book>,
    required: true,
  },
});

const imageError = ref(false);

function handleImageError() {
  // Consider logging this error for monitoring
  // 
  imageError.value = true;
}

function goToBook() {
  navigateTo(`/books/${props.book.id}`);
}

</script>

<style scoped>
/* Define reusable component classes using @apply (optional but can be cleaner) */
.badge {
  @apply text-xs font-medium px-2.5 py-0.5 rounded;
}

.button-base {
 @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-cream-gray transition-colors duration-200 shadow-sm;
 /* Ensure buttons are above potential pseudo-elements if any */
 position: relative;
 z-index: 1;
}

.button-primary {
  @apply button-base border-transparent text-white bg-primary hover:bg-primary-700 focus:ring-primary-500 dark:text-beige-light dark:bg-primary dark:hover:bg-opacity-80;
   /* Since primary is a CSS var, hover might need adjustment depending on the specific hex values used for 700 */
   /* If primary-700 isn't defined, adjust hover like: dark:hover:brightness-110 */
}

.button-secondary {
  @apply button-base border-golden-calm text-golden-calm hover:bg-golden-calm hover:text-white dark:border-golden-calm dark:text-golden-calm dark:hover:bg-golden-calm dark:hover:text-gray-900 focus:ring-golden-calm;
}

/* Optional: Subtle visual cue on card focus/hover */
.book-card:focus,
.book-card:hover {
  /* Example: Slightly lift the card */
  /* transform: translateY(-2px); */
}

/* Ensure focus outline is visible clearly on dark background for the card itself */
.dark .book-card:focus {
   /* Use a lighter ring color or adjust offset */
  /* focus:ring-offset-gray-900 is already set, which is good */
}

</style>