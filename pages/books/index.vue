<template>
  <div class="bg-beige-light dark:bg-gray-950 min-h-screen">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8  md:py-5">
    
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-brown-dark dark:text-brown-dark mb-12 md:mb-16 border-b-2 border-olive-green dark:border-golden-calm pb-5 max-w-3xl mx-auto">
        المكتبة الرقمية
      </h1>

     
      <div class="mb-10 md:mb-12 p-4 sm:p-6 bg-white dark:bg-gray-800/70 rounded-xl shadow-lg border border-cream-gray/50 dark:border-gray-700/60 space-y-5 max-w-5xl mx-auto">
       
        <div>
          <label for="library-search" class="sr-only">ابحث في المكتبة</label>
          <div class="relative">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              type="search"
              id="library-search"
              :value="searchQuery"
              @input="handleSearchInput"
              class="block w-full p-3.5 ps-11 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-olive-green/50 focus:border-olive-green dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-olive-green/70 dark:focus:border-olive-green/70 transition duration-150"
              placeholder="ابحث عن كتاب، بحث، تفريغ..."
              aria-label="بحث في المكتبة"
            />
            
            <button
              v-if="searchQuery"
              @click="clearSearch"
              type="button"
              class="absolute inset-y-0 end-0 flex items-center pe-3.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              aria-label="مسح البحث"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L10 8.586 7.707 6.293a1 1 0 0 0-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 1 0 1.414 1.414L10 11.414l2.293 2.293a1 1 0 0 0 1.414-1.414L11.414 10l2.293-2.293Z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </div>

       
        <div class="flex flex-wrap items-center gap-3 pt-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 ms-1 hidden sm:inline">التصنيف:</span>
    
          <button
            @click="selectCategory(null)"
            :disabled="isInteractionDisabled"
            :class="['filter-chip', selectedCategoryId === null ? 'filter-chip-active' : 'filter-chip-inactive']"
          >
            الكل
          </button>
         
          <button
            v-for="filterCat in filterCategories"
            :key="filterCat.id"
            @click="selectCategory(filterCat.id)"
            :disabled="isInteractionDisabled"
            :class="['filter-chip', selectedCategoryId === filterCat.id ? 'filter-chip-active' : 'filter-chip-inactive']"
          >
            {{ filterCat.name }}
          </button>
         
            <div v-if="loadingFilters" class="text-xs text-gray-500 italic flex items-center gap-1">
                <LoadingSpinner class="w-3 h-3"/>
                جار تحميل الفئات...
            </div>
            <div v-if="filterError" class="text-xs text-red-500">خطأ تحميل الفئات.</div>
        </div>
      </div>

    
      <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="n in BOOKS_PER_PAGE" :key="`skel-${n}`" class="animate-pulse space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow">
           <div class="h-40 bg-gray-300 dark:bg-gray-600 rounded"></div>
           <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
           <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
           <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
      </div>

   
      <div v-else-if="isFetchErrorState" class="text-center py-12 px-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-300 rounded-xl max-w-lg mx-auto shadow-lg">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-4 text-red-500 dark:text-red-400">
           <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
         </svg>
        <p class="text-xl font-semibold mb-3">عذراً، حدث خطأ</p>
        <p class="text-base mb-6">{{ error?.message || 'لم نتمكن من تحميل بيانات المكتبة.' }}</p>
        <button @click="retryFetch" class="px-6 py-2.5 bg-primary hover:bg-opacity-90 text-white text-base font-medium rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-950 shadow-md hover:shadow-lg inline-flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          إعادة المحاولة
        </button>
      </div>

    
      <div v-else-if="isNoBooksFoundState" class="text-center py-20 text-gray-500 dark:text-gray-400">
        <div v-if="searchQuery || selectedCategoryId !== null">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mb-5 mx-auto text-gray-400 dark:text-gray-500 opacity-70">
               <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
             </svg>
             <p class="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">لا توجد نتائج مطابقة</p>
             <p class="text-base mb-5">لم نعثر على أي كتب تطابق بحثك أو الفلتر المحدد.</p>
             <button @click="resetFiltersAndSearch" class="px-6 py-2.5 bg-olive-green text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium shadow-md">
                 عرض كل محتويات المكتبة
             </button>
        </div>
        <div v-else>
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 mb-5 mx-auto text-gray-400 dark:text-gray-500 opacity-70" aria-hidden="true">
              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533v-1.27a.75.75 0 0 0-.624-.744A8.25 8.25 0 0 1 6 18.75a8.25 8.25 0 0 1-5.25-2.268v-2.156a.75.75 0 0 0 .51-.698A8.217 8.217 0 0 1 6 13.5a8.182 8.182 0 0 1 5.25 1.406v-1.406a8.182 8.182 0 0 1-5.25 1.406 8.217 8.217 0 0 1-4.74-.954.75.75 0 0 0-.51-.698V9.732a8.25 8.25 0 0 1 5.25-2.268 8.25 8.25 0 0 1 5.25 2.268V9.376a.75.75 0 0 0 .624.744v1.27ZM12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533v-1.27a.75.75 0 0 1 .624-.744A8.25 8.25 0 0 0 18 18.75a8.25 8.25 0 0 0 5.25-2.268v-2.156a.75.75 0 0 1-.51-.698A8.217 8.217 0 0 0 18 13.5a8.182 8.182 0 0 0-5.25 1.406v-1.406a8.182 8.182 0 0 0 5.25 1.406 8.217 8.217 0 0 0 4.74-.954.75.75 0 0 1 .51-.698V9.732a8.25 8.25 0 0 0-5.25-2.268 8.25 8.25 0 0 0-5.25 2.268V9.376a.75.75 0 0 1-.624.744v1.27Z" />
           </svg>
           <p class="text-xl font-semibold text-gray-700 dark:text-gray-300">المكتبة فارغة حاليًا</p>
           <p class="mt-2">سيتم إضافة الكتب والمحتويات قريباً بإذن الله.</p>
        </div>
      </div>


      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        <BookCard
          v-for="book in books"
          :key="book.id"
          :book="book"
          @open-pdf="openPdfModal"
        />
      </div>

    
      <div ref="infiniteScrollTrigger" class="h-20 flex justify-center items-center pt-10">
         <div v-if="loadingMore" class="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 dark:text-gray-400">
             <LoadingSpinner class="w-6 h-6 text-primary"/>
             <span class="text-base">جارٍ تحميل المزيد...</span>
         </div>
         <div v-else-if="isEndOfListState" class="text-base text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-600 pt-4 px-6 w-full max-w-xs text-center">
            ~ وصلت إلى نهاية المكتبة ~
         </div>
        
          <div v-else-if="error && books.length > 0 && !loadingMore" class="text-sm text-red-600 dark:text-red-400">
              حدث خطأ أثناء تحميل المزيد.
          </div>
      </div>

   
      <LazyPdfViewerModal
        :show="showPdfModal"
        :storage-path="selectedPdfPath"
        :book-title="selectedBookTitle"
        @close="closePdfModal"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useHead, useSupabaseClient } from '#imports';
