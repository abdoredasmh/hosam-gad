<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center text-[color:var(--color-brown-dark)] dark:text-[color:var(--color-beige-light)]">الملف الشخصي</h1>

    <ClientOnly>
      <!-- Main content grid: Render ONLY if profile exists -->
      <div v-if="userStore.profile" class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Column 1: User Info & Avatar -->
        <div class="md:col-span-1 space-y-6">
          <BaseCard>
            <template #title>المعلومات الشخصية</template>
            <template #content>
              <div class="flex flex-col items-center space-y-4">
                <!-- Avatar -->
                <div class="relative">
                  <UserAvatar :src="userStore.userAvatar || undefined" :alt="userStore.displayName" size="xl" />
                  <button @click="triggerFileInput" class="absolute bottom-0 right-0 bg-[color:var(--color-olive-green)] text-white rounded-full p-1 hover:bg-opacity-80 transition duration-200" aria-label="تغيير الصورة الرمزية" :disabled="isUploadingAvatar">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 8a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>
                  </button>
                  <input type="file" ref="fileInput" @change="handleAvatarUpload" class="hidden" accept="image/png, image/jpeg, image/gif" :disabled="isUploadingAvatar"/>
                </div>
                <div v-if="isUploadingAvatar" class="text-sm text-gray-500">جارٍ رفع الصورة...</div>
                <div v-if="avatarError" class="text-sm text-red-500">{{ avatarError }}</div>
                <!-- User Info -->
                <h2 class="text-xl font-semibold text-center">{{ userStore.displayName }}</h2>
                <p class="text-gray-600 dark:text-gray-400 text-center">{{ userStore.userEmail }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-center">النقاط: <span class="font-bold">{{ userStore.userPoints }}</span></p>
                <p class="text-sm text-gray-500 dark:text-gray-300 mt-2 text-center px-2">{{ userStore.userBio || 'لا توجد نبذة شخصية.' }}</p>
              </div>
            </template>
          </BaseCard>
          <BaseCard>
            <template #title>تسجيل الخروج</template>
            <template #content>
              <button @click="logout" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200">
                تسجيل الخروج
              </button>
            </template>
          </BaseCard>
        </div>

        <!-- Column 2 & 3: Reordered Sections -->
        <div class="md:col-span-2 space-y-6">

          <!-- 1. Admin/System Messages Section -->
          <BaseCard>
            <template #title>رسائل الإدارة / النظام</template>
            <template #content>
              <div v-if="pendingMessages" class="flex justify-center p-4"><LoadingSpinner /></div>
              <div v-else-if="errorMessages" class="text-red-500 p-4">حدث خطأ أثناء تحميل الرسائل: {{ errorMessages.message }}</div>
              <div v-else-if="!adminMessages || adminMessages.length === 0" class="text-gray-500 p-4 text-center">لا توجد رسائل إدارية حاليًا.</div>
              <div v-else class="space-y-6">
                <div v-for="(message, index) in adminMessages" :key="message.id"
                     :class="['border rounded-lg p-4 dark:border-gray-700 shadow-sm transition-colors duration-300', message.is_read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800']">
                  
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold">{{ message.title }}</h4>
                    <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {{ formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: arSA }) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ message.content }}</p>
                  <div v-if="!message.is_read" class="mt-3 text-right">
                    <button @click="markMessageAsRead(message.id)" :disabled="isMarkingRead === message.id" class="text-xs text-[color:var(--color-blue-muted)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
                      {{ isMarkingRead === message.id ? 'جارٍ...' : 'تمييز كمقروءة' }}
                    </button>
                  </div>
                
                  <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <template v-if="message.user_reply_text">
              
                      <div>
                        <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">ردك:</p>
                        <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ message.user_reply_text }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                          {{ message.user_replied_at ? formatDistanceToNow(new Date(message.user_replied_at), { addSuffix: true, locale: arSA }) : '' }}
                        </p>
                      </div>
                    </template>
                    <template v-else>
                  
                      <div>
                        <button v-if="!replyingTo || replyingTo !== message.id" @click="showReplyForm(message.id)" class="text-sm text-[color:var(--color-olive-green)] hover:underline">
                          الرد على الرسالة
                        </button>
                        <form v-if="replyingTo === message.id" @submit.prevent="submitReply(message.id, index)" class="mt-2 space-y-2">
                          <textarea
                            v-model="replyText"
                            rows="3"
                            required
                            placeholder="اكتب ردك هنا..."
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[color:var(--color-olive-green)] focus:ring focus:ring-[color:var(--color-olive-green)] focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          ></textarea>
                          <div class="flex justify-end space-x-2 space-x-reverse">
                            <button type="button" @click="cancelReply" class="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">إلغاء</button>
                            <button type="submit" :disabled="isSubmittingReply" class="px-3 py-1 text-sm rounded bg-[color:var(--color-olive-green)] text-white hover:bg-opacity-80 disabled:opacity-50">
                              {{ isSubmittingReply ? 'جارٍ الإرسال...' : 'إرسال الرد' }}
                            </button>
                          </div>
                          <p v-if="replyError === message.id" class="text-sm text-red-500 mt-1">{{ genericReplyError }}</p>
                        </form>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </BaseCard>

          <!-- 2. My Courses Section -->
          <BaseCard>
            <template #title>دوراتي المسجل بها</template>
            <template #content>
              <div v-if="pendingCourses" class="flex justify-center p-4"><LoadingSpinner /></div>
              <div v-else-if="errorCourses" class="text-red-500 p-4">حدث خطأ أثناء تحميل الدورات: {{ errorCourses.message }}</div>
              <div v-else-if="!myCourses || myCourses.length === 0" class="text-gray-500 p-4 text-center">لم تسجل في أي دورات بعد. <NuxtLink to="/study" class="text-[color:var(--color-olive-green)] hover:underline">تصفح الدورات</NuxtLink></div>
              <div v-else class="space-y-4">
                <div v-for="course in myCourses" :key="course.id" class="border rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                  <NuxtImg :src="course.image_url || '/images/placeholder-course.jpg'" alt="صورة الدورة" class="w-full sm:w-24 h-24 object-cover rounded-md flex-shrink-0" width="96" height="96" loading="lazy" format="webp" placeholder />
                  <div class="flex-grow w-full">
                    <h4 class="font-semibold text-lg">{{ course.title }}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ course.description }}</p>
                    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2"><div class="bg-[color:var(--color-olive-green)] h-2.5 rounded-full" :style="{ width: course.progress + '%' }"></div></div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ course.progress }}% مكتمل</p>
                  </div>
                  <NuxtLink :to="course.last_accessed_lesson_id ? `/study/courses/${course.id}/lessons/${course.last_accessed_lesson_id}` : `/study/courses/${course.id}`" class="mt-2 sm:mt-0 flex-shrink-0 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[color:var(--color-olive-green)] hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-olive-green)] dark:focus:ring-offset-gray-800 transition">{{ course.last_accessed_lesson_id ? 'استئناف التعلم' : 'عرض الدورة' }} <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg></NuxtLink>
                </div>
              </div>
            </template>
          </BaseCard>

           <!-- 3. Account Settings Section -->
           <BaseCard>
             <template #title>إعدادات الحساب</template>
             <template #content>
               <div class="space-y-6">
                 <!-- Change Password Form -->
                 <form @submit.prevent="changePassword" class="space-y-4 border-b dark:border-gray-700 pb-6">
                   <h4 class="font-semibold">تغيير كلمة المرور</h4>
                   <div><label for="currentPassword" class="block text-sm font-medium">كلمة المرور الحالية</label><input type="password" id="currentPassword" v-model="currentPassword" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"></div>
                   <div><label for="newPassword" class="block text-sm font-medium">كلمة المرور الجديدة</label><input type="password" id="newPassword" v-model="newPassword" required minlength="6" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"></div>
                   <button type="submit" :disabled="isChangingPassword" class="w-full bg-[color:var(--color-blue-muted)] hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50">{{ isChangingPassword ? 'جارٍ التغيير...' : 'تغيير كلمة المرور' }}</button>
                   <p v-if="passwordError" class="text-sm text-red-500 mt-2">{{ passwordError }}</p>
                   <p v-if="passwordSuccessMessage" class="text-sm text-green-500 mt-2">{{ passwordSuccessMessage }}</p>
                 </form>
                 <!-- Change Email Form -->
                 <form @submit.prevent="changeEmail" class="space-y-4">
                   <h4 class="font-semibold">تغيير البريد الإلكتروني</h4>
                   <div><label for="newEmail" class="block text-sm font-medium">البريد الإلكتروني الجديد</label><input type="email" id="newEmail" v-model="newEmail" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600"></div>
                   <button type="submit" :disabled="isChangingEmail" class="w-full bg-[color:var(--color-blue-muted)] hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50">{{ isChangingEmail ? 'جارٍ التغيير...' : 'تغيير البريد الإلكتروني' }}</button>
                   <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">سيتم إرسال رابط تأكيد إلى بريدك الإلكتروني الجديد.</p>
                   <p v-if="emailError" class="text-sm text-red-500 mt-2">{{ emailError }}</p>
                   <p v-if="emailSuccessMessage" class="text-sm text-green-500 mt-2">{{ emailSuccessMessage }}</p>
                 </form>
               </div>
             </template>
           </BaseCard>

          <!-- 4. Edit Profile Section -->
          <BaseCard>
            <template #title>تعديل الملف الشخصي</template>
            <template #content>
              <form @submit.prevent="updateProfile" class="space-y-4">
                <div>
                  <label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل</label>
                  <input type="text" id="fullName" v-model="newFullName" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[color:var(--color-olive-green)] focus:ring focus:ring-[color:var(--color-olive-green)] focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label for="bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نبذة شخصية</label>
                  <textarea id="bio" v-model="newBio" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[color:var(--color-olive-green)] focus:ring focus:ring-[color:var(--color-olive-green)] focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                </div>
                <button type="submit" :disabled="isUpdatingProfile" class="w-full bg-[color:var(--color-olive-green)] hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:opacity-50">
                  {{ isUpdatingProfile ? 'جارٍ الحفظ...' : 'حفظ التعديلات' }}
                </button>
                <p v-if="profileError" class="text-sm text-red-500 mt-2">{{ profileError }}</p>
                <p v-if="profileSuccessMessage" class="text-sm text-green-500 mt-2">{{ profileSuccessMessage }}</p>
              </form>
            </template>
          </BaseCard>

        </div>
      </div>

      <!-- Fallback/Error message if no profile -->
      <div v-else class="text-center text-gray-500 dark:text-gray-400 py-10">
        لا يمكن عرض الملف الشخصي. يرجى التأكد من تسجيل الدخول والمحاولة مرة أخرى.
      </div>

      <!-- Fallback for ClientOnly -->
      <template #fallback>
         <div class="flex justify-center items-center h-64">
           <LoadingSpinner />
         </div>
      </template>
    </ClientOnly>
  </div>
