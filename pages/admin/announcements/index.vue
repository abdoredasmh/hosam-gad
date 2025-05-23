<template>
  <!-- Responsive Padding -->
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Page Header (Responsive) -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-cream-gray dark:border-gray-700 pb-3 gap-3 flex-wrap">
      <h1 class="text-2xl font-bold text-brown-dark dark:text-beige-light">
        إدارة المواعيد والإعلانات
      </h1>
      <div class="flex-shrink-0 relative">
        <button
          @click="openAddModal"
          :disabled="isAddDisabled"
          :title="addButtontitle"
          class="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          إضافة جديد
        </button>
        <!-- Optional: Display a message when disabled -->
        <p v-if="isAddDisabled" class="text-xs text-red-600 dark:text-red-400 mt-1 absolute -bottom-4 right-0 whitespace-nowrap">
          تم الوصول للحد الأقصى ({{ MAX_ANNOUNCEMENTS }}).
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingList" class="text-center py-10">
      <p class="text-gray-500 dark:text-gray-400 mb-3">جاري تحميل الإعلانات...</p>
      <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"><span class="sr-only">Loading...</span></div>
    </div>

    <!-- Error State Display -->
    <div v-else-if="listError && !isLoadingList" class="text-center py-10 p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-md">
      <p>حدث خطأ أثناء تحميل القائمة.</p>
      <p class="text-xs mt-1">({{ listError }})</p>
      <button @click="fetchAnnouncements" class="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700">إعادة المحاولة</button>
    </div>

    <!-- Announcements Table Container (Responsive) -->
    <div v-else-if="announcements.length > 0" class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-cream-gray dark:border-gray-700">
      <table class="min-w-full divide-y divide-cream-gray dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <!-- Responsive Table Headers (Adjusted min-w, hide 'Type' on small screens) -->
            <th scope="col" class="table-th min-w-[180px] sm:min-w-[200px]">العنوان</th>
            <th scope="col" class="table-th min-w-[100px] hidden sm:table-cell">النوع</th> <!-- Hidden on xs -->
            <th scope="col" class="table-th min-w-[160px] sm:min-w-[180px]">التاريخ</th>
            <th scope="col" class="table-th text-center min-w-[70px]">منشور؟</th>
            <th scope="col" class="table-th text-left min-w-[110px]">إجراءات</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-cream-gray dark:divide-gray-700">
          <tr v-for="announcement in announcements" :key="announcement.id" class="table-tr">
            <td class="table-td font-medium text-brown-dark dark:text-beige-light">{{ announcement.title }}</td>
            <td class="table-td hidden sm:table-cell"> <!-- Hidden on xs -->
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap', announcement.type === 'lecture' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200' : announcement.type === 'live' ? 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200 animate-pulse' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200']">{{ getTypeText(announcement.type) }}</span>
            </td>
            <td class="table-td text-gray-700 dark:text-gray-300">{{ formatDate(announcement.date) || 'غير محدد' }}</td>
            <td class="table-td text-center">
              <button @click="togglePublish(announcement)" :disabled="isTogglingPublish === announcement.id" :class="['p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-150 relative', announcement.is_published ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800/60' : 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800/60']">
                 <div v-if="isTogglingPublish === announcement.id" class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-full"><div class="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent text-primary" role="status"></div></div>
                 <svg v-if="announcement.is_published" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="{'opacity-0': isTogglingPublish === announcement.id}" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                 <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :class="{'opacity-0': isTogglingPublish === announcement.id}" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
                 <span class="sr-only">{{ announcement.is_published ? 'إلغاء النشر' : 'نشر' }}</span>
              </button>
            </td>
            <td class="table-td text-left whitespace-nowrap"> <!-- Keep actions from wrapping -->
              <button @click="triggerDeleteConfirmation(announcement)" :disabled="isDeleting === announcement.id" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 relative px-1 py-1">
                <svg v-if="isDeleting === announcement.id" class="animate-spin h-4 w-4 text-red-500 absolute inset-0 m-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span :class="{'opacity-0': isDeleting === announcement.id}">حذف</span>
              </button>
              <button @click="openEditModal(announcement)" :disabled="isDeleting === announcement.id" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 px-1 py-1">تعديل</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- No Announcements Message -->
    <div v-else class="text-center py-10">
      <p class="text-gray-500 dark:text-gray-400">لا توجد إعلانات أو مواعيد حاليًا.</p>
    </div>

    <!-- Add/Edit Announcement Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="add-edit-modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div @click="closeModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-80" aria-hidden="true"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start w-full">
              <div class="mt-3 text-center sm:mt-0 sm:text-right w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-5 border-b dark:border-gray-700 pb-3" id="add-edit-modal-title">{{ editingAnnouncement ? 'تعديل' : 'إضافة جديد' }}</h3>
                <form @submit.prevent="handleSubmit">
                  <div class="space-y-5">
                    <div><label for="modal-title-input" class="form-label">العنوان <span class="text-red-500">*</span></label><input v-model="formData.title" type="text" id="modal-title-input" required class="form-input" :disabled="isSaving" /></div>
                    <div><label for="modal-details" class="form-label">التفاصيل</label><textarea v-model="formData.details" id="modal-details" rows="4" class="form-textarea" :disabled="isSaving"></textarea></div>
                    <div><label for="modal-type" class="form-label">النوع <span class="text-red-500">*</span></label><select v-model="formData.type" id="modal-type" required class="form-select" :disabled="isSaving"><option value="lecture">محاضرة / درس</option><option value="announcement">إعلان عام</option><option value="live">بث مباشر</option></select></div>
                    <div><label for="modal-date" class="form-label">التاريخ والوقت</label><input v-model="formData.date" type="datetime-local" id="modal-date" class="form-input" :disabled="isSaving" /><p class="form-help-text">مهم للمحاضرات والبث المباشر لتحديد وقت البدء.</p></div>
                    <div><label for="modal-link" class="form-label">الرابط</label><input v-model="formData.link" type="url" id="modal-link" class="form-input" placeholder="https://..." :disabled="isSaving"/><p class="form-help-text">رابط البث أو تفاصيل الإعلان (اختياري).</p></div>
                    <div class="flex items-center"><input v-model="formData.is_published" id="modal-is_published" type="checkbox" class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-600 dark:border-gray-500" :disabled="isSaving"/><label for="modal-is_published" class="ms-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer">نشر</label></div>
                    <div v-if="formData.is_published" class="flex items-center mt-4 pt-4 border-t dark:border-gray-600"><input v-model="formData.sendNotification" id="modal-send_notification" type="checkbox" class="h-4 w-4 text-accent border-gray-300 rounded focus:ring-accent dark:bg-gray-600 dark:border-gray-500" :disabled="isSaving" /><label for="modal-send_notification" class="ms-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer">إرسال إشعار</label></div>
                  </div>
                  <div v-if="errorMessage" class="mt-4 p-3 form-error-message">خطأ: {{ errorMessage }}</div>
                </form>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-col sm:flex-row-reverse gap-3 border-t dark:border-gray-600"> <!-- Responsive buttons -->
            <button @click="handleSubmit" :disabled="isSaving || !isFormValid" type="button" class="modal-button-primary"> <!-- Disable if form invalid -->
               <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              {{ isSaving ? 'جاري الحفظ...' : (editingAnnouncement ? 'حفظ التعديلات' : 'إضافة') }}
            </button>
            <button @click="closeModal" type="button" class="modal-button-secondary mt-3 sm:mt-0" :disabled="isSaving">إلغاء</button> <!-- Margin adjustment for small screens -->
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal Instance (for Delete Confirmation) -->
    <LazyAdminConfirmationModal
      v-if="showConfirmationModal"
      v-model="showConfirmationModal"
      :config="confirmationConfigObject"
      @confirm="handleDeleteConfirmation"
      @close="showConfirmationModal = false"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSupabaseClient, useNuxtApp } from '#imports';
