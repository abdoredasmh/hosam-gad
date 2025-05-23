<template>
  <div class="container mx-auto px-4 py-8">

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل بيانات الكتاب...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !book" class="text-center py-20">
      <h2 v-if="(error as any)?.statusCode === 404" class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
         الكتاب غير موجود
      </h2>
      <h2 v-else class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
         حدث خطأ
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
         {{ (error as any)?.statusMessage || 'لم نتمكن من العثور على الكتاب المطلوب أو حدث خطأ أثناء تحميله.' }}
      </p>
      <NuxtLink
        to="/books"
        class="button-primary"
      >
        <!-- SVG Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true">
           <title>العودة للمكتبة</title>
           <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-4.75a.75.75 0 0 0 0 1.5h4.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 1 0-1.02 1.1l2.1 1.95H9.25a.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
        </svg>
        <span>العودة إلى المكتبة</span>
      </NuxtLink>
    </div>

    <!-- Book Details Display (Use v-if instead of v-else) -->
    <div v-if="!pending && !error && book" class="book-details">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Book Cover & Actions Column -->
        <div class="md:col-span-1">
           <div class="relative aspect-[3/4] bg-cream-gray dark:bg-gray-700 flex items-center justify-center rounded-lg shadow-md overflow-hidden">
             <img
               v-if="book.cover_image_url && !imageError"
               :src="book.cover_image_url"
               :alt="`غلاف ${book.title}`"
               class="w-full h-full object-contain"
               loading="lazy"
               decoding="async"
               @error="handleImageError"
             />
             <!-- Placeholder SVG -->
             <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-8xl text-gray-400 dark:text-gray-500 w-24 h-24" aria-hidden="true">
                <title>غلاف كتاب بديل</title>
                <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533v-1.27a.75.75 0 0 0-.624-.744A8.25 8.25 0 0 1 6 18.75a8.25 8.25 0 0 1-5.25-2.268v-2.156a.75.75 0 0 0 .51-.698A8.217 8.217 0 0 1 6 13.5a8.182 8.182 0 0 1 5.25 1.406v-1.406a8.182 8.182 0 0 1-5.25 1.406 8.217 8.217 0 0 1-4.74-.954.75.75 0 0 0-.51-.698V9.732a8.25 8.25 0 0 1 5.25-2.268 8.25 8.25 0 0 1 5.25 2.268V9.376a.75.75 0 0 0 .624.744v1.27ZM12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533v-1.27a.75.75 0 0 1 .624-.744A8.25 8.25 0 0 0 18 18.75a8.25 8.25 0 0 0 5.25-2.268v-2.156a.75.75 0 0 1-.51-.698A8.217 8.217 0 0 0 18 13.5a8.182 8.182 0 0 0-5.25 1.406v-1.406a8.182 8.182 0 0 0 5.25 1.406 8.217 8.217 0 0 0 4.74-.954.75.75 0 0 1 .51-.698V9.732a8.25 8.25 0 0 0-5.25-2.268 8.25 8.25 0 0 0-5.25 2.268V9.376a.75.75 0 0 1-.624.744v1.27Z" />
             </svg>
              <!-- Badges -->
              <div class="absolute top-3 start-3 flex flex-wrap gap-2">
                <span v-if="book.is_research" class="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  بحث
                </span>
                <span v-if="book.is_transcript" class="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  تفريغ
                </span>
              </div>
           </div>

           <!-- Wrap Action Buttons in ClientOnly -->
           <ClientOnly>
              <div class="mt-4 flex flex-col space-y-2">
                 <!-- View Button -->
                 <button
                   v-if="book.storage_path"
                   type="button"
                   @click="openPdfModal"
                   class="button-primary w-full"
                 >
                   <!-- SVG Icon -->
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true">
                     <title>عرض بالموقع</title>
                     <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                     <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.18l.879-.879a.75.75 0 0 1 1.06 0l.879.879A1.651 1.651 0 0 1 3.482 10c0 .311.102.613.284.879l-.879.879a.75.75 0 0 1-1.06 0l-.879-.879A1.651 1.651 0 0 1 .664 10.59ZM19.336 9.41a1.651 1.651 0 0 1 0 1.18l-.879.879a.75.75 0 0 1-1.06 0l-.879-.879A1.651 1.651 0 0 1 16.518 10c0-.311-.102-.613-.284-.879l.879-.879a.75.75 0 0 1 1.06 0l.879.879A1.651 1.651 0 0 1 19.336 9.41Z" clip-rule="evenodd" />
                     <path fill-rule="evenodd" d="M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm-5.017-9.836a.75.75 0 0 1 1.06 0l.879.879a4.652 4.652 0 0 1 6.156 0l.879-.879a.75.75 0 1 1 1.06 1.06l-.879.879a4.652 4.652 0 0 1-6.156 0l-.879-.879a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                   </svg>
                   <span>عرض الكتاب بالموقع</span>
                 </button>

                 <!-- Download Button (Changed from <a> to <button>) -->
                 <button
                   v-if="book.storage_path"
                   type="button"
                   @click="downloadPdf"
                   :disabled="isDownloading"
                   class="button-secondary w-full"
                 >
                   <!-- Conditional Spinner -->
                   <svg v-if="isDownloading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                     <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   <!-- Download Icon -->
                   <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true">
                      <title>تنزيل الملف</title>
                      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                   </svg>
                   <span>{{ isDownloading ? 'جارٍ التنزيل...' : 'تنزيل الملف' }}</span>
                 </button>

                 <!-- Message if file not available -->
                 <p v-if="!book.storage_path && !pending" class="text-center text-sm text-red-500 dark:text-red-400 mt-2">
                   ملف الكتاب غير متاح حاليًا للعرض أو التنزيل.
                 </p>
              </div>
           </ClientOnly>
        </div>

        <!-- Book Info Column -->
        <div class="md:col-span-2">
          <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark mb-4">
            {{ book.title }}
          </h1>
           <!-- Link to Original Lesson (for Transcripts) -->
           <div v-if="book.is_transcript && book.linked_lesson_id" class="mb-4">
             <NuxtLink
               :to="`/lessons/${book.linked_lesson_id}`"
               class="inline-flex items-center text-sm font-medium text-golden-calm hover:underline focus:outline-none focus:ring-2 focus:ring-golden-calm focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
               aria-label="عرض الدرس الأصلي المرتبط بهذا التفريغ"
             >
               <!-- SVG Icon -->
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1" aria-hidden="true">
                  <title>رابط الدرس الأصلي</title>
                  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.665l3-3Z" />
                  <path d="M8.603 17.007a4 4 0 0 0 5.656-5.656l-3-3a4 4 0 0 0-5.865-.225.75.75 0 0 0 1.138.977 2.5 2.5 0 0 1 3.665.142l3 3a2.5 2.5 0 0 1-3.536 3.536l-1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 0 0 5.656 5.656Z" />
               </svg>
               <span>هذا تفريغ للدرس - اضغط هنا لعرض الدرس الأصلي</span>
             </NuxtLink>
           </div>

           <!-- Description -->
           <div v-if="book.description" class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
             <p class="whitespace-pre-wrap">{{ book.description }}</p>
           </div>
           <p v-else class="text-gray-500 dark:text-gray-400 italic">
             لا يوجد وصف متاح لهذا الكتاب.
           </p>

        </div>
      </div>

      <!-- Comments Section -->
      <ClientOnly>
         <CommentSection
           v-if="book && book.id"
           :book-id="book.id"
         />
         <template #fallback>
            <div class="text-center py-6 text-gray-500 dark:text-gray-400">
               جارٍ تحميل قسم التعليقات...
            </div>
         </template>
      </ClientOnly>

    </div>

    <!-- PDF Viewer Modal (Lazy Loaded) -->
    <ClientOnly>
      <LazyPdfViewerModal
        :show="showModal"
        :storage-path="book?.storage_path || null"
        :book-title="book?.title || 'عرض الكتاب'"
        @close="closePdfModal"
      />
    </ClientOnly>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import CommentSection from '~/components/CommentSection.vue';

