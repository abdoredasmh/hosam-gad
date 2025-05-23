<template>
  <div class="bg-beige-light dark:bg-gray-950 min-h-screen">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8  md:py-5">
            <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-brown-dark dark:text-brown-dark mb-12 md:mb-16 border-b-2 border-olive-green dark:border-golden-calm pb-5 max-w-3xl mx-auto">
        سلاسل الدروس
      </h1>

            <div class="mb-10 md:mb-12 p-4 sm:p-6 bg-white dark:bg-gray-800/70 rounded-xl shadow-lg border border-cream-gray/50 dark:border-gray-700/60 space-y-5 max-w-5xl mx-auto">
                <div>
          <label for="lessons-search" class="sr-only">ابحث في الدروس</label>
          <div class="relative">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              type="search"
              id="lessons-search"
              :value="searchQuery"
              @input="handleSearchInput"
              class="block w-full p-3.5 ps-11 text-base text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-olive-green/50 focus:border-olive-green dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-olive-green/70 dark:focus:border-olive-green/70 transition duration-150"
              placeholder="ابحث في عناوين الدروس أو السلاسل..."
              aria-label="ابحث في الدروس"
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
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300 ms-1 hidden sm:inline">السلسلة:</span>
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
                جار تحميل الفلاتر...
            </div>
           <div v-if="filterError" class="text-xs text-red-500">خطأ تحميل الفلاتر.</div>
        </div>
      </div>

            <div v-if="pending" class="space-y-12">
                  <div v-for="n in 3" :key="`cat-skel-${n}`" class="animate-pulse">
           <div class="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
              <div v-for="i in 4" :key="`lesson-skel-${i}`" class="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow">
                 <div class="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                 <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                 <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
           </div>
         </div>
      </div>

            <div v-else-if="isFetchErrorState" class="text-center py-12 px-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-300 rounded-xl max-w-lg mx-auto shadow-lg">
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-4 text-red-500 dark:text-red-400">
             <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
         </svg>
        <p class="text-xl font-semibold mb-3">عذراً، حدث خطأ</p>
        <p class="text-base mb-6">{{ error?.message || 'لم نتمكن من تحميل البيانات المطلوبة.' }}</p>
        <button @click="refreshInitialData" class="px-6 py-2.5 bg-primary hover:bg-opacity-90 text-white text-base font-medium rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-950 shadow-md hover:shadow-lg inline-flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          إعادة المحاولة
        </button>
      </div>

            <div v-else-if="allCategoriesWithLessons && allCategoriesWithLessons.length > 0" class="space-y-12 md:space-y-16">
        <div v-for="category in allCategoriesWithLessons" :key="category.id" class="category-section">
                    <h2 class="text-2xl md:text-3xl font-semibold mb-6 text-brown-dark dark:text-beige-light border-b border-gray-300 dark:border-gray-700 pb-3 flex justify-between items-baseline">
            <span>{{ category.name }}</span>
            <span v-if="category.totalLessonsCount > 0" class="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({{ category.totalLessonsCount }} درس)
            </span>
          </h2>

                    <div v-if="category.lessons && category.lessons.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-8">
            <LessonCard
              v-for="lesson in category.lessons"
              :key="lesson.id"
              :lesson="lesson"
            />
          </div>
                    <p v-else class="text-gray-500 dark:text-gray-400 mt-4 text-center sm:text-right">لا توجد دروس متاحة حاليًا في هذه السلسلة.</p>

                    <div v-if="category.loadedLessonsCount < category.totalLessonsCount" class="mt-8 text-center">
               <button
                  @click="loadMoreLessonsForCategory(category.id)"
                  :disabled="category.isLoadingMoreLessons"
                  class="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green disabled:opacity-60 disabled:cursor-not-allowed dark:focus:ring-offset-gray-900 transition-colors"
               >
                  <span v-if="!category.isLoadingMoreLessons">
                      تحميل المزيد ({{ category.totalLessonsCount - category.loadedLessonsCount }} متبقي)
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 inline-block align-middle ms-1">
                         <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                       </svg>
                  </span>
                  <span v-else class="inline-flex items-center gap-1.5">
                       <LoadingSpinner class="w-4 h-4 text-olive-green" />
                       جارٍ التحميل...
                  </span>
               </button>
           </div>
            <p v-if="category.errorLoadingMore" class="mt-3 text-center text-sm text-red-600 dark:text-red-400">
               حدث خطأ أثناء تحميل المزيد.
            </p>

        </div>

                  <div ref="infiniteScrollTriggerElement" v-show="selectedCategoryId === null && !pending" class="h-20 flex justify-center items-center pt-10">
             <div v-if="loadingMoreCategories && !noMoreCategories" class="text-center py-6">
                 <LoadingSpinner class="w-8 h-8 mx-auto text-primary"/>
                 <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">جارٍ تحميل المزيد من السلاسل...</p>
             </div>
                          <div v-else-if="isEndOfListState" class="text-base text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-600 pt-5 px-8 w-full max-w-md text-center">
                ~ وصلت إلى نهاية قائمة السلاسل ~
             </div>
                           <div v-else-if="error && currentPage > 1 && selectedCategoryId === null && !loadingMoreCategories" class="text-sm text-red-600 dark:text-red-400">
                حدث خطأ أثناء تحميل المزيد من السلاسل. حاول التمرير للأسفل مرة أخرى.
              </div>
          </div>

      </div>

            <div v-else-if="isNoResultsState" class="text-center py-20 text-gray-500 dark:text-gray-400">
         <div v-if="searchQuery || selectedCategoryId !== null">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mb-5 mx-auto text-gray-400 dark:text-gray-500 opacity-70">
                 <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
             </svg>
             <p class="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">لا توجد نتائج مطابقة</p>
             <p class="text-base mb-5">لم نعثر على أي سلاسل أو دروس تطابق بحثك أو الفلتر المحدد.</p>
             <button @click="resetFiltersAndSearch" class="px-6 py-2.5 bg-olive-green text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium shadow-md">
                 عرض كل السلاسل والدروس
             </button>
         </div>
         <div v-else>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 mb-5 mx-auto text-gray-400 dark:text-gray-500 opacity-70" aria-hidden="true"><path d="M3.41 1.86L2 3.27l4.22 4.22c-.15.19-.22.44-.22.71v10c0 .55.45 1 1 1h12c.34 0 .65-.17.83-.42L20.73 21l1.41-1.41L3.41 1.86M7 18V9.54l8.46 8.46H7m5-8l-2-2H7V8l3.18 3.18L12 10m5 0v-.73L15.27 7.54C15.61 7.2 16.09 7 16.63 7H17v-.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5V7h.5a.5.5 0 0 1 .5.5V12h-2v-2z"/></svg>
             <p class="text-xl font-semibold text-gray-700 dark:text-gray-300">لا توجد سلاسل دروس متاحة</p>
             <p class="mt-2">سيتم إضافة السلاسل والدروس قريباً بإذن الله.</p>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useSupabaseClient, useHead } from '#imports';