</template>


<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useUserStore } from '~/stores/user';
import { useSupabaseClient, useSupabaseUser, useAsyncData, navigateTo } from '#imports';
import type { Database, Tables, Json } from '~/types/database.types';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';

// --- تعريف الأنواع المطلوبة ---
type Profile = Tables<'profiles'>;
type Course = {
  id: number;
  title: string | null;
  description: string | null;
  image_url: string | null;
  progress: number;
  last_accessed_lesson_id: number | null;
};
type PrivateMessage = Tables<'user_private_messages'>;
// تم حذف نوع الشهادة/الدورة المكتملة

// --- المكونات والمساعدات ---
import BaseCard from '~/components/BaseCard.vue';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import UserAvatar from '~/components/UserAvatar.vue';

definePageMeta({
  middleware: 'auth'
});

const userStore = useUserStore();
const client = useSupabaseClient<Database>();
const user = useSupabaseUser();

// --- حالة النموذج والتحديث ---
const newFullName = ref('');
const newBio = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const newEmail = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const isUpdatingProfile = ref(false);
const profileError = ref<string | null>(null);
const profileSuccessMessage = ref<string | null>(null);
const isUploadingAvatar = ref(false);
const avatarError = ref<string | null>(null);
const isChangingPassword = ref(false);
const passwordError = ref<string | null>(null);
const passwordSuccessMessage = ref<string | null>(null);
const isChangingEmail = ref(false);
const emailError = ref<string | null>(null);
const emailSuccessMessage = ref<string | null>(null);
const isMarkingRead = ref<number | false>(false);

