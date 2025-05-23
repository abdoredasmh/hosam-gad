<template>
  <div v-if="pending" class="flex justify-center items-center min-h-[60vh]">
    <LoadingSpinner class="w-10 h-10 text-indigo-600" />
  </div>

  <div v-else-if="fetchError || !userData" class="container mx-auto px-4 py-8 text-center">
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">خطأ!</strong>
      <span class="block sm:inline">
        {{ fetchError ? `فشل تحميل بيانات المستخدم: ${fetchError.message}` : 'لم يتم العثور على المستخدم المطلوب.' }}
      </span>
    </div>
    <NuxtLink to="/admin/users" class="mt-6 inline-block text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
      ← العودة إلى قائمة المستخدمين
    </NuxtLink>
  </div>

  <div v-else class="container mx-auto px-4 lg:px-8 py-8 space-y-8">
    <!-- Header: User Info & Back Button -->
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b dark:border-gray-700">
      <div class="flex items-center gap-4">
        <UserAvatar :src="userData.profile.avatar_url || undefined" :alt="userData.profile.full_name || 'مستخدم'" size="lg" />
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">{{ userData.profile.full_name || 'لم يحدد اسم' }}</h1>
          <!-- Removed email display -->
          <div class="mt-1 flex flex-wrap gap-2 text-xs">
             <span :class="['px-2 py-0.5 rounded-full', getRoleClass(userData.profile.role)]">
               {{ userData.profile.role === 'admin' ? 'مشرف' : 'مستخدم' }}
             </span>
              <span v-if="isCommentSuspended(userData.profile.comment_suspended_until)" class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">تعليق موقوف</span>
              <span v-else class="px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">نشط</span>
          </div>
        </div>
      </div>
      <NuxtLink to="/admin/users" class="flex-shrink-0 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 mt-2 sm:mt-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25H13.25A.75.75 0 0 1 14 8Z" clip-rule="evenodd" /></svg>
        العودة للقائمة
      </NuxtLink>
    </div>

    <!-- Action Buttons / Status Area -->
     <div v-if="isLoadingAction === true" class="fixed inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-50">
         <LoadingSpinner class="w-8 h-8 text-indigo-600" />
         <span class="ml-2 text-gray-700 dark:text-gray-300">جاري تنفيذ الإجراء...</span>
     </div>


    <AdminUserActions
        v-if="userData?.profile"
        :user-profile="userData.profile"
        :is-loading="isLoadingAction === true"
        :show-ban-actions="false"
        @action-start="handleActionStart"
        @action-complete="handleActionComplete"
        @send-message="openSendMessageModal(userData.profile)"
        @suspend-comments="openSuspendModal(userData.profile)"
    />

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Left Column: User Details & Enrolled Courses -->
      <div class="lg:col-span-1 space-y-6">
         <BaseCard>
             <template #title>معلومات إضافية</template>
             <template #content>
                 <dl class="space-y-3 text-sm">
                   <div class="flex justify-between">
                     <dt class="font-medium text-gray-500 dark:text-gray-400">تاريخ الانضمام:</dt>
                     <dd class="text-gray-700 dark:text-gray-200">{{ formatDate(userData.profile.created_at) }}</dd>
                   </div>
                   <div class="flex justify-between">
                     <dt class="font-medium text-gray-500 dark:text-gray-400">آخر تحديث للبروفايل:</dt>
                     <dd class="text-gray-700 dark:text-gray-200">{{ formatDate(userData.profile.updated_at) }}</dd>
                   </div>
                    <div class="flex justify-between">
                     <dt class="font-medium text-gray-500 dark:text-gray-400">آخر تسجيل دخول:</dt>
                     <dd class="text-gray-700 dark:text-gray-200 italic">غير متاح</dd>
                   </div>
                    <div class="flex justify-between">
                     <dt class="font-medium text-gray-500 dark:text-gray-400">النقاط:</dt>
                     <dd class="text-gray-700 dark:text-gray-200 font-semibold">{{ userData.profile.points ?? 0 }}</dd>
                   </div>
                   <div v-if="isCommentSuspended(userData.profile.comment_suspended_until)">
                       <dt class="font-medium text-gray-500 dark:text-gray-400">انتهاء إيقاف التعليق:</dt>
                       <dd class="text-yellow-600 dark:text-yellow-400">{{ formatDate(userData.profile.comment_suspended_until) }}</dd>
                   </div>
                   <div class="pt-2">
                     <dt class="font-medium text-gray-500 dark:text-gray-400 mb-1">النبذة الشخصية:</dt>
                     <dd class="text-gray-700 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-2 rounded border dark:border-gray-600 min-h-[50px]">{{ userData.profile.bio || 'لم يكتب نبذة.' }}</dd>
                   </div>
                 </dl>
             </template>
         </BaseCard>

         <BaseCard v-if="!isLoadingCourses">
           <template #title>الدورات المسجل بها ({{ userEnrolledCourses.length }})</template>
           <template #content>
               <div v-if="userEnrolledCourses.length > 0" class="space-y-2 max-h-60 overflow-y-auto text-sm pr-1 custom-scrollbar">
                  <li v-for="enrollment in userEnrolledCourses" :key="enrollment.course_id" class="flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded">
                      <NuxtLink :to="`/study/courses/${enrollment.course_id}`" target="_blank" class="hover:underline text-gray-700 dark:text-gray-200 flex-grow truncate mr-2" :title="enrollment.study_courses?.title || ''">
                          {{ enrollment.study_courses?.title || 'دورة غير معروفة' }}
                      </NuxtLink>
                      <span class="text-xs text-gray-400 flex-shrink-0">{{ formatDateShort(enrollment.enrolled_at) }}</span>
                  </li>
              </div>
              <div v-else class="text-sm text-center text-gray-400 dark:text-gray-500 italic py-4">
                  المستخدم غير مسجل في أي دورات.
              </div>
           </template>
       </BaseCard>
      </div>

      <!-- Right Column: Messages (FILTERED: Admin <-> User Only) -->
      <div class="lg:col-span-2 space-y-6">
         <BaseCard>
             <template #title>
                 <div class="flex justify-between items-center">
                     <span>المراسلات الإدارية مع المستخدم</span>
                      <button @click="openSendMessageModal(userData.profile)" :disabled="isLoadingAction === 'send'" class="text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 px-3 py-1 rounded-md flex items-center gap-1 disabled:opacity-50">
                         <LoadingSpinner v-if="isLoadingAction === 'send'" class="w-4 h-4"/>
                         <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11ZM2 4.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v1.145l-5.426 3.05a1.75 1.75 0 0 1-1.93.066L2 5.96V4.5Zm11.5 8h-11a.5.5 0 0 1-.5-.5v-4.318l3.924 2.207a3.25 3.25 0 0 0 3.552-.122L14 7.764V11.5a.5.5 0 0 1-.5.5Z" /></svg>
                         <span>رسالة جديدة</span>
                      </button>
                 </div>
             </template>
             <template #content>
                <div v-if="isLoadingMessages" class="text-center py-10"><LoadingSpinner /></div>
                <div v-else-if="filteredAdminMessages.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">لا توجد رسائل إدارية متبادلة.</div>
                <div v-else class="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                   <div v-for="message in filteredAdminMessages" :key="message.id" class="border-b dark:border-gray-700 pb-4 last:border-b-0">

                      <div class="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/80 shadow-sm">
                          <div class="flex justify-between items-start mb-1.5">
                            <h4 class="font-semibold text-gray-800 dark:text-gray-100">{{ message.title }}</h4>
                            <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {{ formatDate(message.created_at) }}
                            </span>
                          </div>
                          <p class="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{{ message.content }}</p>
                           <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                               <span class="font-medium">المصدر:</span> {{ getMessageSourceText(message.source) }}
                           </p>
                      </div>


                      <div v-if="message.user_reply_text" class="mt-3 mr-4 rtl:mr-0 rtl:ml-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 shadow-sm">
                          <div class="flex justify-between items-start mb-1.5">
                             <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-200">رد المستخدم:</p>
                              <span class="text-xs text-yellow-700 dark:text-yellow-300 whitespace-nowrap">
                                {{ formatDate(message.user_replied_at) }}
                              </span>
                          </div>
                          <p class="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{{ message.user_reply_text }}</p>
                           <div class="mt-2 text-right">
                               <button v-if="!message.admin_read_reply"
                                      @click="markReplyAsReadByAdmin(message.id)"
                                      :disabled="isLoadingAction === `read-${message.id}`"
                                      class="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 flex items-center justify-end gap-1 ml-auto">
                                  <LoadingSpinner v-if="isLoadingAction === `read-${message.id}`" class="w-3 h-3"/>
                                  <span>{{ isLoadingAction === `read-${message.id}` ? 'جارٍ...' : 'تمييز كمقروء' }}</span>
                               </button>
                                <span v-else class="text-xs text-green-600 dark:text-green-400 font-medium">(تمت القراءة)</span>
                           </div>
                      </div>
                       <div v-else class="mt-3 mr-4 rtl:mr-0 rtl:ml-4 text-xs text-gray-400 italic">
                           لم يرد المستخدم على هذه الرسالة بعد.
                       </div>
                   </div>
                </div>
             </template>
         </BaseCard>
      </div>

    </div>

     <!-- Modals -->
    <LazyAdminSendMessageModal v-model="showSendMessageModal" :user="modalUser" @sent="handleMessageSent" />
    <LazyAdminSuspendCommentModal v-model="showSuspendModal" :user="modalUser" @suspended="handleUserSuspended" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Database, Tables, Enums } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import UserAvatar from '~/components/UserAvatar.vue';
