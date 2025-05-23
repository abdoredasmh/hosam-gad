<template>
  <div
    class="flex items-center justify-center rounded-full overflow-hidden flex-shrink-0"
    :class="sizeClasses"
  >
    <img
      v-if="avatarUrl && !showInitial"
      :src="avatarUrl"
      :alt="altText"
      class="w-full h-full object-cover"
      loading="lazy"
      @error="handleImageError"
    />
    <div
      v-else-if="initial"
      :class="[
        'w-full h-full flex items-center justify-center font-semibold',
        initialBgColor,
        initialTextColor,
      ]"
      :title="altText"
      aria-hidden="true"
    >
      {{ initial }}
    </div>
    <div
      v-else
      :class="[
        'w-full h-full flex items-center justify-center',
        initialBgColor,
        initialTextColor,
      ]"
      :title="altText"
      aria-hidden="true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-2/3 h-2/3" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 2a5 5 0 100 10 5 5 0 000-10zM2 16.5A7.5 7.5 0 0110 9a7.5 7.5 0 018 7.5v.25a.25.25 0 01-.25.25H2.25a.25.25 0 01-.25-.25v-.25z" clip-rule="evenodd" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps({
  avatarUrl: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'md', // 'xs', 'sm', 'md', 'lg', 'xl'
    validator: (value: string) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
  },
  initialBgColor: {
    type: String,
    default: 'bg-gray-200 dark:bg-gray-700', // لون افتراضي للخلفية
  },
  initialTextColor: {
    type: String,
    default: 'text-gray-600 dark:text-gray-300', // لون افتراضي للنص
  },
})

// Internal state to track if image failed and we should show initial/icon
const showInitial = ref(false)

// Calculate the initial character from the name
const initial = computed(() => {
  return props.name?.trim()?.[0]?.toUpperCase() || null
})

// Generate alt text for the image or title for the fallback
const altText = computed(() => {
  return props.name ? `الصورة الرمزية لـ ${props.name}` : 'الصورة الرمزية للمستخدم'
})

// Determine size classes based on the size prop
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-6 h-6 text-xs';
    case 'sm': return 'w-8 h-8 text-sm';
    case 'lg': return 'w-12 h-12 text-lg';
    case 'xl': return 'w-16 h-16 text-xl';
    case 'md':
    default:   return 'w-10 h-10 text-base';
  }
})

// Watch for changes in avatarUrl to reset the error state
watch(() => props.avatarUrl, (newUrl) => {
  showInitial.value = !newUrl; // Reset based on whether the new URL is truthy
}, { immediate: true }); // Run immediately to set initial state

// Handle image loading errors
const handleImageError = () => {
  
  showInitial.value = true; // Show fallback if image fails
}
</script>