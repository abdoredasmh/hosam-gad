<template>
  <!-- Overlay for mobile when sidebar is open -->
  <div v-if="isOpenOnMobile" @click="closeMobileSidebar" class="fixed inset-0 bg-black/50 z-30 md:hidden" aria-hidden="true"></div>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed inset-y-0 right-0 z-40 flex flex-col bg-gray-800 dark:bg-gray-900 text-gray-100 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:inset-y-auto md:z-auto md:w-64 md:flex-shrink-0',
      isOpenOnMobile ? 'translate-x-0 w-64' : 'translate-x-full w-64' // Slide in/out on mobile
    ]"
     aria-label="الشريط الجانبي للإدارة"
  >
    <div class="h-16 flex items-center justify-between px-4 bg-gray-900 dark:bg-gray-950 flex-shrink-0">
      <NuxtLink to="/admin" class="text-xl font-bold text-white hover:opacity-80 transition-opacity">
        لوحة التحكم
      </NuxtLink>
       <!-- Mobile Close Button -->
       <button @click="closeMobileSidebar" class="md:hidden text-gray-400 hover:text-white">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
             <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
           </svg>
            <span class="sr-only">إغلاق القائمة</span>
       </button>
    </div>

    <!-- ======================== قسم الروابط الرئيسية ======================== -->
    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
      <!-- حلقة تكرارية لإنشاء الروابط من مصفوفة navigation -->
      <NuxtLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        @click="closeMobileSidebar"
        class="flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 group"
        :class="[
          isLinkActive(item.href)
            ? 'bg-primary-600 dark:bg-primary-700 text-white shadow-inner' // تنسيق الرابط النشط (استخدام primary من Tailwind config)
            : 'text-gray-300 hover:bg-gray-700/60 dark:hover:bg-gray-700 hover:text-white' // تنسيق الرابط غير النشط
        ]"
      >
        <!-- أيقونة الرابط -->
        <span
          v-html="item.iconSvg"
          :class="[
            'w-5 h-5 me-3 flex-shrink-0 transition-colors duration-150',
            isLinkActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-200' // لون الأيقونة يتغير حسب حالة الرابط
          ]"
          aria-hidden="true"
        ></span>
        <!-- اسم الرابط -->
        <span>{{ item.name }}</span>
      </NuxtLink>
    </nav>
    <!-- ======================== نهاية قسم الروابط الرئيسية ======================== -->


     <!-- ======================== قسم تسجيل الخروج ======================== -->
     <div class="px-4 py-4 border-t border-gray-700 dark:border-gray-800 mt-auto flex-shrink-0">
        <button @click="handleLogout" class="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors duration-150 group">
             <span v-html="logoutIcon" class="w-5 h-5 me-3 flex-shrink-0 text-red-500 group-hover:text-red-400 transition-colors" aria-hidden="true"></span>
            <span>تسجيل الخروج</span>
        </button>
     </div>
     <!-- ======================== نهاية قسم تسجيل الخروج ======================== -->
  </aside>
</template>

// --- بداية جزء السكربت ---
<script setup lang="ts">
import { ref, computed } from 'vue'; // استيراد الوظائف اللازمة من Vue
import { useSupabaseClient, useRouter, useRoute } from '#imports'; // استيراد وظائف Nuxt و Supabase

// الحصول على instance من Supabase client والـ router والـ route الحالي
const supabase = useSupabaseClient();
const router = useRouter();
const route = useRoute();

// حالة رؤية الشريط الجانبي في وضع الموبايل (يتم التحكم بها من الـ layout الأب)
// نستخدم defineModel للربط ثنائي الاتجاه (two-way binding) مع المكون الأب
const isOpenOnMobile = defineModel<boolean>('isOpenOnMobile', { default: false });

// دالة لإغلاق الشريط الجانبي في الموبايل (ترسل تحديثًا للمكون الأب)
const closeMobileSidebar = () => {
    isOpenOnMobile.value = false;
};

// دالة للتحقق مما إذا كان الرابط الحالي هو النشط
const isLinkActive = (href: string) => {
    // تطابق تام لمسار لوحة التحكم الرئيسية
    if (href === '/admin') {
        return route.path === '/admin';
    }
    // التحقق مما إذا كان المسار الحالي يبدأ بمسار الرابط (للقوائم الفرعية)
    // مع التأكد من أن لوحة التحكم الرئيسية لا تظل نشطة عند الدخول لصفحة فرعية
    return route.path.startsWith(href) && route.path !== '/admin';
};