// --- حالة الرد ---
const replyingTo = ref<number | null>(null);
const replyText = ref('');
const isSubmittingReply = ref(false);
const replyError = ref<number | null>(null);
const genericReplyError = ref<string | null>(null);


// --- جلب البيانات ---
const { data: myCourses, pending: pendingCourses, error: errorCourses, refresh: refreshCourses } = useAsyncData<Course[]>(
  'myCourses',
  () => $fetch('/api/my-courses'), // يفترض أن هذا الـ API يجلب الدورات مع التقدم
  { lazy: true, server: false }
);

// تم حذف useAsyncData الخاص بالشهادات/الدورات المكتملة

// --- جلب رسائل الإدارة فقط ---
const { data: adminMessages, pending: pendingMessages, error: errorMessages, refresh: refreshMessages } = useAsyncData<PrivateMessage[]>(
  'adminMessages',
  async () => {
    if (!user.value) return [];
    
    try {
        const { data, error } = await client
          .from('user_private_messages')
          .select('*')
          .eq('user_id', user.value.id)
          .is('related_question_id', null) // الفلتر: جلب الرسائل التي ليست ردودًا على أسئلة
          .order('created_at', { ascending: false });
        if (error) {  throw error; }
        
        return data || [];
    } catch (err) {  throw err; }
  },
  { lazy: true, server: false, watch: [user] }
);

