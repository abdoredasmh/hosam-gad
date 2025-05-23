<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-lg shadow border border-cream-gray">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-brown-dark">
          إعادة تعيين كلمة المرور
        </h2>
        <p v-if="!showForm && !message" class="mt-2 text-center text-sm text-gray-600"> {/* تعديل شرط الرسالة */}
          جارٍ التحقق من الرابط...
        </p>
      </div>

      <!-- رسائل الخطأ أو النجاح -->
       <div v-if="message" :class="isError ? 'text-red-600' : 'text-green-600'" class="text-center text-sm mb-4 p-2 bg-opacity-10 rounded" :style="{ backgroundColor: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }">
          {{ message }}
        </div>

      <form v-if="showForm" class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
        <input type="hidden" name="remember" value="true">
        <div class="rounded-md shadow-sm -space-y-px">
           <div>
            <label for="password" class="sr-only">كلمة المرور الجديدة</label>
            <input id="password" name="password" type="password" v-model="password" autocomplete="new-password" required
                   class="relative block w-full appearance-none rounded-none rounded-t-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                   placeholder="كلمة المرور الجديدة (8+ حروف، رموز، إلخ)">
          </div>
           <div>
            <label for="confirm-password" class="sr-only">تأكيد كلمة المرور الجديدة</label>
            <input id="confirm-password" name="confirm-password" type="password" v-model="confirmPassword" autocomplete="new-password" required
                   class="relative block w-full appearance-none rounded-none rounded-b-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                   placeholder="تأكيد كلمة المرور الجديدة">
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
            <span :class="{ 'opacity-0': loading }">تحديث كلمة المرور</span>
          </button>
        </div>
      </form>
        <div v-if="!showForm && !loading && !isError" class="text-sm text-center mt-4"> {/* تعديل الشرط */}
          <NuxtLink to="/login" class="font-medium text-olive-green hover:underline">
            العودة لتسجيل الدخول
          </NuxtLink>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient, navigateTo } from '#imports' // لا نحتاج route هنا بالضرورة

const client = useSupabaseClient()
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const isError = ref(false)
const loading = ref(false)
const showForm = ref(false)

onMounted(() => {
  // ننتظر قليلاً للتأكد من معالجة الـ fragment بواسطة Supabase listener
  setTimeout(async () => {
      const { data: { session } } = await client.auth.getSession();
      if (session) {
          // يوجد جلسة صالحة (تم التحقق من الرمز بنجاح)، أظهر نموذج تغيير كلمة المرور
          showForm.value = true;
      } else {
          // لا يوجد جلسة صالحة، الرابط غير صالح أو منتهي الصلاحية
          message.value = 'الرابط المستخدم غير صالح أو انتهت صلاحيته. يرجى طلب رابط جديد.';
          isError.value = true;
          showForm.value = false;
      }
  }, 500);
});

const handleResetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    message.value = 'كلمتا المرور غير متطابقتين.'
    isError.value = true
    return
  }
  // يمكنك إضافة التحقق من قوة كلمة المرور هنا أيضًا

  loading.value = true
  message.value = ''
  isError.value = false

  const { error } = await client.auth.updateUser({
    password: password.value
  })

  loading.value = false

  if (error) {
    console.error('Reset Password Error:', error.message)
    message.value = error.message || 'حدث خطأ أثناء تحديث كلمة المرور.'
    isError.value = true
  } else {
    message.value = 'تم تحديث كلمة المرور بنجاح! سيتم تسجيل خروجك الآن. يمكنك تسجيل الدخول بكلمة المرور الجديدة.'
    isError.value = false
    showForm.value = false // إخفاء النموذج بعد النجاح
    // تسجيل الخروج لإنهاء الجلسة المؤقتة بشكل واضح
    await client.auth.signOut();
    // يمكنك توجيه المستخدم لصفحة الدخول بعد لحظات
    setTimeout(() => navigateTo('/login'), 3000);
  }
}

// تحديد التخطيط الافتراضي
definePageMeta({
  layout: 'default'
})
</script>

<style scoped>
button:disabled span:first-child {
    left: 0.75rem;
}
</style>