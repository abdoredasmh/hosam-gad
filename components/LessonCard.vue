<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-cream-gray dark:border-gray-700/50 overflow-hidden group transition-shadow duration-300 hover:shadow-lg">
    <NuxtLink :to="`/lessons/${lesson.id}`" class="block group/link">
      <!-- منطقة الصورة المصغرة من يوتيوب -->
      <div class="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
        <!-- صورة الفيديو -->
        <img
          v-if="videoId && !imageError"
          :src="`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`" 
          :alt="`صورة مصغرة لدرس: ${lesson.title}`" 
          class="w-full h-full object-cover transition-transform duration-300 group-hover/link:scale-105"
          loading="lazy"
          decoding="async" 
          @error="handleImageError" 
        />
        <!-- أيقونة احتياطية (تظهر إذا لم يوجد videoId أو حدث خطأ في تحميل الصورة) -->
        <div v-else class="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="w-12 h-12 text-gray-400 dark:text-gray-500"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M10,15L15,12L10,9V15M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z"
            />
          </svg>
        </div>

        <!-- أيقونة التشغيل -->
        <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover/link:bg-opacity-40 transition-opacity duration-300 opacity-0 group-hover/link:opacity-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="w-12 h-12 text-white drop-shadow-lg transform transition-transform duration-300 group-hover/link:scale-110"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
            />
          </svg>
        </div>
      </div>

      <!-- النص -->
      <div class="p-4">
        <h3 class="font-semibold text-lg mb-1 line-clamp-2 text-brown-dark dark:text-beige-light group-hover/link:text-olive-green transition-colors duration-200">
          {{ lesson.title }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3"> 
          {{ lesson.description || 'لا يوجد وصف للفديو' }} 
        </p>
  
        <!--
        <p v-if="lesson.created_at" class="text-xs text-gray-400 dark:text-gray-500 mt-2">
           {{ new Date(lesson.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) }}
        </p>
        -->
      </div>
    </NuxtLink>
  </div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Tables } from '~/types/database.types'; // Import types if available

// Define Type for the lesson prop (Adjust based on actual data)
type LessonProp = Pick<Tables<'lessons'>, 'id' | 'title' | 'description' | 'youtube_url' | 'created_at'>; // Example

const props = defineProps({
  lesson: {
    type: Object as () => LessonProp, // Use the defined type
    required: true
  }
});

const imageError = ref(false); // State to track image loading error

// --- Improved YouTube Video ID Extraction using Regex ---
const getYouTubeVideoId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    // Regex covering various YouTube URL patterns (watch, embed, short, etc.)
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return (match && match[1]) ? match[1] : null;
  } catch (e) {
    
    return null;
  }
};

// Computed property for videoId
const videoId = computed(() => getYouTubeVideoId(props.lesson.youtube_url));

// --- Image Error Handler ---
const handleImageError = () => {
  
  imageError.value = true; // Set error state to true to hide the broken image
};

</script>

<style scoped>
/* Ensure line-clamp plugin styles are available */
/* You might not need these if the plugin is configured correctly */
/*
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
*/
</style>