// --- أيقونات SVG ---
// (نفس تعريفات الأيقونات السابقة: homeIcon, lessonsIcon, ..., settingsIcon, logoutIcon)
const homeIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>`;
const lessonsIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg>`;
const booksIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18.75c1.052 0 2.062.18 3 .512V12.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v6.012c.938-.332 1.95-.512 3-.512a8.987 8.987 0 0 1 3 1.5V4.262a8.967 8.967 0 0 0-3-.512c-1.052 0-2.062.18-3 .512v1.538a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75V6.042Z" /></svg>`;
const categoriesIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>`;
const coursesIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>`;
const quizzesIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-4.5c-.621 0-1.125-.504-1.125-1.125v-3.75c0-.621.504-1.125 1.125-1.125h4.5ZM13.875 8.625v11.25M12 15.375h.008v.008H12v-.008ZM14.625 15.375h.008v.008h-.008v-.008ZM17.25 15.375h.008v.008h-.008v-.008Z" /></svg>`;
const commentsIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-3.04 8.25-7.625 8.25-1.414 0-2.743-.27-3.98-.746a.75.75 0 0 1-.374-.651v-1.05c0-.816.672-1.48 1.488-1.48l.06-.004a8.409 8.409 0 0 0 4.986-7.412c0-.38-.029-.755-.085-1.114a.75.75 0 1 1 1.47-.29c.034.17.053.342.053.516 0 2.398-1.054 4.56-2.792 6.056l-.06.004c-.816 0-1.488.664-1.488 1.48v1.05c0 .33-.116.643-.31.887-.71.865-1.617 1.568-2.662 2.081a9.008 9.008 0 0 1-12.412-9.67 9.009 9.009 0 0 1 6.876-7.133.75.75 0 0 1 .98.613c.012.088.02.177.02.266 0 4.114 2.368 7.62 5.88 9.106a.75.75 0 0 0 .92-.842 8.409 8.409 0 0 0-.548-1.933.75.75 0 1 1 1.341-.686 9.9 9.9 0 0 1 .453 2.35C20.683 10.13 21 11.04 21 12Z" /></svg>`;
const askSheikhIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>`;
const usersIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm-2.25 3.188a3.75 3.75 0 0 0-1.756.044l-2.982 4.163a3.375 3.375 0 0 0 3.268 0l2.982-4.163a3.75 3.75 0 0 0-1.756-.044Z" /></svg>`;
const logoutIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>`;
const calendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-9.75 12h2.25M9.75 16.5h.008v.008H9.75v-.008Zm2.25 0h.008v.008H12v-.008Zm2.25 0h.008v.008H14.25v-.008Zm2.25 0h.008v.008H16.5v-.008Z" /></svg>`;
const userCircleIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`;
// --- <<< أيقونة جديدة للتصحيح اليدوي >>> ---
const clipboardCheckIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.125 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Zm0 0H15M15.75 6.75v10.5a1.5 1.5 0 0 1-1.5 1.5h-9.75a1.5 1.5 0 0 1-1.5-1.5V6.75h12.75Zm-1.125 3.75h.008v.008h-.008v-.008Zm-.938 3.375h.008v.008h-.008v-.008Z" /></svg>`;
// --- نهاية الأيقونة الجديدة ---
// --- نهاية قسم الأيقونات ---


// --- مصفوفة روابط التنقل (تم التعديل والإضافة) ---
const navigation = ref([
  { name: 'لوحة التحكم', href: '/admin', iconSvg: homeIcon },
  { name: 'إدارة الدروس', href: '/admin/lessons', iconSvg: lessonsIcon },
  { name: 'إدارة الكتب', href: '/admin/books', iconSvg: booksIcon },
  { name: 'إدارة الدورات', href: '/admin/study-courses', iconSvg: coursesIcon },
  { name: 'إدارة الاختبارات', href: '/admin/quizzes', iconSvg: quizzesIcon },
  // --- <<< رابط التصحيح اليدوي الجديد >>> ---
  { name: 'التصحيح اليدوي', href: '/admin/grading', iconSvg: clipboardCheckIcon },
  // --- نهاية الرابط الجديد ---
  { name: 'إدارة الإعلانات', href: '/admin/announcements', iconSvg: calendarIcon },
  { name: 'إدارة الفئات', href: '/admin/categories', iconSvg: categoriesIcon },
  { name: 'إدارة التعليقات', href: '/admin/comments', iconSvg: commentsIcon },
  { name: 'اسأل الشيخ', href: '/admin/ask-sheikh', iconSvg: askSheikhIcon },
  { name: 'عن الشيخ', href: '/admin/about-sheikh', iconSvg: userCircleIcon },
  { name: 'إدارة المستخدمين', href: '/admin/users', iconSvg: usersIcon },
  
]);
// --- نهاية مصفوفة روابط التنقل ---


// --- دالة تسجيل الخروج ---
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut(); // محاولة تسجيل الخروج
  if (error) {
     // طباعة الخطأ في الكونسول إذا حدث
  } else {
    router.push('/login'); // إعادة التوجيه إلى صفحة تسجيل الدخول بعد النجاح
  }
};
// --- نهاية دالة تسجيل الخروج ---

</script>
// --- نهاية جزء السكربت ---

// لا يوجد تغييرات في style
<style scoped>
/* تنسيقات مخصصة لشريط التمرير */
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(107, 114, 128, 0.4); border-radius: 10px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(107, 114, 128, 0.6); }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

/* التأكد من أن الشريط الجانبي يأخذ كامل الارتفاع في عمود flex */
aside { display: flex; flex-direction: column; height: 100vh; }

/* إصلاح لمشكلة محتملة في عرض الموبايل حيث يتم دفع الشريط للأسفل */
@media (max-width: 767px) {
  aside.fixed { top: 0; }
}
</style>