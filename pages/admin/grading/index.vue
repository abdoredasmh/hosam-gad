<template>
  <div class="p-4 sm:p-6">
    <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">تصحيح الاختبارات</h1>

    <!-- Filters Section -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 shadow-sm">
      <h2 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">تصفية المحاولات</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Filter by Grading Status -->
        <div>
          <label for="statusFilter" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">حالة التصحيح:</label>
          <select id="statusFilter" v-model="selectedStatus" @change="handleFilterChange" class="input-field">
            <option :value="null">الكل</option>
            <option value="pending_manual">يحتاج تصحيح يدوي</option>
            <option value="graded">تم تصحيحه</option>
            <option value="auto_graded">تم تصحيحه آلياً</option>
            <option value="pending">قيد المراجعة (آلي)</option>
          </select>
        </div>

        <!-- Filter by Course -->
        <div>
           <label for="courseFilter" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">الدورة:</label>
           <select id="courseFilter" v-model="selectedCourseId" @change="handleCourseChange" class="input-field">
             <option :value="null">كل الدورات</option>
             <option v-for="course in coursesList" :key="course.id" :value="course.id">
               {{ course.title }}
             </option>
             <option v-if="loadingCourses" disabled>جارٍ تحميل الدورات...</option>
             <option v-else-if="!loadingCourses && coursesList.length === 0" disabled>لا توجد دورات متاحة</option>
           </select>
         </div>

        <!-- Filter by Quiz (Depends on Course) -->
        <div>
          <label for="quizFilter" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">الاختبار:</label>
          <select
            id="quizFilter"
            v-model="selectedQuizId"
            @change="handleFilterChange"
            class="input-field"
            :disabled="!selectedCourseId || loadingQuizzes || quizzesListBasedOnCourse.length === 0"
          >
            <option :value="null">كل الاختبارات {{ selectedCourseId ? 'في الدورة المحددة' : '' }}</option>
            <option v-for="quiz in quizzesListBasedOnCourse" :key="quiz.id" :value="quiz.id">
              {{ quiz.title }}
            </option>
             <option v-if="loadingQuizzes" disabled>جارٍ تحميل الاختبارات...</option>
             <option v-else-if="selectedCourseId && !loadingQuizzes && quizzesListBasedOnCourse.length === 0" disabled>لا توجد اختبارات في هذه الدورة</option>
             <option v-else-if="!selectedCourseId" disabled>اختر دورة أولاً</option>
          </select>
        </div>

        <!-- Filter by Student (Search Input) -->
         <div class="relative">
           <label for="studentSearch" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">الطالب:</label>
           <input
             type="text"
             id="studentSearch"
             v-model="studentSearchTerm"
             @input="debouncedFetchStudents"
             @focus="showStudentDropdown = true"
             @blur="handleStudentSearchBlur"
             placeholder="ابحث بالاسم أو المعرف..."
             class="input-field"
             autocomplete="off"
             aria-autocomplete="list"
             :aria-expanded="showStudentDropdown && (loadingStudents || filteredStudentsList.length > 0)"
             aria-controls="student-results-list"
           />
           <!-- Dropdown for search results -->
           <div
             v-if="showStudentDropdown && (loadingStudents || filteredStudentsList.length > 0)"
             class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
             id="student-results-list"
             role="listbox"
            >
             <div v-if="loadingStudents" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">جارٍ البحث...</div>
             <ul v-else role="presentation">
               <li
                 v-for="student in filteredStudentsList"
                 :key="student.id"
                 @mousedown="selectStudent(student)"
                 role="option"
                 :aria-selected="student.id === selectedStudentId"
                 class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-800/50 cursor-pointer"
               >
                 {{ student.full_name }} (ID: {{ student.id.substring(0, 8) }}...)
               </li>
                <li v-if="filteredStudentsList.length === 0 && !loadingStudents && studentSearchTerm.length > 1" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  لا توجد نتائج مطابقة.
                </li>
             </ul>
           </div>
           <!-- Display selected student -->
            <div v-if="selectedStudentId && selectedStudentName" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                الطالب المحدد: {{ selectedStudentName }}
                <button @click="clearStudentSelection" class="text-red-500 hover:text-red-700 ms-1 text-xxs font-medium focus:outline-none" aria-label="إلغاء اختيار الطالب">(إلغاء)</button>
            </div>
         </div>

      </div>
      <!-- Reset button moved outside grid for better alignment -->
       <div class="mt-4 text-right border-t pt-4 dark:border-gray-700">
           <button @click="resetFilters" v-if="hasActiveFilters" class="button-secondary text-sm">
                إعادة تعيين كل الفلاتر
            </button>
       </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending && attempts.length === 0" class="text-center py-10"> 
      <LoadingSpinner class="w-10 h-10 text-primary" />
      <p class="mt-3 text-gray-500 dark:text-gray-400">جارٍ تحميل المحاولات...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-box mt-6">
      <p>حدث خطأ أثناء تحميل المحاولات:</p>
      <pre class="mt-2 text-sm bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-x-auto">{{ error.message }}</pre>
      <button @click="() => loadAttempts(true)" class="button-secondary mt-4">إعادة المحاولة</button>
    </div>

    <!-- Empty State (Considering Filters) -->
    <div v-else-if="attempts.length === 0 && !pending" class="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg mt-6 border dark:border-gray-700">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
      <p class="mt-3 font-medium text-gray-700 dark:text-gray-300">
        {{ hasActiveFilters ? 'لا توجد محاولات تطابق معايير التصفية الحالية.' : 'لا توجد محاولات لعرضها.' }}
      </p>
       <button @click="resetFilters" v-if="hasActiveFilters" class="button-secondary text-sm mt-4">
           إلغاء الفلاتر وعرض الكل
       </button>
    </div>

    <!-- Attempts Table -->
    <div v-else class="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg border dark:border-gray-700 mt-6">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
           <!-- Table Headers -->
          <tr>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المعرف</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الاختبار</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الطالب</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الحالة</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تاريخ الإرسال</th>
            <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">إجراء</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Table Rows -->
          <tr v-for="attempt in attempts" :key="attempt.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 ease-in-out">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">#{{ attempt.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{{ attempt.quizzes?.title ?? 'اختبار غير متاح' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{{ attempt.profiles?.full_name ?? `مستخدم (${attempt.user_id.substring(0,8)}...)` }}</td>
             <td class="px-6 py-4 whitespace-nowrap text-sm">
                 <span :class="getStatusBadgeClass(attempt.grading_status)">
                     {{ getGradingStatusText(attempt.grading_status) }}
                 </span>
             </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ formatDate(attempt.submitted_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
              <NuxtLink
                :to="`/admin/grading/${attempt.id}`"
                :class="['font-medium transition-colors duration-150 ease-in-out px-3 py-1 rounded',
                  attempt.grading_status === 'pending_manual'
                  ? 'text-primary-700 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700']"
                :aria-label="`تصحيح أو عرض محاولة الطالب ${attempt.profiles?.full_name ?? attempt.user_id}`"
              >
                {{ attempt.grading_status === 'pending_manual' ? 'بدء التصحيح' : 'عرض المحاولة' }}
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

     <!-- Infinite Scroll Loader/Trigger -->
     <div ref="scrollTrigger" class="h-20 flex justify-center items-center mt-6">
        <LoadingSpinner v-if="loadingMore" class="w-6 h-6 text-primary" />
        <span v-else-if="!hasMoreAttempts && attempts.length > 0 && !pending" class="text-sm text-gray-500 dark:text-gray-400">وصلت إلى نهاية القائمة.</span>
     </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, shallowRef, onUnmounted, nextTick } from 'vue';
