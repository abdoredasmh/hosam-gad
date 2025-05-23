<!-- components/admin/VideoPreviewModal.vue -->
<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-[60]">

      <TransitionChild
        as="div"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      />

      <div class="fixed inset-0 overflow-y-auto">
        <!-- التعديل هنا: تغيير padding ليكون أصغر على الشاشات الصغيرة -->
        <div class="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <!-- التعديل هنا: استخدام w-full و max-w متجاوب -->
            <DialogPanel class="w-full max-w-sm sm:max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-4 text-left align-middle shadow-xl transition-all">
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex justify-between items-center"
              >
                <span>معاينة الفيديو</span>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </DialogTitle>
              <div class="mt-4 aspect-video">
                <iframe
                  v-if="embedUrl"
                  :src="embedUrl"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  class="w-full h-full"
                ></iframe>
                <div v-else class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                  لا يمكن تحميل الفيديو.
                </div>
              </div>
              <!-- تم الإبقاء على زر الإغلاق معلقًا -->
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';

const props = defineProps<{
  show: boolean;
  videoUrl: string | null;
}>();

const emit = defineEmits(['close']);

const getYoutubeVideoId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      return urlObj.searchParams.get('v');
    }
  } catch (e) {
     
     // زيادة قوة Regex للتعامل مع حالات أكثر (مثل قوائم التشغيل) مع الحفاظ على استخراج معرف الفيديو الأساسي
     const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
     const match = url.match(regex);
     if (match && match[1]) {
        return match[1];
     }
   }
  
  return null;
};

const embedUrl = computed(() => {
  const videoId = getYoutubeVideoId(props.videoUrl);
  if (!videoId) return null;
  // إضافة ?autoplay=1 لتشغيل الفيديو تلقائيًا عند فتح المودال (اختياري)
  // إضافة &modestbranding=1 لإخفاء شعار يوتيوب قليلًا
  // إضافة &rel=0 لمنع عرض الفيديوهات المقترحة من قنوات أخرى في النهاية
  // إضافة &playsinline=1 قد يساعد على تشغيل الفيديو مباشرة في الصفحة على iOS بدلاً من وضع ملء الشاشة الإجباري
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&playsinline=1`;
});

function closeModal() {
  // قد ترغب في إيقاف الفيديو عند الإغلاق لمنع استمرار الصوت في الخلفية
  // هذا يتطلب الوصول إلى iframe وإيقافه، وهو أمر معقد قليلاً.
  // الحل الأبسط هو إعادة تعيين embedUrl إلى null عند الإغلاق (إذا كان ذلك مناسبًا لمنطق التطبيق).
  emit('close');
}
</script>