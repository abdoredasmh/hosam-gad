<template>
  <div class="container mx-auto px-4 py-8 md:py-12">
    <h2 class="text-3xl font-bold text-brown-dark dark:text-beige-light mb-6 md:mb-8 border-b-2 border-primary pb-3">
      الدورات الدراسية المنهجية
    </h2>

    <!-- 1. Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner class="w-12 h-12 mx-auto text-primary" />
      <p class="mt-4 text-base text-gray-600 dark:text-gray-400">جارٍ تحميل الدورات المتاحة...</p>
    </div>

    <!-- 2. Error State -->
     <div v-else-if="error" class="text-center py-10 px-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg max-w-lg mx-auto shadow-md">
         <div class="flex justify-center items-center text-red-600 dark:text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
            </svg>
            <h3 class="text-xl font-semibold ms-2">خطأ في تحميل الدورات</h3>
         </div>
        <p class="text-sm text-red-700 dark:text-red-300 mb-5">
          {{ error.data?.message || error.message || 'حدث خطأ غير متوقع أثناء محاولة جلب قائمة الدورات. يرجى المحاولة مرة أخرى.' }}
        </p>
        <button @click="refresh" class="button-secondary border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-800/60 hover:bg-red-200 dark:hover:bg-red-700/70 focus:ring-red-500 inline-flex items-center gap-1.5">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4" aria-hidden="true"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.984a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-2.432l.311.31a7 7 0 0 0 11.767-3.18.75.75 0 1 0-1.475-.292ZM4.688 8.576a5.5 5.5 0 0 1 9.201-2.466l.312.311h-2.433a.75.75 0 0 0 0 1.5h4.516a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-1.5 0v2.432l-.311-.31a7 7 0 0 0-11.767 3.18.75.75 0 0 0 1.475.292Z" clip-rule="evenodd" /></svg>
          إعادة المحاولة
        </button>
     </div>

    <!-- 3. No Courses Available State -->
    <div v-else-if="Array.isArray(courses) && courses.length === 0" class="text-center py-16 text-gray-500 dark:text-gray-400 border border-dashed dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/20">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
      <p class="text-lg font-medium">لا توجد دورات دراسية متاحة حاليًا.</p>
      <p class="text-sm mt-1 text-gray-400 dark:text-gray-500">سيتم إضافة دورات جديدة قريبًا بإذن الله، تابعنا للمزيد.</p>
    </div>

    <!-- 4. Courses Grid -->
    <div v-else-if="Array.isArray(courses) && courses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      <!-- Course Card Iteration -->
      <CourseCard
        v-for="course in courses"
        :key="course.id"
        :course="course"
        :lesson-count="course.lessons_count"
        :category-name="course.category_name"
        :is-enrolled="userEnrollments.includes(course.id)"
        :enroll-loading="enrollLoadingState[course.id] || false"
        @enroll="handleEnroll"
      />
      <!-- TODO: Implement Pagination or Infinite Scroll for large number of courses -->
    </div>

     <!-- 5. Fallback for unexpected states -->
     <div v-else-if="!pending && !error">
        <p class="text-center py-10 text-gray-400 dark:text-gray-500 italic">حالة عرض الدورات غير معروفة.</p>
     </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import { useSupabaseClient, useAsyncData, useHead, navigateTo } from '#imports';
import CourseCard from '~/components/CourseCard.vue';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import { useUserStore } from '~/stores/user';
import { storeToRefs } from 'pinia';
// import { useToast } from 'vue-toastification'; // Optional: Import if using toast notifications

// --- Define Types ---
// Interface for course data after processing (includes lesson count and category name)
interface ProcessedCourse extends Tables<'study_courses'> {
  lessons_count: number;
  category_name: string | null;
}
// Type for raw course data fetched from Supabase
type FetchedCourse = Tables<'study_courses'> & {
  // The 'lessons' property will hold the count based on the foreign key constraint name
  lessons?: { count: number }[];
  category?: Pick<Tables<'categories'>, 'name'> | null; // Embedded category
};
// Type for enrollment data (only need course_id)
type CourseEnrollmentInfo = Pick<Tables<'course_enrollments'>, 'course_id'>;

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const userStore = useUserStore();
const { profile, isLoggedIn } = storeToRefs(userStore); // Reactive refs for user state
// const toast = useToast(); // Optional: Initialize toast