import BaseCard from '~/components/BaseCard.vue';
const AdminSendMessageModal = resolveComponent('LazyAdminSendMessageModal');
const AdminSuspendCommentModal = resolveComponent('LazyAdminSuspendCommentModal');
import AdminUserActions from '~/components/admin/AdminUserActions.vue';
import { useSupabaseClient, definePageMeta, useNuxtApp, useRoute, navigateTo } from '#imports';
import type { PostgrestError } from '@supabase/supabase-js'; // Removed User type

// --- Define Types ---
type Profile = Tables<'profiles'>;
// Reduced AuthUser type - Email removed as it's not fetched reliably
type AuthUser = {
    id: string;
    email?: string | undefined; // Kept optional for flexibility if profile has it
    created_at?: string | undefined;
    last_sign_in_at?: string | undefined; // Will be undefined
};
type PrivateMessage = Tables<'user_private_messages'>;
type CourseEnrollment = Tables<'course_enrollments'> & {
    study_courses: Pick<Tables<'study_courses'>, 'title'> | null;
};
type UserDetailData = { profile: Profile; auth: AuthUser; } | null;
type NotificationInsert = Tables<'notifications'>;

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const { $toast } = useNuxtApp();
const route = useRoute();
const userId = computed(() => route.params.id as string);