import LessonCard from '~/components/LessonCard.vue';
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // Assuming component exists
import type { Database, Tables } from '~/types/database.types';

// --- Types ---
type Lesson = Pick<Tables<'lessons'>, 'id' | 'title' | 'description' | 'youtube_url' | 'created_at'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;

interface CategoryWithLessons extends Category {
  lessons: Lesson[];
  totalLessonsCount: number;
  loadedLessonsCount: number;
  isLoadingMoreLessons: boolean;
  errorLoadingMore: boolean;
}

// --- Constants ---
const INITIAL_LESSONS_TO_SHOW = 8; // Initial lessons per category
const LESSONS_PER_PAGE = 12;       // Lessons per "load more" click
const CATEGORIES_PER_PAGE = 5;    // Categories per infinite scroll batch
const DEBOUNCE_WAIT = 500;       // Search debounce time

// --- Supabase Client ---
const client = useSupabaseClient<Database>();

// --- State ---

// Data & Filters
const allCategoriesWithLessons = ref<CategoryWithLessons[]>([]);
const filterCategories = ref<Category[]>([]);
const selectedCategoryId = ref<number | null>(null);
const searchQuery = ref('');
const debouncedSearchQuery = ref('');

// Loading & Pagination
const pending = ref(true); // Initial load state
const error = ref<any>(null); // Main fetch error
const loadingFilters = ref(false);
const filterError = ref<any>(null);
const currentPage = ref(1); // For category pagination
const loadingMoreCategories = ref(false);
const noMoreCategories = ref(false);