import type { Database, Tables, Enums } from '~/types/database.types';
import type { PostgrestError } from '@supabase/supabase-js';
import type { ConfirmationConfig } from '~/components/admin/ConfirmationModal.vue'; // Verify this path

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });

// --- Types & Interfaces ---
type AnnouncementType = Enums<'announcement_type'>;
type Announcement = Omit<Tables<'announcements'>, 'type'> & { type: AnnouncementType };
type NotificationInsert = Omit<Tables<'notifications'>, 'id' | 'created_at'>;

// --- Constants ---
const MAX_ANNOUNCEMENTS = 9; // Define the maximum limit

// --- Supabase Client & Nuxt App ---
const client = useSupabaseClient<Database>();
const { $toast } = useNuxtApp();

// --- Component State ---
const announcements = ref<Announcement[]>([]);
const isLoadingList = ref(false);
const listError = ref<string | null>(null);
const isModalOpen = ref(false);
const editingAnnouncement = ref<Announcement | null>(null);
const isSaving = ref(false);
const isDeleting = ref<number | null>(null);
const isTogglingPublish = ref<number | null>(null);
const errorMessage = ref<string | null>(null);

// --- Confirmation Modal State ---
const showConfirmationModal = ref(false);
const confirmationConfigObject = ref<ConfirmationConfig | null>(null);
const itemToDelete = ref<Announcement | null>(null);

