<template>
  <section class="mt-8 py-6 border-t border-gray-200 dark:border-gray-700">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
      التعليقات ({{ totalCommentsCount ?? '...' }})
    </h2>

    <!-- New Comment Form -->
    <div v-if="user" class="mb-6">
      <div class="flex space-x-3 rtl:space-x-reverse">
        <UserAvatar
          :avatar-url="userProfile?.avatar_url"
          :name="userProfile?.full_name"
          size="md"
          class="flex-shrink-0 mt-1"
        />
        <div class="flex-1 min-w-0">
          <textarea
            v-model="newCommentContent"
            rows="3"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-70"
            placeholder="إضافة تعليق عام..."
             :disabled="isSubmittingComment || isSuspended" 
            aria-label="إضافة تعليق جديد"
          ></textarea>
           <!-- Suspension Message -->
           <p v-if="isSuspended" class="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
             التعليق موقوف حاليًا حتى {{ formatDate(userStore.profile?.comment_suspended_until) }}.
           </p>
          <div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">
            <span v-if="commentSubmitError" class="text-xs text-red-500 flex-1 text-right">{{ commentSubmitError }}</span>
            <button
              @click="addComment"
              type="button"
              :disabled="isSubmittingComment || !newCommentContent.trim() || isSuspended" 
              class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="isSubmittingComment" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{{ isSubmittingComment ? 'جاري الإضافة...' : (isSuspended ? 'التعليق موقوف' : 'إضافة تعليق') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Login/Signup Prompt -->
    <div v-else class="mb-6 p-4 text-center bg-gray-100 dark:bg-gray-800 rounded-md">
       <p class="text-sm text-gray-700 dark:text-gray-300">
        يرجى
        <NuxtLink :to="localePath('/login')" class="text-primary-600 hover:underline dark:text-primary-400 font-medium">تسجيل الدخول</NuxtLink>
        أو
        <NuxtLink :to="localePath('/signup')" class="text-primary-600 hover:underline dark:text-primary-400 font-medium">إنشاء حساب</NuxtLink>
        للتعليق.
      </p>
    </div>

    <!-- Loading State -->
     <div v-if="isLoadingInitial" class="text-center py-10">
        <LoadingSpinner class="mx-auto h-8 w-8 text-gray-500 dark:text-gray-400"/> 
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">جاري تحميل التعليقات...</p>
    </div>


    <!-- Error State -->
    <div v-else-if="fetchError" class="text-center py-6 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md p-4">
       <svg class="w-6 h-6 inline-block mb-1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <p>{{ fetchError }}</p>
      <button v-if="!fetchError.includes('إعداد المكون')" @click="fetchInitialComments" class="mt-2 px-3 py-1 text-xs font-medium text-primary-700 dark:text-primary-300 hover:underline">إعادة المحاولة</button>
    </div>

    <!-- No Comments State -->
    <div v-else-if="allComments.length === 0 && totalCommentsCount === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
       <svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
      <p class="text-lg font-medium">لا توجد تعليقات بعد</p>
      <p class="text-sm mt-1">كن أول من يترك تعليقاً!</p>
    </div>

    <!-- Comments List -->
    <div v-else class="space-y-4">
       <CommentItem
         v-for="comment in topLevelComments"
         :key="comment.id"
         :comment="comment"
         :replies="getRepliesForComment(comment.id)"
         :content-id="contentIdentifier"
         :is-commenting-suspended="isSuspended" 
         @comment-updated="handleCommentUpdate"
         @comment-deleted="handleCommentDelete"
         @reply-added="handleReplyAdded"
         class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4"
       />


      <!-- Load More Button -->
      <div v-if="hasMoreComments" class="text-center pt-4">
        <button
          @click="loadMoreComments"
          :disabled="isLoadingMore"
          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 border border-transparent rounded-md hover:bg-primary-200 dark:text-primary-300 dark:bg-primary-900 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="isLoadingMore" class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
             <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ isLoadingMore ? 'جاري التحميل...' : 'تحميل المزيد من التعليقات' }}</span>
        </button>
        <p v-if="fetchMoreError" class="mt-2 text-xs text-red-500">{{ fetchMoreError }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Database } from '~/types/database.types'
import UserAvatar from './UserAvatar.vue'
import CommentItem from './CommentItem.vue'
import LoadingSpinner from './LoadingSpinner.vue'; // Import LoadingSpinner
import { storeToRefs } from 'pinia'
import { useUserStore } from '~/stores/user'
import type { PostgrestError } from '@supabase/supabase-js'

const localePath = (path: string) => path;

type CommentWithProfile = Database['public']['Tables']['comments']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url'> | null
}
type ContentId = { lesson_id?: number | string; book_id?: number | string; study_course_id?: number | string; }

const props = defineProps<{
  lessonId?: number | string
  bookId?: number | string
  courseId?: number | string
}>()

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const userStore = useUserStore() // Get the whole store instance
const { profile: userProfile } = storeToRefs(userStore) // Keep this for convenience