// --- State ---
// Holds the processed list of courses to display
const courses = ref<ProcessedCourse[]>([]);
// Holds the IDs of courses the current user is enrolled in
const userEnrollments = ref<number[]>([]);
// Tracks loading state for individual enrollment buttons (keyed by course ID)
const enrollLoadingState = reactive<Record<number, boolean>>({});

// --- Data Fetching ---
// Fetches active courses with lesson counts and category names, plus user's enrollments.
const { data, pending, error, refresh } = await useAsyncData(
    'studyCoursesAndEnrollmentsList', // Unique key for this fetch operation
    async () => {
        const userId = profile.value?.id; // Get current user ID safely
        

        // Fetch courses and enrollments in parallel using Promise.allSettled for robust error handling
        const results = await Promise.allSettled([
            // Query 1: Fetch Active Courses with Lesson Count and Category Name
            supabase
                .from('study_courses')
                .select(`
                  *,
                  lessons!fk_lessons_course_id(count),
                  category:categories ( name )
                `) // *** USE CONSTRAINT NAME 'fk_lessons_course_id' FOR LESSONS COUNT ***
                .eq('is_active', true) // Only fetch active courses
                .order('created_at', { ascending: false }), // Order courses, newest first

            // Query 2: Fetch User Enrollments (only if logged in)
            isLoggedIn.value && userId
                ? supabase
                    .from('course_enrollments')
                    .select('course_id') // Only need the course ID for enrollment check
                    .eq('user_id', userId)
                : Promise.resolve({ data: [], error: null }) // Resolve with empty data if not logged in
        ]);

        // Process Course Results
        let fetchedCoursesRaw: FetchedCourse[] = [];
        if (results[0].status === 'fulfilled') {
             const courseResult = results[0].value; // نتيجة جلب الدورات
             if (courseResult.error) {
                  const errorObj = courseResult.error; // كائن الخطأ

                  // --- تسجيل تفصيلي للخطأ ---
                  
                  
                  
                  
                  
                  
                  
                  // --- نهاية التسجيل التفصيلي ---

                  // Check for the specific embedding error message robustly
                  if (String(errorObj.message).includes("more than one relationship")) {
                      throw new Error(`فشل جلب الدورات: ${errorObj.message || 'التباس في تعريف العلاقات'}. هناك التباس في تعريف العلاقات بين الجداول.`);
                  } else {
                     throw new Error(`فشل جلب الدورات: ${errorObj.message || 'خطأ غير معروف من Supabase.'}`);
                  }
             }
             // إذا لم يكن هناك خطأ، أكمل بشكل طبيعي
             fetchedCoursesRaw = courseResult.data || [];
             
        } else {
            // Handle promise rejection for course fetch (status === 'rejected')
            
            
            throw new Error(`فشل الاتصال لجلب الدورات: ${results[0].reason?.message || 'سبب غير معروف.'}`);
        }


        // Process Enrollment Results
        let fetchedEnrollmentsData: CourseEnrollmentInfo[] = [];
        if (results[1].status === 'fulfilled') {
             if (results[1].value.error) {
                 
             } else {
                fetchedEnrollmentsData = results[1].value.data || [];
                
             }
        } else {
            
        }

        // Transform raw course data into the structure needed by the template
        const processedCourses: ProcessedCourse[] = fetchedCoursesRaw.map(course => ({
            ...course,
            // Safely access count from the 'lessons' relation (using the constraint name implicitly)
            lessons_count: course.lessons?.[0]?.count ?? 0,
            category_name: course.category?.name ?? null, // Safely access category name
            lessons: undefined, // Remove temporary relation properties
            category: undefined
        }));

        // Return the processed data
        return {
            courses: processedCourses,
            enrollments: fetchedEnrollmentsData.map(e => e.course_id) // Return only the array of enrolled course IDs
        };
    }, {
        // Default value while loading or on error, matches the return structure
        default: () => ({ courses: [], enrollments: [] }),
        // Refetch data if the user logs in or out
        watch: [() => profile.value?.id],
        // server: false, // Consider if SSR hydration mismatches occur with auth state
    }
);

 // --- Update Local State Reactively ---
 // Updates the component's local state when the fetched data changes.
 watch(data, (newData) => {
    if (newData) {
        courses.value = newData.courses || [];
        userEnrollments.value = newData.enrollments || [];
        
    } else if (!pending.value && !error.value) {
        // Reset state if data becomes null unexpectedly after loading
        
        courses.value = [];
        userEnrollments.value = [];
    }
 }, { immediate: true }); // Run immediately on component mount

