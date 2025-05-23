<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-lg space-y-8 bg-white p-8 md:p-12 rounded-xl shadow-lg border border-cream-gray">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-brown-dark">
          إنشاء حساب جديد
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          ابدأ رحلتك معنا بخطوات بسيطة.
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSignup">
        <!-- رسائل الخطأ أو النجاح -->
        <div v-if="message" :class="isError ? 'text-red-700 bg-red-100 border-red-300' : 'text-green-700 bg-green-100 border-green-300'" class="text-center text-sm mb-4 p-3 border rounded-md shadow-sm">
          {{ message }}
        </div>

        <!-- استخدام flex-col لترتيب الحقول فوق بعضها بشكل واضح -->
        <div class="flex flex-col gap-y-5 rounded-md shadow-sm -space-y-px">
          <!-- الاسم الكامل -->
          <div class="relative">
            <label for="full-name" class="sr-only">الاسم الكامل</label>
             <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
               </svg>
             </span>
            <input id="full-name" name="full-name" type="text" v-model="fullName" required
                   class="relative block w-full appearance-none rounded-md border border-cream-gray px-3 py-2.5 pl-10 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                   placeholder="الاسم الكامل">
          </div>

          <!-- البريد الإلكتروني -->
           <div class="relative">
             <label for="email-address" class="sr-only">البريد الإلكتروني</label>
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </span>
             <input id="email-address" name="email" type="email" v-model="email" autocomplete="email" required
                    class="relative block w-full appearance-none rounded-md border border-cream-gray px-3 py-2.5 pl-10 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                    placeholder="البريد الإلكتروني">
           </div>

          <!-- كلمة المرور -->
           <div class="relative">
             <label for="password" class="sr-only">كلمة المرور</label>
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                 </svg>
             </span>
             <input id="password" name="password" :type="showPassword ? 'text' : 'password'" v-model="password" autocomplete="new-password" required
                    @input="validatePasswordLength"
                    class="relative block w-full appearance-none rounded-md border border-cream-gray px-3 py-2.5 pl-10 pr-10 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                    placeholder="كلمة المرور (8 حروف على الأقل)">
              <!-- زر إظهار/إخفاء كلمة المرور -->
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-brown-dark focus:outline-none z-10">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              </button>
           </div>
           <!-- إرشادات كلمة المرور المبسطة -->
            <p v-if="password.length > 0" class="mt-2 px-1 text-xs" :class="passwordMeetsLength ? 'text-green-600' : 'text-red-600'">
              {{ passwordMeetsLength ? '✓ طول كلمة المرور مناسب (8 حروف أو أكثر).' : '✗ يجب أن تكون كلمة المرور 8 حروف على الأقل.' }}
            </p>

           <!-- تأكيد كلمة المرور -->
           <div class="relative">
             <label for="confirm-password" class="sr-only">تأكيد كلمة المرور</label>
             <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                     <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
             </span>
             <input id="confirm-password" name="confirm-password" :type="showConfirmPassword ? 'text' : 'password'" v-model="confirmPassword" autocomplete="new-password" required
                    class="relative block w-full appearance-none rounded-md border border-cream-gray px-3 py-2.5 pl-10 pr-10 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                    placeholder="تأكيد كلمة المرور">
               <!-- زر إظهار/إخفاء كلمة المرور للتأكيد -->
               <button type="button" @click="showConfirmPassword = !showConfirmPassword" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-brown-dark focus:outline-none z-10">
                  <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                </button>
           </div>
        </div>

        <div>
          <button type="submit" :disabled="loading || !passwordMeetsLength || password !== confirmPassword"
                  class="group relative flex w-full justify-center rounded-md border border-transparent bg-olive-green py-2.5 px-4 text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-olive-green focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out">
            <span v-if="loading" class="absolute inset-y-0 left-0 flex items-center pl-3">
               <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                 <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            </span>
             <span class="absolute inset-y-0 right-0 flex items-center pr-3" v-else>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 group-disabled:opacity-0 transition-opacity">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
             </span>
            <span :class="{ 'opacity-0': loading }">إنشاء الحساب</span>
          </button>
        </div>
        <div class="text-sm text-center">
          <NuxtLink to="/login" class="font-medium text-olive-green hover:underline hover:text-opacity-80">
            لديك حساب بالفعل؟ تسجيل الدخول
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSupabaseClient, navigateTo } from '#imports'

