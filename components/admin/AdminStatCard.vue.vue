<template>
  <component
    :is="linkTo ? 'NuxtLink' : 'div'"
    :to="linkTo"
    class="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-lg shadow-md border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 group relative"
    :class="{
      'border-yellow-400 dark:border-yellow-600 hover:border-yellow-500 dark:hover:border-yellow-500': warning && !isLoading,
      'cursor-pointer': linkTo
    }"
    v-tooltip="tooltip"
  >
    <div v-if="isLoading" class="animate-pulse">
      <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
      <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
    </div>
    <div v-else class="flex items-center space-x-4 rtl:space-x-reverse">
      <div
        class="p-3 rounded-full flex items-center justify-center"
        :class="getIconBgColor()"
      >
        <!-- استخدم مكتبة أيقونات مثل heroicons أو fontawesome -->
        <component :is="iconComponent" class="h-6 w-6" :class="getIconTextColor()" />
      </div>
      <div>
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
          {{ title }}
        </p>
        <p class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
           :class="{ 'text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-300': warning }"
        >
          {{ formattedValue }}
        </p>
      </div>
       <!-- أيقونة تحذير صغيرة -->
       <span v-if="warning && value !== null && value > 0" class="absolute top-2 right-2 text-yellow-500 dark:text-yellow-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
       </span>
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// افتراض أنك تستخدم مكتبة أيقونات أو مكونات SVG
// import { UserGroupIcon, ChatAlt2Icon, /* ... other icons */ } from '@heroicons/vue/outline'; // مثال لـ Heroicons
// أو
// import IconUsers from '~/components/icons/IconUsers.vue'; // مثال لمكونات SVG محلية

const props = defineProps({
  title: { type: String, required: true },
  value: { type: Number, default: null },
  icon: { type: String, required: true }, // اسم الأيقونة (مثل 'users', 'comments')
  isLoading: { type: Boolean, default: false },
  warning: { type: Boolean, default: false },
  linkTo: { type: String, default: null }, // الرابط الذي ستنتقل إليه البطاقة
  tooltip: { type: String, default: null } // نص التلميح (Tooltip)
});

// لعرض قيمة مناسبة حتى لو كانت null
const formattedValue = computed(() => {
  if (props.value === null || props.value === undefined) {
    return '-'; // أو 'N/A' أو '0' حسب ما تفضل
  }
  // يمكنك إضافة تنسيق للأرقام الكبيرة إذا أردت
  return props.value.toLocaleString('ar-EG'); // تنسيق الأرقام بالعربية
});

// لتحديد مكون الأيقونة بناءً على الاسم (مثال)
const iconComponent = computed(() => {
  // هذا يعتمد بشكل كبير على كيفية تنظيم أيقوناتك
  // مثال بسيط، يمكنك استخدام switch أو object mapping
  // return {
  //   'users': UserGroupIcon,
  //   'comments': ChatAlt2Icon,
  //   // ... باقي الأيقونات
  // }[props.icon] || UserGroupIcon; // أيقونة افتراضية
  return `icon-${props.icon}`; // إذا كنت تستخدم مكونات مثل <icon-users />, <icon-comments />
});

// دوال لتحديد ألوان الأيقونات (يمكن تخصيصها)
const getIconBgColor = () => {
  if (props.warning && !props.isLoading) return 'bg-yellow-100 dark:bg-yellow-900/50';
  // يمكنك تغيير الألوان بناءً على الأيقونة أو نوع الإحصائية
  const colors = ['bg-blue-100 dark:bg-blue-900/50', 'bg-green-100 dark:bg-green-900/50', 'bg-purple-100 dark:bg-purple-900/50', 'bg-red-100 dark:bg-red-900/50'];
  return colors[Math.floor(Math.random() * colors.length)]; // لون عشوائي كمثال
};

const getIconTextColor = () => {
   if (props.warning && !props.isLoading) return 'text-yellow-600 dark:text-yellow-400';
   const colors = ['text-blue-600 dark:text-blue-400', 'text-green-600 dark:text-green-400', 'text-purple-600 dark:text-purple-400', 'text-red-600 dark:text-red-400'];
  return colors[Math.floor(Math.random() * colors.length)]; // لون عشوائي كمثال
};

// ستحتاج إلى تسجيل directive للـ tooltip إذا لم تكن تستخدم مكتبة UI توفره
// مثال بسيط باستخدام v-tooltip (قد تحتاج لتثبيت وإعداد مكتبة tooltip مثل 'v-tooltip')
// import { VTooltip } from 'v-tooltip'; // مثال
// directives: { tooltip: VTooltip },
</script>

<style scoped>
/* يمكنك إضافة تنسيقات v-tooltip هنا إذا لزم الأمر */
</style>