// UI State
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// --- Computed Properties ---
const isInteractionDisabled = computed(() => pending.value || loadingFilters.value || loadingMoreCategories.value);
const isFetchErrorState = computed(() => error.value && allCategoriesWithLessons.value.length === 0 && !pending.value);
const isNoResultsState = computed(() => !pending.value && allCategoriesWithLessons.value.length === 0 && !error.value);
const isEndOfListState = computed(() => !pending.value && !loadingMoreCategories.value && selectedCategoryId.value === null && noMoreCategories.value);

// --- Fetching Functions ---

/** Fetches categories for the filter bar */
const fetchFilterCategories = async () => {
    loadingFilters.value = true;
    filterError.value = null;
    try {
        const { data, error: catError } = await client
            .from('categories')
            .select('id, name')
            // .eq('type', 'lesson_series') // Add if you categorize categories
            .order('name', { ascending: true });
        if (catError) throw catError;
        filterCategories.value = data || [];
    } catch (err: any) {
        console.error("Error fetching filter categories:", err);
        filterError.value = err;
    } finally {
        loadingFilters.value = false;
    }
};

/** Fetches categories and their initial lessons, handling pagination and search */
const fetchCategoriesAndLessons = async (page: number = 1, categoryId: number | null = null, searchTerm: string = ''): Promise<CategoryWithLessons[]> => {
    // Determine pagination range for categories if fetching all
    const catFrom = categoryId === null ? (page - 1) * CATEGORIES_PER_PAGE : 0;
    const catTo = categoryId === null ? catFrom + CATEGORIES_PER_PAGE - 1 : 0; // Fetch 1 if specific ID

    // 1. Fetch Categories
    let categoryQuery = client.from('categories').select('id, name');
    if (categoryId !== null) {
        categoryQuery = categoryQuery.eq('id', categoryId);
    } else {
        // If searching, we might need to fetch categories whose *lessons* match the search,
        // which is complex. Simpler approach for now: filter categories by name OR let lesson search handle it.
        // Let's filter categories by name if searching 'All'
        if (searchTerm) {
             const searchPattern = `%${searchTerm}%`;
             categoryQuery = categoryQuery.like('name', searchPattern);
        }
        categoryQuery = categoryQuery.order('created_at', { ascending: false }).range(catFrom, catTo);
    }

    const { data: categoriesData, error: categoriesError } = await categoryQuery;
    if (categoriesError) throw categoriesError;
    if (!categoriesData || categoriesData.length === 0) {
        if (categoryId === null) noMoreCategories.value = true; // No more categories for 'All'
        return [];
    }

    // 2. Fetch Initial Lessons for each Category
    const results = await Promise.all(categoriesData.map(async (category) => {
        try {
            let lessonQuery = client
                .from('lessons')
                .select('id, title, description, youtube_url, created_at', { count: 'exact' })
                .eq('category_id', category.id)
                .is('course_id', null) // Ensure it's not part of a course
                .order('created_at', { ascending: false }); // Or order by lesson number/sequence if available

            // Apply search term to lessons within the category
            if (searchTerm) {
                const searchPattern = `%${searchTerm}%`;
                lessonQuery = lessonQuery.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`);
            }

            const { data: lessonsData, error: lessonsError, count } = await lessonQuery.limit(INITIAL_LESSONS_TO_SHOW);

            if (lessonsError) throw lessonsError;

            const totalCount = count ?? 0;
            const initialLessons = lessonsData || [];

            // If searching and *no* lessons match *within this category*, skip the category entirely
            if (searchTerm && totalCount === 0) {
                return null; // Indicate skipping this category
            }

            return {
                ...category,
                lessons: initialLessons,
                totalLessonsCount: totalCount,
                loadedLessonsCount: initialLessons.length,
                isLoadingMoreLessons: false,
                errorLoadingMore: false
            };
        } catch (err: any) {
            console.error(`Error fetching lessons for category ${category.id}:`, err);
            // If searching and an error occurs fetching lessons, maybe still skip? Or show error state?
            // For simplicity, let's skip it if searching caused the lesson fetch error.
            if (searchTerm) return null;
            // Otherwise, show the category with an error state for its lessons
            return { ...category, lessons: [], totalLessonsCount: 0, loadedLessonsCount: 0, isLoadingMoreLessons: false, errorLoadingMore: true };
        }
    }));

    // Filter out null results (categories skipped due to search mismatch or specific errors)
    return results.filter(result => result !== null) as CategoryWithLessons[];
};


/** Loads more lessons for a specific category */
const loadMoreLessonsForCategory = async (categoryId: number) => {
    const categoryIndex = allCategoriesWithLessons.value.findIndex(c => c.id === categoryId);
    if (categoryIndex === -1) return;

    const category = allCategoriesWithLessons.value[categoryIndex];
    if (category.isLoadingMoreLessons || category.loadedLessonsCount >= category.totalLessonsCount) return;

    category.isLoadingMoreLessons = true;
    category.errorLoadingMore = false;

    try {
        const from = category.loadedLessonsCount;
        const to = from + LESSONS_PER_PAGE - 1;
        let lessonQuery = client
            .from('lessons')
            .select('id, title, description, youtube_url, created_at')
            .eq('category_id', category.id)
            .is('course_id', null)
            .order('created_at', { ascending: false })
            .range(from, to);

        // Re-apply search term if active, to ensure consistency? (Optional, can be complex)
        // if (debouncedSearchQuery.value) {
        //    const searchPattern = `%${debouncedSearchQuery.value}%`;
        //    lessonQuery = lessonQuery.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`);
        // }

        const { data: newLessons, error: lessonsError } = await lessonQuery;

        if (lessonsError) throw lessonsError;
        if (newLessons && newLessons.length > 0) {
            // Use Vue's reactivity correctly: replace the item or update properties
            allCategoriesWithLessons.value[categoryIndex] = {
                ...category,
                lessons: [...category.lessons, ...newLessons],
                loadedLessonsCount: category.loadedLessonsCount + newLessons.length,
                isLoadingMoreLessons: false,
            };
        } else {
             // No more lessons fetched, update state
             allCategoriesWithLessons.value[categoryIndex] = {
                 ...category,
                 loadedLessonsCount: category.totalLessonsCount, // Assume all are loaded now
                 isLoadingMoreLessons: false,
             };
        }
    } catch (err: any) {
        console.error(`Error loading more lessons for category ${categoryId}:`, err);
        allCategoriesWithLessons.value[categoryIndex] = { ...category, isLoadingMoreLessons: false, errorLoadingMore: true };
    }
};

/** Loads the next batch of categories for infinite scroll */
const loadMoreCategories = async () => {
    if (loadingMoreCategories.value || noMoreCategories.value || error.value || selectedCategoryId.value !== null) {
        return;
    }
    loadingMoreCategories.value = true;
    // Don't clear main error when loading more, only specific 'load more' error if added
    try {
        currentPage.value++;
        const newCategories = await fetchCategoriesAndLessons(currentPage.value, null, debouncedSearchQuery.value);
        if (newCategories.length > 0) {
            allCategoriesWithLessons.value.push(...newCategories);
        }
        // noMoreCategories flag is set inside fetchCategoriesAndLessons
    } catch (err: any) {
        console.error("Error loading more categories:", err);
        error.value = err; // Set main error state
        currentPage.value--; // Revert page increment on error
    } finally {
        loadingMoreCategories.value = false;
    }
};

/** Refreshes the initial data based on current filters/search */
const refreshInitialData = async () => {
    pending.value = true;
    error.value = null;
    noMoreCategories.value = false;
    currentPage.value = 1; // Reset page for categories
    allCategoriesWithLessons.value = [];

    try {
        const initialData = await fetchCategoriesAndLessons(1, selectedCategoryId.value, debouncedSearchQuery.value);
        allCategoriesWithLessons.value = initialData;
        // Determine if no more categories based on the *first* fetch result
        if (selectedCategoryId.value === null && initialData.length < CATEGORIES_PER_PAGE) {
            noMoreCategories.value = true;
        }
    } catch (err: any) {
        console.error("Error during initial data refresh:", err);
        error.value = err;
    } finally {
        pending.value = false;
    }
};

// --- Event Handlers ---

/** Handles search input with debouncing */
const handleSearchInput = (event: Event) => {
  searchQuery.value = (event.target as HTMLInputElement).value;
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    const trimmedQuery = searchQuery.value.trim();
    if (debouncedSearchQuery.value !== trimmedQuery) {
      debouncedSearchQuery.value = trimmedQuery;
      refreshInitialData(); // Trigger refresh
    }
  }, DEBOUNCE_WAIT);
};

/** Clears search and refreshes data */
const clearSearch = () => {
    searchQuery.value = '';
    if (debouncedSearchQuery.value !== '') {
        debouncedSearchQuery.value = '';
        if (searchTimeout.value) clearTimeout(searchTimeout.value);
        refreshInitialData(); // Refresh immediately
    }
};


/** Selects a category filter */
const selectCategory = (categoryId: number | null) => {
  if (selectedCategoryId.value === categoryId) return;
  selectedCategoryId.value = categoryId;
  // When selecting a category, also clear the search for simplicity,
  // or modify fetch to handle both simultaneously if needed.
  searchQuery.value = '';
  debouncedSearchQuery.value = '';
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  refreshInitialData(); // Refresh with new category
};

/** Resets search and category filters */
const resetFiltersAndSearch = () => {
    searchQuery.value = '';
    debouncedSearchQuery.value = '';
    selectedCategoryId.value = null;
    if (searchTimeout.value) clearTimeout(searchTimeout.value);
    // Only refresh if filters/search were actually active or if there was an error
    if(allCategoriesWithLessons.value.length > 0 || error.value) {
        refreshInitialData();
    }
};


// --- Infinite Scroll Observer ---
const infiniteScrollTriggerElement = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const setupObserver = () => {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(
        (entries) => {
            if (entries[0]?.isIntersecting && !pending.value && selectedCategoryId.value === null) {
                loadMoreCategories();
            }
        },
        { rootMargin: '0px 0px 300px 0px', threshold: 0.1 } // Increased rootMargin
    );
    if (infiniteScrollTriggerElement.value) {
        observer.observe(infiniteScrollTriggerElement.value);
    } else {
         watch(infiniteScrollTriggerElement, (newEl) => { // Fallback watcher
           if (newEl && observer && !observer.takeRecords().length) {
               observer.observe(newEl);
           }
       }, { immediate: true });
    }
};

// --- Lifecycle Hooks ---
onMounted(() => {
    fetchFilterCategories();
    refreshInitialData(); // Load initial data
    setupObserver();
});

onUnmounted(() => {
    if (observer) observer.disconnect();
    if (searchTimeout.value) clearTimeout(searchTimeout.value);
});

// --- SEO ---
useHead({
  title: 'سلاسل الدروس - موقع الشيخ إبراهيم بشندي',
  meta: [
    { name: 'description', content: 'تصفح واستمع إلى سلاسل الدروس والمحاضرات العامة للشيخ إبراهيم بشندي في مختلف العلوم الشرعية، مع إمكانية البحث والتصفية.' }
    // Add other meta tags as needed
  ]
});

</script>

<style scoped>
/* Enhanced Category Section Border */
.category-section:not(:last-child) {
  border-bottom: 1px solid theme('colors.gray.200');
  @apply dark:border-gray-700/80;
  padding-bottom: theme('spacing.12'); /* pb-12 */
}

/* Filter Chip Styles (Copied from previous example) */
.filter-chip {
    @apply px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ease-in-out border focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-olive-green;
}
.filter-chip-active {
    @apply bg-olive-green text-white border-transparent shadow-md cursor-default;
}
.filter-chip-inactive {
    @apply bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:border-gray-500;
}
.filter-chip:disabled {
     @apply opacity-60 cursor-not-allowed !shadow-none;
}

/* Style LessonCard hover slightly (can be in LessonCard.vue) */
:deep(.lesson-card-container:hover) {
  transform: translateY(-3px);
  box-shadow: theme('boxShadow.lg');
}
:deep(.lesson-card-container) {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

/* Ensure spinner inside buttons aligns well */
button .animate-spin {
    display: inline-block;
    vertical-align: middle;
}
</style>