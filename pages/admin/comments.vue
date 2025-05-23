<template>
  <div class="p-4 sm:p-6">
    <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">إدارة التعليقات</h1>

    <!-- Filters Section -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 shadow-sm">
      <h2 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3">تصفية التعليقات</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Filter by Content -->
        <div>
          <label for="contentFilter" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">البحث في المحتوى:</label>
          <input
            type="text"
            id="contentFilter"
            v-model="searchTerm"
            @input="debouncedRefresh"
            placeholder="اكتب كلمة للبحث..."
            class="input-field"
            aria-label="البحث في محتوى التعليقات"
          />
        </div>

        <!-- Filter by User (Search) -->
         <div class="relative">
           <label for="userSearch" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">المستخدم (الكاتب):</label>
           <input
             type="text"
             id="userSearch"
             v-model="userSearchTerm"
             @input="debouncedFetchUsers"
             @focus="showUserDropdown = true"
             @blur="handleUserSearchBlur"
             placeholder="ابحث باسم المستخدم..."
             class="input-field"
             autocomplete="off"
             aria-haspopup="listbox"
             :aria-expanded="showUserDropdown"
             aria-controls="user-dropdown-list"
           />
           <!-- Dropdown for search results -->
           <div
             v-if="showUserDropdown && (loadingUsers || filteredUsersList.length > 0 || (userSearchTerm && !loadingUsers))"
             id="user-dropdown-list"
             role="listbox"
             class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
           >
             <div v-if="loadingUsers" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400" aria-live="polite">جارٍ البحث...</div>
             <ul v-else-if="filteredUsersList.length > 0">
               <li
                 v-for="(user, index) in filteredUsersList"
                 :key="user.id"
                 :id="`user-option-${index}`"
                 role="option"
                 @mousedown="selectUser(user)"
                 class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-800/50 cursor-pointer focus:outline-none focus:bg-primary-50 dark:focus:bg-primary-800/50"
                 tabindex="-1"
               >
                 {{ user.full_name }} ({{ user.id.substring(0, 8) }}...)
               </li>
             </ul>
             <div v-else-if="userSearchTerm && !loadingUsers" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                لا يوجد مستخدمون يطابقون البحث.
             </div>
           </div>
           <!-- Display selected user -->
            <div v-if="selectedUserId && selectedUserName" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                المستخدم المحدد: {{ selectedUserName }}
                <button @click="clearUserSelection" class="text-red-500 hover:text-red-700 ms-1 text-xxs" aria-label="إلغاء اختيار المستخدم">(إلغاء)</button>
            </div>
         </div>
      </div>
       <div class="mt-4 text-right border-t pt-4 dark:border-gray-700">
           <button @click="resetFilters" v-if="hasActiveFilters" class="button-secondary text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 me-1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                إعادة تعيين كل الفلاتر
            </button>
       </div>
    </div>


    <!-- Loading State -->
    <div v-if="pending && comments.length === 0" class="text-center py-10" aria-live="polite">
      <LoadingSpinner />
      <p class="mt-3 text-gray-500 dark:text-gray-400">جارٍ تحميل التعليقات...</p>
    </div>

    <!-- Error State -->
     <div v-else-if="error" class="error-box mt-6" aria-live="assertive">
       <h3 class="font-semibold mb-2">حدث خطأ</h3>
       <p class="mb-2">عفواً، لم نتمكن من تحميل التعليقات. يرجى المحاولة مرة أخرى.</p>
       <details class="mt-2 text-sm">
           <summary class="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">تفاصيل الخطأ</summary>
           <pre class="mt-1 p-2 bg-gray-100 dark:bg-gray-700/50 rounded text-xs break-all whitespace-pre-wrap">{{ error.message || error }}</pre>
       </details>
       <button @click="refreshComments" class="button-secondary mt-4">إعادة المحاولة</button>
     </div>

    <!-- Empty State (Considering Filters) -->
    <div v-else-if="comments.length === 0 && !pending" class="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg mt-6">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
      <p class="mt-3 font-medium text-gray-700 dark:text-gray-300">
          {{ hasActiveFilters ? 'لا توجد تعليقات تطابق معايير التصفية الحالية.' : 'لا توجد تعليقات لعرضها بعد.' }}
      </p>
      <button @click="resetFilters" v-if="hasActiveFilters" class="button-secondary text-sm mt-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 me-1"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
           عرض كل التعليقات
       </button>
    </div>

    <!-- Comments List -->
    <div v-else class="space-y-4">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 relative transition-opacity duration-300"
        :class="{ 'opacity-50 pointer-events-none': comment.isDeleting }"
        aria-labelledby="`comment-user-${comment.id}`"
      >
        <!-- Comment Header: User, Date, Linked Post -->
        <div class="flex items-start justify-between mb-2 flex-wrap gap-2">
          <div class="flex items-center space-x-3 rtl:space-x-reverse">
             <img :src="comment.profiles?.avatar_url || '/images/default-avatar.png'" alt="" class="w-8 h-8 rounded-full object-cover bg-gray-200 dark:bg-gray-600" />
            <div>
              <p :id="`comment-user-${comment.id}`" class="text-sm font-semibold text-gray-800 dark:text-gray-200">{{ comment.profiles?.full_name ?? 'مستخدم غير معروف' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <time :datetime="comment.created_at">{{ formatDate(comment.created_at) }}</time>
                 <span v-if="getPostLink(comment)" class="mx-1"> - على:
                     <NuxtLink :to="getPostLink(comment)?.to || '#'" class="text-primary hover:underline" :aria-label="`الانتقال إلى ${getPostLink(comment)?.text}`">
                         {{ getPostLink(comment)?.text || 'منشور' }}
                     </NuxtLink>
                 </span>
              </p>
            </div>
          </div>
           <!-- Actions: Delete Only -->
           <div class="flex items-center flex-shrink-0">
                 <button
                     @click="confirmDeleteComment(comment)"
                     :disabled="comment.isDeleting"
                     class="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-wait transition-colors"
                     :title="comment.isDeleting ? 'جارٍ الحذف...' : 'حذف التعليق'"
                     :aria-label="`حذف تعليق المستخدم ${comment.profiles?.full_name ?? 'غير معروف'}`"
                     :aria-busy="comment.isDeleting"
                 >
                    <LoadingSpinner v-if="comment.isDeleting" class="w-4 h-4" />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                        <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.325.418C2.38 4.97 1.5 5.647 1.5 6.5V17a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3V6.5c0-.853-.88-1.53-2.175-1.889a48.47 48.47 0 0 0-2.325-.418v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.5.66 1.5 1.5v1.5c0 .84-.66 1.5-1.5 1.5s-1.5-.66-1.5-1.5V5.5C8.5 4.66 9.16 4 10 4ZM4.5 6.5c0-.132.015-.26.043-.386a.75.75 0 0 1 .914-.551 47.14 47.14 0 0 1 8.999.171.75.75 0 0 1 .914.55c.028.127.043.255.043.386V17a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4.5 17V6.5Z" clip-rule="evenodd" />
                    </svg>
                 </button>
           </div>
        </div>

        <!-- Comment Content -->
        <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ comment.content }}</p>
      </div>

       <!-- Infinite Scroll Loader/Trigger -->
       <div ref="scrollTrigger" class="h-10 flex justify-center items-center" aria-hidden="true">
           <LoadingSpinner v-if="loadingMore" class="w-6 h-6 text-primary" />
           <span v-if="!hasMore && comments.length > 0 && !loadingMore" class="text-sm text-gray-500 dark:text-gray-400">وصلت إلى نهاية القائمة.</span>
       </div>
    </div>

     <!-- Confirmation Modal -->
     <ConfirmationModal
       :isOpen="showDeleteConfirm"
       title="تأكيد الحذف"
       message="هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء."
       confirmButtonText="نعم، حذف"
       cancelButtonText="إلغاء"
       confirmButtonVariant="danger"
       @confirm="executeDeleteComment"
       @cancel="showDeleteConfirm = false"
     />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useSupabaseClient, definePageMeta, useHead, useRouter, useRoute } from '#imports';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import ConfirmationModal from '~/components/ConfirmationModal.vue';