import { useSupabaseClient, definePageMeta, useHead, useRouter, useRoute } from '#imports';
import type { Database, Tables, Enums } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import { debounce } from 'lodash-es';

// --- تعريف الأنواع ---
type AttemptGradingStatus = Enums<'grading_status_enum'>; // No longer null, use null for 'All' filter
type AttemptWithRelations = Tables<'quiz_attempts'> & {
  quizzes: Pick<Tables<'quizzes'>, 'title'> | null;
  profiles: Pick<Tables<'profiles'>, 'full_name' | 'id'> | null; // Include id for fallback display
};
type QuizBasicInfo = Pick<Tables<'quizzes'>, 'id' | 'title'>;
type StudentBasicInfo = Pick<Tables<'profiles'>, 'id' | 'full_name'>;
type CourseBasicInfo = Pick<Tables<'study_courses'>, 'id' | 'title'>;

// --- حماية الصفحة ---
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'] // Ensure auth middleware is also applied if needed
});

// --- إعدادات ---
const supabase = useSupabaseClient<Database>();
const router = useRouter();
const route = useRoute();
const ITEMS_PER_PAGE = 25; // Increased slightly
const DEFAULT_STATUS_FILTER: AttemptGradingStatus = 'pending_manual';

// --- حالة الفلاتر ---
// Initialize filters from URL query or use defaults
const selectedStatus = ref<AttemptGradingStatus | null>(route.query.status as AttemptGradingStatus || DEFAULT_STATUS_FILTER);
const selectedCourseId = ref<number | null>(route.query.courseId ? Number(route.query.courseId) : null);
const selectedQuizId = ref<number | null>(route.query.quizId ? Number(route.query.quizId) : null);
const selectedStudentId = ref<string | null>(route.query.studentId as string || null);
const selectedStudentName = ref<string | null>(null); // To display the name of the selected student
const studentSearchTerm = ref(''); // Student search input model
const showStudentDropdown = ref(false);

