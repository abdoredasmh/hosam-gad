<template>
  <div class="container mx-auto px-4 py-8 sm:py-12">

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل بيانات الدرس...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !lesson" class="text-center py-20 max-w-2xl mx-auto">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 mx-auto text-red-500 dark:text-red-400 mb-4" aria-hidden="true">
        <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.519 13.007a3 3 0 0 1-2.598 4.5H4.48a3 3 0 0 1-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
      </svg>
      <h2 v-if="error?.statusCode === 404" class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
        الدرس غير موجود
      </h2>
      <h2 v-else class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
        حدث خطأ
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ error?.statusMessage || 'لم نتمكن من العثور على الدرس المطلوب أو حدث خطأ أثناء تحميله.' }}
      </p>
      <NuxtLink
        to="/lessons"
        class="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors"
        :style="{ backgroundColor: 'var(--color-olive-green)' }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true" focusable="false">
          <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" />
        </svg>
        <span>العودة إلى قائمة الدروس</span>
      </NuxtLink>
    </div>

    <!-- Lesson Details Display -->
    <div v-else class="lesson-details max-w-5xl mx-auto space-y-8">
      <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark text-right"> 
        {{ lesson.title }}
      </h1>

      <!-- Video Section with Navigation Buttons -->
      <div class="video-section flex items-center gap-2 sm:gap-4">
        <!-- Previous Button -->
        <div class="flex-shrink-0">
         
          <NuxtLink
            v-if="previousLesson"
            :to="`/lessons/${previousLesson.id}`"
            class="w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            :title="`الدرس السابق: ${previousLesson.title}`"
            aria-label="الدرس السابق"
          >
            <span class="sr-only">الدرس السابق</span> 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true">
              <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
        
          <div v-else class="w-11 h-11 sm:w-14 sm:h-14"></div>
        </div>

        <!-- Video Player -->
        <div class="flex-grow min-w-0">
          <div v-if="youtubeVideoId" class="relative w-full rounded-lg overflow-hidden shadow-lg bg-black aspect-video"> 
            <iframe
              :src="`https://www.youtube.com/embed/${youtubeVideoId}`"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
              class="absolute inset-0 w-full h-full"
              title="مشغل فيديو الدرس"
            ></iframe>
          </div>
          <div v-else-if="lesson.youtube_url" class="p-4 bg-yellow-100 dark:bg-yellow-800 border border-yellow-300 dark:border-yellow-600 rounded-md text-yellow-800 dark:text-yellow-100 text-sm"> 
            <p>تعذر استخلاص معرف الفيديو من الرابط: <code class="break-all">{{ lesson.youtube_url }}</code>.</p>
            <p class="mt-1">قد يكون الرابط غير صحيح أو بتنسيق غير مدعوم.</p>
          </div>
          <div v-else class="p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 text-sm">
            <p>لا يوجد رابط يوتيوب متاح لهذا الدرس.</p>
          </div>
        </div>

        <!-- Next Button -->
        <div class="flex-shrink-0">
         
          <NuxtLink
            v-if="nextLesson"
            :to="`/lessons/${nextLesson.id}`"
            class="w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            :title="`الدرس التالي: ${nextLesson.title}`"
            aria-label="الدرس التالي"
          >
            <span class="sr-only">الدرس التالي</span> 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true">
              <path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
           
          <div v-else class="w-11 h-11 sm:w-14 sm:h-14"></div>
        </div>
      </div>

      <!-- Description -->
      <div class="description-section">
        <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-3">عن الدرس:</h2>
        <div v-if="lesson.description" class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          <p class="whitespace-pre-wrap">{{ lesson.description }}</p>
        </div>
        <p v-else class="text-gray-500 dark:text-gray-400 italic">
          لا يوجد وصف متاح لهذا الدرس.
        </p>
      </div>

      <!-- Linked Books -->
      <div class="downloads-section p-5 bg-beige-light dark:bg-cream-gray rounded-lg shadow-sm border border-cream-gray dark:border-gray-700">
        <h3 class="text-lg font-semibold text-brown-dark dark:text-brown-dark mb-4">ملفات مرتبطة:</h3>
        <div v-if="linkedBooks.length > 0" class="flex flex-row items-start gap-3 flex-wrap"> 
          <div v-for="book in linkedBooks" :key="book.id" class="flex-shrink-0"> 
            <button
              v-if="book.storage_path"
              @click="openPdfModal(book.storage_path, book.title)"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors"
              :style="{ backgroundColor: 'var(--color-olive-green)' }"
              :title="`عرض ${book.title}`"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true" focusable="false">
                 <path d="M10.5 2.75a.75.75 0 0 0-1.5 0v8.573l-1.44-1.246a.75.75 0 1 0-.94 1.162l2.5 2.143a.75.75 0 0 0 .94 0l2.5-2.143a.75.75 0 1 0-.94-1.162L10.5 11.323V2.75Z" />
                 <path d="M3.5 14.5a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 18.75h10.5A2.75 2.75 0 0 0 18 16v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
              
              </svg>
              <span>عرض: {{ book.title }} ({{ book.is_research ? 'بحث' : (book.is_transcript ? 'تفريغ' : 'كتاب') }})</span>
            </button>
            <span v-else class="inline-block px-4 py-2 text-xs text-gray-400 italic">({{ book.title }} - لا يوجد ملف مرفق)</span> 
          </div>
        </div>
        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          لا توجد ملفات إضافية متاحة للتحميل لهذا الدرس.
        </p>
      </div>

      <!-- Comments -->
      <CommentSection
        v-if="lessonId !== -1 && lesson"
        :lesson-id="lessonId"
      />
    </div>

    <!-- PDF Modal -->
    <ClientOnly>
      <LazyPdfViewerModal
        :show="showPdfModal"
        :storage-path="currentPdfPath"
        :book-title="currentPdfTitle"
        @close="closePdfModal"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import CommentSection from '~/components/CommentSection.vue';
