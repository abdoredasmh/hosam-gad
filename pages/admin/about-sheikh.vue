<template>
  <div class="p-4 md:p-6 lg:p-8">
    <h1 class="text-2xl font-bold text-brown-dark dark:text-beige-light mb-6 border-b border-cream-gray dark:border-gray-700 pb-3">
      إدارة صفحة "عن الشيخ"
    </h1>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500 dark:text-gray-400">جاري تحميل البيانات...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-md">
      <p>خطأ في تحميل البيانات: {{ loadError }}</p>
      <button @click="fetchSheikhInfo" class="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
        إعادة المحاولة
      </button>
    </div>

    <!-- Form Section -->
    <div v-else class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-cream-gray dark:border-gray-700">
      <form @submit.prevent="handleUpdate">
        <div class="space-y-6">

          <!-- Short Bio -->
          <div>
            <label for="short_bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              نبذة مختصرة
            </label>
            <textarea v-model="formData.short_bio" id="short_bio" rows="3" class="form-textarea"></textarea>
             <p class="form-help-text">تظهر في أماكن مثل أعلى الصفحة الرئيسية.</p>
          </div>

          <!-- Full Bio -->
          <div>
            <label for="full_bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              السيرة الذاتية الكاملة
            </label>
            <textarea v-model="formData.full_bio" id="full_bio" rows="10" class="form-textarea"></textarea>
             <p class="form-help-text">المحتوى الرئيسي لصفحة "عن الشيخ".</p>
          </div>

          <!-- Profile Image Upload and URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              صورة الشيخ الشخصية
            </label>
            <div class="mt-1 flex items-center space-x-reverse space-x-4">
              <!-- Image Preview -->
              <img v-if="formData.profile_image_url" :src="formData.profile_image_url" alt="صورة الشيخ الحالية" class="h-24 w-24 rounded-md object-cover border border-cream-gray dark:border-gray-600 flex-shrink-0">
              <div v-else class="h-24 w-24 rounded-md border border-dashed border-cream-gray dark:border-gray-600 flex items-center justify-center text-gray-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <!-- Upload Button and Status -->
              <div class="flex-grow">
                <input type="file" id="imageUpload" @change="handleImageSelection" accept="image/png, image/jpeg, image/webp" class="hidden">
                <label for="imageUpload" class="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <span>{{ isUploading ? 'جاري الرفع...' : 'اختيار صورة جديدة' }}</span>
                </label>
                <p v-if="uploadError" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ uploadError }}</p>
                <p v-if="!uploadError" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  (اختياري) اختر ملف PNG, JPG, أو WEBP. سيتم استبدال الصورة الحالية.
                </p>
                 <!-- Display URL (read-only) -->
                 <input type="text" :value="formData.profile_image_url" readonly class="form-input mt-2 !bg-gray-100 dark:!bg-gray-700/50 opacity-75" placeholder="رابط الصورة بعد الرفع">
              </div>
            </div>
          </div>

          <!-- Contact Info - Individual Fields -->
          <fieldset class="border-t border-cream-gray dark:border-gray-600 pt-5">
              <legend class="text-base font-medium text-gray-900 dark:text-white mb-3">معلومات الاتصال (اختياري)</legend>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                  <!-- Email -->
                  <div>
                      <label for="contact_email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">البريد الإلكتروني</label>
                      <input type="email" id="contact_email" v-model="formData.contact_info.email" class="form-input mt-1" placeholder="email@example.com">
                  </div>
                  <!-- Phone -->
                  <div>
                      <label for="contact_phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الهاتف</label>
                      <input type="tel" id="contact_phone" v-model="formData.contact_info.phone" class="form-input mt-1" placeholder="+XXXXXXXXXXX">
                  </div>
                   <!-- Telegram -->
                   <div>
                       <label for="contact_telegram" class="block text-sm font-medium text-gray-700 dark:text-gray-300">تيليجرام (رابط قناة أو حساب)</label>
                       <input type="url" id="contact_telegram" v-model="formData.contact_info.telegram" class="form-input mt-1" placeholder="https://t.me/username">
                   </div>
                   <!-- WhatsApp -->
                   <div>
                       <label for="contact_whatsapp" class="block text-sm font-medium text-gray-700 dark:text-gray-300">واتساب (رابط مباشر أو رقم)</label>
                       <input type="text" id="contact_whatsapp" v-model="formData.contact_info.whatsapp" class="form-input mt-1" placeholder="https://wa.me/...">
                   </div>
                   <!-- Facebook -->
                   <div>
                       <label for="contact_facebook" class="block text-sm font-medium text-gray-700 dark:text-gray-300">فيسبوك (رابط صفحة)</label>
                       <input type="url" id="contact_facebook" v-model="formData.contact_info.facebook" class="form-input mt-1" placeholder="https://facebook.com/page">
                   </div>
                   <!-- Twitter / X -->
                   <div>
                       <label for="contact_twitter" class="block text-sm font-medium text-gray-700 dark:text-gray-300">تويتر / X (رابط حساب)</label>
                       <input type="url" id="contact_twitter" v-model="formData.contact_info.twitter" class="form-input mt-1" placeholder="https://x.com/username">
                   </div>
                   <!-- YouTube -->
                   <div>
                       <label for="contact_youtube" class="block text-sm font-medium text-gray-700 dark:text-gray-300">يوتيوب (رابط قناة)</label>
                       <input type="url" id="contact_youtube" v-model="formData.contact_info.youtube" class="form-input mt-1" placeholder="https://youtube.com/channel/...">
                   </div>
                   <!-- Instagram -->
                   <div>
                       <label for="contact_instagram" class="block text-sm font-medium text-gray-700 dark:text-gray-300">انستغرام (رابط حساب)</label>
                       <input type="url" id="contact_instagram" v-model="formData.contact_info.instagram" class="form-input mt-1" placeholder="https://instagram.com/username">
                   </div>
                   <!-- TikTok -->
                   <div>
                       <label for="contact_tiktok" class="block text-sm font-medium text-gray-700 dark:text-gray-300">تيك توك (رابط حساب)</label>
                       <input type="url" id="contact_tiktok" v-model="formData.contact_info.tiktok" class="form-input mt-1" placeholder="https://tiktok.com/@username">
                   </div>
                   <!-- Add more platforms as needed -->
              </div>
          </fieldset>

        </div>

        <!-- Feedback Messages -->
         <div v-if="successMessage" class="mt-6 p-3 form-success-message">
            {{ successMessage }}
         </div>
         <div v-if="updateError" class="mt-6 p-3 form-error-message">
           خطأ في التحديث: {{ updateError }}
         </div>

        <!-- Submit Button -->
        <div class="mt-8 pt-5 border-t border-cream-gray dark:border-gray-700">
          <button
            type="submit"
            :disabled="isSaving || isUploading"
            class="inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 dark:focus:ring-offset-gray-800"
          >
            <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
   <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
   <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
            {{ isSaving ? 'جاري حفظ التعديلات...' : 'حفظ التعديلات' }}
          </button>
           <p v-if="lastUpdated" class="mt-3 text-xs text-gray-500 dark:text-gray-400">آخر تحديث: {{ formatDate(lastUpdated) }}</p>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSupabaseClient } from '#imports';