import { debounce } from 'lodash-es';
// import { useToast } from 'vue-toastification'; // مثال: لاستخدام نظام إشعارات

// --- Type Definitions ---
type CommentProfile = Pick<Tables<'profiles'>, 'full_name' | 'avatar_url'> | null;
type CommentLesson = Pick<Tables<'lessons'>, 'id' | 'title'> | null;
type CommentBook = Pick<Tables<'books'>, 'id' | 'title'> | null;
type CommentStudyCourse = Pick<Tables<'study_courses'>, 'id' | 'title'> | null;

type CommentWithState = Tables<'comments'> & {
  profiles: CommentProfile;
  lessons: CommentLesson;
  books: CommentBook;
  study_courses: CommentStudyCourse;
  isDeleting?: boolean; // Transient UI state for deletion
};
type UserBasicInfo = Pick<Tables<'profiles'>, 'id' | 'full_name'>;

// --- Page Meta & Layout ---
definePageMeta({
  layout: 'admin',
  middleware: ['admin'] // Ensure this middleware correctly checks for admin role
});

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const router = useRouter();
const route = useRoute();
// const toast = useToast(); // مثال: لاستخدام نظام إشعارات

// --- Constants ---
const ITEMS_PER_PAGE = 25;

// --- Filter State ---
const searchTerm = ref(route.query.q as string || '');
const selectedUserId = ref<string | null>(route.query.userId as string || null);
const selectedUserName = ref<string | null>(null); // Store name for display after selection/load
const userSearchTerm = ref(''); // Separate model for the user search input
const showUserDropdown = ref(false);

