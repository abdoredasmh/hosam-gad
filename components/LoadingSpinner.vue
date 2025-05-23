<template>
  <div
    class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
    role="status">
    <span
      class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
    >
      Loading...
    </span>
  </div>
</template>

<script setup lang="ts">
// لا حاجة لـ script في هذا المكون البسيط
</script>

<style scoped>
/* يمكنك إضافة أي تخصيصات إضافية هنا إذا لزم الأمر */
/* يستخدم الكود أعلاه لون 'text-primary' للسبينر.
   تأكد من أن لديك لون primary معرف في tailwind.config.js
   أو قم بتغيير text-primary إلى لون آخر مثل text-olive-green */
.text-primary {
  color: var(--color-olive-green); /* تأكيد استخدام لونك الأساسي */
}
</style>