// --- Enrollment Action ---
// Handles the @enroll event emitted by CourseCard
async function handleEnroll(courseId: number) {
    if (!isLoggedIn.value || !profile.value?.id) {
        // TODO: Replace alert with a user-friendly notification (e.g., toast)
        alert('يجب تسجيل الدخول أولاً للانتساب للدورة.');
        navigateTo(`/login?redirect=${window.location.pathname}`); // Redirect to login
        return;
    }

    if (userEnrollments.value.includes(courseId)) {
        // TODO: Replace alert with a user-friendly notification (e.g., toast)
        alert('أنت منتسب بالفعل لهذه الدورة.');
        navigateTo(`/study/courses/${courseId}`); // Navigate to course if already enrolled
        return;
    }

    // Set loading state for the specific course button
    enrollLoadingState[courseId] = true;
    

    try {
        const { error: enrollError } = await supabase
            .from('course_enrollments')
            .insert({ user_id: profile.value.id, course_id: courseId })
            .select('course_id')
            .single();

        if (enrollError) {
             // Handle potential race condition or stale state where user is already enrolled in DB
             if (enrollError.code === '23505') { // unique_violation
                 
                 // TODO: Replace alert with a user-friendly notification (e.g., toast)
                 alert('أنت منتسب بالفعل لهذه الدورة (تم تحديث الحالة).');
                 if (!userEnrollments.value.includes(courseId)) {
                     userEnrollments.value.push(courseId); // Sync local state
                 }
             } else {
                throw enrollError; // Re-throw other Supabase errors
             }
        } else {
            // Success
            
            userEnrollments.value.push(courseId); // Update local state immediately
            // TODO: Replace alert with a success notification (e.g., toast)
            alert('تم الانتساب للدورة بنجاح!');
            navigateTo(`/study/courses/${courseId}`); // Navigate to the course page
        }
    } catch (err: any) {
        
        // TODO: Replace alert with an error notification (e.g., toast)
        alert(`فشل الانتساب للدورة: ${err.message || 'حدث خطأ غير متوقع.'}`);
    } finally {
        // Always reset loading state for the specific button
        enrollLoadingState[courseId] = false;
    }
}

// --- SEO Meta Tags ---
useHead({
  title: 'الدورات الدراسية - موقع الشيخ إبراهيم بشندي',
  meta: [
    { name: 'description', content: 'تصفح والتحق بالدورات الدراسية المنهجية للشيخ إبراهيم بشندي في مختلف العلوم الشرعية.' },
    { property: 'og:title', content: 'الدورات الدراسية - موقع الشيخ إبراهيم بشندي' },
    { property: 'og:description', content: 'دورات علمية منهجية ومتخصصة في العلوم الشرعية، متاحة للتعلم والدراسة عبر الإنترنت.' },
    { property: 'og:type', content: 'website' },
    // { property: 'og:image', content: '/path/to/default-course-image.jpg' }, // Consider adding a default image
  ]
})
</script>

<style scoped>
/* Basic button styles (can be extracted to a global CSS or base component) */
.button-base {
    @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150;
}
.button-primary {
    @apply button-base border-transparent text-white bg-primary hover:bg-opacity-85 focus:ring-primary;
}
.button-secondary {
    @apply button-base border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-muted;
}

/* Ensure focus states are clearly visible */
button:focus-visible, a:focus-visible {
  outline: 2px solid var(--color-primary); /* Or your focus ring color */
  outline-offset: 2px;
}

/* Add transitions for smoother visual feedback */
.grid > * {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
/* Example hover effect (could be inside CourseCard) */
.grid > *:hover {
    /* transform: translateY(-2px); */
    /* box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow); */
}
</style>