const allComments = ref<CommentWithProfile[]>([])
const totalCommentsCount = ref<number | null>(null)
const isLoadingInitial = ref(true)
const isLoadingMore = ref(false)
const fetchError = ref<string | null>(null)
const fetchMoreError = ref<string | null>(null)
const commentsPerPage = ref(10)
const currentPage = ref(1)
const hasMoreComments = ref(true)
const newCommentContent = ref('')
const isSubmittingComment = ref(false)
const commentSubmitError = ref<string | null>(null)

const contentInfo = computed(() => {
  if (props.lessonId !== undefined) return { column: 'lesson_id', value: Number(props.lessonId) };
  if (props.bookId !== undefined) return { column: 'book_id', value: Number(props.bookId) };
  if (props.courseId !== undefined) return { column: 'study_course_id', value: Number(props.courseId) };
  return null;
})

const contentIdentifier = computed((): ContentId => ({
  lesson_id: props.lessonId, book_id: props.bookId, study_course_id: props.courseId
}))

// --- Suspension Check ---
const isSuspended = computed(() => {
  // Access profile directly from the store instance
  const profile = userStore.profile;
  if (!profile || !profile.comment_suspended_until) {
    return false;
  }
  try {
    return new Date(profile.comment_suspended_until) > new Date();
  } catch {
    return false;
  }
});

const topLevelComments = computed(() => {
  return allComments.value
    .filter(c => c.parent_comment_id === null)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
})

const getRepliesForComment = (commentId: number): CommentWithProfile[] => {
  return allComments.value.filter(c => c.parent_comment_id === commentId)
}

const fetchTotalCount = async (column: string, value: number) => {
  // ... (implementation remains the same) ...
   try {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true }) // Only get count
      .eq(column, value)
      .eq('is_approved', true) // Count only approved comments

    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    
    fetchError.value = 'فشل في جلب عدد التعليقات.'; // Set error for initial load
    return null; // Return null on error
  }
}

const fetchCommentsBatch = async (column: string, value: number, page = 1) => {
  // ... (implementation remains the same) ...
  const from = (page - 1) * commentsPerPage.value;
  const to = from + commentsPerPage.value - 1;

  // 1. Fetch Top-Level Comments
  const { data: topLevelData, error: topLevelError } = await supabase
    .from('comments')
    .select(`
      *,
      profiles!inner (id, full_name, avatar_url)
    `)
    .eq(column, value)
    .eq('is_approved', true)
    .is('parent_comment_id', null) // Only top-level
    .order('created_at', { ascending: false }) // Newest first
    .range(from, to);

  if (topLevelError) throw topLevelError;

  const newTopLevelComments = (topLevelData || []).filter(c => c.profiles !== null) as CommentWithProfile[];

  // 2. Fetch Replies for the fetched Top-Level Comments
  const parentIds = newTopLevelComments.map(c => c.id);
  let repliesData: CommentWithProfile[] = [];
  if (parentIds.length > 0) {
    const { data, error: repliesError } = await supabase
      .from('comments')
      .select(`
        *,
        profiles!inner (id, full_name, avatar_url)
      `)
      .in('parent_comment_id', parentIds)
      .eq('is_approved', true)
      .order('created_at', { ascending: true }); // Replies oldest first

    if (repliesError) {
      
      fetchMoreError.value = 'حدث خطأ أثناء تحميل بعض الردود.';
    } else {
      repliesData = (data || []).filter(c => c.profiles !== null) as CommentWithProfile[];
    }
  }

  return { newTopLevelComments, repliesData };
}

const fetchInitialComments = async () => {
  // ... (implementation mostly remains the same) ...
   isLoadingInitial.value = true;
  fetchError.value = null;
  allComments.value = [];
  currentPage.value = 1;
  hasMoreComments.value = true;
  totalCommentsCount.value = null;

  const providedPropsCount = [props.lessonId, props.bookId, props.courseId]
                            .filter(p => p !== undefined).length;
  if (providedPropsCount !== 1 || !contentInfo.value) {
      fetchError.value = 'خطأ في إعداد المكون: يجب تحديد معرف محتوى واحد فقط.';
      isLoadingInitial.value = false; hasMoreComments.value = false; return;
  }

  const { column, value } = contentInfo.value;

  try {
    const count = await fetchTotalCount(column, value);
    if (count === null) { isLoadingInitial.value = false; hasMoreComments.value = false; return; }
    totalCommentsCount.value = count;

    if (totalCommentsCount.value === 0) {
      hasMoreComments.value = false; allComments.value = [];
    } else {
      const { newTopLevelComments, repliesData } = await fetchCommentsBatch(column, value, 1);
      const newComments = [...newTopLevelComments, ...repliesData];
      const existingIds = new Set<number>(); // Initialize here
      newComments.forEach(comment => {
        if (!existingIds.has(comment.id)) { allComments.value.push(comment); existingIds.add(comment.id); }
      });
      hasMoreComments.value = newTopLevelComments.length === commentsPerPage.value;
    }
  } catch (err: any) {
    
    fetchError.value = `فشل تحميل التعليقات: (${(err as PostgrestError).message || 'خطأ غير معروف'})`;
    allComments.value = []; totalCommentsCount.value = 0; hasMoreComments.value = false;
  } finally { isLoadingInitial.value = false; }
}