// --- Form Data State ---
const initialFormData = {
  title: '', details: '', type: 'announcement' as AnnouncementType, date: '', link: '', is_published: false, sendNotification: false,
};
const formData = ref({ ...initialFormData });

// --- Computed Property for Form Validation ---
const isFormValid = computed(() => {
  return formData.value.title.trim() !== '';
});

// --- Computed Property for Add Button Disabling ---
const isAddDisabled = computed(() => {
  // Disable if loading OR if the limit is reached
  return isLoadingList.value || announcements.value.length >= MAX_ANNOUNCEMENTS;
});

// --- Computed Property for Add Button Title (Tooltip) ---
const addButtontitle = computed(() => {
    if (announcements.value.length >= MAX_ANNOUNCEMENTS) {
        return `لا يمكن الإضافة، تم الوصول إلى الحد الأقصى (${MAX_ANNOUNCEMENTS} إعلانات).`;
    }
    return 'إضافة إعلان أو موعد جديد';
});


// --- Helper Functions ---
function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;
  try { const date = new Date(dateString); return date.toLocaleTimeString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }); } catch (e) {  return 'تاريخ غير صالح'; }
}
function formatISOForInput(isoString: string | null): string {
   if (!isoString) return '';
   try { const date = new Date(isoString); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); } catch { return ''; }
}
function getTypeText(type: AnnouncementType): string {
    switch (type) { case 'lecture': return 'محاضرة/درس'; case 'announcement': return 'إعلان عام'; case 'live': return 'بث مباشر'; default: return String(type); }
}

// --- Toast Helper ---
function showToast(type: 'success' | 'error' | 'warning' | 'info', message: string) {
    if ($toast && typeof $toast[type] === 'function') { $toast[type](message); }
    else { console[type === 'error' ? 'error' : 'log'](`[Toast Fallback] ${type}: ${message}`); }
}

// --- Data Fetching ---
async function fetchAnnouncements() {
  isLoadingList.value = true;
  listError.value = null;
  try {
    // Fetch data
    const { data, error } = await client.from('announcements').select('*').order('date', { ascending: false, nullsFirst: false });
    if (error) throw error;
    announcements.value = (data || []) as Announcement[];
    // Check count after fetching
    if (announcements.value.length > MAX_ANNOUNCEMENTS) {
      
      // Optionally show a persistent warning message to the user
      // showToast('warning', `تجاوز عدد الإعلانات الحد الأقصى (${MAX_ANNOUNCEMENTS}).`);
    }
  } catch (error: any) {
    
    listError.value = error.message || 'فشل تحميل قائمة الإعلانات.';
    showToast('error', `خطأ في تحميل الإعلانات: ${listError.value}`);
    announcements.value = [];
  } finally { isLoadingList.value = false; }
}

// --- Lifecycle Hook ---
onMounted(() => {
  
  fetchAnnouncements(); // Fetch data on mount, which also checks the limit
});

// --- Modal Management ---
function openAddModal() {
  // Double check the limit before opening the modal, though the button should be disabled
  if (isAddDisabled.value) {
    showToast('warning', `لا يمكن الإضافة، تم الوصول إلى الحد الأقصى (${MAX_ANNOUNCEMENTS} إعلانات).`);
    return;
  }
  editingAnnouncement.value = null;
  formData.value = { ...initialFormData };
  errorMessage.value = null;
  isModalOpen.value = true;
}
function openEditModal(announcement: Announcement) {
  // Editing is always allowed regardless of the count
  editingAnnouncement.value = announcement;
  formData.value = {
    title: announcement.title, details: announcement.details ?? '', type: announcement.type, date: formatISOForInput(announcement.date),
    link: announcement.link ?? '', is_published: announcement.is_published, sendNotification: false,
  };
  errorMessage.value = null;
  isModalOpen.value = true;
}
function closeModal() {
  isModalOpen.value = false;
  editingAnnouncement.value = null;
  errorMessage.value = null;
}

