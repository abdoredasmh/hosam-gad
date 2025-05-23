<template>
  <div class="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 flex flex-wrap items-center justify-start gap-3">
    <!-- Change Role Dropdown -->
    <div class="flex items-center gap-2">
        <label :for="`role-select-${userProfile.id}`" class="text-sm font-medium text-gray-700 dark:text-gray-300">تغيير الدور:</label>
        <select
            :id="`role-select-${userProfile.id}`"
            :value="currentRole"
            @change="updateUserRole($event.target.value as 'user' | 'admin')"
            :disabled="isLoading || pendingAction === 'role'"
            class="text-sm rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-70"
            >
            <option value="user">مستخدم</option>
            <option value="admin">مشرف</option>
        </select>
         <LoadingSpinner v-if="pendingAction === 'role'" class="w-4 h-4 inline-block ml-1 animate-spin text-indigo-500"/>
    </div>

    <!-- ====================== -->
    <!-- Ban/Unban Buttons REMOVED -->
    <!-- ====================== -->
    <!--
    <button
        v-if="!userProfile.is_banned"
        @click="confirmAction('ban')"
        :disabled="isLoading || pendingAction === 'ban'"
        class="..."
    >
        ... حظر ...
    </button>
     <button
        v-else
        @click="confirmAction('unban')"
        :disabled="isLoading || pendingAction === 'unban'"
        class="..."
    >
        ... إلغاء الحظر ...
    </button>
    -->

    <!-- Suspend/Unsuspend Button -->
     <button
        v-if="!isCurrentlySuspended"
        @click="emit('suspend-comments')"
        :disabled="isLoading"
        class="px-3 py-1.5 text-sm rounded-md text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 flex items-center gap-1"
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M4.5 6.75a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7Zm0 3.5a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z" clip-rule="evenodd" /></svg>
        <span>إيقاف التعليق</span>
    </button>
     <button
        v-else
        @click="confirmAction('unsuspend')"
        :disabled="isLoading || pendingAction === 'unsuspend'"
        class="px-3 py-1.5 text-sm rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-1"
    >
        <LoadingSpinner v-if="pendingAction === 'unsuspend'" class="w-4 h-4"/>
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.84-10.73a.75.75 0 1 0-1.18-.94l-1.66 2.08-.94-1.18a.75.75 0 1 0-.94 1.18l1.5 1.875a.75.75 0 0 0 1.18 0l2-2.5Z" clip-rule="evenodd" /></svg>
        <span>إلغاء إيقاف التعليق</span>
    </button>

     <!-- Send Message Button -->
      <button
        @click="emit('send-message')"
        :disabled="isLoading"
        class="px-3 py-1.5 text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center gap-1"
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11ZM2 4.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v1.145l-5.426 3.05a1.75 1.75 0 0 1-1.93.066L2 5.96V4.5Zm11.5 8h-11a.5.5 0 0 1-.5-.5v-4.318l3.924 2.207a3.25 3.25 0 0 0 3.552-.122L14 7.764V11.5a.5.5 0 0 1-.5.5Z" /></svg>
        <span>إرسال رسالة</span>
    </button>

     <!-- Confirmation Modal -->
     <LazyAdminConfirmationModal v-model="showConfirm" :config="confirmModalConfig" @confirm="executeConfirmedAction" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
// Lazy load the confirmation modal
const ConfirmationModal = resolveComponent('LazyAdminConfirmationModal');
import { type ConfirmationConfig } from '~/components/admin/ConfirmationModal.vue';
import { useSupabaseClient } from '#imports';

// Define the user profile type expected by the component
type ProfileProp = Tables<'profiles'>;

const props = defineProps({
  userProfile: {
    type: Object as PropType<ProfileProp>,
    required: true,
  },
   isLoading: { // Prop to disable buttons while parent page is loading
        type: Boolean,
        default: false,
    }
   // Removed showBanActions prop as buttons are fully removed
});

