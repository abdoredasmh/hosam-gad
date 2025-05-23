<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-lg shadow border border-cream-gray">
      <h1 class="text-2xl md:text-3xl font-semibold text-center text-brown-dark mb-4"> 
        تأكيد البريد الإلكتروني
      </h1>

      <!-- حالة التحميل الأولي -->
      <div v-if="initialLoading" class="py-6 text-center"> 
        <p class="text-gray-600 mb-4">جارٍ التحقق من حالة الحساب...</p>
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-olive-green"></div>
      </div>

      <!-- عرض الرسائل بعد التحميل -->
      <div v-else class="text-center"> 
        <div v-if="message" :class="isError ? 'text-red-600' : 'text-green-600'" class="text-lg mb-6 p-3 bg-opacity-10 rounded" :style="{ backgroundColor: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }">
          {{ message }}
        </div>

        <!-- زر إعادة الإرسال (يظهر إذا لم يتم التأكيد أو حدث خطأ) -->
        <div v-if="showResendButton && emailForResend" class="mt-6">
           <p class="text-sm text-gray-600 mb-2">لم تستلم الإيميل أو انتهت صلاحية الرابط؟</p>
           <button @click="resendConfirmation" :disabled="resendLoading"
                   class="text-sm bg-gray-200 text-brown-dark px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait">
             <span v-if="resendLoading">جارٍ الإرسال...</span>
             <span v-else>إعادة إرسال رابط التأكيد</span>
           </button>
           <p v-if="resendMessage" class="mt-2 text-xs" :class="resendError ? 'text-red-500' : 'text-green-500'">
             {{ resendMessage }}
           </p>
        </div>

         <!-- رابط العودة (يظهر دائمًا بعد التحميل الأولي) -->
         <div class="mt-8">
            <NuxtLink to="/" class="inline-block text-olive-green hover:underline font-medium">
                <Icon name="mdi:arrow-right" class="inline-block ml-1" /> 
                العودة إلى الصفحة الرئيسية
            </NuxtLink>
            <NuxtLink v-if="user" to="/profile" class="inline-block text-olive-green hover:underline font-medium mr-4">
                 الذهاب للملف الشخصي
                <Icon name="mdi:account-circle-outline" class="inline-block ml-1" />
            </NuxtLink>
         </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseUser, useSupabaseClient, navigateTo, useRoute } from '#imports'

const user = useSupabaseUser()
const client = useSupabaseClient()
const route = useRoute()

// حالة التحميل والرسائل الأساسية
const message = ref('')
const isError = ref(false)
const initialLoading = ref(true) // للتحميل الأولي عند فتح الصفحة
const showResendButton = ref(false) // للتحكم بظهور زر إعادة الإرسال

// حالة زر إعادة الإرسال
const emailForResend = ref('') // سنحصل عليه من URL أو المستخدم
const resendLoading = ref(false)
const resendMessage = ref('')
const resendError = ref(false)

onMounted(() => {
  // 1. حاول الحصول على البريد الإلكتروني من الـ URL (إذا تم التوجيه من signup)
  if (route.query.email) {
    emailForResend.value = route.query.email.toString();
  }

  // 2. انتظر قليلاً ثم تحقق من حالة المستخدم
  setTimeout(() => {
    initialLoading.value = false // انتهى التحميل الأولي
    if (user.value) {
      // المستخدم سُجل دخوله (إما تم التأكيد الآن أو كان مسجلاً بالفعل)
      if (user.value.email_confirmed_at) {
         message.value = 'تم تأكيد حسابك بنجاح! يمكنك الآن استخدام جميع ميزات الموقع.'
         isError.value = false
         showResendButton.value = false
      } else {
         message.value = 'حسابك موجود ولكن لم يتم تأكيد بريدك الإلكتروني بعد. يرجى التحقق من بريدك الوارد (والـ Spam) والنقر على رابط التأكيد.'
         isError.value = true
         showResendButton.value = true
         if (!emailForResend.value && user.value.email) {
             emailForResend.value = user.value.email;
         }
      }

    } else {
      // المستخدم غير مسجل دخوله
      message.value = 'لإكمال عملية التسجيل أو التأكيد، يرجى التحقق من بريدك الإلكتروني والنقر على الرابط المُرسل. إذا لم تستلم الإيميل، يمكنك طلب إعادة إرساله.'
      isError.value = true
      showResendButton.value = true
      if (!emailForResend.value) {
          
          message.value += "\n(لم نتمكن من تحديد بريدك لإعادة الإرسال تلقائيًا.)";
      }
    }
  }, 1500);
})

// دالة إعادة إرسال إيميل التأكيد
const resendConfirmation = async () => {
  if (!emailForResend.value) {
      resendMessage.value = 'لا يمكن تحديد البريد الإلكتروني لإعادة الإرسال.';
      resendError.value = true;
      return;
  }
  resendLoading.value = true;
  resendMessage.value = '';
  resendError.value = false;

  const { error } = await client.auth.resend({
    type: 'signup',
    email: emailForResend.value,
  });

  resendLoading.value = false;
  if (error) {
    
    resendMessage.value = error.message || 'فشل إرسال الإيميل. حاول مرة أخرى لاحقًا.';
    resendError.value = true;
  } else {
    resendMessage.value = 'تم إعادة إرسال إيميل التأكيد بنجاح. يرجى التحقق من بريدك.';
    resendError.value = false;
  }
};

// تحديد التخطيط الافتراضي
definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
/* أنماط إضافية إذا لزم الأمر */
</style>