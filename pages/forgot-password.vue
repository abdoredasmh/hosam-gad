<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-lg shadow border border-cream-gray">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-brown-dark">
          نسيت كلمة المرور؟
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleForgotPassword">
        <!-- رسائل الخطأ أو النجاح -->
        <div v-if="message" :class="isError ? 'text-red-600' : 'text-green-600'" class="text-center text-sm mb-4 p-2 bg-opacity-10 rounded" :style="{ backgroundColor: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }">
          {{ message }}
        </div>

        <div class="rounded-md shadow-sm">
          <div>
            <label for="email-address" class="sr-only">البريد الإلكتروني</label>
            <input id="email-address" name="email" type="email" v-model="email" autocomplete="email" required
                   class="relative block w-full appearance-none rounded-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                   placeholder="البريد الإلكتروني المسجل">
          </div>
        </div>

        <div>
          <button type="submit" :disabled="loading"
                  class="group relative flex w-full justify-center rounded-md border border-transparent bg-olive-green py-2 px-4 text-sm font-medium text-white hover:bg-opacity-85 focus:outline-none focus:ring-2 focus:ring-olive-green focus:ring-offset-2 disabled:opacity-50">
            <span v-if="loading" class="absolute inset-y-0 left-0 flex items-center pl-3">
               <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                 <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            </span>
            <span :class="{ 'opacity-0': loading }">إرسال رابط إعادة التعيين</span>
          </button>
        </div>
        <div class="text-sm text-center">
          <NuxtLink to="/login" class="font-medium text-olive-green hover:underline">
            العودة لتسجيل الدخول
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

const client = useSupabaseClient()
const email = ref('')
const message = ref('')
const isError = ref(false)
const loading = ref(false)

const handleForgotPassword = async () => {
  loading.value = true
  message.value = ''
  isError.value = false

  // نحتاج لتحديد رابط صفحة إعادة التعيين التي سننشئها تاليًا
  // يجب أن يتطابق هذا المسار مع الصفحة التي ستتعامل مع رمز إعادة التعيين
  // تأكد من أن هذا المسار موجود في redirectTo ضمن خيارات الوحدة إذا كنت تستخدمها
  const resetPasswordUrl = `${window.location.origin}/reset-password`

  const { error } = await client.auth.resetPasswordForEmail(email.value, {
    redirectTo: resetPasswordUrl,
  })

  loading.value = false

  if (error) {
    console.error('Forgot Password Error:', error.message)
    // لا تخبر المستخدم إذا كان البريد موجودًا أم لا لأسباب أمنية
    message.value = 'إذا كان هذا البريد الإلكتروني مسجلاً، فقد تم إرسال رابط إعادة التعيين إليه.'
    isError.value = false // نعرضها كرسالة نجاح دائمًا
  } else {
    message.value = 'إذا كان هذا البريد الإلكتروني مسجلاً، فقد تم إرسال رابط إعادة التعيين إليه.'
    isError.value = false
  }
}
</script>