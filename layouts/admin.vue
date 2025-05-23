<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans antialiased">
    <!-- Sidebar -->
    <!-- Use v-model for two-way binding, simplifies toggling from parent if needed -->
    <AdminSidebar v-model:isOpenOnMobile="isSidebarOpen" />

    <!-- Overlay for mobile sidebar -->
    <div
      v-if="isSidebarOpen"
      @click="closeSidebar"
      class="fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ease-in-out md:hidden"
      aria-hidden="true"
    ></div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Admin Header -->
      <header class="bg-white dark:bg-gray-800 shadow-md h-16 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 relative z-10">
         <!-- Left side: Mobile Menu & Title -->
         <div class="flex items-center gap-3 sm:gap-4">
             <!-- Mobile Menu Button -->
             <button
                @click="toggleSidebar"
                aria-label="Toggle Navigation"
                class="md:hidden p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <!-- Use a standard hamburger icon -->
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
             </button>

             <!-- Page Title (Dynamic) -->
             <h1 class="text-lg font-semibold text-gray-700 dark:text-gray-200 hidden sm:block truncate">
               {{ pageTitle }}
             </h1>
         </div>

         <!-- Right side: Actions & User Menu -->
         <div class="flex items-center gap-3 sm:gap-4">
            <!-- View Site Link -->
            <NuxtLink
                to="/"
              
                class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150 ease-in-out"
                title="فتح الموقع الرئيسي في تبويب جديد"
            >
                 <!-- External Link Icon -->
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                    <path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clip-rule="evenodd" />
                    <path fill-rule="evenodd" d="M6.25 10.75a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" clip-rule="evenodd" />
                     <path fill-rule="evenodd" d="M10.5 3.25a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-1.5 0v-8.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />

                 </svg>

                 <span class="hidden sm:inline">عرض الموقع</span>
            </NuxtLink>

             <!-- User Dropdown Placeholder -->
             <div class="relative">
               <!-- Replace with your actual User Menu component -->
               <button class="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                 <span class="sr-only">Open user menu</span>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clip-rule="evenodd" />
                </svg>

               </button>
               <!-- Dropdown Panel (Example structure)
               <div v-if="isUserMenuOpen" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                 <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Your Profile</a>
                 <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</a>
                 <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Sign out</a>
               </div>
               -->
             </div>
         </div>
      </header>

      <!-- Page Content -->
      <!-- Ensure scrolling happens here, not the outer container -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
        <!-- The actual page content will be rendered here -->
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
// Use Nuxt's auto-imports for useRoute if configured, otherwise import explicitly
import { useRoute } from 'vue-router';
import AdminSidebar from '~/components/admin/AdminSidebar.vue';

const isSidebarOpen = ref(false);
const route = useRoute();

// --- Dynamic Page Title ---
// Gets the title from the route's meta field, falling back to a default.
// Ensure you set `meta: { title: 'Your Page Name' }` in your page component definitions.
const pageTitle = computed(() => (route.meta?.title as string) || 'لوحة التحكم');

// --- Sidebar Management ---
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

// --- Keyboard Shortcut (Escape to close sidebar) ---
const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isSidebarOpen.value) {
    closeSidebar();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEsc);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc);
  // Ensure body overflow is reset if the component is unmounted while sidebar is open
  document.body.style.overflow = '';
});

// --- Body Scroll Lock (Optional but recommended for mobile) ---
// Prevent body scroll when mobile sidebar is open
watch(isSidebarOpen, (isOpen) => {
  // Check if we are likely on a mobile view (tailwind's md breakpoint is 768px)
  // This check might not be perfectly reliable if window is resized *after* opening.
  // A more robust solution might involve a resize listener or CSS media queries.
  if (window.innerWidth < 768) {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  } else {
     // Ensure overflow is reset if window is wider than mobile breakpoint
     document.body.style.overflow = '';
  }
});

// Close sidebar on route change (useful for mobile SPA navigation)
watch(() => route.path, () => {
    // Only close if it's currently open and likely on mobile
    if (isSidebarOpen.value && window.innerWidth < 768) {
        closeSidebar();
    }
})

</script>

<style scoped>
/* Add any component-specific styles here if needed */
/* For example, fine-tuning transition behavior */
.font-sans {
  font-family: 'Inter', 'ui-sans-serif', 'system-ui', /* Add your preferred Arabic font */ sans-serif;
}
/* Basic scrollbar styling (optional) */
main::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
main::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5); /* gray-400 with opacity */
  border-radius: 4px;
}
main::-webkit-scrollbar-track {
  background-color: transparent;
}
/* Dark mode scrollbar */
.dark main::-webkit-scrollbar-thumb {
    background-color: rgba(75, 85, 99, 0.6); /* gray-600 with opacity */
}
</style>