<template>
  <div class="bg-beige-light dark:bg-gray-950 min-h-screen"> 
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
   
      <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-center text-brown-dark dark:text-brown-dark mb-12 md:mb-16 border-b-2 border-olive-green dark:border-golden-calm pb-5 max-w-3xl mx-auto">
        عن الشيخ إبراهيم بشندي
      </h1>

    
      <div v-if="pending" class="text-center py-24">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p class="mt-6 text-lg text-gray-500 dark:text-gray-400 font-medium">جاري تحميل بيانات الشيخ...</p>
      </div>

      
      <div v-else-if="displayError || !sheikhInfo" class="text-center py-12 px-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-300 rounded-xl max-w-lg mx-auto shadow-lg">
         <div class="flex justify-center items-center mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 text-red-500 dark:text-red-400">
             <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z" />
           </svg>
        </div>
        <p class="text-xl font-semibold mb-3">عذراً، حدث خطأ</p>
        <p class="text-base mb-6">{{ displayError?.message || 'لم نتمكن من تحميل بيانات الشيخ المطلوبة.' }}</p>
        <button @click="refresh" class="px-6 py-2.5 bg-primary hover:bg-opacity-90 text-white text-base font-medium rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-950 shadow-md hover:shadow-lg">
          إعادة المحاولة
        </button>
      </div>

    
      <div v-else class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16 lg:gap-20"> 

         
          <aside class="lg:col-span-1 lg:sticky lg:top-20 self-start"> 
            <div class="bg-beige-light/70 dark:bg-gray-800/80 rounded-xl shadow-xl overflow-hidden border border-cream-gray/50 dark:border-gray-700/60 p-6 md:p-7"> 
              <NuxtImg
                :src="sheikhInfo.profile_image_url || '/images/placeholder-sheikh.jpg'"
                alt="صورة الشيخ إبراهيم بشندي"
                class="rounded-lg w-full h-auto object-cover aspect-[4/3] transition-transform duration-500 ease-in-out hover:scale-105 shadow-lg ring-1 ring-black/5 dark:ring-white/10" 
                sizes="sm:100vw md:300px lg:400px"
                format="webp"
                quality="90" 
                loading="lazy"
                :placeholder="[60, 45, 75, 5]"
              />

             
              <div v-if="contactLinks.length > 0" class="mt-8 pt-6 border-t border-cream-gray dark:border-gray-700/50 contact-links">
                 
                  <h3 class="text-xl font-semibold text-brown-dark dark:text-brown-dark mb-5">للتواصل مع الشيخ:</h3>
                  <ul class="space-y-2"> 
                      <li v-for="link in contactLinks" :key="link.platform"
                          class="flex items-center space-x-reverse space-x-4 group p-3 hover:bg-cream-gray/30 dark:hover:bg-gray-700/40 rounded-lg transition-colors duration-200"> 
                          <span class="flex-shrink-0 w-7 h-7 text-olive-green dark:text-golden-calm group-hover:text-primary dark:group-hover:text-primary-300 transition-colors duration-200" v-html="getIconForPlatform(link.platform)"> 
                          </span>

                          <div class="flex-grow min-w-0"> 
                             
                              <a v-if="!isPhonePlatform(link.platform)"
                                :href="link.url"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-base text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-300 hover:underline break-words font-medium transition-colors duration-200 block truncate" 
                                :title="`تواصل عبر ${formatPlatformName(link.platform)}`">
                                  {{ formatPlatformName(link.platform) }}
                              </a>

                            
                              <button v-else
                                      type="button"
                                      @click="copyPhoneNumber(link.url, link.platform)"
                                      class="text-base text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-300 hover:underline font-medium transition-all duration-200 ease-in-out focus:outline-none text-right w-full" 
                                      :class="{ 'text-green-600 dark:text-green-400 font-bold': copiedPlatform === link.platform }"
                                      :title="`اضغط لنسخ رقم الهاتف`">
                                  <span v-if="copiedPlatform === link.platform" class="flex items-center justify-end"> 
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 ml-1.5"> 
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                      </svg>
                                      تم النسخ بنجاح!
                                  </span>
                                  <span v-else>
                                      {{ formatPlatformName(link.platform) }} <span class="text-xs opacity-70">(اضغط للنسخ)</span> 
                                  </span>
                              </button>
                           </div>
                      </li>
                  </ul>
                   <p v-if="copyError" class="mt-4 text-sm text-red-600 dark:text-red-400 text-center">{{ copyError }}</p> 
              </div>
            </div>
          </aside>

         
          <main class="lg:col-span-2">
            <article class="bg-white dark:bg-gray-800/70 rounded-xl shadow-xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 p-8 md:p-10 lg:p-12"> 
              
              <blockquote v-if="sheikhInfo.short_bio" class="relative mb-10 md:mb-12 border-r-[5px] border-olive-green dark:border-golden-calm pr-6 md:pr-8 italic bg-cream-gray/20 dark:bg-gray-700/30 p-5 rounded-lg shadow-inner"> 
                <p class="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-200">
                  {{ sheikhInfo.short_bio }}
                </p>
                 <span class="absolute top-1 right-1 -mr-3 text-6xl text-olive-green/20 dark:text-golden-calm/20 font-serif opacity-40 select-none">“</span>
              </blockquote>

             
            
              <h2 class="text-2xl md:text-3xl font-semibold text-brown-dark dark:text-brown-dark mb-6 md:mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
                السيرة الذاتية
              </h2>
            
              <div v-if="sheikhInfo.full_bio"
                   class="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 bio-content"
                   v-html="formatBio(sheikhInfo.full_bio)">
              </div>
              <p v-else class="text-gray-500 dark:text-gray-400 mt-8 text-lg"> 
                لا تتوفر حالياً سيرة ذاتية مفصلة للشيخ.
              </p>
            </article>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSupabaseClient, useAsyncData, useHead } from '#imports';
