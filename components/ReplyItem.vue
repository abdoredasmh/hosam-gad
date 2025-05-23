<template>
  <div class="flex space-x-3 rtl:space-x-reverse py-3 border-t border-gray-200 dark:border-gray-700 first:border-t-0 first:pt-0 last:pb-0">
    <UserAvatar
      :avatar-url="reply.profiles?.avatar_url"
      :name="reply.profiles?.full_name"
      size="sm"
      class="mt-1"
    />
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {{ reply.profiles?.full_name || 'مستخدم' }}
        </span>
        <!-- استخدم CommentActions هنا أيضاً -->
        <CommentActions
          :item="reply"
          item-type="reply"
          @edit="startEditing"
          @delete="requestDelete"
        />
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
        <time :datetime="reply.created_at" :title="fullTimestamp">{{ formattedTimestamp }}</time>
        <span v-if="isEdited" class="mx-1" title="تم تعديل هذا الرد">(تم التعديل)</span>
      </div>

      <!-- وضع العرض -->
      <p v-if="!isEditing" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
        {{ reply.content }}
      </p>

      <!-- وضع التعديل -->
      <div v-else>
        <textarea
          ref="editInputRef"
          v-model="editedContent"
          rows="2"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-70"
          placeholder="تعديل الرد..."
          :disabled="isSavingEdit"
          @keydown.esc="cancelEdit"
          @keydown.enter.prevent.exact="saveEdit"
          aria-label="تعديل الرد"
        ></textarea>
        <div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">
           <span v-if="editError" class="text-xs text-red-500 flex-1 text-right">{{ editError }}</span>
           <button
             @click="cancelEdit"
             type="button"
             :disabled="isSavingEdit"
             class="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"
           >
             إلغاء
           </button>
           <button
             @click="saveEdit"
             type="button"
             :disabled="isSavingEdit || !editedContent.trim()"
             class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
           >
             <svg v-if="isSavingEdit" class="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
             <span>{{ isSavingEdit ? 'جاري الحفظ...' : 'حفظ' }}</span>
           </button>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { Database } from '~/types/database.types' // تأكد من المسار الصحيح
import { formatDistanceToNowStrict } from 'date-fns'
import { ar } from 'date-fns/locale'
import UserAvatar from './UserAvatar.vue'
import CommentActions from './CommentActions.vue' // إعادة استخدام المكون
import type { PostgrestError } from '@supabase/supabase-js';

// Define the type for a comment/reply with profile data
type CommentWithProfile = Database['public']['Tables']['comments']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'avatar_url'> | null
}

// Props definition
const props = defineProps<{
  reply: CommentWithProfile
}>()

// Emits definition
const emit = defineEmits<{
  (e: 'replyUpdated', updatedReply: CommentWithProfile): void
  (e: 'replyDeleted', deletedReplyId: number): void
}>()

// Supabase & User context
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

// Component state
const isEditing = ref(false)
const editedContent = ref('')
const isSavingEdit = ref(false)
const isDeleting = ref(false) // Optional: for delete loading state
const editError = ref<string | null>(null)
const editInputRef = ref<HTMLTextAreaElement | null>(null); // For focusing the edit input

// Computed properties
const isOwner = computed(() => user.value && user.value.id === props.reply.user_id)
const isEdited = computed(() => props.reply.created_at !== props.reply.updated_at)

// Format timestamp (relative)
const formattedTimestamp = computed(() => {
  try {
    return formatDistanceToNowStrict(new Date(props.reply.created_at), { addSuffix: true, locale: ar })
  } catch (e) {
    console.error("Error formatting date:", e)
    return props.reply.created_at?.toString() // Fallback
  }
})

// Format timestamp (full)
const fullTimestamp = computed(() => {
    try {
        return new Date(props.reply.created_at).toLocaleString('ar-EG', {dateStyle: 'long', timeStyle: 'short'});
    } catch {
        return props.reply.created_at?.toString(); // Fallback
    }
})

// --- Methods ---

// Start editing mode
const startEditing = async () => {
  if (!isOwner.value) return
  isEditing.value = true
  editedContent.value = props.reply.content // Initialize with current content
  editError.value = null
  await nextTick() // Wait for the textarea to be rendered
  editInputRef.value?.focus() // Focus the input
}

// Cancel editing mode
const cancelEdit = () => {
  isEditing.value = false
  editedContent.value = '' // Clear potentially edited content
  editError.value = null
}

// Save the edited reply
const saveEdit = async () => {
  if (!isOwner.value || !editedContent.value.trim() || isSavingEdit.value) return

  const contentToSave = editedContent.value.trim();
  // Don't save if content hasn't changed
  if (contentToSave === props.reply.content) {
    cancelEdit();
    return;
  }

  isSavingEdit.value = true
  editError.value = null
  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ content: contentToSave, updated_at: new Date().toISOString() })
      .eq('id', props.reply.id)
      .select('id, content, updated_at') // Select updated fields
      .single()

    if (error) throw error
    if (!data) throw new Error('لم يتم إرجاع بيانات الرد المحدث.');

    // Emit event with the updated reply data
    // Merge existing props with updated fields for reactivity
    emit('replyUpdated', {
        ...props.reply,
        content: data.content,
        updated_at: data.updated_at
     })
    isEditing.value = false // Exit editing mode

  } catch (err: any) {
    console.error('Error updating reply:', err)
    editError.value = `فشل حفظ التعديل: (${(err as PostgrestError).message || 'خطأ غير معروف'})`
  } finally {
    isSavingEdit.value = false
  }
}

// Request to delete the reply
const requestDelete = async () => {
  if (!isOwner.value || isDeleting.value) return

  if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الرد؟')) {
     isDeleting.value = true; // Optional: set deleting state
     try {
       const { error } = await supabase
         .from('comments')
         .delete()
         .eq('id', props.reply.id)

       if (error) throw error

       // Emit event for deletion (parent component handles removal from list)
       emit('replyDeleted', props.reply.id)
       // No need to do anything else here, the parent will remove this component instance

     } catch (err: any) {
       console.error('Error deleting reply:', err)
       alert(`فشل حذف الرد: (${(err as PostgrestError).message || 'خطأ غير معروف'})`)
     } finally {
         isDeleting.value = false; // Optional: unset deleting state
     }
   }
}
</script>