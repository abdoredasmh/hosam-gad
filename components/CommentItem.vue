<template>
  <div class="py-4">
    <!-- التعليق الأصلي -->
    <div class="flex space-x-3 rtl:space-x-reverse">
      <UserAvatar
        :avatar-url="comment.profiles?.avatar_url"
        :name="comment.profiles?.full_name"
        size="md"
        class="mt-1"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {{ comment.profiles?.full_name || 'مستخدم' }}
          </span>
          <CommentActions
            :item="comment"
            item-type="comment"
            :is-commenting-suspended="isCommentingSuspended" 
            @reply="toggleReplyForm"
            @edit="startEditingComment"
            @delete="requestDeleteComment"
            class="flex-shrink-0"
          />
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
          <time :datetime="comment.created_at" :title="fullTimestamp">{{ formattedTimestamp }}</time>
          <span v-if="isCommentEdited" class="mx-1" title="تم تعديل هذا التعليق">(تم التعديل)</span>
        </div>

        <!-- عرض محتوى التعليق -->
        <p v-if="!isEditingComment" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
          {{ comment.content }}
        </p>

        <!-- وضع تعديل التعليق -->
        <div v-else>
          <textarea
            ref="editCommentInputRef"
            v-model="editedCommentContent"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-70"
            placeholder="تعديل التعليق..."
            :disabled="isSavingCommentEdit"
            @keydown.esc="cancelEditComment"
            @keydown.enter.prevent.exact="saveEditComment"
             aria-label="تعديل التعليق"
          ></textarea>
          <div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">
            <span v-if="editCommentError" class="text-xs text-red-500 flex-1 text-right">{{ editCommentError }}</span>
            <button @click="cancelEditComment" type="button" :disabled="isSavingCommentEdit" class="px-3 py-1 text-xs ...">إلغاء</button>
            <button @click="saveEditComment" type="button" :disabled="isSavingCommentEdit || !editedCommentContent.trim()" class="inline-flex ...">
               <svg v-if="isSavingCommentEdit" class="animate-spin ..."></svg>
              <span>{{ isSavingCommentEdit ? 'جاري الحفظ...' : 'حفظ' }}</span>
            </button>
          </div>
        </div>

        <!-- أزرار الرد وعرض الردود (لغير وضع التعديل) -->
        <div v-if="!isEditingComment" class="mt-2 flex items-center space-x-4 rtl:space-x-reverse text-xs">
          <button
            v-if="user"
            @click="toggleReplyForm"
            type="button"
            class="font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
             :disabled="isCommentingSuspended" 
            aria-controls="reply-form-{{ comment.id }}"
            :aria-expanded="showReplyForm.toString()"
          >
             <svg v-if="!showReplyForm" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
             <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            <span>{{ showReplyForm ? 'إلغاء الرد' : (isCommentingSuspended ? 'الرد موقوف' : 'رد') }}</span> 
          </button>
           <!-- Optional: Show suspension reason near reply button -->
           <span v-if="isCommentingSuspended && user" class="text-yellow-600 dark:text-yellow-400">(لا يمكنك الرد حاليًا)</span>

          <button
            v-if="localReplies.length > 0"
            @click="repliesVisible = !repliesVisible"
            type="button"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center gap-1"
            :aria-expanded="repliesVisible.toString()"
            aria-controls="replies-list-{{ comment.id }}"
          >
             <svg v-if="repliesVisible" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
             <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            <span>
                {{ localReplies.length }} {{ localReplies.length === 1 ? 'رد' : (localReplies.length === 2 ? 'ردان' : (localReplies.length <= 10 ? 'ردود' : 'ردًا')) }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- منطقة الردود -->
    <div class="mt-3 ml-10 rtl:mr-10 rtl:ml-0 pl-3 rtl:pr-3 border-l-2 border-gray-200 dark:border-gray-700 rtl:border-l-0 rtl:border-r-2">
      <!-- نموذج إضافة رد جديد -->
      <div v-if="showReplyForm" :id="'reply-form-' + comment.id" class="mb-4">
        <div class="flex space-x-3 rtl:space-x-reverse">
          <UserAvatar :avatar-url="userProfile?.avatar_url" :name="userProfile?.full_name" size="sm" class="mt-1"/>
          <div class="flex-1 min-w-0">
            <textarea
              ref="replyInputRef"
              v-model="newReplyContent"
              rows="2"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-70"
              placeholder="إضافة رد عام..."
               :disabled="isSubmittingReply || isCommentingSuspended" 
              @keydown.esc="cancelReply"
              @keydown.enter.prevent.exact="addReply"
              aria-label="إضافة رد جديد"
            ></textarea>
             <!-- Suspension Message for reply form -->
             <p v-if="isCommentingSuspended" class="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
               لا يمكنك إضافة رد حاليًا بسبب الإيقاف.
             </p>
            <div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">
              <span v-if="replyError" class="text-xs text-red-500 flex-1 text-right">{{ replyError }}</span>
               <button @click="cancelReply" type="button" :disabled="isSubmittingReply" class="px-3 py-1 text-xs ...">إلغاء</button>
              <button
                @click="addReply"
                type="button"
                :disabled="isSubmittingReply || !newReplyContent.trim() || isCommentingSuspended" 
                class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <svg v-if="isSubmittingReply" class="animate-spin ..."></svg>
                <span>{{ isSubmittingReply ? 'جاري الرد...' : 'رد' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- قائمة الردود -->
      <Transition name="fade">
        <div v-show="localReplies.length > 0 && repliesVisible" :id="'replies-list-' + comment.id" class="space-y-0">
          <ReplyItem
            v-for="reply in sortedReplies"
            :key="reply.id"
            :reply="reply"
            @reply-updated="handleReplyUpdate"
            @reply-deleted="handleReplyDelete"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, type PropType } from 'vue' // Added PropType
import type { Database } from '~/types/database.types'
import { formatDistanceToNowStrict } from 'date-fns'
import { ar } from 'date-fns/locale'
import UserAvatar from './UserAvatar.vue'
import ReplyItem from './ReplyItem.vue'
import CommentActions from './CommentActions.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '~/stores/user'
import type { PostgrestError } from '@supabase/supabase-js';

// Define Type for Comment/Reply with Profile
type CommentWithProfile = Database['public']['Tables']['comments']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url'> | null
}

// Define Content ID structure for associating replies
type ContentId = {
  lesson_id?: number | string;
  book_id?: number | string;
  study_course_id?: number | string; // Ensure column name matches DB
}

// Props definition - ADD isCommentingSuspended
const props = defineProps({
  comment: {
      type: Object as PropType<CommentWithProfile>,
      required: true
  },
  replies: {
      type: Array as PropType<CommentWithProfile[]>,
      default: () => []
  },
  contentId: {
      type: Object as PropType<ContentId>,
      required: true
  },
  isCommentingSuspended: { // Receive suspension status from parent
      type: Boolean,
      default: false
  }
})

// Emits definition
const emit = defineEmits<{
  (e: 'commentUpdated', updatedComment: CommentWithProfile): void
  (e: 'commentDeleted', deletedCommentId: number): void
  (e: 'replyAdded', newReply: CommentWithProfile): void
}>()

// Supabase & User context
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { profile: userProfile } = storeToRefs(useUserStore())

// --- Component State ---
const localReplies = ref<CommentWithProfile[]>([])
const repliesVisible = ref(true)
const isEditingComment = ref(false)
const editedCommentContent = ref('')
const isSavingCommentEdit = ref(false)
const editCommentError = ref<string | null>(null)
const editCommentInputRef = ref<HTMLTextAreaElement | null>(null);
const showReplyForm = ref(false)
const newReplyContent = ref('')
const isSubmittingReply = ref(false)
const replyError = ref<string | null>(null)
const replyInputRef = ref<HTMLTextAreaElement | null>(null);

// --- Computed Properties ---
const isOwner = computed(() => user.value && user.value.id === props.comment.user_id) // Renamed for clarity
const isCommentEdited = computed(() => props.comment.created_at !== props.comment.updated_at)
const formattedTimestamp = computed(() => { /* ... as before ... */
   try { return formatDistanceToNowStrict(new Date(props.comment.created_at), { addSuffix: true, locale: ar }) }
   catch (e) {  return props.comment.created_at?.toString() }
})
const fullTimestamp = computed(() => { /* ... as before ... */
    try { return new Date(props.comment.created_at).toLocaleString('ar-EG', {dateStyle: 'long', timeStyle: 'short'}); }
    catch { return props.comment.created_at?.toString(); }
})
const sortedReplies = computed(() => { /* ... as before ... */
    return [...localReplies.value].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
})

// --- Watchers ---
watch(() => props.replies, (newReplies) => { /* ... as before ... */
    localReplies.value = [...newReplies];
}, { deep: true, immediate: true });

// --- Methods for Comment Editing ---
const startEditingComment = async () => { /* ... as before ... */
  if (!isOwner.value) return
  isEditingComment.value = true
  editedCommentContent.value = props.comment.content
  editCommentError.value = null
  showReplyForm.value = false // Close reply form when editing comment
  await nextTick();
  editCommentInputRef.value?.focus();
}
const cancelEditComment = () => { /* ... as before ... */
  isEditingComment.value = false
  editedCommentContent.value = ''
  editCommentError.value = null
}
const saveEditComment = async () => { /* ... as before ... */
  if (!isOwner.value || !editedCommentContent.value.trim() || isSavingCommentEdit.value) return
  const contentToSave = editedCommentContent.value.trim();
  if (contentToSave === props.comment.content) { cancelEditComment(); return; }
  isSavingCommentEdit.value = true; editCommentError.value = null
  try {
    const { data, error } = await supabase.from('comments').update({ content: contentToSave, updated_at: new Date().toISOString() }).eq('id', props.comment.id).select('id, content, updated_at').single()
    if (error) throw error; if (!data) throw new Error('لم يتم إرجاع بيانات التعليق المحدث.');
    emit('commentUpdated', { ...props.comment, content: data.content, updated_at: data.updated_at }); isEditingComment.value = false
  } catch (err: any) {  editCommentError.value = `فشل حفظ التعديل: (${(err as PostgrestError).message || 'خطأ غير معروف'})`
  } finally { isSavingCommentEdit.value = false }
}

// --- Method for Comment Deletion ---
const requestDeleteComment = async () => { /* ... as before ... */
   if (!isOwner.value) return
   if (window.confirm('هل أنت متأكد من حذف هذا التعليق وكل ردوده؟')) {
     try { const { error } = await supabase.from('comments').delete().eq('id', props.comment.id); if (error) throw error; emit('commentDeleted', props.comment.id) }
     catch (err: any) {  alert(`فشل حذف التعليق: (${(err as PostgrestError).message || 'خطأ غير معروف'})`) }
   }
}

// --- Methods for Replying ---
const toggleReplyForm = async () => { /* ... as before ... */
    if(!user.value || props.isCommentingSuspended) return; // Prevent opening if suspended
    showReplyForm.value = !showReplyForm.value
    newReplyContent.value = ''
    replyError.value = null
    if (showReplyForm.value) { isEditingComment.value = false; await nextTick(); replyInputRef.value?.focus(); }
}
const cancelReply = () => { /* ... as before ... */
    showReplyForm.value = false; newReplyContent.value = ''; replyError.value = null;
}
// ADD SUSPENSION CHECK to addReply
const addReply = async () => {
  // Add suspension check here as well
  if (props.isCommentingSuspended) {
      replyError.value = "لا يمكنك إضافة رد حاليًا بسبب الإيقاف.";
      return;
  }
  if (!user.value || !userProfile.value || !newReplyContent.value.trim() || isSubmittingReply.value) return
  if (!userProfile.value.id) { replyError.value = 'خطأ: لم يتم العثور على معرف الملف الشخصي.';  return; }

  isSubmittingReply.value = true; replyError.value = null
  const replyData = { /* ... as before ... */
    user_id: user.value.id, profile_id: userProfile.value.id, content: newReplyContent.value.trim(), parent_comment_id: props.comment.id,
    ...(props.contentId.lesson_id && { lesson_id: Number(props.contentId.lesson_id) }),
    ...(props.contentId.book_id && { book_id: Number(props.contentId.book_id) }),
    ...(props.contentId.study_course_id && { study_course_id: Number(props.contentId.study_course_id) }),
  };
   if (!replyData.lesson_id && !replyData.book_id && !replyData.study_course_id) { replyError.value = 'خطأ: يجب ربط الرد بمحتوى.';  isSubmittingReply.value = false; return; }

  try {
    const { data: newReply, error } = await supabase.from('comments').insert(replyData).select(`*, profiles!inner (id, full_name, avatar_url)`).single()
    if (error) throw error; if (!newReply || !newReply.profiles) throw new Error('فشل جلب بيانات الرد الجديد.');
    emit('replyAdded', newReply as CommentWithProfile); newReplyContent.value = ''; showReplyForm.value = false; repliesVisible.value = true
  } catch (err: any) {  replyError.value = `فشل إضافة الرد: (${(err as PostgrestError).message || 'خطأ غير معروف'})`
  } finally { isSubmittingReply.value = false }
}

// --- Methods to Handle Events from ReplyItem ---
const handleReplyUpdate = (updatedReply: CommentWithProfile) => { /* ... as before ... */
  const index = localReplies.value.findIndex(r => r.id === updatedReply.id); if (index !== -1) { localReplies.value.splice(index, 1, updatedReply); }
}
const handleReplyDelete = (deletedReplyId: number) => { /* ... as before ... */
  localReplies.value = localReplies.value.filter(r => r.id !== deletedReplyId)
}
</script>

<style scoped>
/* ... (styles remain the same) ... */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-leave-active { position: absolute; visibility: hidden; }
</style>