import type { Database, Tables } from '~/types/database.types';

// --- أنواع البيانات ---
type SheikhInfoClean = {
  short_bio: string | null;
  full_bio: string | null;
  profile_image_url: string | null;
  contact_info: ContactInfo | null;
} | null;

type AboutSheikhInfo = Tables<'about_sheikh'> | null;
interface ContactInfo {
  [key: string]: string | null | undefined;
}

// --- Supabase Client ---
const client = useSupabaseClient<Database>();

// --- حالة النسخ ورسالة الخطأ ---
const copiedPlatform = ref<string | null>(null);
const copyError = ref<string | null>(null);
let copyTimeout: ReturnType<typeof setTimeout> | null = null;

// --- جلب البيانات ---
const { data: sheikhInfo, pending, error: rawError, refresh } = await useAsyncData<SheikhInfoClean>(
  'aboutSheikhData',
  async () => {
    const { data, error } = await client
      .from('about_sheikh')
      .select('short_bio, full_bio, profile_image_url, contact_info')
      .eq('id', 1) // Adjust ID if necessary
      .maybeSingle();

    if (error) {
      
       throw error;
    }
    return data;
  },
  {
    transform: (rawData: AboutSheikhInfo): SheikhInfoClean => {
      if (!rawData) return null;
      const cleanData: SheikhInfoClean = {
        short_bio: rawData.short_bio ?? null,
        full_bio: rawData.full_bio ?? null,
        profile_image_url: rawData.profile_image_url ?? null,
        contact_info: null,
      };
      if (rawData.contact_info && typeof rawData.contact_info === 'object' && Object.keys(rawData.contact_info).length > 0) {
          try {
              cleanData.contact_info = JSON.parse(JSON.stringify(rawData.contact_info));
          } catch (e) {
              
              cleanData.contact_info = null;
          }
      }
      return cleanData;
    },
    // lazy: true, // Uncomment if needed
    // default: () => ({ short_bio: null, full_bio: null, profile_image_url: null, contact_info: null }) // Needed if lazy: true
  }
);

// --- SEO Meta ---
const pageTitle = computed(() => sheikhInfo.value?.short_bio ? `عن الشيخ إبراهيم بشندي - ${sheikhInfo.value.short_bio.substring(0, 40)}...` : 'عن الشيخ إبراهيم بشندي');
const pageDescription = computed(() => sheikhInfo.value?.short_bio || 'تعرف على سيرة الشيخ إبراهيم بشندي، نشأته العلمية، ومسيرته الدعوية من خلال موقعه الرسمي.');
const pageImage = computed(() => sheikhInfo.value?.profile_image_url || '/images/placeholder-sheikh.jpg');