// Define component type for clarity if needed elsewhere
interface Book extends Tables<'books'> {}

// --- Constants ---
const STORAGE_BUCKET_NAME = 'book-files'; // Ensure this matches your bucket name

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const route = useRoute();
const { $toast } = useNuxtApp(); // Assuming you have a toast plugin configured

// --- Route Parameter Validation ---
definePageMeta({
  validate: async (route) => {
    const id = route.params.id;
    return typeof id === 'string' && /^\d+$/.test(id) && parseInt(id, 10) > 0;
  }
});

// --- Reactive State ---
const bookId = computed(() => +route.params.id);
const imageError = ref(false);
const showModal = ref(false);
const isDownloading = ref(false); // State for download button
// pdfPublicUrl is no longer needed for the download button itself

// --- Helper Functions ---
function handleImageError() {
  
  imageError.value = true;
}

function openPdfModal() {
  if (!book.value?.storage_path) {
    
    $toast?.error('ملف الكتاب غير متاح للعرض حاليًا.');
    return;
  }
  showModal.value = true;
}

function closePdfModal() {
  showModal.value = false;
}

// --- Direct Download Function ---
async function downloadPdf() {
  if (!book.value?.storage_path || isDownloading.value) {
    return;
  }

  isDownloading.value = true;
  // Use toast for feedback if available
  const downloadToast = $toast?.info('جارٍ تجهيز الملف للتنزيل...', { duration: 0 }); // Indefinite duration

  try {
    // 1. Fetch the file blob from Supabase Storage
    const { data: blob, error: downloadError } = await supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .download(book.value.storage_path);

    if (downloadError) throw downloadError;
    if (!blob) throw new Error('لم يتم استلام بيانات الملف (Blob).');

    // 2. Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // 3. Create a temporary link element
    const link = document.createElement('a');
    link.href = url;

    // 4. Set the download attribute with a safe filename
    const safeTitle = book.value.title ? book.value.title.replace(/[/\\?%*:|"<>]/g, '-') : 'book';
    link.download = `${safeTitle}.pdf`; // Ensure .pdf extension

    // 5. Programmatically click the link to trigger the download
    document.body.appendChild(link); // Append required for Firefox
    link.click();

    // 6. Clean up: remove the link and revoke the object URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Update toast on success
    if (downloadToast && $toast?.update) {
        $toast.update(downloadToast.id, {
            type: 'success',
            message: 'بدأ تنزيل الملف!',
            duration: 5000 // Show for 5 seconds
        });
    }

  } catch (err: any) {
    
    const errorMessage = err.message || 'فشل تنزيل الملف. يرجى المحاولة مرة أخرى.';
     // Update toast on error
    if (downloadToast && $toast?.update) {
        $toast.update(downloadToast.id, {
            type: 'error',
            message: errorMessage,
            duration: 7000 // Show error longer
        });
    } else if ($toast?.error) { // Fallback if update isn't available
        $toast.error(errorMessage);
    }
  } finally {
    isDownloading.value = false; // Reset download state regardless of outcome
  }
}


// --- Data Fetching ---
const { data: book, pending, error, refresh } = await useAsyncData<Book | null, Error>(
  `book-${bookId.value}`,
  async () => {
    
    // pdfPublicUrl is no longer fetched here as it's not needed for download button
    imageError.value = false;

    const { data: bookData, error: queryError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId.value)
      .maybeSingle();

    if (queryError) {
      
      throw createError({ statusCode: 500, statusMessage: `فشل تحميل الكتاب: ${queryError.message}`, fatal: true });
    }

    if (!bookData) {
      
      throw createError({ statusCode: 404, statusMessage: 'الكتاب المطلوب غير موجود.', fatal: true });
    }

    // storage_path is now the crucial field for both view and download buttons
    if (!bookData.storage_path) {
        
    }

    return bookData;
  },
  {
    watch: [bookId],
  }
);

// --- SEO Meta ---
const pageTitle = computed(() => {
    if (pending.value) return 'جاري التحميل...';
    if (error.value || !book.value) return 'خطأ - الكتاب غير موجود';
    return book.value.title;
});

const pageDescription = computed(() => {
    if (pending.value) return 'جاري تحميل تفاصيل الكتاب...';
    if (error.value || !book.value) return 'حدث خطأ أثناء تحميل الكتاب أو أن الكتاب غير موجود.';
    const desc = book.value.description ? String(book.value.description).trim() : '';
    return desc.substring(0, 160) || `تفاصيل ومعلومات عن كتاب ${book.value.title}`;
});

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageDescription },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:type', content: 'book' },
    ...(book.value?.cover_image_url && !imageError.value
        ? [{ property: 'og:image', content: book.value.cover_image_url }]
        : []
    ),
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: pageDescription },
     ...(book.value?.cover_image_url && !imageError.value
        ? [{ name: 'twitter:image', content: book.value.cover_image_url }]
        : []
    ),
  ]
});

</script>

<style scoped>
.badge {
  @apply text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap;
}

.button-base {
 @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed;
}

.button-primary {
  @apply button-base border-transparent text-white bg-primary hover:bg-primary-700 focus:ring-primary-500 dark:text-beige-light dark:bg-primary dark:hover:bg-opacity-80;
}

.button-secondary {
  @apply button-base border-gray-300 dark:border-gray-600 text-brown-dark dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-primary-500;
}

.prose :where(p):not(:where([class~="not-prose"] *)) {
    margin-top: 0.75em;
    margin-bottom: 0.75em;
}

.aspect-\[3\/4\] {
    aspect-ratio: 3 / 4;
}

svg {
    flex-shrink: 0;
}

/* Style for the download spinner */
.animate-spin {
    animation: spin 1s linear infinite;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>cp node_modules/pdfjs-dist/build/pdf.worker.mjs public/pdf.worker.mjs