import type { Database, Tables } from '~/types/database.types';

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });

// --- Types & Supabase Client ---
type AboutSheikhInfo = Tables<'about_sheikh'>;
const client = useSupabaseClient<Database>();
const BUCKET_NAME = 'profile-images'; // اسم الـ Bucket في Supabase Storage

// --- Component State ---
const isLoading = ref(true);
const loadError = ref<string | null>(null);
const isSaving = ref(false);
const updateError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const lastUpdated = ref<string | null>(null);
const selectedFile = ref<File | null>(null); // الملف المختار للرفع
const isUploading = ref(false); // حالة رفع الصورة
const uploadError = ref<string | null>(null); // خطأ رفع الصورة

// --- Form Data State ---
// تعريف النوع المتوقع لكائن معلومات الاتصال
interface ContactInfo {
  email?: string | null;
  phone?: string | null;
  telegram?: string | null;
  whatsapp?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  // أضف المزيد هنا إذا لزم الأمر
}

const initialFormData = {
  short_bio: '',
  full_bio: '',
  profile_image_url: '',
  contact_info: {} as ContactInfo, // تهيئة ككائن فارغ
};
const formData = ref({ ...initialFormData });

// --- Helper Functions ---
function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' });
  } catch { return 'تاريخ غير صالح'; }
}

// --- Data Fetching ---
async function fetchSheikhInfo() {
  isLoading.value = true;
  loadError.value = null;
  try {
    const { data, error } = await client
      .from('about_sheikh')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      formData.value.short_bio = data.short_bio ?? '';
      formData.value.full_bio = data.full_bio ?? '';
      formData.value.profile_image_url = data.profile_image_url ?? '';
      // تأكد من أن contact_info هو كائن، إذا كان null أو غير صالح، استخدم كائنًا فارغًا
      formData.value.contact_info = (typeof data.contact_info === 'object' && data.contact_info !== null) ? data.contact_info as ContactInfo : {};
      lastUpdated.value = data.updated_at;
    } else {
      loadError.value = 'لم يتم العثور على بيانات "عن الشيخ" (id=1).';
      // Initialize contact_info as empty object if no data found
      formData.value.contact_info = {};
    }
  } catch (error: any) {
    
    loadError.value = error.message || 'فشل تحميل بيانات الشيخ.';
     // Initialize contact_info as empty object on error
     formData.value.contact_info = {};
  } finally {
    isLoading.value = false;
  }
}

