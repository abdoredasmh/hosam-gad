<template>
  <div class="relative">
    <label :for="inputId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="inputId"
        type="text"
        :value="displayValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.down.prevent="navigateResults(1)"
        @keydown.up.prevent="navigateResults(-1)"
        @keydown.enter.prevent="selectHighlighted"
        @keydown.esc.prevent="closeResults"
        :placeholder="placeholder"
        :disabled="disabled"
        class="input-field w-full pr-10" 
        :class="{'pr-16': isLoading && internalValue !== null, 'pr-10': !isLoading && internalValue !== null, 'pr-12': isLoading && internalValue === null, 'pr-6': !isLoading && internalValue === null}"
        :aria-label="label"
        aria-haspopup="listbox"
        :aria-expanded="showResults"
        :aria-controls="listboxId"
        :aria-activedescendant="highlightedIndex >= 0 ? `${listboxId}-option-${highlightedIndex}` : undefined"
        autocomplete="off"
      />
      <!-- Clear Button - يظهر فقط إذا كان internalValue رقمًا -->
      <button
        v-if="typeof internalValue === 'number'"
        type="button"
        @click="clearSelection"
        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none z-[1]"
        :class="{'right-7': isLoading}"
        aria-label="مسح اختيار الدرس"
        title="مسح الاختيار"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <!-- Loading Spinner -->
      <div v-if="isLoading" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" :class="{'right-8': typeof internalValue === 'number'}">
           <svg class="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
      </div>
    </div>

    <!-- Results Dropdown -->
    <div
      v-if="showResults && (results.length > 0 || (searchQuery && !isLoading))"
      :id="listboxId"
      ref="resultsContainer"
      class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 dark:ring-gray-700 overflow-auto focus:outline-none sm:text-sm"
      role="listbox"
      :aria-label="`${label} results`"
    >
      <!-- No Results -->
      <div v-if="searchQuery && results.length === 0 && !isLoading" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
        لا توجد دروس مطابقة.
      </div>
      <!-- Result Items -->
      <ul v-else>
        <li
          v-for="(lesson, index) in results"
          :key="lesson.id"
          :id="`${listboxId}-option-${index}`"
          @mouseenter="highlightedIndex = index"
          @mouseleave="highlightedIndex = -1"
          @mousedown.prevent="selectLesson(lesson)"
          class="text-gray-900 dark:text-white cursor-pointer select-none relative py-2 pl-3 pr-9"
          :class="{ 'bg-primary-100 dark:bg-primary-700': index === highlightedIndex }"
          role="option"
          :aria-selected="index === highlightedIndex"
        >
          <span class="block truncate" :class="{ 'font-semibold': lesson.id === internalValue }">
            {{ lesson.title }}
          </span>
          <!-- Checkmark -->
          <span
            v-if="lesson.id === internalValue"
            class="text-primary-600 dark:text-primary-300 absolute inset-y-0 right-0 flex items-center pr-4"
           >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
            </svg>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import type { Database } from '~/types/database.types';

type Lesson = Pick<Database['public']['Tables']['lessons']['Row'], 'id' | 'title'>;

// Props
const props = defineProps<{
  modelValue: number | 'all' | null; // Keep 'all' for initial filter compatibility
  label: string;
  placeholder?: string;
  disabled?: boolean;
}>();

// Emits - Ensure we only emit number or null
const emit = defineEmits<{ (e: 'update:modelValue', value: number | null): void }>();


// Supabase
const supabase = useSupabaseClient<Database>();

// State
const uid = Math.random().toString(36).substring(7);
const inputId = `searchable-lesson-input-${uid}`;
const listboxId = `searchable-lesson-listbox-${uid}`;
const searchQuery = ref('');
// --- Initialize internalValue strictly to number or null ---
const internalValue = ref<number | null>(typeof props.modelValue === 'number' ? props.modelValue : null);
const selectedTitle = ref<string | null>(null);
const results = ref<Lesson[]>([]);
const isLoading = ref(false);
const showResults = ref(false);
const highlightedIndex = ref(-1);
const resultsContainer = ref<HTMLDivElement | null>(null);
let blurTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed value for the input display
const displayValue = computed(() => {
  if (showResults.value && searchQuery.value) {
    return searchQuery.value;
  }
  // --- تعديل: التحقق من أن internalValue هو رقم ---
  if (typeof internalValue.value === 'number' && selectedTitle.value) {
    return selectedTitle.value;
  }
  return '';
});

