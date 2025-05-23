<template>
  <div class="flex flex-col min-h-screen bg-beige-light dark:bg-gray-950 text-brown-dark font-sans">
    <!-- 1. رأس الصفحة -->
    <AppHeader /> 

    <!-- 2. المحتوى الرئيسي للصفحة -->
    <main class="flex-grow container mx-auto px-4 py-8">
      <slot /> 
    </main>

    <!-- 3. تذييل الصفحة -->
    <AppFooter /> 
  </div>
</template>

<script setup lang="ts">
// جرب إبقاء هذا القسم فارغًا أولاً، Nuxt يجب أن يكتشف المكونات تلقائيًا
// إذا لم يظهر الهيدر/الفوتر، أضف الاستيراد الصريح:
// import AppHeader from '~/components/AppHeader.vue'
// import AppFooter from '~/components/AppFooter.vue'
</script>

<style>
/* يمكنك إضافة خطوط مخصصة هنا إذا أردت */
body {
  font-family: sans-serif; /* استبدل هذا بالخط الذي تختاره إذا أردت */
}
</style>