// --- State ---
const pending = ref(true);
const fetchError = ref<PostgrestError | { message: string } | null>(null);
const userData = ref<UserDetailData>(null);
const userMessages = ref<PrivateMessage[]>([]); // Raw messages from fetch
const isLoadingMessages = ref(false);
const userEnrolledCourses = ref<CourseEnrollment[]>([]);
const isLoadingCourses = ref(false);
const isLoadingAction = ref<boolean | string>(false);

// Modal State
const showSendMessageModal = ref(false);
const showSuspendModal = ref(false);
const modalUser = computed(() => userData.value?.profile ?? null);

// --- Computed Property for Filtered Messages ---
const filteredAdminMessages = computed(() => {
  // Filter messages to show only those WITHOUT related_question_id
  return userMessages.value.filter(msg => msg.related_question_id === null);
});


// --- Fetch Data (Removed auth.admin call) ---
const fetchData = async () => {
  pending.value = true; fetchError.value = null; userData.value = null;
  userMessages.value = []; userEnrolledCourses.value = [];
  isLoadingMessages.value = true; isLoadingCourses.value = true;

  if (!userId.value) {
    fetchError.value = { message: "معرف المستخدم غير موجود." }; pending.value = false; return;
  }

  try {
    // Fetch profile, messages, and courses concurrently
    const [profileResult, messagesResult, coursesResult] = await Promise.all([
      supabase.from('profiles')
        // Select all fields from profiles EXCEPT email if it doesn't exist
        // Adjust the select string based on your actual 'profiles' table columns
        .select(`id, full_name, avatar_url, role, points, bio, is_banned, comment_suspended_until, created_at, updated_at`)
        .eq('id', userId.value)
        .single(),
      supabase.from('user_private_messages').select('*').eq('user_id', userId.value).order('created_at', { ascending: false }),
      supabase.from('course_enrollments').select(`course_id, enrolled_at, study_courses (title)`).eq('user_id', userId.value).order('enrolled_at', { ascending: false })
    ]);

    // Process Profile
    if (profileResult.error) throw profileResult.error;
    if (!profileResult.data) throw new Error('لم يتم العثور على ملف المستخدم.');
    // Cast to Profile, acknowledging email might not be present
    const profileData = profileResult.data as Profile;

    // Construct AuthUser object (email will likely be undefined here)
    const authData: AuthUser = {
        id: profileData.id,
        email: profileData.email || undefined, // Will be undefined if 'email' not in profiles
        created_at: profileData.created_at || undefined,
        last_sign_in_at: undefined // Cannot get this safely client-side
    };
    userData.value = { profile: profileData, auth: authData };

    // Process Messages (Store ALL fetched messages)
    if (messagesResult.error) 
    userMessages.value = messagesResult.data ?? [];
    isLoadingMessages.value = false;

    // Process Courses
    if (coursesResult.error) 
    userEnrolledCourses.value = coursesResult.data ?? [];
    isLoadingCourses.value = false;

  } catch (err: any) {
    
    fetchError.value = (err as PostgrestError) ?? { message: err.message || 'خطأ غير معروف.' };
    userData.value = null;
    isLoadingMessages.value = false;
    isLoadingCourses.value = false;
  } finally {
    pending.value = false;
  }
};