// --- User Filter Fetching State ---
const filteredUsersList = ref<UserBasicInfo[]>([]);
const loadingUsers = ref(false);

// --- Comments Data & Infinite Scroll State ---
const comments = ref<CommentWithState[]>([]);
const pending = ref(false); // Primarily for initial load indication
const error = ref<Error | null>(null);
const loadingMore = ref(false); // For subsequent page loads (infinite scroll)
const hasMore = ref(true); // Indicates if more comments are available
const currentPage = ref(0); // Tracks the next page to fetch (0-indexed)
const scrollTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// --- Modal State ---
const showDeleteConfirm = ref(false);
const commentToDelete = ref<CommentWithState | null>(null);

// --- Core Logic: Fetching Comments ---
const loadComments = async (reset: boolean = false) => {
  if (reset) {
    
    pending.value = true;
    error.value = null;
    currentPage.value = 0;
    comments.value = [];
    hasMore.value = true;
    // Ensure observer is re-attached if needed after reset, though it should persist
  }

  // Prevent concurrent loads or loading when no more data exists
  if (loadingMore.value || !hasMore.value) {
    
    return;
  }

  loadingMore.value = true;
  if (!reset) pending.value = false; // 'pending' is false for subsequent loads

  const pageToFetch = currentPage.value;
  const rangeFrom = pageToFetch * ITEMS_PER_PAGE;
  const rangeTo = rangeFrom + ITEMS_PER_PAGE - 1;

  

  try {
    let query = supabase
      .from('comments')
      .select(`
        *,
        profiles ( full_name, avatar_url ),
        lessons ( id, title ),
        books ( id, title ),
        study_courses ( id, title )
      `, { count: 'exact' }) // count: 'exact' is crucial for pagination/hasMore
      .order('created_at', { ascending: false })
      .range(rangeFrom, rangeTo);

    // Apply filters dynamically
    if (searchTerm.value) {
      query = query.ilike('content', `%${searchTerm.value}%`);
    }
    if (selectedUserId.value) {
      query = query.eq('user_id', selectedUserId.value);
    }
    // Add more filters here if needed (e.g., date range, post type)

    const { data, error: fetchError, count } = await query;

    if (fetchError) throw fetchError;

    // Ensure data is not null and cast correctly
    const newComments = (data ?? []) as CommentWithState[];
    

    if (reset) {
      comments.value = newComments;
    } else {
      // Append new comments for infinite scroll
      comments.value.push(...newComments);
    }

    // Update pagination state
    // Check if the total number of comments fetched so far is less than the total count
    hasMore.value = count !== null ? comments.value.length < count : newComments.length === ITEMS_PER_PAGE;
    currentPage.value += 1; // Increment page number for the next fetch

    

  } catch (err: any) {
    
    error.value = err;
    hasMore.value = false; // Stop trying to load more on error
    // toast.error('فشل تحميل التعليقات.'); // Example notification
  } finally {
    loadingMore.value = false;
    if (reset) pending.value = false; // Ensure pending is false after initial load completes
  }
};