const loadMoreComments = async () => {
  // ... (implementation remains the same) ...
   if (!hasMoreComments.value || isLoadingMore.value || !contentInfo.value) return;

  isLoadingMore.value = true;
  fetchMoreError.value = null;
  const nextPage = currentPage.value + 1;
  const { column, value } = contentInfo.value;

  try {
    const { newTopLevelComments, repliesData } = await fetchCommentsBatch(column, value, nextPage);
    if (newTopLevelComments.length === 0) { hasMoreComments.value = false; }
    else {
      const newComments = [...newTopLevelComments, ...repliesData];
      const existingIds = new Set(allComments.value.map(c => c.id));
      newComments.forEach(comment => { if (!existingIds.has(comment.id)) { allComments.value.push(comment); existingIds.add(comment.id); } });
      currentPage.value = nextPage;
      hasMoreComments.value = newTopLevelComments.length === commentsPerPage.value;
    }
  } catch (err: any) {
    
    fetchMoreError.value = `فشل تحميل المزيد: (${(err as PostgrestError).message || 'خطأ غير معروف'})`;
  } finally { isLoadingMore.value = false; }
}

// Add Comment Function - WITH SUSPENSION CHECK
const addComment = async () => {
  // Add suspension check at the beginning
  if (isSuspended.value) {
      commentSubmitError.value = "لا يمكنك إضافة تعليق حاليًا بسبب الإيقاف.";
      return;
  }

  if (!user.value || !userProfile.value || !newCommentContent.value.trim() || !contentInfo.value || isSubmittingComment.value) return;

  if (!userProfile.value.id) {
      commentSubmitError.value = 'خطأ: لم يتم العثور على معرف الملف الشخصي.';
      
      return;
  }

  isSubmittingComment.value = true;
  commentSubmitError.value = null;
  const { column, value } = contentInfo.value;

  const commentData = {
    user_id: user.value.id,
    profile_id: userProfile.value.id,
    content: newCommentContent.value.trim(),
    parent_comment_id: null,
    [column]: value,
  };

  try {
    const { data: newComment, error } = await supabase
      .from('comments').insert(commentData).select(`*, profiles!inner (id, full_name, avatar_url)`).single();

    if (error) throw error;
    if (!newComment || !newComment.profiles) throw new Error('لم يتم إرجاع بيانات التعليق الجديد أو الملف الشخصي.');

    allComments.value.unshift(newComment as CommentWithProfile);
    newCommentContent.value = '';
    if (totalCommentsCount.value !== null) totalCommentsCount.value++;

  } catch (err: any) {
    
    commentSubmitError.value = `فشل إضافة التعليق: (${(err as PostgrestError).message || 'يرجى المحاولة مرة أخرى'})`;
  } finally { isSubmittingComment.value = false; }
}

const handleCommentUpdate = (updatedComment: CommentWithProfile) => {
  // ... (implementation remains the same) ...
  const index = allComments.value.findIndex(c => c.id === updatedComment.id);
  if (index !== -1) { allComments.value.splice(index, 1, updatedComment); }
}

const handleCommentDelete = (deletedCommentId: number) => {
  // ... (implementation remains the same) ...
  const idsToDelete = new Set<number>([deletedCommentId]);
  const findReplies = (parentId: number) => { allComments.value.forEach(c => { if (c.parent_comment_id === parentId) { idsToDelete.add(c.id); findReplies(c.id); } }); };
  findReplies(deletedCommentId);
  const initialLength = allComments.value.length;
  allComments.value = allComments.value.filter(c => !idsToDelete.has(c.id));
  const deletedCount = initialLength - allComments.value.length;
  if (totalCommentsCount.value !== null && deletedCount > 0) { totalCommentsCount.value = Math.max(0, totalCommentsCount.value - deletedCount); }
}

const handleReplyAdded = (newReply: CommentWithProfile) => {
   // ... (implementation remains the same) ...
   if (!allComments.value.some(c => c.id === newReply.id)) {
       allComments.value.push(newReply);
       if (totalCommentsCount.value !== null) totalCommentsCount.value++;
   }
}

// --- Helper Functions ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try { const date = new Date(dateString); if (isNaN(date.getTime())) return ''; return date.toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short', hour12: true }); }
  catch { return ''; }
};


// ---- Lifecycle Hooks & Watchers ----
onMounted(() => {
  // Ensure profile is loaded before fetching comments IF suspension check relies on it immediately
   // We added the check inside addComment, so initial fetch is probably fine here
  fetchInitialComments();
});

watch(contentInfo, (newVal, oldVal) => {
    if (newVal?.value !== oldVal?.value || newVal?.column !== oldVal?.column) {
       if (newVal) { fetchInitialComments(); }
       else {
         allComments.value = []; totalCommentsCount.value = 0;
         fetchError.value = 'خطأ في إعداد المكون: لم يتم تحديد معرف محتوى.';
         isLoadingInitial.value = false; hasMoreComments.value = false;
       }
    }
}, { immediate: false });

</script>