const client = useSupabaseClient()
const email = ref('')
const password = ref('')
const fullName = ref('')
const confirmPassword = ref('')
const message = ref('')
const isError = ref(false)
const loading = ref(false)
const showPassword = ref(false) // حالة إظهار/إخفاء كلمة المرور
const showConfirmPassword = ref(false) // حالة إظهار/إخفاء تأكيد كلمة المرور

// حالة لتتبع طول كلمة المرور فقط
const passwordMeetsLength = ref(false)

// دالة للتحقق من طول كلمة المرور وتحديث الحالة
const validatePasswordLength = () => {
  passwordMeetsLength.value = password.value.length >= 8
}

const handleSignup = async () => {
  // التحقق من تطابق كلمتي المرور
  if (password.value !== confirmPassword.value) {
    message.value = 'كلمتا المرور غير متطابقتين.'
    isError.value = true
    return
  }

  // التحقق من طول كلمة المرور قبل الإرسال
  if (!passwordMeetsLength.value) {
     message.value = 'يجب أن تكون كلمة المرور 8 حروف على الأقل.'
     isError.value = true
     return
  }

  loading.value = true
  message.value = ''
  isError.value = false

  try {
      const { data, error } = await client.auth.signUp({
        email: email.value,
        password: password.value, // استخدم كلمة المرور بعد التحقق
        options: {
          data: {
            full_name: fullName.value,
          }
        }
      })

      if (error) {
        console.error('Signup Error:', error.message)
        // تحسين رسالة الخطأ لضعف كلمة المرور إذا كانت من Supabase (احتياطي)
        if (error.message.includes('Password should be at least')) {
             message.value = 'كلمة المرور ضعيفة جدًا بحسب سياسة الخادم. يرجى استخدام كلمة مرور أقوى.' // قد تحتاج لتعديلها بناءً على سياسة Supabase
        } else if (error.message.includes('User already registered')) {
             message.value = 'هذا البريد الإلكتروني مسجل بالفعل. حاول تسجيل الدخول.'
        }
         else {
            message.value = error.message || 'حدث خطأ أثناء إنشاء الحساب.'
        }
        isError.value = true
      } else if (data.user) {
          // تحقق إذا كان يحتاج تأكيد البريد
          // Supabase v2: data.user.identities is empty if email confirmation needed
          // Supabase v2: data.session is null if email confirmation needed
          const needsConfirmation = !data.session;

          if (needsConfirmation) {
             message.value = 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق منه لتفعيل حسابك.';
             isError.value = false;
             // توجيه المستخدم لصفحة التأكيد بعد لحظة لعرض الرسالة
             setTimeout(() => navigateTo('/confirm?email=' + encodeURIComponent(email.value)), 3000);
          } else if (data.session) {
              message.value = 'تم إنشاء الحساب وتسجيل الدخول بنجاح!';
              isError.value = false;
              setTimeout(() => navigateTo('/profile'), 1500); // أو إلى لوحة التحكم
          } else {
             // حالة غير متوقعة، ربما نعرض رسالة تأكيد عامة
             message.value = 'تم إنشاء الحساب بنجاح. قد تحتاج لتأكيد بريدك الإلكتروني.';
             isError.value = false;
             setTimeout(() => navigateTo('/confirm?email=' + encodeURIComponent(email.value)), 3000);
          }
      } else {
        message.value = 'حدث خطأ غير متوقع أثناء إنشاء الحساب.';
        isError.value = true;
      }
  } catch (err: any) {
      console.error('Unexpected Signup Error:', err)
      message.value = 'حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.'
      isError.value = true;
  } finally {
       loading.value = false
  }
}

</script>

<style scoped>
/* يمكنك إضافة أي تنسيقات مخصصة هنا إذا لزم الأمر */

/* تعديل بسيط لموضع أيقونة التحميل عند تعطيل الزر */
button:disabled span:first-child {
    left: 0.75rem; /* pl-3 */
}

/* جعل أيقونات الإدخال غير قابلة للتحديد */
.absolute span {
    pointer-events: none;
}

/* تأكد من أن زر العين قابل للنقر */
.absolute button {
    cursor: pointer;
}

/* إخفاء أيقونة الإنشاء عند التعطيل */
button:disabled span:last-child {
  opacity: 0;
}
</style>