const LazyPdfViewerModal = defineAsyncComponent(() => import('~/components/PdfViewerModal.client.vue'));

// --- Type definitions remain the same ---
type Lesson = Omit<Tables<'lessons'>, 'audio_url' | 'pdf_transcript_url'>;
type Book = Tables<'books'>;
type NavLesson = Pick<Lesson, 'id' | 'title'> | null;

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const lessonId = computed(() => {
  const id = Number(route.params.id);
  return isNaN(id) ? -1 : id;
});

const showPdfModal = ref(false);
const currentPdfPath = ref<string | null>(null);
const currentPdfTitle = ref('');

interface FetchedData {
  lesson: Lesson | null;
  linkedBooks: Book[];
  previousLesson: NavLesson;
  nextLesson: NavLesson;
}

const { data: fetchedData, pending, error, refresh } = await useAsyncData<FetchedData>(
  `lesson-details-catnav-filtered-${lessonId.value}`, // Updated key slightly for clarity
  async () => {
    const currentId = lessonId.value;
    if (currentId === -1) {
      throw createError({ statusCode: 400, statusMessage: 'معرف الدرس غير صالح.', fatal: true }); // Make critical errors fatal
    }

    // Fetch current lesson
    const { data: currentLessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('id, title, description, youtube_url, category_id, course_id, created_at')
      .eq('id', currentId)
      .maybeSingle();

    if (lessonError) {

      throw createError({ statusCode: 500, statusMessage: `حدث خطأ أثناء تحميل بيانات الدرس.`, fatal: true });
    }
    if (!currentLessonData) {
      throw createError({ statusCode: 404, statusMessage: 'الدرس المطلوب غير موجود.', fatal: true });
    }

    let previousLessonData: NavLesson = null;
    let nextLessonData: NavLesson = null;
    let booksData: Book[] = [];
    const currentCategoryId = currentLessonData.category_id;

    // --- Parallel Fetches ---
    const fetches: Promise<any>[] = [
        // Fetch linked books
        supabase
            .from('books')
            .select('id, title, storage_path, is_research, is_transcript')
            .eq('linked_lesson_id', currentId)
    ];

    // --- Conditional Fetch for Nav Lessons ---
    // Only fetch if there's a category_id and NO course_id on the *current* lesson
    // (assuming we only navigate between non-course lessons)
    // OR if the requirement is just that the *target* prev/next lesson has no course_id,
    // then we only need the filter inside the queries below. Let's assume the second case.

    if (currentCategoryId !== null) {
        // Fetch previous lesson (in category, no course_id)
        fetches.push(
            supabase
                .from('lessons')
                .select('id, title')
                .eq('category_id', currentCategoryId)
                .filter('course_id', 'is', null) // <-- **ADDED FILTER**
                .lt('id', currentId)
                .order('id', { ascending: false })
                .limit(1)
                .maybeSingle()
        );
        // Fetch next lesson (in category, no course_id)
        fetches.push(
            supabase
                .from('lessons')
                .select('id, title')
                .eq('category_id', currentCategoryId)
                .filter('course_id', 'is', null) // <-- **ADDED FILTER**
                .gt('id', currentId)
                .order('id', { ascending: true })
                .limit(1)
                .maybeSingle()
        );
    }
    // --- End Conditional Fetch ---

    const results = await Promise.all(fetches);

    // Process results
    const booksResult = results[0];
    if (booksResult.error) {

      // Non-fatal error, maybe show a message later
    } else {
      booksData = booksResult.data ?? [];
    }

    // Process nav lesson results ONLY if they were fetched
    if (currentCategoryId !== null && results.length === 3) {
        const prevResult = results[1];
        const nextResult = results[2];

        if (prevResult.error) {

        } else {
            previousLessonData = prevResult.data; // Will be null if query returns no rows
        }

        if (nextResult.error) {

        } else {
            nextLessonData = nextResult.data; // Will be null if query returns no rows
        }
    }

    return {
      lesson: currentLessonData,
      linkedBooks: booksData,
      previousLesson: previousLessonData,
      nextLesson: nextLessonData
    };
  },
  {
    watch: [lessonId], // Re-run when lessonId changes
  }
);

// --- Computed properties remain largely the same ---
const lesson = computed(() => fetchedData.value?.lesson ?? null);
const linkedBooks = computed(() => fetchedData.value?.linkedBooks ?? []);
const previousLesson = computed(() => fetchedData.value?.previousLesson ?? null); // This will now be null if fetched lesson had a course_id or didn't exist
const nextLesson = computed(() => fetchedData.value?.nextLesson ?? null); // This will now be null if fetched lesson had a course_id or didn't exist

const youtubeVideoId = computed(() => {
   if (!lesson.value?.youtube_url) return null;
  try {
    // Regex to capture video ID from various YouTube URL formats
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = lesson.value.youtube_url.match(regex);
    return (match && match[1]) ? match[1] : null;
  } catch (e) {

    return null;
  }
});

// --- Head remains the same ---
useHead(computed(() => {
  const title = lesson.value?.title ? `درس: ${lesson.value.title}` : (pending.value ? 'جارٍ التحميل...' : 'تفاصيل الدرس');
  const baseDescription = lesson.value?.description?.substring(0, 100) || `شاهد تفاصيل درس ${lesson.value?.title || ''}.`;
  let linkedItemsDescription = '';
  if (linkedBooks.value.length > 0) {
      const itemTypes = linkedBooks.value
          .map(book => book.is_research ? 'بحث' : (book.is_transcript ? 'تفريغ' : 'كتاب'))
          .filter((v, i, a) => a.indexOf(v) === i) // Unique types
          .join(', ');
      linkedItemsDescription = ` يتضمن ملفات مرتبطة: ${itemTypes}.`;
  }
  const fullDescription = (baseDescription + linkedItemsDescription).substring(0, 160); // Limit length

  return {
    title: title,
    meta: [
      { name: 'description', content: fullDescription },
      { property: 'og:title', content: title },
      { property: 'og:description', content: fullDescription },
      { property: 'og:type', content: 'article' },
      // Ensure URL is generated correctly on client/server
      { property: 'og:url', content: process.client ? window.location.href : `https://yourdomain.com${route.fullPath}` }, // Replace with your actual domain
      // Potentially add og:image if you have a thumbnail logic
    ]
  };
}));

// --- Modal functions remain the same ---
function openPdfModal(path: string | null | undefined, title: string | null | undefined) {
  if (path && typeof path === 'string') {
    currentPdfPath.value = path;
    currentPdfTitle.value = title || 'ملف مرتبط';
    showPdfModal.value = true;
  } else {
    // Optionally show an alert or log if path is missing

  }
}

function closePdfModal() {
  showPdfModal.value = false;
  // Reset state if needed
  // currentPdfPath.value = null;
  // currentPdfTitle.value = '';
}

// --- watchEffect can be removed if it's not doing anything specific ---
// watchEffect(() => {
//   // Cleanup or side effects when component unmounts or dependencies change
//   // Example: if (error.value) { /* Track error */ }
// });

</script>

<style scoped>
/* Styles remain the same */
.prose :where(p):not(:where([class~="not-prose"] *)) { margin-top: 0.75em; margin-bottom: 0.75em; line-height: 1.7; }
code { word-break: break-all; font-size: 0.875em; background-color: rgba(0,0,0,0.05); padding: 0.1em 0.3em; border-radius: 0.25rem; }
.dark code { background-color: rgba(255,255,255,0.1); }

/* Ensure aspect-video works */
.aspect-video {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
}

.aspect-video iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>