// Fetch initial lesson title
async function fetchLessonTitle(id: number | null) { // Expect only number or null
  if (typeof id !== 'number') {
     selectedTitle.value = null;
     return;
  }
  if (internalValue.value === id && selectedTitle.value) return;

  isLoading.value = true;
  try {
    const { data, error } = await supabase.from('lessons').select('title').eq('id', id).maybeSingle();
    if (error) throw error;
    selectedTitle.value = data ? data.title : `درس غير معروف #${id}`;
  } catch (err: any) {
    
    selectedTitle.value = `خطأ #${id}`;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  // Fetch based on the correctly initialized internalValue (number or null)
  fetchLessonTitle(internalValue.value);
});

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  // Convert 'all' or other invalid types to null immediately
  const nextValue = typeof newValue === 'number' ? newValue : null;
  if (nextValue !== internalValue.value) {
    internalValue.value = nextValue;
    searchQuery.value = '';
    closeResults();
    fetchLessonTitle(nextValue);
  }
}, { immediate: true }); // Run immediately on mount


// Debounced search function
const debouncedSearch = useDebounceFn(async () => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    results.value = []; isLoading.value = false; highlightedIndex.value = -1; return;
  }
  isLoading.value = true; highlightedIndex.value = -1;
  try {
    const { data, error } = await supabase.from('lessons').select('id, title').ilike('title', `%${searchQuery.value}%`).limit(15);
    if (error) throw error;
    results.value = data || [];
    showResults.value = true;
  } catch (err: any) {  results.value = []; }
  finally { isLoading.value = false; if (results.value.length > 0) showResults.value = true; }
}, 300);

// --- Event Handlers (Strictly emit null or number) ---
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const newQuery = target.value;
  searchQuery.value = newQuery;

  // ** Crucial Change: Always emit null when user types **
  // If the user is typing, the previous selection (if any) is invalidated.
  if (internalValue.value !== null) {
      internalValue.value = null;
      selectedTitle.value = null;
      emit('update:modelValue', null); // <-- Emit null immediately
      
  }

  if (newQuery.length > 0) {
      showResults.value = true; isLoading.value = true; debouncedSearch();
  } else {
      // If cleared, ensure null state and close
      if (internalValue.value !== null) { // Double check
         internalValue.value = null; selectedTitle.value = null; emit('update:modelValue', null);
         
      }
      closeResults(); isLoading.value = false; results.value = []; highlightedIndex.value = -1;
  }
}

function clearSelection() {
    searchQuery.value = '';
    if (internalValue.value !== null) { // Only emit if not already null
        internalValue.value = null;
        selectedTitle.value = null;
        emit('update:modelValue', null); // <-- Emit null
        
    }
    closeResults();
}

function selectLesson(lesson: Lesson) {
  searchQuery.value = '';
  internalValue.value = lesson.id; // Set internal value to the selected ID (number)
  selectedTitle.value = lesson.title;
  closeResults();
  emit('update:modelValue', lesson.id); // <-- Emit the selected ID (number)
  
}

// --- Other Handlers (Focus, Blur, Keyboard) ---
function handleFocus() { if (searchQuery.value && results.value.length > 0) showResults.value = true; }
function handleBlur() { if (blurTimeout) clearTimeout(blurTimeout); blurTimeout = setTimeout(closeResults, 150); }
function closeResults() { showResults.value = false; highlightedIndex.value = -1; }

function navigateResults(direction: 1 | -1) { /* ... (same as before) ... */
    if (!showResults.value || results.value.length === 0) return;
    highlightedIndex.value = (highlightedIndex.value + direction + results.value.length) % results.value.length;
    scrollToHighlighted();
}
function selectHighlighted() { /* ... (same as before) ... */
    if (showResults.value && highlightedIndex.value >= 0 && highlightedIndex.value < results.value.length) selectLesson(results.value[highlightedIndex.value]);
    else if (searchQuery.value && results.value.length === 1) selectLesson(results.value[0]);
    else closeResults();
}
function scrollToHighlighted() { /* ... (same as before) ... */
    nextTick(() => {
        const list = resultsContainer.value; if (!list) return;
        const elementId = `${listboxId}-option-${highlightedIndex.value}`;
        const highlightedElement = list.querySelector(`#${elementId}`) as HTMLLIElement;
        if (highlightedElement) highlightedElement.scrollIntoView({ block: 'nearest' });
    });
}

// Cleanup timeout
import { onBeforeUnmount } from 'vue';
onBeforeUnmount(() => { if (blurTimeout) clearTimeout(blurTimeout); });

</script>

<style scoped>
.input-field { /* استخدام الفئة الموحدة */
  @apply block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}
.absolute { z-index: 10; }
input { transition: padding-right 0.2s ease-out; }
</style>