useHead({
  title: pageTitle,
  meta: [
    { name: 'description', content: pageDescription },
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:image', content: pageImage },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: pageDescription },
    { name: 'twitter:image', content: pageImage },
  ]
});

// --- Handle Error ---
const displayError = computed(() => {
  if (!rawError.value) return null;
  // Provide more user-friendly messages based on potential error types if possible
  return { message: rawError.value.message || 'حدث خطأ غير متوقع أثناء تحميل البيانات.' };
});

// --- Contact Links ---
const contactLinks = computed(() => {
  if (!sheikhInfo.value?.contact_info || typeof sheikhInfo.value.contact_info !== 'object') return [];
  const contacts = sheikhInfo.value.contact_info as ContactInfo;
  const platformOrder = ['whatsapp', 'telegram', 'phone', 'facebook', 'youtube', 'twitter', 'instagram', 'tiktok', 'email'];
  return Object.entries(contacts)
    .filter(([key, url]) => url && typeof url === 'string' && url.trim() !== '')
    .map(([platform, url]) => ({ platform, url: url as string }))
    .sort((a, b) => {
        const indexA = platformOrder.indexOf(a.platform.toLowerCase());
        const indexB = platformOrder.indexOf(b.platform.toLowerCase());
        // Put unknown platforms at the end
        if (indexA === -1 && indexB === -1) return a.platform.localeCompare(b.platform); // Sort unknown alphabetically
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
     });
});

// --- Helper Functions ---

/**
 * Checks if the platform is considered a phone number type.
 */
function isPhonePlatform(platform: string): boolean {
    const lowerPlatform = platform.toLowerCase();
    return lowerPlatform === 'phone' || lowerPlatform === 'هاتف';
}

/**
 * Extracts the raw phone number (without 'tel:') from the URL.
 */
function getRawPhoneNumber(url: string): string {
  if (url.startsWith('tel:')) {
    return url.substring(4);
  }
  // If it doesn't start with tel:, assume it's just the number
  
  return url;
}

/**
 * Copies the phone number to the clipboard.
 */
async function copyPhoneNumber(url: string, platform: string) {
  const numberToCopy = getRawPhoneNumber(url);
  copyError.value = null;

  if (!navigator.clipboard) {
    
    copyError.value = 'عذراً، خاصية النسخ غير متاحة في متصفحك.';
    return;
  }

  try {
    await navigator.clipboard.writeText(numberToCopy);
    copiedPlatform.value = platform;

    if (copyTimeout) clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copiedPlatform.value = null;
      copyTimeout = null;
    }, 2500);

  } catch (err) {
    
    copyError.value = 'فشل نسخ الرقم. الرجاء المحاولة يدوياً.';
    copiedPlatform.value = null;
  }
}

/**
 * Returns the appropriate SVG icon string based on the platform name.
 */
function getIconForPlatform(platform: string): string {
    const lowerPlatform = platform.toLowerCase();
    // (Keep the SVG variables as defined in the previous script block)
    if (lowerPlatform.includes('email') || lowerPlatform.includes('بريد')) return svgIconEmail;
    if (isPhonePlatform(platform)) return svgIconPhone;
    if (lowerPlatform.includes('telegram')) return svgIconTelegram;
    if (lowerPlatform.includes('whatsapp') || lowerPlatform.includes('واتس')) return svgIconWhatsapp;
    if (lowerPlatform.includes('facebook') || lowerPlatform.includes('فيس')) return svgIconFacebook;
    if (lowerPlatform.includes('twitter') || lowerPlatform.includes('اكس') || lowerPlatform === 'x') return svgIconTwitter;
    if (lowerPlatform.includes('youtube') || lowerPlatform.includes('يوتيوب')) return svgIconYoutube;
    if (lowerPlatform.includes('instagram') || lowerPlatform.includes('انستا')) return svgIconInstagram;
    if (lowerPlatform.includes('tiktok') || lowerPlatform.includes('تيك')) return svgIconTiktok;
    return svgIconLink; // Default link icon
}

/**
 * Formats the platform key into a user-friendly name.
 */