import BookCard from '~/components/BookCard.vue';
import LazyPdfViewerModal from '~/components/PdfViewerModal.client.vue';
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // Assuming you have this
import type { Database, Tables } from '~/types/database.types';

// --- Types ---
type Book = Tables<'books'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;

// --- Constants ---
const BOOKS_PER_PAGE = 16;
const DEBOUNCE_WAIT = 450; // Slightly longer debounce

// --- Supabase Client ---
const client = useSupabaseClient<Database>();

// --- State Management ---

// Data & Filters
const books = ref<Book[]>([]);
const filterCategories = ref<Category[]>([]);
const selectedCategoryId = ref<number | null>(null);
const searchQuery = ref('');
const debouncedSearchQuery = ref('');

// Pagination & Loading
const currentPage = ref(1);
const totalBooksCount = ref(0);
const noMoreBooks = ref(false);
const pending = ref(true);       // Initial load state
const loadingMore = ref(false);    // Infinite scroll loading state
const loadingFilters = ref(false); // Filter loading state
const error = ref<any>(null);      // General fetch error
const filterError = ref<any>(null); // Filter fetch error

// UI State
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const showPdfModal = ref(false);
const selectedPdfPath = ref<string | null>(null);
const selectedBookTitle = ref<string | null>(null);

// --- Computed Properties ---

// Combined loading state for disabling interactions
const isInteractionDisabled = computed(() => pending.value || loadingMore.value || loadingFilters.value);

// State for showing the initial fetch error message
const isFetchErrorState = computed(() => error.value && books.value.length === 0 && !pending.value);

// State for showing the "no books found" message (after initial load/filtering)
const isNoBooksFoundState = computed(() => !pending.value && books.value.length === 0 && !error.value);

// State for showing the "end of list" indicator
const isEndOfListState = computed(() => !pending.value && !loadingMore.value && books.value.length > 0 && noMoreBooks.value);

// --- Data Fetching Functions ---