// --- حالة جلب بيانات الفلاتر ---
const coursesList = ref<CourseBasicInfo[]>([]);
const quizzesListBasedOnCourse = ref<QuizBasicInfo[]>([]);
const filteredStudentsList = ref<StudentBasicInfo[]>([]);
const loadingCourses = ref(false);
const loadingQuizzes = ref(false);
const loadingStudents = ref(false);

// --- حالة بيانات المحاولات و Infinite Scroll ---
const attempts = shallowRef<AttemptWithRelations[]>([]); // shallowRef for performance with large lists
const currentPage = ref(0);
const loadingMore = ref(false);
const hasMoreAttempts = ref(true);
const pending = ref(false); // General loading state (initial load or filter change)
const error = ref<Error | null>(null);
const scrollTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// --- دوال جلب بيانات الفلاتر ---
const fetchCourses = async () => {
  loadingCourses.value = true;
  try {
    const { data, error: fetchError } = await supabase
      .from('study_courses')
      .select('id, title')
      .order('title');
    if (fetchError) throw fetchError;
    coursesList.value = data ?? [];
  } catch (err: any) {
    
    // Optionally: show a notification to the user
  } finally {
    loadingCourses.value = false;
  }
};

const fetchQuizzesForCourse = async (courseId: number | null) => {
    quizzesListBasedOnCourse.value = []; // Clear current list
    selectedQuizId.value = null; // Reset selected quiz when course changes

    if (!courseId) {
        // No need to fetch if no course is selected
        return;
    }

    loadingQuizzes.value = true;
    try {
        const { data, error: fetchError } = await supabase
            .from('quizzes')
            .select('id, title')
            .eq('course_id', courseId)
            .order('title');
        if (fetchError) throw fetchError;
        quizzesListBasedOnCourse.value = data ?? [];
    } catch (err: any) {
        
    } finally {
        loadingQuizzes.value = false;
    }
};

