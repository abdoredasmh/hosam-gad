<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-lg shadow border border-cream-gray">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-brown-dark">
          تسجيل الدخول إلى حسابك
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <!-- رسائل الخطأ -->
        <div v-if="message" class="text-red-600 text-center text-sm mb-4 p-2 bg-red-100 rounded">
          {{ message }}
        </div>

        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">البريد الإلكتروني</label>
            <input id="email-address" name="email" type="email" v-model="email" autocomplete="email" required
                   class="relative block w-full appearance-none rounded-none rounded-t-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                   placeholder="البريد الإلكتروني">
          </div>
          <div>
            <label for="password" class="sr-only">كلمة المرور</label>
            <input id="password" name="password" type="password" v-model="password" autocomplete="current-password" required
                   class="relative block w-full appearance-none rounded-none rounded-b-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                   placeholder="كلمة المرور">
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
             <NuxtLink to="/forgot-password" class="font-medium text-olive-green hover:underline">          نسيت كلمة المرور؟
           </NuxtLink>
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
            <span :class="{ 'opacity-0': loading }">تسجيل الدخول</span>
          </button>
        </div>
         <div class="text-sm text-center">
          <NuxtLink to="/signup" class="font-medium text-olive-green hover:underline">
            ليس لديك حساب؟ إنشاء حساب جديد
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseClient, navigateTo, useSupabaseUser } from '#imports'

const client = useSupabaseClient()
const user = useSupabaseUser() // للتحقق إذا كان المستخدم مسجلاً بالفعل
const email = ref('')
const password = ref('')
const message = ref('')   // لعرض رسائل الخطأ فقط هنا
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  message.value = '' // مسح أي خطأ سابق

  const { error } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  loading.value = false

  if (error) {
    console.error('Login Error:', error.message)
    message.value = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' // رسالة خطأ عامة أفضل من عرض الخطأ الفعلي
  } else {
    // نجح تسجيل الدخول
    // وحدة Supabase ستحدث حالة `user` تلقائيًا
    // والهيدر سيتغير تلقائيًا
    // توجيه المستخدم للصفحة الرئيسية أو الملف الشخصي
    await navigateTo('/') // أو '/profile'
  }
}

// التحقق إذا كان المستخدم مسجلاً بالفعل عند تحميل الصفحة
// إذا كان كذلك، يتم توجيهه مباشرة للصفحة الرئيسية أو الملف الشخصي
// هذا يمنع المستخدم المسجل من رؤية صفحة تسجيل الدخول مرة أخرى
import { watchEffect } from 'vue' // استيراد watchEffect

watchEffect(() => {
  if (user.value) {
    // يمكن إضافة تأخير بسيط إذا أردت إظهار رسالة ترحيب قبل التوجيه
    // console.log('User already logged in, redirecting...')
    navigateTo('/') // أو '/profile'
  }
})

// تحديد التخطيط (اختياري)
// definePageMeta({
//   layout: 'auth'
// })
</script>

<style scoped>
button:disabled span:first-child {
    left: 0.75rem;
}
</style>