onMounted(fetchSheikhInfo);

// --- Image Upload Handling ---
function handleImageSelection(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    uploadError.value = null; // Reset previous upload errors
    // Immediately attempt upload after selection
    handleImageUpload();
  } else {
    selectedFile.value = null;
  }
}

async function handleImageUpload() {
  if (!selectedFile.value) {
    uploadError.value = 'الرجاء اختيار ملف صورة أولاً.';
    return;
  }

  isUploading.value = true;
  uploadError.value = null;
  successMessage.value = null; // Clear other messages

  try {
    const file = selectedFile.value;
    const fileExt = file.name.split('.').pop();
    // استخدام اسم ملف ثابت لسهولة التحديث، تأكد من أن هذا مناسب لحالتك
    const fileName = `sheikh_avatar.${fileExt}`;
    const filePath = `${fileName}`; // المسار داخل الـ Bucket

    

    // رفع الملف مع خيار upsert للكتابة فوق الملف الموجود بنفس الاسم
    const { error: uploadError } = await client.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600', // فترة التخزين المؤقت (اختياري)
        upsert: true, // هام: للسماح بالكتابة فوق الملف الموجود
      });

    if (uploadError) {
      
      throw uploadError;
    }

    

    // الحصول على الرابط العام للملف بعد رفعه
    const { data: urlData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      
      throw new Error('لم يتمكن من الحصول على رابط الصورة بعد الرفع.');
    }

    const publicUrl = urlData.publicUrl;
    

    // تحديث حقل الصورة في الفورم بالرابط الجديد
    formData.value.profile_image_url = publicUrl;
    successMessage.value = 'تم رفع الصورة بنجاح. لا تنس حفظ التعديلات الإجمالية.';
    selectedFile.value = null; // مسح الملف المختار بعد الرفع

  } catch (error: any) {
    
    uploadError.value = `فشل رفع الصورة: ${error.message}`;
  } finally {
    isUploading.value = false;
    // Reset file input visually (important for re-selecting the same file)
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement | null;
    if (fileInput) {
        fileInput.value = '';
    }
  }
}


// --- Form Update Handling ---
async function handleUpdate() {
  isSaving.value = true;
  updateError.value = null;
  successMessage.value = null;

  try {
    // --- تنظيف كائن contact_info قبل الإرسال ---
    // إزالة أي مفاتيح ذات قيم فارغة أو null
    const cleanContactInfo: ContactInfo = {};
    for (const key in formData.value.contact_info) {
      const typedKey = key as keyof ContactInfo; // Type assertion
      if (formData.value.contact_info[typedKey]) { // Check if value is truthy (not empty string, null, undefined)
        cleanContactInfo[typedKey] = formData.value.contact_info[typedKey];
      }
    }
    // -------------------------------------------

    const dataToUpdate = {
      short_bio: formData.value.short_bio || null,
      full_bio: formData.value.full_bio || null,
      profile_image_url: formData.value.profile_image_url || null, // قد يتم تحديثه من رفع الصورة
      contact_info: Object.keys(cleanContactInfo).length > 0 ? cleanContactInfo : null, // أرسل الكائن المنظف أو null إذا كان فارغاً
      updated_at: new Date().toISOString(),
    };

    

    const { error } = await client
      .from('about_sheikh')
      .update(dataToUpdate)
      .eq('id', 1);

    if (error) throw error;

    successMessage.value = 'تم حفظ التعديلات بنجاح!';
    lastUpdated.value = dataToUpdate.updated_at;
    setTimeout(() => { successMessage.value = null; }, 3000);

  } catch (error: any) {
    
    updateError.value = error.message || 'حدث خطأ غير متوقع أثناء حفظ التعديلات.';
  } finally {
    isSaving.value = false;
  }
}

</script>

<style scoped>
/* تطبيق أنماط Tailwind @apply لتجنب التكرار */
.form-input {
  @apply w-full px-4 py-2 border border-cream-gray dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white;
}
.form-textarea {
   @apply w-full px-4 py-2 border border-cream-gray dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white;
}
.form-help-text {
   @apply mt-1 text-xs text-gray-500 dark:text-gray-400;
}
.form-success-message {
     @apply p-3 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 rounded-md text-sm;
}
.form-error-message {
    @apply p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-md text-sm;
}
</style>