// --- Send Notification Function ---
async function notifyAllUsersAboutAnnouncement(announcementId: number, title: string, type: AnnouncementType) {
    
    const notificationLink = '/';
    const messagePrefix = editingAnnouncement.value ? 'تحديث إعلان' : 'إعلان جديد';
    let notificationMessage = `${messagePrefix}: ${title}`;
    if (type === 'live') notificationMessage = `بث مباشر قادم: ${title}`;
    else if (type === 'lecture') notificationMessage = `محاضرة جديدة: ${title}`;
    try {
        const { data: users, error: userError } = await client.from('profiles').select('id');
        if (userError) throw new Error(`فشل جلب المستخدمين: ${userError.message}`);
        if (!users || users.length === 0) { showToast('warning', 'لم يتم العثور على مستخدمين لإرسال الإشعارات لهم.'); return; }
        const notificationObjects: NotificationInsert[] = users.map(user => ({ user_id: user.id, message: notificationMessage, link: notificationLink, is_read: false }));
        
        const { error: notificationError } = await client.from('notifications').insert(notificationObjects);
        if (notificationError) {
            if (notificationError.message.includes('violates row-level security policy')) throw new Error('فشل إرسال الإشعارات بسبب قيود الأمان.');
            else throw new Error(`فشل حفظ الإشعارات: ${notificationError.message}`);
        }
        showToast('success', `تم إرسال الإشعار بنجاح إلى ${users.length} مستخدم.`);
    } catch (error: any) {  showToast('error', `خطأ في الإشعارات الجماعية: ${error.message || 'خطأ غير معروف'}`); }
}

// --- Form Handling (with validation) ---
const handleSubmit = async () => {
  errorMessage.value = null;
  if (!isFormValid.value) {
    errorMessage.value = 'الرجاء ملء حقل العنوان.';
    return;
  }

  // Add check here specifically for ADDING a new item
  if (!editingAnnouncement.value && announcements.value.length >= MAX_ANNOUNCEMENTS) {
      errorMessage.value = `لا يمكن الإضافة، تم الوصول إلى الحد الأقصى (${MAX_ANNOUNCEMENTS} إعلانات).`;
      showToast('error', errorMessage.value);
      isSaving.value = false; // Ensure saving state is reset
      return; // Prevent submission
  }

  isSaving.value = true;
  try {
    const dataToSubmit = {
      title: formData.value.title.trim(), details: formData.value.details?.trim() || null, type: formData.value.type,
      date: formData.value.date ? new Date(formData.value.date).toISOString() : null, link: formData.value.link?.trim() || null, is_published: formData.value.is_published,
    };
    let savedAnnouncementId: number | null = null;
    let operationError: PostgrestError | null = null;
    const wasPublished = formData.value.is_published;
    const shouldNotify = formData.value.sendNotification;

    if (editingAnnouncement.value) {
      // Editing doesn't need the count check
      const { error } = await client.from('announcements').update(dataToSubmit).eq('id', editingAnnouncement.value.id);
      operationError = error; if (!error) savedAnnouncementId = editingAnnouncement.value.id;
    } else {
       // Adding needs the check (already performed above, but double-checking is safe)
       if (announcements.value.length >= MAX_ANNOUNCEMENTS) {
           throw new Error(`Attempted to add beyond the limit of ${MAX_ANNOUNCEMENTS}.`);
       }
      const { data: insertedData, error } = await client.from('announcements').insert(dataToSubmit).select('id').single();
      operationError = error; if (!error && insertedData) savedAnnouncementId = insertedData.id;
    }
    if (operationError) throw operationError;

    if (savedAnnouncementId && wasPublished && shouldNotify) {
        notifyAllUsersAboutAnnouncement(savedAnnouncementId, formData.value.title.trim(), formData.value.type);
        formData.value.sendNotification = false; // Reset after sending
    }

    const successText = editingAnnouncement.value ? 'تم التحديث بنجاح!' : 'تمت الإضافة بنجاح!';
    closeModal();
    await fetchAnnouncements(); // Re-fetch to update the list and the count
    showToast('success', successText);

  } catch (error: any) {
    
    let specificErrorMsg = error.message || 'حدث خطأ غير متوقع أثناء الحفظ.';
    if (error.message?.includes('violates check constraint')) specificErrorMsg = 'خطأ في البيانات المدخلة.';
    else if (error.message?.includes('violates row-level security policy')) specificErrorMsg = 'فشل الحفظ بسبب قيود الأمان.';
    else if (error.message?.includes(`beyond the limit of ${MAX_ANNOUNCEMENTS}`)) specificErrorMsg = `لا يمكن الإضافة، تم الوصول للحد الأقصى (${MAX_ANNOUNCEMENTS}).`;

    errorMessage.value = specificErrorMsg;
    showToast('error', `خطأ في الحفظ: ${specificErrorMsg}`);
  } finally { isSaving.value = false; }
};