// --- Action Handlers ---
const handleActionStart = (actionType: string) => {
    isLoadingAction.value = (actionType !== 'read');
    
};

const handleActionComplete = (success: boolean, message: string, updatedProfile?: Partial<Profile>) => {
    isLoadingAction.value = false;
    if (success && userData.value && updatedProfile) {
        Object.assign(userData.value.profile, updatedProfile);
        showToast(message, 'success');
    } else if (!success) {
        showToast(message, 'error');
    }
};

const markReplyAsReadByAdmin = async (messageId: number) => {
    if (typeof isLoadingAction.value === 'string') return;
    isLoadingAction.value = `read-${messageId}`;
    try {
        const { error } = await supabase.from('user_private_messages').update({ admin_read_reply: true }).eq('id', messageId);
        if (error) throw error;
        const msgIndex = userMessages.value?.findIndex(m => m.id === messageId);
        if (msgIndex !== undefined && msgIndex !== -1 && userMessages.value) {
             userMessages.value[msgIndex].admin_read_reply = true;
        }
        showToast('تم تمييز الرد كمقروء.', 'success');
    } catch (err: any) {
        
        showToast('فشل تمييز الرد كمقروء.', 'error');
    } finally {
        if (isLoadingAction.value === `read-${messageId}`) {
            isLoadingAction.value = false;
        }
    }
};

const openSendMessageModal = (userProfile: Profile | null) => { if (!userProfile) return; showSendMessageModal.value = true; };
const openSuspendModal = (userProfile: Profile | null) => { if (!userProfile) return; showSuspendModal.value = true; };

// --- Send Notification Function ---
async function sendNotificationToUser(targetUserId: string, title: string, link: string) {
    // Basic validation
    if (!targetUserId || !title || !link) {
        
        showToast('فشل إرسال الإشعار: بيانات الإشعار غير مكتملة.', 'error');
        return;
    }

    const notificationData: Omit<NotificationInsert, 'id' | 'created_at'> = {
        user_id: targetUserId,
        message: `رسالة جديدة من الإدارة: ${title}`,
        link: link,
        is_read: false,
    };
    

    try {
        const { error } = await supabase.from('notifications').insert(notificationData);
         // Log error regardless

        if (error) {
            
            showToast(`فشل إرسال الإشعار للمستخدم: ${error.message}`, 'error'); // Use error toast
        } else {
             
        }
    } catch(err: any) {
         
         showToast(`حدث خطأ غير متوقع أثناء إرسال الإشعار: ${err.message || 'خطأ غير معروف'}`, 'error');
    }
}

