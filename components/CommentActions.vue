<template>
  <div v-if="canShowActions" class="relative">
    <button
      @click.stop="toggleDropdown"
      :aria-label="`إجراءات ${itemType === 'comment' ? 'التعليق' : 'الرد'}`"
      aria-haspopup="true"
      :aria-expanded="isOpen.toString()"
      class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none p-1 -m-1 rounded-full"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 11.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 17a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
      </svg>
    </button>

    <!-- القائمة المنسدلة -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        ref="dropdownMenuRef"
        class="origin-top-right rtl:origin-top-left absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 z-20"
      >
        <div class="py-1" role="menu" aria-orientation="vertical">
          <!-- زر الرد (فقط للتعليقات الرئيسية، وللمستخدم المسجل وغير الموقوف) -->
          <button
            v-if="itemType === 'comment' && user"
            @click="emitAndClose('reply')"
            :disabled="isCommentingSuspended" 
            class="flex items-center gap-2 w-full text-right rtl:text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            role="menuitem"
             :title="isCommentingSuspended ? 'التعليق موقوف حاليًا' : 'الرد على هذا التعليق'"
          >
             <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
               <path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span>رد</span>
          </button>

          <!-- أزرار التعديل والحذف (فقط للمالك) -->
          <template v-if="isOwner">
            <button
              @click="emitAndClose('edit')"
              class="flex items-center gap-2 w-full text-right rtl:text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700"
              role="menuitem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
              <span>تعديل</span>
            </button>
            <button
              @click="emitAndClose('delete')"
              class="flex items-center gap-2 w-full text-right rtl:text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300"
              role="menuitem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
              <span>حذف</span>
            </button>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, type PropType } from 'vue' // Import PropType
import type { Database } from '~/types/database.types' // تأكد من المسار الصحيح

type CommentOrReply = Database['public']['Tables']['comments']['Row']

const props = defineProps({
  item: {
      type: Object as PropType<CommentOrReply>,
      required: true
  },
  itemType: {
      type: String as PropType<'comment' | 'reply'>,
      required: true
  },
  isCommentingSuspended: { // Add the new prop
      type: Boolean,
      default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'reply'])

const user = useSupabaseUser()
const isOpen = ref(false)
const dropdownMenuRef = ref<HTMLElement | null>(null)

const isOwner = computed(() => user.value && user.value.id === props.item.user_id)

// تحديد ما إذا كان يجب إظهار زر النقاط الثلاث أصلاً
const canShowActions = computed(() => {
    if (!user.value && !isOwner.value) return false;
    if (isOwner.value) return true;
    // Show only if user is logged in AND it's a comment (for reply button) AND commenting is NOT suspended
    if (user.value && props.itemType === 'comment' && !props.isCommentingSuspended) {
        return true;
    }
    // Otherwise hide
    return false;
})

const toggleDropdown = () => { isOpen.value = !isOpen.value }

const handleClickOutside = (event: MouseEvent) => { /* ... as before ... */
  if (dropdownMenuRef.value && !dropdownMenuRef.value.contains(event.target as Node)) {
    const toggleButton = dropdownMenuRef.value.parentElement?.querySelector('button');
    if (!toggleButton || !toggleButton.contains(event.target as Node)) { isOpen.value = false }
  }
}

const handleEscapeKey = (event: KeyboardEvent) => { /* ... as before ... */
  if (event.key === 'Escape') { isOpen.value = false; }
};

watch(isOpen, (newValue) => { /* ... as before ... */
  if (newValue) { document.addEventListener('click', handleClickOutside, true); document.addEventListener('keydown', handleEscapeKey); }
  else { document.removeEventListener('click', handleClickOutside, true); document.removeEventListener('keydown', handleEscapeKey); }
});

onUnmounted(() => { /* ... as before ... */
  document.removeEventListener('click', handleClickOutside, true); document.removeEventListener('keydown', handleEscapeKey);
})

const emitAndClose = (action: 'edit' | 'delete' | 'reply') => { /* ... as before ... */
  // Prevent emitting reply if suspended (extra safety)
  if (action === 'reply' && props.isCommentingSuspended) {
      isOpen.value = false;
      return;
  }
  emit(action); isOpen.value = false
}
</script>