// --- Filter Logic ---

// Fetch users based on search term (debounced)
const fetchUsers = async (term: string) => {
  if (!term || term.length < 2) {
    filteredUsersList.value = [];
    loadingUsers.value = false;
    return;
  }
  
  loadingUsers.value = true;
  try {
      const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .ilike('full_name', `%${term}%`)
          .limit(10);

      if (fetchError) throw fetchError;
      filteredUsersList.value = data ?? [];
      
  } catch(err: any) {
      
      filteredUsersList.value = [];
      // Consider showing an error message in the dropdown
  } finally {
     loadingUsers.value = false;
  }
};
const debouncedFetchUsers = debounce(fetchUsers, 300);

// Select a user from the dropdown
const selectUser = (user: UserBasicInfo) => {
    
    selectedUserId.value = user.id;
    selectedUserName.value = user.full_name; // Store name
    userSearchTerm.value = user.full_name; // Update input field to show selected name
    showUserDropdown.value = false;
    filteredUsersList.value = []; // Clear suggestions
    refreshComments(); // Trigger data refresh with the new filter
};

// Clear the selected user filter
const clearUserSelection = () => {
    
    selectedUserId.value = null;
    selectedUserName.value = null;
    userSearchTerm.value = ''; // Clear search input
    filteredUsersList.value = []; // Clear suggestions
    refreshComments(); // Refresh data without the user filter
};

// Handler for user search input blur to close dropdown after a delay
const handleUserSearchBlur = () => {
    // Use setTimeout to allow click event on dropdown items to register first
    setTimeout(() => {
        showUserDropdown.value = false;
    }, 200); // Adjust delay if needed
};

// Refresh comments list and update URL query params
const refreshComments = () => {
    // Use router.replace to update URL without adding history entry
    router.replace({
        query: {
            // Only add params to URL if they have values
            q: searchTerm.value || undefined,
            userId: selectedUserId.value || undefined,
        }
    });
    // Load comments from the beginning with current filters
    loadComments(true);
};
// Debounced version for text input changes
const debouncedRefresh = debounce(refreshComments, 500);

// Reset all filters to their default state
const resetFilters = () => {
    
    searchTerm.value = '';
    selectedUserId.value = null;
    selectedUserName.value = null;
    userSearchTerm.value = '';
    filteredUsersList.value = [];
    router.replace({ query: {} }); // Clear query params from URL
    refreshComments(); // Reload comments without filters
};

// Computed property to check if any filter is currently active
const hasActiveFilters = computed(() => {
    return searchTerm.value !== '' || selectedUserId.value !== null;
});

// --- Infinite Scroll Logic ---
const setupIntersectionObserver = () => {
  if (observer) observer.disconnect(); // Clean up previous observer if exists

  const options = {
    root: null, // Use the viewport as the root
    rootMargin: '0px 0px 300px 0px', // Load more when trigger is 300px from bottom
    threshold: 0, // Trigger as soon as the element enters the root margin
  };

  observer = new IntersectionObserver((entries) => {
    // Check if the trigger element is intersecting and we are not already loading
    if (entries[0].isIntersecting && !loadingMore.value && hasMore.value) {
      
      loadComments(); // Load the next page
    }
  }, options);

  // Observe the scroll trigger element
  if (scrollTrigger.value) {
    observer.observe(scrollTrigger.value);
    
  } else {
      
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
    
    // Fetch initial batch of comments
    loadComments(true);
    // Set up the observer for infinite scrolling
    setupIntersectionObserver();

     // Attempt to fetch user name if userId is present in URL query on initial load
     if (selectedUserId.value && !selectedUserName.value) {
         
         supabase.from('profiles').select('full_name').eq('id', selectedUserId.value).maybeSingle().then(({ data, error: nameError }) => {
             if (nameError) {
                 
             } else if (data) {
                 
                 selectedUserName.value = data.full_name;
                 // Update the search input field to reflect the loaded user filter
                 userSearchTerm.value = data.full_name;
             } else {
                 
                 // Optionally clear the invalid userId from state/URL if user not found
                 // clearUserSelection(); // Or handle differently
             }
         });
     }
});