// Fetch students based on search term (debounced)
const fetchStudentsDebounced = async (searchTerm: string) => {
  if (!searchTerm || searchTerm.trim().length < 2) {
    filteredStudentsList.value = [];
    loadingStudents.value = false; // Ensure loading stops if search term is too short
    return;
  }
  loadingStudents.value = true;
  // 
  try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name')
        // Using textSearch for potentially better relevance across multiple fields if needed later
        // .textSearch('fts', `${searchTerm.trim()}:*`, { type: 'websearch', config: 'arabic' }) // Adjust based on your FTS setup
        .ilike('full_name', `%${searchTerm.trim()}%`) // Simple ILIKE for now
        .limit(15); // Limit results

      if (fetchError) throw fetchError;
      filteredStudentsList.value = data ?? [];
  } catch(err: any) {
      
      filteredStudentsList.value = []; // Clear results on error
  } finally {
      loadingStudents.value = false;
  }
};
const debouncedFetchStudents = debounce(() => fetchStudentsDebounced(studentSearchTerm.value), 350);

// Fetch student name if selectedStudentId is set from URL on initial load
const fetchSelectedStudentName = async (studentId: string) => {
    if (!studentId || selectedStudentName.value) return; // Don't fetch if no ID or name already exists
    try {
        const { data, error: fetchError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', studentId)
            .maybeSingle();
        if (fetchError) throw fetchError;
        if (data) {
            selectedStudentName.value = data.full_name;
            // Optionally set search term to match, if desired UX
            // studentSearchTerm.value = data.full_name;
        } else {
             
             // Keep selectedStudentId but name remains null (fallback display will be used)
             selectedStudentId.value = null; // Or clear the ID if profile must exist
             updateUrlQuery(); // Update URL if we clear the ID
        }
    } catch (err: any) {
        
    }
};


// --- دالة جلب المحاولات الرئيسية (مع Infinite Scroll) ---
const loadAttempts = async (reset: boolean = false) => {
    if (reset) {
        pending.value = true;
        error.value = null;
        currentPage.value = 0;
        attempts.value = [];
        hasMoreAttempts.value = true; // Assume more until first fetch proves otherwise
        // Ensure scroll trigger is observed again if needed
        await nextTick(); // Allow DOM updates before possibly re-observing
        setupIntersectionObserver();
    }

    if (loadingMore.value || !hasMoreAttempts.value || (pending.value && !reset)) return; // Prevent concurrent loads or loading when already pending initial/reset

    if (!reset) {
        loadingMore.value = true; // Loading *more* items
    }
    // `pending` is handled by the reset block

    const pageToFetch = currentPage.value;
    const rangeFrom = pageToFetch * ITEMS_PER_PAGE;
    const rangeTo = rangeFrom + ITEMS_PER_PAGE - 1;

    // 

    try {
        let query = supabase
            .from('quiz_attempts')
            .select(`
                id,
                user_id,
                quiz_id,
                submitted_at,
                grading_status,
                quizzes ( title ),
                profiles ( id, full_name )
            `)
            .order('submitted_at', { ascending: false })
            .range(rangeFrom, rangeTo);

        // Apply filters
        if (selectedStatus.value) query = query.eq('grading_status', selectedStatus.value);
        // If a specific quiz is selected, filter by it.
        if (selectedQuizId.value) {
            query = query.eq('quiz_id', selectedQuizId.value);
        }
        // If a course is selected BUT no specific quiz, filter by course (indirectly via quizzes in that course)
        // Note: This requires a join or a subquery which might be complex/inefficient.
        // A simpler approach is to fetch quizzes for the course first and then filter by quiz IDs if needed,
        // but the current structure filters directly by quiz_id if selected, which is fine.
        // Filtering attempts directly by course_id would require joining quiz_attempts -> quizzes.
        // Let's keep it simple: if course is selected but quiz is not, we *don't* filter by course here directly,
        // as the user hasn't chosen a specific quiz within that course yet. The quiz dropdown handles the context.
        if (selectedStudentId.value) query = query.eq('user_id', selectedStudentId.value);

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const newAttempts = data ?? [];
        // 

        // Use shallowRef correctly by replacing the array
        attempts.value = reset ? newAttempts : [...attempts.value, ...newAttempts];

        hasMoreAttempts.value = newAttempts.length === ITEMS_PER_PAGE;
        currentPage.value += 1;

    } catch (err: any) {
        
        error.value = err;
        hasMoreAttempts.value = false; // Stop trying on error
    } finally {
        loadingMore.value = false;
        if (reset) {
            pending.value = false; // Stop general pending state after reset is complete
        }
    }
};

// --- مراقبة التمرير (Intersection Observer) ---
const setupIntersectionObserver = () => {
  if (observer) observer.disconnect();

  const options = {
    rootMargin: '0px 0px 300px 0px', // Load somewhat before element enters viewport
    threshold: 0
  };

  observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry.isIntersecting && !loadingMore.value && hasMoreAttempts.value && !pending.value) {
        // 
        loadAttempts(); // Load next page
    }
  }, options);

  if (scrollTrigger.value) {
    observer.observe(scrollTrigger.value);
  } else {
      // 
  }
};