// --- Delete Handling ---
function triggerDeleteConfirmation(announcement: Announcement) {
    itemToDelete.value = announcement;
    confirmationConfigObject.value = {
      title: 'تأكيد الحذف',
      message: `هل أنت متأكد من رغبتك في حذف الإعلان "${announcement.title}"؟ لا يمكن التراجع عن هذا الإجراء.`,
      confirmText: 'تأكيد الحذف',
      cancelText: 'إلغاء',
      confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    };
    showConfirmationModal.value = true;
}
function handleDeleteConfirmation() {
    const itemBeingDeleted = itemToDelete.value;
    showConfirmationModal.value = false; // Close modal first
    itemToDelete.value = null;
    confirmationConfigObject.value = null;
    if (itemBeingDeleted) { handleDelete(itemBeingDeleted.id); }
}
async function handleDelete(id: number) {
  isDeleting.value = id;
  try {
    const { error } = await client.from('announcements').delete().eq('id', id);
    if (error) throw error;
    await fetchAnnouncements(); // Re-fetch to update the list and count
    showToast('success', 'تم حذف الإعلان بنجاح.');
  } catch (error: any) {  showToast('error', `فشل حذف الإعلان: ${error.message || 'خطأ غير معروف'}`);
  } finally { isDeleting.value = null; }
}

// --- Toggle Publish Status ---
async function togglePublish(announcement: Announcement) {
    isTogglingPublish.value = announcement.id;
    const newStatus = !announcement.is_published;
    const actionText = newStatus ? 'نشر' : 'إلغاء نشر';
    try {
        const { error } = await client.from('announcements').update({ is_published: newStatus }).eq('id', announcement.id);
        if (error) throw error;
        // Find the announcement in the local array and update its status
        // This avoids a full re-fetch just for toggling publish status, making it faster
        const index = announcements.value.findIndex(a => a.id === announcement.id);
        if (index !== -1) {
            announcements.value[index].is_published = newStatus;
        } else {
            // Fallback to re-fetch if not found locally (shouldn't happen often)
            await fetchAnnouncements();
        }
        // await fetchAnnouncements(); // Optionally keep re-fetch if simpler
        showToast('success', `تم ${actionText} الإعلان "${announcement.title}" بنجاح.`);
    } catch (error: any) {  showToast('error', `فشل ${actionText} الإعلان: ${error.message || 'خطأ غير معروف'}`);
    } finally { isTogglingPublish.value = null; }
}

</script>

<style scoped>
/* Styles from previous response */
.table-th { @apply px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider; }
/* Added min-width for responsiveness */
.table-th.min-w-\[200px\] { min-width: 200px; } /* Title */
.table-th.min-w-\[120px\] { min-width: 120px; } /* Type / Actions */
.table-th.min-w-\[180px\] { min-width: 180px; } /* Date */
.table-th.min-w-\[80px\] { min-width: 70px; } /* Published */
.table-th.min-w-\[110px\] { min-width: 110px; } /* Actions */


.table-td { @apply px-6 py-4 whitespace-nowrap text-sm; }
/* Allow title to wrap if needed */
.table-td:first-child { @apply whitespace-normal break-words; }

.table-tr:hover { @apply bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-150; }
.form-label { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
.form-input, .form-textarea, .form-select { @apply w-full px-4 py-2 border border-cream-gray dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed; }
.form-textarea { @apply min-h-[80px]; }
.form-help-text { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.form-error-message { @apply p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-md text-sm; }
.modal-button-primary { @apply w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ms-3 sm:text-sm disabled:opacity-50 dark:focus:ring-offset-gray-800 transition-colors duration-150; }
.modal-button-secondary { @apply w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm transition-colors duration-150 disabled:opacity-70; }
/* Responsive modal button margin */
.modal-button-secondary.mt-3 { margin-top: 0.75rem; }
@screen sm {
    .modal-button-secondary.mt-3 { margin-top: 0; }
}
input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.6) brightness(50%); cursor: pointer; }
.dark input[type="datetime-local"]::-webkit-calendar-picker-indicator { filter: invert(0.8); }
.animate-pulse { animation: pulse-light 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
@keyframes pulse-light { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
#modal-send_notification + label { cursor: pointer; }
</style>