onUnmounted(() => {
  // Clean up the observer when the component is unmounted to prevent memory leaks
  if (observer) {
    observer.disconnect();
    
  }
});

// --- Helper Functions ---
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'غير محدد';
  try {
    // Format for Arabic locale with common options
    return new Date(dateString).toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
  } catch {
    // Fallback if dateString is invalid
    return dateString;
  }
};

// Generate link object for the comment's related post
const getPostLink = (comment: CommentWithState): { to: string; text: string } | null => {
    // Ensure related data (like titles) are available before generating link
    // The select query in loadComments should fetch these if they exist.
    if (comment.lesson_id && comment.lessons?.title) {
        // IMPORTANT: Ensure your route structure matches. If lessons are nested under courses,
        // you might need the course ID here. The current query fetches study_courses based on comment.study_course_id,
        // but not necessarily the course *containing* the lesson_id if they are linked differently.
        // Assuming a direct lesson link for simplicity:
        return { to: `/lessons/${comment.lesson_id}`, text: `درس: ${comment.lessons.title}` };
    } else if (comment.book_id && comment.books?.title) {
        // Link to a specific section within the books page if possible
        return { to: `/books#book-${comment.book_id}`, text: `كتاب: ${comment.books.title}` };
    } else if (comment.study_course_id && comment.study_courses?.title) {
        return { to: `/study/courses/${comment.study_course_id}`, text: `دورة: ${comment.study_courses.title}` };
    }
    // Return null if no specific link can be determined
    return null;
};

// --- Delete Comment Logic ---
const confirmDeleteComment = (comment: CommentWithState) => {
    commentToDelete.value = comment;
    showDeleteConfirm.value = true;
};

const executeDeleteComment = async () => {
    if (!commentToDelete.value) return;

    const comment = commentToDelete.value;
    
    // Set UI state to indicate deletion is in progress
    comment.isDeleting = true;
    showDeleteConfirm.value = false; // Close confirmation modal

    try {
        const { error: deleteError } = await supabase
            .from('comments')
            .delete()
            .eq('id', comment.id); // Target the specific comment by ID

        if (deleteError) throw deleteError; // Throw error to be caught below

        
        // Remove the comment from the local list for immediate UI update
        comments.value = comments.value.filter(c => c.id !== comment.id);

        // Provide user feedback (using toast/notification is better than alert)
        // toast.success('تم حذف التعليق بنجاح.');
       

    } catch (err: any) {
        
       
        const commentInList = comments.value.find(c => c.id === comment.id);
        if(commentInList) {
            commentInList.isDeleting = false;
        } else {
             // If already removed (e.g., due to optimistic update that failed), ensure original object state is reset
             comment.isDeleting = false;
        }
    } finally {
         // Always clear the comment-to-delete reference
         commentToDelete.value = null;
         // Note: We don't reset the general isDeleting state here, as it's per-comment.
    }
};

// --- SEO & Head ---
useHead({
    title: 'إدارة التعليقات - لوحة التحكم' // More specific title
});
</script>

<style scoped>
/* General Styles (Tailwind utility classes are preferred) */
.error-box {
  @apply p-4 border border-red-300 bg-red-50 text-red-700 rounded-md dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-300;
}
.button-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150;
}
.input-field {
   @apply shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 disabled:opacity-70 disabled:cursor-not-allowed;
}
.text-xxs {
    font-size: 0.65rem; /* 10.4px */
    line-height: 0.8rem; /* 12.8px */
}

[role="option"]:focus {
    /* اختر درجة اللون المناسبة من ملف الإعدادات الخاص بك */
    outline: 2px solid theme('colors.primary.500');
    outline-offset: -1px;
}

/* Style for deleting state */
.opacity-50.pointer-events-none {
    transition: opacity 0.3s ease-in-out;
}
</style>