// --- Handle Message Sent (Sends notification) ---
const handleMessageSent = (success: boolean, sentMessage?: PrivateMessage, errorMsg?: string) => {
    showSendMessageModal.value = false;
    if (success && sentMessage?.id && sentMessage?.user_id && sentMessage?.title) {
        showToast('تم إرسال الرسالة الخاصة بنجاح.', 'success');
        const notificationLink = `/profile?messageId=${sentMessage.id}`;
        // Call notification function asynchronously (don't necessarily wait for it)
        sendNotificationToUser(sentMessage.user_id, sentMessage.title, notificationLink);
        fetchMessages(); // Refresh messages list to show the new message
    } else if (!success) {
        showToast(`فشل إرسال الرسالة الخاصة: ${errorMsg || 'خطأ غير معروف'}`, 'error');
    } else {
        
        showToast('تم إرسال الرسالة، لكن لا يمكن إرسال الإشعار (بيانات ناقصة).', 'warning');
    }
};


const fetchMessages = async () => {
    if (!userId.value) return; isLoadingMessages.value = true;
    try {
        const { data, error } = await supabase.from('user_private_messages')
            .select('*')
            .eq('user_id', userId.value)
            .order('created_at', { ascending: false });
        if (error) throw error;
        userMessages.value = data ?? [];
    } catch (err: any) {
        
        showToast("فشل تحديث قائمة الرسائل.", "error");
    } finally { isLoadingMessages.value = false; }
};

const handleUserSuspended = (userIdParam: string, suspended: boolean, suspended_until: string | null) => {
    if (userData.value?.profile.id === userIdParam) {
        userData.value.profile.comment_suspended_until = suspended_until;
        const userName = userData.value.profile.full_name || 'المستخدم'; // Fallback name
        if (suspended) { showToast(`تم إيقاف تعليقات المستخدم ${userName} حتى ${formatDate(suspended_until)}.`, 'success'); }
        else { showToast(`تم إلغاء إيقاف تعليقات المستخدم ${userName}.`, 'success'); }
    }
    showSuspendModal.value = false;
};

// --- Helper Functions ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '--';
  try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'تاريخ غير صالح'; return date.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short', hour12: true }); }
  catch (e) { return 'خطأ تنسيق'; }
};
const formatDateShort = (dateString: string | null | undefined): string => {
  if (!dateString) return '--';
  try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'تاريخ غير صالح'; return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric'}); }
  catch (e) { return 'خطأ تنسيق'; }
};

const isCommentSuspended = (suspendedUntil: string | null | undefined): boolean => {
    if (!suspendedUntil) return false;
    try { return new Date(suspendedUntil) > new Date(); } catch { return false; }
};

const getRoleClass = (role: string | null | undefined): string => {
    if (role === 'admin') return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
}

const getMessageSourceText = (source: string | null | undefined): string => {
    // Removed 'ask_sheikh_reply' as it's filtered out
    if (source === 'admin_direct_message') return 'رسالة مباشرة من الإدارة';
    return source || 'رسالة إدارية'; // Adjusted default
};

const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if ($toast && typeof $toast[type] === 'function') { $toast[type](message); }
    else {  if (type === 'error' || type === 'warning') { alert(`[${type.toUpperCase()}] ${message}`); } }
};

// --- Watchers ---
watch(userId, (newId) => { if (newId) fetchData(); }, { immediate: true });

// --- Lifecycle Hooks ---
onMounted(() => {
    // Initial fetch handled by watcher
});

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 3px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.8); }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.whitespace-pre-wrap { white-space: pre-wrap; word-wrap: break-word; }
.min-h-\[50px\] { min-height: 50px; }
</style>