// --- وظائف التحديث (كما هي في النسخة السابقة) ---
watch(() => userStore.profile, (newProfile) => {
    if (newProfile) { newFullName.value = newProfile.full_name || ''; newBio.value = newProfile.bio || ''; }
}, { immediate: true });

async function updateProfile() {
  if (!user.value || !userStore.profile) return;
  isUpdatingProfile.value = true; profileError.value = null; profileSuccessMessage.value = null;
  try {
    const updates: Partial<Profile> = { id: user.value.id, full_name: newFullName.value.trim() || null, bio: newBio.value.trim() || null, updated_at: new Date().toISOString() };
    if(updates.full_name === userStore.profile.full_name) delete updates.full_name;
    if(updates.bio === userStore.profile.bio) delete updates.bio;
    if (!updates.full_name && !updates.bio) { profileSuccessMessage.value = "لا توجد تغييرات لحفظها."; isUpdatingProfile.value = false; return; }
    const { error } = await client.from('profiles').upsert(updates); if (error) throw error;
    await userStore.fetchProfile(); profileSuccessMessage.value = 'تم تحديث الملف الشخصي بنجاح!'; setTimeout(() => profileSuccessMessage.value = null, 3000);
  } catch (err: any) {  profileError.value = err.message || 'فشل تحديث الملف الشخصي.';
  } finally { isUpdatingProfile.value = false; }
}

function triggerFileInput() { fileInput.value?.click(); }

async function handleAvatarUpload(event: Event) {
  const input = event.target as HTMLInputElement; if (!input.files || input.files.length === 0 || !user.value) return;
  const file = input.files[0]; const fileExt = file.name.split('.').pop()?.toLowerCase(); const filePath = `${user.value.id}/avatar.${fileExt}`;
  const allowedTypes = ['png', 'jpg', 'jpeg', 'gif'];
  if (!fileExt || !allowedTypes.includes(fileExt)) { avatarError.value = 'نوع الملف غير مدعوم.'; return; }
  if (file.size > 2 * 1024 * 1024) { avatarError.value = 'حجم الملف كبير جدًا (الحد الأقصى 2 ميجابايت).'; return; }
  isUploadingAvatar.value = true; avatarError.value = null;
  try {
    const { error: uploadError } = await client.storage.from('avatars').upload(filePath, file, { upsert: true }); if (uploadError) throw uploadError;
    const { data: urlData } = client.storage.from('avatars').getPublicUrl(filePath); if (!urlData?.publicUrl) throw new Error("لم يتم العثور على رابط الصورة بعد الرفع.");
    const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
    const { error: updateError } = await client.from('profiles').update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', user.value.id); if (updateError) throw updateError;
    await userStore.fetchProfile();
  } catch (err: any) {
     avatarError.value = err.message || 'فشل رفع الصورة.';
    if (err.message?.includes("Bucket not found")) avatarError.value = 'خطأ إعداد: مخزن الصور غير موجود.';
    else if (err.message?.includes("mime type not supported")) avatarError.value = 'نوع الملف غير مسموح به في المخزن.';
    else if (err.message?.includes("exceeds the maximum allowed size")) avatarError.value = 'حجم الملف يتجاوز الحد المسموح به في المخزن.';
    else if (err.message?.includes("duplicate key value violates unique constraint") || err.message?.includes("The resource already exists")) {
        try {
             const { data: urlData } = client.storage.from('avatars').getPublicUrl(filePath);
             if (urlData?.publicUrl) { const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
                 const { error: updateRetryError } = await client.from('profiles').update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', user.value.id);
                 if (updateRetryError) throw updateRetryError; await userStore.fetchProfile();
             } else { throw new Error("الملف موجود ولكن لا يمكن الحصول على الرابط العام."); }
        } catch(retryErr: any) {  avatarError.value = retryErr.message || 'فشل تحديث رابط الصورة الموجودة.'; }
     }
  } finally { isUploadingAvatar.value = false; if (input) input.value = ''; }
}