// --- تحميل البيانات الأولية وإعداد المراقب ---
onMounted(async () => {
    pending.value = true; // Set initial pending state
    await fetchCourses();
    // If courseId is pre-selected from URL, fetch its quizzes
    if (selectedCourseId.value) {
        await fetchQuizzesForCourse(selectedCourseId.value);
        // Ensure selectedQuizId from URL is valid for the fetched quizzes
        if (selectedQuizId.value && !quizzesListBasedOnCourse.value.some(q => q.id === selectedQuizId.value)) {
            
            selectedQuizId.value = null;
            updateUrlQuery(); // Remove invalid quizId from URL
        }
    }
    // If studentId is pre-selected from URL, fetch their name for display
    if (selectedStudentId.value) {
        await fetchSelectedStudentName(selectedStudentId.value);
    }
    // Load initial attempts based on resolved filters
    await loadAttempts(true);
    // Setup observer after initial load attempt
    nextTick(() => {
        setupIntersectionObserver();
    });
});

// --- تنظيف المراقب عند مغادرة الصفحة ---
onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});

// --- دوال مساعدة للتنسيق والعرض ---
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('ar-EG', { // Example locale
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch (e) {
    
    return dateString; // Fallback to original string
  }
};

const getGradingStatusText = (status: AttemptGradingStatus | null | undefined): string => {
  switch (status) {
    case 'pending_manual': return 'يحتاج تصحيح يدوي';
    case 'graded': return 'تم تصحيحه';
    case 'auto_graded': return 'تم تصحيحه آلياً';
    case 'pending': return 'قيد المراجعة (آلي)';
    default: return 'غير معروف';
  }
};

const getStatusBadgeClass = (status: AttemptGradingStatus | null | undefined): string => {
  const baseClass = 'px-2.5 py-0.5 rounded-full text-xs font-medium inline-block';
  switch (status) {
    case 'pending_manual': return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200`;
    case 'graded': return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200`;
    case 'auto_graded': return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200`;
    case 'pending': return `${baseClass} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300`;
    default: return `${baseClass} bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400`;
  }
};

// --- دوال التعامل مع الفلاتر ---
const handleFilterChange = () => {
    updateUrlQuery();
    loadAttempts(true); // Reset and load with new filters
};

const handleCourseChange = async () => {
    // Reset quiz and fetch new ones *before* applying filters
    selectedQuizId.value = null;
    await fetchQuizzesForCourse(selectedCourseId.value);
    handleFilterChange(); // Now trigger the attempt reload
};

const selectStudent = (student: StudentBasicInfo) => {
    selectedStudentId.value = student.id;
    selectedStudentName.value = student.full_name;
    studentSearchTerm.value = student.full_name; // Update search bar to reflect selection
    showStudentDropdown.value = false;
    filteredStudentsList.value = []; // Clear search results
    handleFilterChange();
};

const clearStudentSelection = () => {
    selectedStudentId.value = null;
    selectedStudentName.value = null;
    studentSearchTerm.value = '';
    filteredStudentsList.value = [];
    showStudentDropdown.value = false; // Ensure dropdown is hidden
    handleFilterChange();
};

// Close dropdown on blur, but delay to allow click/mousedown on options
const handleStudentSearchBlur = () => {
    setTimeout(() => {
        // Only hide if a student wasn't just selected (which would also hide it)
        if (!selectedStudentId.value || studentSearchTerm.value !== selectedStudentName.value) {
             showStudentDropdown.value = false;
             // Optional: if search term doesn't match a selected student, clear the selection?
             // if (selectedStudentId.value && studentSearchTerm.value !== selectedStudentName.value) {
             //    clearStudentSelection();
             // }
        }
         // If the search term is empty after blur, ensure selection is cleared
         if(studentSearchTerm.value.trim() === '' && selectedStudentId.value) {
             clearStudentSelection();
         }
    }, 200); // Adjust delay if needed
};

const resetFilters = () => {
    selectedStatus.value = DEFAULT_STATUS_FILTER;
    selectedCourseId.value = null;
    selectedQuizId.value = null;
    quizzesListBasedOnCourse.value = []; // Clear dependent quiz list
    clearStudentSelection(); // Use the dedicated clear function
    updateUrlQuery(); // Update URL to reflect reset state
    loadAttempts(true); // Reload data
};

// Computed property to check if any filter is active (different from default/null)
const hasActiveFilters = computed(() => {
    return selectedStatus.value !== DEFAULT_STATUS_FILTER
        || selectedCourseId.value !== null
        || selectedQuizId.value !== null
        || selectedStudentId.value !== null;
});

// Function to update URL query parameters based on current filters
const updateUrlQuery = () => {
     router.replace({
        query: {
            // Only include non-default/non-null values in the query
            status: selectedStatus.value === DEFAULT_STATUS_FILTER ? undefined : selectedStatus.value || undefined,
            courseId: selectedCourseId.value || undefined,
            quizId: selectedQuizId.value || undefined,
            studentId: selectedStudentId.value || undefined,
        }
    }).catch(err => {
        // Handle navigation errors if necessary (e.g., NavigationDuplicated)
        if (err.name !== 'NavigationDuplicated') {
            
        }
    });
}

// Watch for route query changes (e.g., browser back/forward) and update filters
// Note: This might cause double loading if not careful.
// Let's rely on onMounted for initial load and manual triggers for changes for now.
// watch(() => route.query, (newQuery) => {
//   selectedStatus.value = newQuery.status as AttemptGradingStatus || DEFAULT_STATUS_FILTER;
//   selectedCourseId.value = newQuery.courseId ? Number(newQuery.courseId) : null;
//   selectedQuizId.value = newQuery.quizId ? Number(newQuery.quizId) : null;
//   selectedStudentId.value = newQuery.studentId as string || null;
//   // Potentially fetch data if query changes externally? Be cautious of loops.
// }, { deep: true });

// --- Meta ---
useHead({ title: 'تصحيح الاختبارات - لوحة التحكم' });

</script>

<style scoped>
.error-box {
  @apply p-4 border border-red-300 bg-red-50 text-red-700 rounded-md dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-300;
}
.button-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150;
}
/* No button-primary needed in this specific view */
.input-field {
   @apply shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 disabled:opacity-60 disabled:cursor-not-allowed;
}
.text-xxs {
    font-size: 0.68rem; /* Slightly larger for readability */
    line-height: 0.9rem;
}
/* Ensure consistent focus rings */
select.input-field:focus,
input[type="text"].input-field:focus {
     @apply ring-1 ring-primary-500 border-primary-500;
}
</style>