/**
 * Fetches a batch of books based on current state.
 * @param page - The page number to fetch.
 */
const fetchBooksBatch = async (page: number) => {
  // 
  const limit = BOOKS_PER_PAGE;
  const rangeFrom = (page - 1) * limit;
  const rangeTo = rangeFrom + limit - 1;

  let query = client
    .from('books')
    .select('id, title, description, cover_image_url, is_research, is_transcript, created_at, storage_path, category_id', { count: 'exact' });

  // Apply Category Filter
  if (selectedCategoryId.value !== null) {
    query = query.eq('category_id', selectedCategoryId.value);
  }

  // Apply Search Filter
  const searchTerm = debouncedSearchQuery.value.trim();
  if (searchTerm) {
    // Use PostgreSQL Full-Text Search if configured (recommended for performance)
    // Assuming 'fts' is the tsvector column:
    // query = query.textSearch('fts', `'${searchTerm.replace(/'/g, "''")}'`, { type: 'websearch', config: 'arabic' });
    // Fallback to ILIKE (less performant on large tables)
    const searchPattern = `%${searchTerm}%`;
    query = query.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`);
  }

  query = query.order('created_at', { ascending: false }).range(rangeFrom, rangeTo);

  const { data, error: fetchError, count } = await query;

  if (fetchError) {
    
    throw fetchError; // Propagate error
  }

  // 
  return { data: data || [], count: count ?? 0 };
};

/**
 * Loads the initial set of books, resetting state.
 */
const loadInitialBooks = async () => {
  // 
  pending.value = true;
  error.value = null;
  currentPage.value = 1;
  books.value = [];
  noMoreBooks.value = false;
  totalBooksCount.value = 0;

  try {
    const { data, count } = await fetchBooksBatch(1);
    books.value = data;
    totalBooksCount.value = count;
    noMoreBooks.value = data.length >= count; // Check if all loaded initially
  } catch (err: any) {
    error.value = err; // Capture the error object
  } finally {
    pending.value = false;
  }
};

/**
 * Fetches and appends the next batch of books.
 */
const loadMoreBooks = async () => {
  if (loadingMore.value || noMoreBooks.value || pending.value) return;

  loadingMore.value = true;
  // Don't clear the main error state here, only the 'load more' specific error if you add one
  const nextPage = currentPage.value + 1;

  try {
    const { data, count } = await fetchBooksBatch(nextPage);
    if (data.length > 0) {
      books.value.push(...data);
      currentPage.value = nextPage;
      totalBooksCount.value = count; // Update total count just in case
    }
    noMoreBooks.value = books.value.length >= totalBooksCount.value;
    // if (noMoreBooks.value) 

  } catch (err: any) {
    
    error.value = err; // Set error state to indicate failure
    // Potentially show a temporary error message near the trigger
  } finally {
    loadingMore.value = false;
  }
};

/**
 * Fetches categories for the filter bar.
 */
const fetchFilterCategories = async () => {
    loadingFilters.value = true;
    filterError.value = null;
    try {
        // Optimization: Consider fetching only categories that *have* books.
        // This might involve a function/view in Supabase or multiple queries.
        // Simple approach: Fetch all relevant categories.
        const { data, error: catError } = await client
            .from('categories') // Assuming 'categories' table exists
            .select('id, name')
            // .eq('type', 'book') // If categories have types
            .order('name', { ascending: true });

        if (catError) throw catError;
        filterCategories.value = data || [];
        // 
    } catch (err: any) {
        
        filterError.value = err; // Capture error
    } finally {
        loadingFilters.value = false;
    }
};


// --- Event Handlers & Triggers ---

/**
 * Handles search input changes with debouncing.
 */
const handleSearchInput = (event: Event) => {
  searchQuery.value = (event.target as HTMLInputElement).value;
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    const trimmedQuery = searchQuery.value.trim();
    if (debouncedSearchQuery.value !== trimmedQuery) {
      // 
      debouncedSearchQuery.value = trimmedQuery;
      loadInitialBooks(); // Reset and fetch with new search
    }
  }, DEBOUNCE_WAIT);
};

/**
 * Clears the search input and triggers a refresh.
 */
const clearSearch = () => {
    searchQuery.value = '';
    if (debouncedSearchQuery.value !== '') {
        debouncedSearchQuery.value = '';
        if (searchTimeout.value) clearTimeout(searchTimeout.value); // Clear any pending debounce
        loadInitialBooks(); // Refresh immediately
    }
};


/**
 * Selects a category and triggers a refresh.
 * @param categoryId - The ID of the category to select, or null for all.
 */
const selectCategory = (categoryId: number | null) => {
  if (selectedCategoryId.value === categoryId) return; // Avoid redundant fetch
  // 
  selectedCategoryId.value = categoryId;
  loadInitialBooks(); // Reset and fetch with new category
};

/**
 * Retries the initial data load.
 */
const retryFetch = () => {
  error.value = null; // Clear error before retrying
  loadInitialBooks();
};

/**
 * Resets search and category filters.
 */
const resetFiltersAndSearch = () => {
    searchQuery.value = '';
    debouncedSearchQuery.value = '';
    selectedCategoryId.value = null;
    // loadInitialBooks will be triggered by watch if needed, or call explicitly if watch isn't set up
    if (books.value.length !== 0 || error.value) { // Only trigger if not already showing all/empty
        loadInitialBooks();
    }
};


// --- Infinite Scroll Logic ---
const infiniteScrollTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  if (observer) observer.disconnect(); // Disconnect previous observer if any

  observer = new IntersectionObserver(
    (entries) => {
      // Load more only when the trigger element is intersecting (visible)
      if (entries[0]?.isIntersecting) {
        // 
        loadMoreBooks();
      }
    },
    {
      rootMargin: '0px 0px 200px 0px', // Load when trigger is 200px from bottom of viewport
      threshold: 0.1
    }
  );

  if (infiniteScrollTrigger.value) {
    observer.observe(infiniteScrollTrigger.value);
    // 
  } else {
      // Fallback if element not ready immediately
       watch(infiniteScrollTrigger, (newEl) => {
           if (newEl && observer && !observer.takeRecords().length) { // Check if already observing
               observer.observe(newEl);
               // 
           }
       }, { immediate: true }); // Check immediately
  }
};

onMounted(() => {
  fetchFilterCategories(); // Fetch categories once on mount
  loadInitialBooks();      // Fetch initial books
  setupObserver();         // Set up intersection observer
});

onUnmounted(() => {
  // Cleanup observer and timer
  if (observer) {
    observer.disconnect();
    // 
  }
  if (searchTimeout.value) {
      clearTimeout(searchTimeout.value);
  }
});

// --- Modal Methods ---
function openPdfModal(book: Book) {
  if (book.storage_path) {
    selectedPdfPath.value = book.storage_path;
    selectedBookTitle.value = book.title ?? 'مستند PDF';
    showPdfModal.value = true;
  } else {
    
    // Use a more user-friendly alert or notification system
    alert(`عذرًا، الملف غير متوفر حاليًا لهذا الكتاب (${book.title}).`);
  }
}

function closePdfModal() {
  showPdfModal.value = false;
  // Optionally clear selected path/title after a delay for transitions
  // setTimeout(() => {
  //    selectedPdfPath.value = null;
  //    selectedBookTitle.value = null;
  // }, 300);
}

// --- SEO ---
useHead({
  title: 'المكتبة الرقمية - موقع الشيخ إبراهيم بشندي',
  meta: [
    { name: 'description', content: 'تصفح وحمل كتب وأبحاث وتفريغات محاضرات ودروس الشيخ إبراهيم بشندي في مختلف العلوم الشرعية.' },
    // Add more relevant meta tags if needed (OpenGraph, Twitter Cards)
    { property: 'og:title', content: 'المكتبة الرقمية - موقع الشيخ إبراهيم بشندي' },
    { property: 'og:description', content: 'مكتبة شاملة لكتب وأبحاث وتفريغات دروس الشيخ إبراهيم بشندي.' },
    // { property: 'og:image', content: 'URL_TO_A_REPRESENTATIVE_IMAGE' }, // Add an image URL
  ],
});

</script>

<style scoped>
/* Enhanced Focus Ring */
input[type="search"]:focus {
  box-shadow: 0 0 0 3px theme('colors.olive-green' / 30%);
}

/* Filter Chip Styles */
.filter-chip {
    @apply px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ease-in-out border focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-olive-green;
}
.filter-chip-active {
    @apply bg-olive-green text-white border-transparent shadow-md cursor-default;
}
.filter-chip-inactive {
    @apply bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500;
}
.filter-chip:disabled {
     @apply opacity-60 cursor-not-allowed !shadow-none; /* Override shadow on disabled */
}

/* Style BookCard hover slightly (optional, can be in BookCard.vue) */
:deep(.book-card-container:hover) {
  /* Example: slightly lift the card */
  transform: translateY(-2px);
  box-shadow: theme('boxShadow.lg');
}
:deep(.book-card-container) {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
</style>