async function changePassword() {
  if (!currentPassword.value || !newPassword.value) { passwordError.value = "يرجى إدخال كلمة المرور الحالية والجديدة."; return; }
  if (newPassword.value.length < 6) { passwordError.value = "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل."; return; }
  isChangingPassword.value = true; passwordError.value = null; passwordSuccessMessage.value = null;
  try {
    const { error } = await client.auth.updateUser({ password: newPassword.value });
    if (error) {
        if (error.message.includes("password should be different")) throw new Error("كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية.");
        if (error.message.includes("check constraint") || error.message.includes("Password length")) throw new Error("كلمة المرور الجديدة لا تفي بمتطلبات الأمان.");
        throw new Error("فشل تغيير كلمة المرور. تأكد من صحة كلمة المرور الحالية وأن الجديدة مختلفة وتفي بالشروط.");
    }
    passwordSuccessMessage.value = "تم تغيير كلمة المرور بنجاح!"; currentPassword.value = ''; newPassword.value = ''; setTimeout(() => passwordSuccessMessage.value = null, 3000);
  } catch (err: any) {  passwordError.value = err.message || 'فشل تغيير كلمة المرور.';
  } finally { isChangingPassword.value = false; }
}

async function changeEmail() {
   if (!newEmail.value || !user.value || newEmail.value === user.value.email) { emailError.value = "يرجى إدخال بريد إلكتروني جديد وصحيح."; return; }
   isChangingEmail.value = true; emailError.value = null; emailSuccessMessage.value = null;
   try {
     const { error } = await client.auth.updateUser({ email: newEmail.value }); if (error) throw error;
     emailSuccessMessage.value = "تم إرسال رابط التأكيد إلى بريدك الإلكتروني الجديد."; newEmail.value = '';
   } catch (err: any) {  emailError.value = err.message || 'فشل تغيير البريد الإلكتروني.'; if (err.message.includes("already registered")) emailError.value = "هذا البريد الإلكتروني مسجل بالفعل.";
   } finally { isChangingEmail.value = false; }
}

async function markMessageAsRead(messageId: number) {
    if (!user.value || isMarkingRead.value) return; isMarkingRead.value = messageId;
    try {
        const { error } = await client.from('user_private_messages').update({ is_read: true }).match({ id: messageId, user_id: user.value.id }); if (error) throw error;
        const msgIndex = adminMessages.value?.findIndex(m => m.id === messageId);
        if (msgIndex !== undefined && msgIndex !== -1 && adminMessages.value) { adminMessages.value[msgIndex].is_read = true; }
    } catch (err: any) {  } finally { isMarkingRead.value = false; }
}

// --- وظائف الرد ---
function showReplyForm(messageId: number) { replyingTo.value = messageId; replyText.value = ''; replyError.value = null; genericReplyError.value = null; }
function cancelReply() { replyingTo.value = null; replyText.value = ''; replyError.value = null; genericReplyError.value = null; }

async function submitReply(messageId: number, messageIndex: number) {
    if (!user.value || !replyText.value.trim()) { replyError.value = messageId; genericReplyError.value = "الرجاء كتابة نص الرد."; return; }
    isSubmittingReply.value = true; replyError.value = null; genericReplyError.value = null;
    try {
        const replyData = { user_reply_text: replyText.value.trim(), user_replied_at: new Date().toISOString(), admin_read_reply: false };
        const { data: updatedMessage, error } = await client.from('user_private_messages').update(replyData).match({ id: messageId, user_id: user.value.id }).select().single(); if (error) throw error;
        if (adminMessages.value && updatedMessage) { const msgIndexInAdmin = adminMessages.value.findIndex(m => m.id === messageId);
             if (msgIndexInAdmin !== -1) { adminMessages.value[msgIndexInAdmin] = { ...adminMessages.value[msgIndexInAdmin], ...updatedMessage }; } else { await refreshMessages(); }
        } else { await refreshMessages(); }
        cancelReply();
    } catch (err: any) {  replyError.value = messageId; genericReplyError.value = err.message || 'فشل إرسال الرد.';
    } finally { isSubmittingReply.value = false; }
}

// --- تسجيل الخروج ---
async function logout() { await userStore.logout(); await navigateTo('/'); }

</script>

<style scoped>
.whitespace-pre-wrap { white-space: pre-wrap; }
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>