const emit = defineEmits<{
  // Removed 'ban' and 'unban' from action types
  (e: 'action-start', actionType: 'role' | 'unsuspend'): void;
  (e: 'action-complete', success: boolean, message: string, updatedProfile?: Partial<Profile>): void;
  (e: 'send-message'): void;
  (e: 'suspend-comments'): void;
}>();

const supabase = useSupabaseClient<Database>();

// Internal state
// Removed 'ban' and 'unban' from possible pending actions
const pendingAction = ref<'role' | 'unsuspend' | null>(null);
const currentRole = ref(props.userProfile.role); // Local state for dropdown

// Confirmation Modal State
const showConfirm = ref(false);
const confirmModalConfig = ref<ConfirmationConfig | null>(null);
// Removed 'ban' and 'unban' from possible actions to confirm
let actionToConfirm: { type: 'unsuspend' } | null = null;


// Computed property to check suspension status
const isCurrentlySuspended = computed(() => {
    if (!props.userProfile.comment_suspended_until) return false;
    try { return new Date(props.userProfile.comment_suspended_until) > new Date(); }
    catch { return false; }
});

// Watch for external changes to the user profile prop
watch(() => props.userProfile, (newProfile) => {
    currentRole.value = newProfile.role; // Update local role if prop changes
}, { deep: true });


// --- Action Functions ---

const updateUserRole = async (newRole: 'user' | 'admin') => {
    if (pendingAction.value || props.userProfile.role === newRole) return;
    pendingAction.value = 'role';
    emit('action-start', 'role');

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq('id', props.userProfile.id);
        if (error) throw error;

        currentRole.value = newRole;
        emit('action-complete', true, `تم تغيير دور المستخدم إلى ${newRole}.`, { role: newRole });

    } catch (err: any) {
        
         currentRole.value = props.userProfile.role;
        emit('action-complete', false, `فشل تغيير دور المستخدم: ${err.message}`);
    } finally {
        pendingAction.value = null;
    }
};

// REMOVED toggleBanStatus function

const removeCommentSuspension = async () => {
     if (pendingAction.value) return;
     pendingAction.value = 'unsuspend';
     emit('action-start', 'unsuspend');

     try {
         const { error } = await supabase
             .from('profiles')
             .update({ comment_suspended_until: null, updated_at: new Date().toISOString() })
             .eq('id', props.userProfile.id);
         if (error) throw error;

          emit('action-complete', true, `تم إلغاء إيقاف التعليقات بنجاح.`, { comment_suspended_until: null });

     } catch (err: any) {
         
         emit('action-complete', false, `فشل إلغاء إيقاف التعليقات: ${err.message}`);
     } finally {
         pendingAction.value = null;
     }
};

// Confirmation Modal Logic (Removed ban/unban cases)
const confirmAction = (type: 'unsuspend') => { // Only unsuspend needs confirmation now
    actionToConfirm = { type };
    let title = '', message = '', confirmText = '', cancelText = 'إلغاء', confirmClass = 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
    const userName = props.userProfile.full_name || props.userProfile.id;

    if (type === 'unsuspend') {
        title = 'تأكيد إلغاء إيقاف التعليق';
        message = `هل أنت متأكد من السماح لـ ${userName} بالتعليق؟`;
        confirmText = 'نعم، إلغاء الإيقاف';
    }
    // Removed 'ban' and 'unban' cases

    confirmModalConfig.value = { title, message, confirmText, cancelText, confirmClass };
    showConfirm.value = true;
};

const executeConfirmedAction = () => {
    if (!actionToConfirm) return;
    const { type } = actionToConfirm;
    if (type === 'unsuspend') { removeCommentSuspension(); }
    // Removed 'ban' and 'unban' execution
    showConfirm.value = false;
    actionToConfirm = null;
};

</script>

<style scoped>
/* Add styles if needed */
</style>