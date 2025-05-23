<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
    <!-- قسم العنوان (اختياري) -->
    <div v-if="$slots.title" class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold leading-6 text-[color:var(--color-brown-dark)] dark:text-[color:var(--color-beige-light)]">
        <!-- هنا سيتم إدخال محتوى العنوان من الأب -->
        <slot name="title"></slot>
      </h3>
    </div>

    <!-- قسم المحتوى الرئيسي -->
    <div class="px-6 py-5">
      <!-- هنا سيتم إدخال المحتوى الرئيسي من الأب -->
      <slot name="content"></slot>
       <!-- يمكن استخدام الـ slot الافتراضي أيضًا إذا لم يتم تحديد اسم "content" -->
       <slot></slot>
    </div>

     <!-- قسم التذييل (اختياري) -->
     <div v-if="$slots.footer" class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
         <slot name="footer"></slot>
     </div>
  </div>
</template>

<script setup lang="ts">
// هذا المكون لا يحتاج إلى أي منطق JavaScript خاص به في الوقت الحالي
// يعتمد كليًا على Slots والتنسيق
</script>

<style scoped>
/* يمكنك إضافة تنسيقات خاصة بالبطاقة هنا إذا لزم الأمر */
</style>