function formatPlatformName(platform: string): string {
    const nameMap: { [key: string]: string } = {
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        هاتف: 'الهاتف',
        telegram: 'تيليجرام',
        whatsapp: 'واتساب',
        facebook: 'فيسبوك',
        twitter: 'تويتر / X',
        x: 'تويتر / X',
        youtube: 'يوتيوب',
        instagram: 'انستغرام',
        tiktok: 'تيك توك',
    };
    const lowerPlatform = platform.toLowerCase();
    // Return mapped name or format the key itself nicely
    return nameMap[lowerPlatform] || platform
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word if not mapped
}

// --- *** دالة التصحيح هنا *** ---
/**
 * Formats the full bio text, replacing newline characters with <br> tags.
 * Basic sanitization to prevent XSS.
 */
function formatBio(text: string | null): string {
    if (!text) return '';
    // 1. Escape basic HTML characters to prevent XSS
    const escapedText = text
        .replace(/&/g, "&")
        .replace(/</g, "<")
        .replace(/>/g, ">")
        .replace(/"/g, "") 
        .replace(/"/g, "'");
    // 2. Replace newline characters with <br> tags
    return escapedText.replace(/\r\n|\r|\n/g, '<br>');
}

// --- SVG Icons (Keep these defined) ---
const svgIconEmail = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>`;
const svgIconPhone = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" /></svg>`;
const svgIconTelegram = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.17.91-.497 1.205-.82 1.23-.696.054-1.22-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.04-.249-.024c-.106.024-1.793 1.14-5.061 3.346-.48.33-.913.49-1.303.48-.4-.01-.79-.145-1.09-.29-.39-.19-.58-.44-.58-1.03 0-.52.24-.76.68-.98.44-.22 1.07-.46 1.8-.66 3.25-.906 4.85-1.4 5.18-1.5.11-.03.3-.12.39-.24.09-.12.08-.28-.03-.4-.11-.12-.27-.15-.44-.13-.17.02-1.1.34-3.15 1.18-.88.36-1.6.67-2.1.88-.5.2-.93.34-1.27.42-.34.08-.68.12-.98.11-.41-.01-.88-.1-1.28-.25-.76-.27-1.33-.65-1.66-1.09-.13-.17-.24-.38-.3-.61-.06-.23-.07-.48-.04-.73.03-.25.1-.49.21-.72.11-.23.25-.44.42-.63.17-.19.37-.36.59-.5.22-.14.46-.26.72-.35.26-.09.54-.16.82-.21.28-.05.57-.08.86-.09h.57c.39 0 .77.03 1.14.09.37.06.73.15 1.07.27.34.12.67.28.98.46.31.18.6.4.86.65.26.25.5.54.68.85.18.31.3.66.36 1.02.06.36.05.73-.02 1.08-.07.35-.2 1.08-.2 1.08z"/></svg>`;
const svgIconWhatsapp = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.47 1.32 4.91L2 22l5.3-1.42c1.38.78 2.96 1.21 4.61 1.21h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm.01 18.11c-1.54 0-3.03-.4-4.32-1.15l-.31-.18-3.22.85.87-3.14-.2-.33c-.83-1.38-1.28-2.98-1.28-4.68 0-4.48 3.65-8.13 8.14-8.13 2.18 0 4.21.84 5.75 2.38s2.38 3.57 2.38 5.75-3.65 8.13-8.13 8.13zm4.5-5.95c-.25-.12-1.47-.73-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.98-.14.17-.29.18-.54.06-.25-.12-1.06-.39-2.02-1.24-.75-.66-1.25-1.48-1.4-1.73-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.76 2.69 4.27 3.77 1.51.64 2.04.79 2.64.73.71-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.14-1.18-.07-.1-.23-.16-.48-.28z"/></svg>`;
const svgIconFacebook = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>`;
const svgIconTwitter = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
const svgIconYoutube = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path fill-rule="evenodd" d="M19.8 6.2c.4.4.7 1 .7 1.6v8.4c0 .6-.3 1.2-.7 1.6-.4.4-1 .7-1.6.7H5.8c-.6 0-1.2-.3-1.6-.7-.4-.4-.7-1-.7-1.6V7.8c0-.6.3-1.2.7-1.6.4-.4 1-.7 1.6-.7h12.4c.6 0 1.2.3 1.6.7zM9.8 14.9V9.1l5.2 2.9-5.2 2.9z" clip-rule="evenodd"/></svg>`;
const svgIconInstagram = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path fill-rule="evenodd" d="M12 2c-2.7 0-3 .01-4.06.06-1.06.05-1.8.22-2.45.48-.67.27-1.26.64-1.83 1.2-.58.58-.96 1.17-1.22 1.84-.26.64-.43 1.39-.48 2.45C2.01 9 2 9.3 2 12s.01 3 .06 4.06c.05 1.06.22 1.8.48 2.45.27.67.64 1.26 1.2 1.83.58.58 1.17.96 1.84 1.22.64.26 1.39.43 2.45.48 1.06.05 1.36.06 4.06.06s3-.01 4.06-.06c1.06-.05 1.8-.22 2.45-.48.67-.27 1.26-.64 1.83-1.2.58-.58.96-1.17 1.22-1.84.26-.64.43-1.39-.48-2.45.05-1.06.06-1.36.06-4.06s-.01-3-.06-4.06c-.05-1.06-.22-1.8-.48-2.45-.27-.67-.64-1.26-1.2-1.83-.58-.58-1.17-.96-1.84-1.22-.64-.26-1.39-.43-2.45-.48C15 2.01 14.7 2 12 2zm0 1.8c2.67 0 2.97.01 4.02.06 1.01.05 1.5.2 1.8.34.42.17.72.39.98.66.27.27.5.57.66.98.14.3.29.79.34 1.8.05 1.05.06 1.35.06 4.02s-.01 2.97-.06 4.02c-.05 1.01-.2 1.5-.34 1.8-.17.42-.39.72-.66.98-.27.27-.57.5-.98.66-.3.14-.79.29-1.8.34-1.05.05-1.35.06-4.02.06s-2.97-.01-4.02-.06c-1.01-.05-1.5-.2-1.8-.34-.42-.17-.72-.39-.98-.66-.27-.27-.5-.57-.66.98-.14-.3-.29-.79-.34-1.8-.05-1.05-.06-1.35-.06-4.02s.01-2.97.06-4.02c.05-1.01.2-1.5.34-1.8.17-.42.39.72.66.98.27-.27.57.5.98-.66.3-.14.79.29 1.8-.34C9.03 3.81 9.33 3.8 12 3.8zm0 4.16c-2.4 0-4.36 1.96-4.36 4.36s1.96 4.36 4.36 4.36 4.36-1.96 4.36-4.36S14.4 7.96 12 7.96zm0 7.02c-1.47 0-2.66-1.19-2.66-2.66s1.19-2.66 2.66-2.66 2.66 1.19 2.66 2.66-1.19 2.66-2.66 2.66zm4.87-7.86c0 .6-.48 1.08-1.08 1.08s-1.08-.48-1.08-1.08.48-1.08 1.08-1.08 1.08.48 1.08 1.08z" clip-rule="evenodd"/></svg>`;
const svgIconTiktok = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-.81 1.15-1.94 1.96-3.32 2.36-1.37.4-2.88.41-4.28.03-1.4-.38-2.65-1.1-3.63-2.15C1.71 21.33 1 19.86.58 18.29.17 16.73 0 15.11 0 13.46c0-1.55.16-3.1.58-4.61.41-1.5 1.11-2.86 2.15-3.93C3.8 3.81 5.27 3.09 6.84 2.66c1.57-.43 3.2-.42 4.77-.02.01 2.18-.01 4.36.01 6.54.01.2-.07.39-.21.51-.14.12-.33.2-.51.2-.19 0-.38-.07-.52-.2-.14-.12-.21-.31-.22-.51-.02-2.18.01-4.36-.01-6.54-.03-.19-.06-.37-.1-.56-.32-.09-.64-.17-.97-.23C9.11 1.8 8.46 1.42 7.9 1.12c-1.1-.61-1.86-1.6-2.42-2.75C5.02 2.01 4.58 2.6 4.58 5.08c0 3.04-.02 6.08.01 9.12.01.84.32 1.67.86 2.37.53.7 1.27 1.2 2.12 1.47.85.27 1.76.32 2.65.15.89-.17 1.7-.62 2.32-1.25.62-.63 1.04-1.45 1.2-2.35.16-.9.15-1.85.02-2.78-.03-2.91-.01-5.82.01-8.74Z"/></svg>`;
const svgIconLink = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-full h-full"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>`;

</script>