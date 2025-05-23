<template>
  <div>
    <!-- 1. Hero Section -->
    <section class="bg-gradient-to-br from-beige-light via-cream-gray to-yellow-50 py-20 px-6 relative overflow-hidden">
      <div class="container mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
        <div class="md:w-2/3 z-10">
          <!-- العنوان يستخدم اللون الأساسي الذي يتغير تلقائياً عبر متغيرات CSS -->
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-olive-green mb-4">
             فضيلة الشيخ حسام جاد
          </h1>
          <p v-if="pending && !aboutData" class="text-lg text-brown-dark dark:text-gray-300 leading-relaxed mb-6">
            جاري تحميل النبذة...
          </p>
          <p v-else-if="error && !aboutData" class="text-lg text-red-500 leading-relaxed mb-6">
            لم يتم تحميل النبذة.
          </p>
          <!-- النص التمهيدي يستخدم الألوان الرمادية القياسية للوضع الداكن (يمكن تخصيصها أكثر إذا أردت) -->
          <p v-else class="text-lg text-brown-dark dark:text-gray-300 leading-relaxed mb-6">
            {{ aboutData?.short_bio || 'نبذة مختصرة عن حياة الشيخ حسام جاد ومسيرته العلمية والدعوية...' }}
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-8">
            <NuxtLink to="/about" class="btn-primary">
              المزيد عن الشيخ
            </NuxtLink>
            <!-- Dynamic Button for Live/Upcoming Lecture -->
            <button
              v-if="upcomingLectureOrLive?.link"
              @click="openLiveStreamModal(upcomingLectureOrLive)"
              :aria-label="`مشاهدة ${upcomingLectureOrLive?.type === 'live' ? 'البث المباشر' : 'المحاضرة'}: ${upcomingLectureOrLive?.title}`"
              :class="[
                'inline-flex items-center gap-2 py-3 px-6 md:px-8 rounded-md transition-all duration-300 text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
                isLiveNow(upcomingLectureOrLive?.date) && upcomingLectureOrLive?.type === 'live' ? 'btn-live' : '',
                isLiveNow(upcomingLectureOrLive?.date) && upcomingLectureOrLive?.type === 'lecture' ? 'btn-lecture-now' : '',
                !isLiveNow(upcomingLectureOrLive?.date) ? 'btn-upcoming' : ''
              ]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
              </svg>
              <span>
                {{ getHeroButtonText(upcomingLectureOrLive) }}
              </span>
            </button>
          </div>
        </div>
        <div class="md:w-1/3 flex justify-center md:justify-start z-10">
          <NuxtImg
            :src="aboutData?.profile_image_url || '/images/placeholder-sheikh.jpg'"
            alt="صورة الشيخ إبراهيم بشندي"
            class="rounded-lg shadow-xl w-64 h-64 md:w-72 md:h-72 object-cover border-4 border-white dark:border-gray-700"
            sizes="256px md:288px" format="webp" quality="85" loading="lazy" :placeholder="[60, 60, 75, 5]" />
        </div>
      </div>
      <!-- Background decorative elements -->
      <div class="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-olive-green/10 dark:bg-olive-green/5 rounded-full opacity-30 blur-3xl z-0 pointer-events-none"></div>
      <div class="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-golden-calm/10 dark:bg-golden-calm/5 rounded-full opacity-30 blur-3xl z-0 pointer-events-none"></div>
    </section>

    <!-- 2. مواعيد الدروس والإعلانات -->
    <section class="py-16 px-4 bg-white dark:bg-gray-900">
      <div class="container mx-auto">
        <!-- تم التعديل: dark:text-brown-dark -->
        <h2 class="text-3xl font-bold text-center text-brown-dark dark:text-brown-dark mb-10">
          مواعيد الدروس والإعلانات
        </h2>
        <div v-if="pending" class="text-center py-10 text-gray-500 dark:text-gray-400">جاري تحميل المواعيد...</div>
        <div v-else-if="error && !data?.announcements" class="text-center py-10 text-red-500">حدث خطأ أثناء تحميل المواعيد.</div>
        <!-- Updated Check: Ensure filteredAnnouncements exists and has length -->
        <div v-else-if="!filteredAnnouncements || !filteredAnnouncements.length" class="text-center py-10 text-gray-500 dark:text-gray-400">لا توجد مواعيد أو إعلانات (غير البث المباشر) حاليًا.</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <!-- Loop through filteredAnnouncements which excludes 'live' and the hero item -->
          <div v-for="item in filteredAnnouncements" :key="item.id" class="bg-beige-light/70 dark:bg-gray-800 p-5 rounded-lg shadow-md border border-cream-gray dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-start hover:shadow-lg transition-shadow duration-300">
            <div class="flex-shrink-0 w-full sm:w-24 text-center sm:text-right">
              <span :class="['px-2.5 py-1 inline-block text-xs font-semibold rounded mb-1.5', getTagClass(item.type)]">
                {{ getTypeText(item.type) }}
              </span>
              <div v-if="item.date" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ formatDate(item.date) }}
              </div>
               <div v-else class="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                 (بدون تاريخ محدد)
               </div>
            </div>
            <div class="flex-grow">
              <!-- تم التعديل: dark:text-brown-dark -->
              <h3 class="font-semibold text-brown-dark dark:text-brown-dark mb-2 text-lg">{{ item.title }}</h3>
              <p v-if="item.details" class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">{{ item.details }}</p>
              <!-- Link logic remains the same -->
              <NuxtLink v-if="item.link && item.type === 'announcement'" :to="item.link" target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline mt-auto inline-block">التفاصيل</NuxtLink>
              <NuxtLink v-else-if="item.link && item.type === 'lecture'" :to="item.link" target="_blank" rel="noopener noreferrer" class="text-sm text-primary hover:underline mt-auto inline-block">مشاهدة المحاضرة</NuxtLink>
              <NuxtLink v-else-if="!item.link && item.type === 'lecture'" to="/lessons" class="text-sm text-gray-500 dark:text-gray-400 mt-auto inline-block">المزيد من الدروس</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. لوحة الشرف -->
    <section class="bg-cream-gray dark:bg-gray-800/50 py-16 px-4">
       <div class="container mx-auto">
        <!-- تم التعديل: dark:text-brown-dark -->
        <h2 class="text-3xl font-bold text-center text-brown-dark dark:text-brown-dark mb-10">لوحة الشرف</h2>
        <div v-if="pending && !leaderboard" class="text-center text-gray-500 dark:text-gray-400">جاري تحميل لوحة الشرف...</div>
        <div v-else-if="error && !leaderboard" class="text-center text-red-500">حدث خطأ أثناء تحميل لوحة الشرف.</div>
        <div v-else-if="!leaderboard?.length" class="text-center text-gray-500 dark:text-gray-400">لا يوجد متفوقون حاليًا.</div>
        <div v-else class="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-cream-gray dark:border-gray-700">
           <ul class="space-y-4">
             <li v-for="(entry, index) in leaderboard" :key="entry.userId" class="flex items-center justify-between p-3 rounded-md hover:bg-beige-light/70 dark:hover:bg-gray-700/50 transition-colors border-b border-cream-gray dark:border-gray-700 last:border-b-0">
               <div class="flex items-center gap-x-4">
                 <span class="font-bold text-xl text-primary w-8 text-center">{{ index + 1 }}.</span>
                 <!-- تم التعديل: dark:text-brown-dark -->
                 <span class="font-semibold text-brown-dark dark:text-brown-dark text-lg">{{ entry.userName }}</span>
               </div>
               <span class="text-base text-gray-600 dark:text-gray-400 font-medium">{{ entry.score }} نقطة</span>
             </li>
           </ul>
        </div>
         <div v-if="leaderboard?.length" class="text-center mt-10">
           <NuxtLink to="/leaderboard" class="inline-block bg-primary text-white py-2.5 px-7 rounded-md hover:bg-opacity-85 transition-colors text-lg shadow hover:shadow-md">
             عرض لوحة الشرف كاملة
          </NuxtLink>
        </div>
       </div>
    </section>

    <!-- 4. آخر الأسئلة المجابة -->
    <section class="py-16 px-4 bg-white dark:bg-gray-900">
       <div class="container mx-auto">
        <!-- تم التعديل: dark:text-brown-dark -->
        <h2 class="text-3xl font-bold text-center text-brown-dark dark:text-brown-dark mb-10">آخر الأسئلة المجابة</h2>
        <div v-if="pending && !latestQuestions" class="text-center py-10 text-gray-500 dark:text-gray-400">جاري تحميل الأسئلة...</div>
         <div v-else-if="error && !latestQuestions" class="text-center py-10 text-red-500">حدث خطأ أثناء تحميل الأسئلة.</div>
        <div v-else-if="!latestQuestions?.length" class="text-center py-10 text-gray-500 dark:text-gray-400">لا توجد أسئلة مجابة حاليًا.</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="question in latestQuestions" :key="question.id" class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-cream-gray dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col">
            <NuxtLink :to="`/ask`" class="hover:text-primary group flex-grow">
              <!-- تم التعديل: dark:text-brown-dark -->
              <h3 class="font-semibold text-lg mb-2 line-clamp-2 group-hover:underline text-brown-dark dark:text-brown-dark">{{ question.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{{ question.answerSnippet }}</p>
            </NuxtLink>
            <NuxtLink :to="`/ask`" class="text-xs text-primary hover:underline mt-3 self-start">اقرأ الإجابة كاملة →</NuxtLink>
          </div>
        </div>
        <div class="text-center mt-10">
           <NuxtLink to="/ask" class="text-primary hover:underline font-semibold text-lg">عرض جميع الأسئلة المجابة</NuxtLink>
        </div>
        <div class="text-center mt-6">
          <NuxtLink to="/ask" class="bg-primary text-white py-2.5 px-6 rounded-md shadow hover:bg-opacity-90 transition-colors">
            أرسل سؤالك للشيخ
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 5. أحدث الإضافات -->
    <!-- 5.1 أحدث الدروس (المستقلة فقط) -->
    <section class="py-16 px-4 bg-beige-light/50 dark:bg-gray-800/20">
       <div class="container mx-auto">
        <div class="flex justify-between items-center mb-10">
          <!-- تم التعديل: dark:text-brown-dark -->
          <h2 class="text-3xl font-bold text-brown-dark dark:text-brown-dark">أحدث الدروس المستقلة</h2>
          <NuxtLink v-if="latestLessons?.length" to="/lessons" class="text-sm text-primary hover:underline font-medium">عرض كل الدروس</NuxtLink>
        </div>
        <div v-if="pending && !latestLessons" class="text-center text-gray-500 dark:text-gray-400">جاري تحميل الدروس...</div>
        <div v-else-if="error && !latestLessons" class="text-center text-red-500">حدث خطأ أثناء تحميل الدروس.</div>
        <div v-else-if="!latestLessons?.length" class="text-center text-gray-500 dark:text-gray-400">لا توجد دروس مستقلة مضافة حديثًا.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="item in latestLessons" :key="`lesson-${item.id}`" class="content-card">
            <NuxtLink :to="item.link" class="block group">
               <div class="content-card-image-container">
                  <NuxtImg
                     v-if="item.thumbnail"
                     :src="item.thumbnail"
                     :alt="item.title"
                     class="content-card-image"
                     format="webp" quality="80" loading="lazy" :placeholder="[40, 40, 75, 5]"
                     sizes="150px sm:200px md:250px"
                  />
                   <div v-else class="content-card-placeholder">
                       <!-- العنوان هنا سيستخدم الكلاس المعدل في CSS -->
                       <span class="placeholder-text">{{ item.title }}</span>
                       <span class="placeholder-subtext">(درس)</span>
                   </div>
               </div>
              <div class="p-4">
                <p class="content-card-type">{{ getContentType(item.type) }}</p>
                <!-- العنوان هنا سيستخدم الكلاس المعدل في CSS -->
                <h3 class="content-card-title">{{ item.title }}</h3>
                 <span class="text-xs text-primary group-hover:underline">مشاهدة الدرس →</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 5.2 أحدث الدورات -->
    <section class="py-16 px-4 bg-white dark:bg-gray-900">
       <div class="container mx-auto">
         <div class="flex justify-between items-center mb-10">
          <!-- تم التعديل: dark:text-brown-dark -->
          <h2 class="text-3xl font-bold text-brown-dark dark:text-brown-dark">أحدث الدورات</h2>
          <NuxtLink v-if="latestCourses?.length" to="/study" class="text-sm text-primary hover:underline font-medium">عرض كل الدورات</NuxtLink>
        </div>
        <div v-if="pending && !latestCourses" class="text-center text-gray-500 dark:text-gray-400">جاري تحميل الدورات...</div>
        <div v-else-if="error && !latestCourses" class="text-center text-red-500">حدث خطأ أثناء تحميل الدورات.</div>
        <div v-else-if="!latestCourses?.length" class="text-center text-gray-500 dark:text-gray-400">لا توجد دورات مضافة حديثًا.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="item in latestCourses" :key="`course-${item.id}`" class="content-card">
            <NuxtLink :to="item.link" class="block group">
               <div class="content-card-image-container">
                   <NuxtImg
                     v-if="item.thumbnail"
                     :src="item.thumbnail"
                     :alt="item.title"
                     class="content-card-image"
                     format="webp" quality="80" loading="lazy" :placeholder="[40, 40, 75, 5]"
                     sizes="150px sm:200px md:250px"
                    />
                    <div v-else class="content-card-placeholder">
                         <!-- العنوان هنا سيستخدم الكلاس المعدل في CSS -->
                         <span class="placeholder-text">{{ item.title }}</span>
                         <span class="placeholder-subtext">(دورة علمية)</span>
                     </div>
               </div>
              <div class="p-4">
                <p class="content-card-type">{{ getContentType(item.type) }}</p>
                <!-- العنوان هنا سيستخدم الكلاس المعدل في CSS -->
                <h3 class="content-card-title">{{ item.title }}</h3>
                 <span class="text-xs text-primary group-hover:underline">بدء الدورة →</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 5.3 أحدث الكتب -->
    <section class="py-16 px-4 bg-beige-light/50 dark:bg-gray-800/20">
        <div class="container mx-auto">
        <div class="flex justify-between items-center mb-10">
          <!-- تم التعديل: dark:text-brown-dark -->
          <h2 class="text-3xl font-bold text-brown-dark dark:text-brown-dark">أحدث الكتب</h2>
           <NuxtLink v-if="latestBooks?.length" to="/books" class="text-sm text-primary hover:underline font-medium">عرض كل الكتب</NuxtLink>
        </div>
         <div v-if="pending && !latestBooks" class="text-center text-gray-500 dark:text-gray-400">جاري تحميل الكتب...</div>
        <div v-else-if="error && !latestBooks" class="text-center text-red-500">حدث خطأ أثناء تحميل الكتب.</div>
        <div v-else-if="!latestBooks?.length" class="text-center text-gray-500 dark:text-gray-400">لا توجد كتب مضافة حديثًا.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="item in latestBooks" :key="`book-${item.id}`" class="content-card">
            <NuxtLink :to="item.link" class="block group">
               <div class="content-card-image-container">
                  <NuxtImg
                    v-if="item.thumbnail"
                    :src="item.thumbnail"
                    :alt="`غلاف كتاب ${item.title}`"
                    class="content-card-image"
                    format="webp" quality="80" loading="lazy" :placeholder="[40, 50, 75, 5]"
                    sizes="150px sm:200px md:250px"
                  />
                  <div v-else class="content-card-placeholder">
                     <!-- العنوان هنا سيستخدم الكلاس المعدل في CSS -->
                     <span class="placeholder-text">{{ item.title }}</span>
                     <span class="placeholder-subtext">(كتاب)</span>
                  </div>
               </div>
              <div class="p-4">
                <p class="content-card-type">{{ getContentType(item.type) }}</p>
                <!-- العنوان هنا سيستخدم الكلاس المعدل في CSS -->
                <h3 class="content-card-title">{{ item.title }}</h3>
                 <span class="text-xs text-primary group-hover:underline">تصفح الكتاب →</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal for Live Stream -->
     <ClientOnly>
        <VideoPreviewModal
         :show="showLiveModal"
         :video-url="liveStreamUrl"
         :title="liveStreamTitle"
         @close="closeLiveStreamModal" />
     </ClientOnly>

  </div>
</template>


<script setup lang="ts">
import { ref, computed, onUnmounted, watch, onMounted } from 'vue';
import { useSupabaseClient, useAsyncData } from '#imports';
import type { Database, Tables, Enums } from '~/types/database.types';
import VideoPreviewModal from '~/components/admin/VideoPreviewModal.vue'; // Adjust path if necessary

// --- Supabase Client ---
const client = useSupabaseClient<Database>();


// --- Types ---
// ... (keep existing types)
type AnnouncementType = Enums<'announcement_type'>;
type Announcement = {
    id: number;
    created_at?: string | null;
    title: string;
    details?: string | null;
    date?: string | null;
    type: AnnouncementType;
    is_published?: boolean | null;
    link?: string | null;
    time?: string | null;
};
type Question = { id: number; title: string; answerSnippet: string; };
type LeaderboardEntry = { userId: string; userName: string; score: number; };
type ContentItem = {
    id: string | number;
    title: string;
    type: 'lesson' | 'book' | 'course';
    thumbnail?: string | null;
    link: string;
    created_at: string;
};
type AboutSheikhInfo = Pick<Tables<'about_sheikh'>, 'short_bio' | 'profile_image_url'> | null;


// --- Modal State ---
const showLiveModal = ref(false);
const liveStreamUrl = ref('');
const liveStreamTitle = ref('');

// --- Countdown State ---
const countdown = ref<string | null>(null);
let countdownInterval: ReturnType<typeof setInterval> | null = null;

// --- Functions for Modal ---
// ... (keep existing modal functions)
function openLiveStreamModal(lecture: Announcement | undefined) {
    if (lecture?.link) {
        liveStreamUrl.value = lecture.link;
        liveStreamTitle.value = lecture.title;
        showLiveModal.value = true;
    }
}
function closeLiveStreamModal() {
    showLiveModal.value = false;
    liveStreamUrl.value = '';
    liveStreamTitle.value = '';
}

// --- Helper function to get YouTube Thumbnail ---
// ... (keep existing helper functions)
function getYoutubeThumbnailUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    let videoId: string | null = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
            if (!videoId && urlObj.pathname.includes('playlist')) {
                return null;
            }
             if (!videoId && urlObj.pathname.includes('/embed/')) {
                 videoId = urlObj.pathname.split('/embed/')[1]?.split('?')[0];
            }
        }
    } catch (e) {
        if (typeof url === 'string' && !url.includes('/') && url.length === 11) {
             videoId = url;
        } else {
            //  // Keep commented for now unless needed
             return null;
        }
    }
    if (videoId) { return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; }
    return null;
}

// --- Function to generate content links ---
function generateContentLink(type: ContentItem['type'], id: number | string): string {
    // ... (keep existing link generation logic)
     switch (type) {
        case 'lesson': return `/lessons/${id}`;
        case 'book': return `/books/${id}`;
        case 'course': return `/study/courses/${id}`;
        default: return '/';
    }
}

// --- Function to fetch homepage data ---
async function fetchHomepageData() {
    // <<< ADD LOG HERE >>>


    // Define promises
    const aboutPromise = client.from('about_sheikh').select('short_bio, profile_image_url').eq('id', 1).maybeSingle();
    const lessonsPromise = client.from('lessons').select('id, title, created_at, youtube_url').is('course_id', null).order('created_at', { ascending: false }).limit(4);
    const booksPromise = client.from('books').select('id, title, cover_image_url, created_at').order('created_at', { ascending: false }).limit(4);
    const coursesPromise = client.from('study_courses').select('id, title, created_at, youtube_playlist_url').eq('is_active', true).order('created_at', { ascending: false }).limit(4);
    const announcementsPromise = client.from('announcements')
        .select('id, title, details, date, type, link, is_published')
        .eq('is_published', true)
        .order('date', { ascending: true, nullsLast: true })
        .limit(12);
    const questionsPromise = client.from('questions_to_sheikh').select('id, question_text, answer_text, answered_at').eq('is_public', true).eq('is_answered', true).order('answered_at', { ascending: false }).limit(4);
    const leaderboardPromise = client.from('profiles').select('id, full_name, points').neq('points', 0).order('points', { ascending: false }).limit(3);

    // <<< ADD LOG HERE >>>


    // Await all promises
    const settledResults = await Promise.allSettled([
        announcementsPromise, questionsPromise, leaderboardPromise, aboutPromise,
        lessonsPromise, booksPromise, coursesPromise
    ]);

    // <<< ADD LOG HERE >>>


    // Helper to log errors and check status
    const logSettledError = (response: PromiseSettledResult<any>, name: string): { errorOccurred: boolean, data: any } => {
        if (response.status === 'rejected') {

            return { errorOccurred: true, data: null };
        }
        // Log Supabase specific errors if present, even if promise fulfilled
        if (response.value.error) {

             // Decide if this is critical. For maybeSingle(), a Supabase error might just mean 'not found', which could be ok.
             // For lists, an error usually means no data.
             // Let's consider any Supabase error as potentially problematic for now.
             return { errorOccurred: true, data: response.value.data }; // Return data even if error occurred
        }
         // <<< ADD LOG HERE >>>

        return { errorOccurred: false, data: response.value.data };
    };


    // Process results and track errors
    let hasFetchError = false;
    const [
        announcementsResult, questionsResult, leaderboardResult, aboutResult,
        lessonsResult, booksResult, coursesResult
    ] = settledResults.map((result, index) => {
        const names = ['announcements', 'questions', 'leaderboard', 'about data', 'lessons', 'books', 'courses'];
        const { errorOccurred, data } = logSettledError(result, names[index]);
        if (errorOccurred) {
             hasFetchError = true; // Mark that at least one fetch had an issue
        }
        return data; // Return the data regardless of error for potential partial rendering
    });


    // Process data (ensure checks for null/undefined if data might be missing due to errors)
    const processedQuestions = (questionsResult || []).map((q: any) => ({
        id: q.id,
        title: q.question_text ?? 'سؤال بدون عنوان',
        answerSnippet: q.answer_text?.substring(0, 120) + (q.answer_text && q.answer_text.length > 120 ? '...' : '') || '...'
    }));

    const processedLeaderboard = (leaderboardResult || []).map((p: any) => ({
        userId: p.id,
        userName: p.full_name ?? 'مستخدم',
        score: p.points ?? 0
    }));

    const processedLessons = (lessonsResult || []).map((item: any) => ({
        id: item.id,
        title: item.title ?? 'درس بدون عنوان',
        type: 'lesson' as const,
        thumbnail: getYoutubeThumbnailUrl(item.youtube_url),
        created_at: item.created_at ?? new Date().toISOString(),
        link: generateContentLink('lesson', item.id)
    }));

    const processedBooks = (booksResult || []).map((item: any) => ({
        id: item.id,
        title: item.title ?? 'كتاب بدون عنوان',
        type: 'book' as const,
        thumbnail: item.cover_image_url,
        created_at: item.created_at ?? new Date().toISOString(),
        link: generateContentLink('book', item.id)
    }));

    const processedCourses = (coursesResult || []).map((item: any) => ({
        id: item.id,
        title: item.title ?? 'دورة بدون عنوان',
        type: 'course' as const,
        thumbnail: getYoutubeThumbnailUrl(item.youtube_playlist_url),
        created_at: item.created_at ?? new Date().toISOString(),
        link: generateContentLink('course', item.id)
    }));

     

    return {
        aboutData: aboutResult as AboutSheikhInfo,
        announcements: (announcementsResult || []) as Announcement[], // Provide default empty array
        latestQuestions: processedQuestions,
        leaderboard: processedLeaderboard,
        latestLessons: processedLessons,
        latestBooks: processedBooks,
        latestCourses: processedCourses,
        fetchError: hasFetchError // Flag if any sub-fetch failed
    };
}

// --- useAsyncData ---
const { data, pending, error, refresh } = await useAsyncData(
    'homepageData',
    fetchHomepageData,
    {
        lazy: true,
        server: true,
        // watch: [() => someReactiveDependency] // Add if fetch depends on other reactive state
    }
);

// <<< ADD WATCHERS FOR DEBUGGING >>>
watch(data, (newData) => {

}, { deep: true }); // Use deep watch if needed

watch(pending, (newPending) => {

});

watch(error, (newError) => {
  // <<< THIS IS IMPORTANT >>>

});


// --- Computed Properties ---
// ... (keep existing computed properties)
const aboutData = computed(() => data.value?.aboutData || null);
const allAnnouncements = computed(() => data.value?.announcements || []);
const latestQuestions = computed(() => data.value?.latestQuestions || []);
const leaderboard = computed(() => data.value?.leaderboard || []);
const latestLessons = computed(() => data.value?.latestLessons || []);
const latestBooks = computed(() => data.value?.latestBooks || []);
const latestCourses = computed(() => data.value?.latestCourses || []);
const fetchErrorOccurred = computed(() => data.value?.fetchError || !!error.value);

// --- Upcoming Lecture/Live Logic (for Hero button) ---
// ... (keep existing computed logic)
const upcomingLectureOrLive = computed<Announcement | undefined>(() => {
    if (!allAnnouncements.value?.length) return undefined;
    const now = new Date();
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const potentialEvents = allAnnouncements.value
        .filter(a => (a.type === 'lecture' || a.type === 'live') && a.date)
        .map(a => ({ ...a, dateObj: a.date ? new Date(a.date) : null }))
        .filter(a => a.dateObj && !isNaN(a.dateObj.getTime()))
        .filter(a => a.dateObj! >= threeHoursAgo)
        .sort((a, b) => a.dateObj!.getTime() - b.dateObj!.getTime());

    return potentialEvents.find(a => a.dateObj! >= threeHoursAgo);
});

// --- Filtered Announcements (for the list section) ---
// ... (keep existing computed logic)
const filteredAnnouncements = computed(() => {
    const upcomingId = upcomingLectureOrLive.value?.id;
    return allAnnouncements.value
        .filter(a => {
            if (a.type === 'live') {
                return false;
            }
            if (upcomingId && a.id === upcomingId) {
                return false;
            }
            return true;
        })
        .slice(0, 8);
});

// --- Countdown Update Function ---
// ... (keep existing countdown logic)
function updateCountdown() {
  if (!upcomingLectureOrLive.value?.date || isLiveNow(upcomingLectureOrLive.value.date)) {
    countdown.value = null;
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    return;
  }
  const now = new Date();
  const eventDate = new Date(upcomingLectureOrLive.value.date);
  if (isNaN(eventDate.getTime())) {
       countdown.value = null;
       if (countdownInterval) clearInterval(countdownInterval);
       return;
  }
  const diff = eventDate.getTime() - now.getTime();

  if (diff <= 0) {
    countdown.value = null;
    if (countdownInterval) {
         clearInterval(countdownInterval);
         countdownInterval = null;
    }
  } else {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    let countdownString = '';
    if (days > 0) countdownString += `${days}ي `;
    if (hours > 0 || days > 0) countdownString += `${hours}س `;
    if (minutes > 0 || hours > 0 || days > 0) countdownString += `${minutes}د `;
    countdownString += `${seconds}ث`;
    countdown.value = countdownString.trim();
  }
}


// --- Lifecycle Hooks for Countdown ---
// ... (keep existing lifecycle hooks)
onMounted(() => {
   watch(upcomingLectureOrLive, (newLecture) => {
      if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
      }
      if (newLecture?.date && !isLiveNow(newLecture.date)) {
         updateCountdown();
         countdownInterval = setInterval(updateCountdown, 1000);
      } else {
          countdown.value = null;
      }
   }, { immediate: true });
});

onUnmounted(() => {
  if (countdownInterval) {
      clearInterval(countdownInterval);
  }
});


// --- Greeting Computed Property ---
// ... (keep existing greeting logic)
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return 'فجر مبارك مع';
  if (hour < 12) return 'صباح الخير مع';
  if (hour < 17) return 'نهارك سعيد مع';
  return 'مساء الخير مع';
});

// --- Helper Functions ---
// ... (keep existing helper functions: formatDate, isLiveNow, getTypeText, getTagClass, getContentType, getHeroButtonText)
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
      // 
      return dateString || '';
  }
}

function isLiveNow(dateString: string | null | undefined): boolean {
    if (!dateString) return false;
    try {
        const now = new Date();
        const eventDate = new Date(dateString);
        if (isNaN(eventDate.getTime())) return false;
        const eventDurationMs = 3 * 60 * 60 * 1000;
        const eventEnd = new Date(eventDate.getTime() + eventDurationMs);
        return now >= eventDate && now < eventEnd;
    } catch (e) {
        // 
        return false;
    }
}
function getTypeText(type: AnnouncementType | undefined): string {
    switch (type) {
        case 'lecture': return 'محاضرة';
        case 'announcement': return 'إعلان';
        case 'live': return 'بث مباشر';
        default: return 'تحديث';
    }
}

function getTagClass(type: AnnouncementType | undefined): string {
     switch (type) {
        case 'lecture': return 'tag-lecture';
        case 'announcement': return 'tag-announcement';
        case 'live': return 'tag-live';
        default: return 'tag-default';
    }
}

function getContentType(type: ContentItem['type']): string {
  switch (type) {
    case 'lesson': return 'درس';
    case 'book': return 'كتاب';
    case 'course': return 'دورة';
    default: return 'محتوى';
  }
}

function getHeroButtonText(item: Announcement | undefined): string {
    if (!item) return '';

    const live = isLiveNow(item.date);
    const typeText = item.type === 'live' ? 'البث' : 'المحاضرة';

    if (live) {
        return item.type === 'live' ? 'شاهد البث الآن' : 'المحاضرة الآن';
    } else if (countdown.value) {
        return `${typeText} يبدأ خلال ${countdown.value}`;
    } else {
        return item.type === 'live' ? 'البث القادم' : 'المحاضرة القادمة';
    }
}


</script>


<style scoped>
/* ----- Base Button Styles (Shared) ----- */
.btn-base {
   @apply inline-flex items-center gap-2 py-3 px-6 md:px-8 rounded-md transition-all duration-300 text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900;
}

/* ----- أنماط الأزرار ----- */
.btn-primary {
  @apply bg-primary text-white py-3 px-10 rounded-md transition-all duration-300 text-lg shadow-lg hover:bg-opacity-90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900;
}
/* Live Button (Red, Pulsing) */
.btn-live {
   @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 animate-pulse;
   /* Inherits base styles from the dynamic class binding */
}
/* Lecture Now Button (e.g., Green, slightly prominent) */
.btn-lecture-now {
    @apply bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500;
   /* Inherits base styles */
}
/* Upcoming Event Button (e.g., Blue) */
.btn-upcoming {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
   /* Inherits base styles */
}


/* ----- أنماط محتوى البطاقات ----- */
.content-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow border border-cream-gray dark:border-gray-700 overflow-hidden transition-shadow duration-200 hover:shadow-lg flex flex-col;
}

/* Container for image or placeholder */
.content-card-image-container {
    @apply h-40 w-full relative bg-gradient-to-br from-cream-gray via-beige-light to-cream-gray dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 flex items-center justify-center overflow-hidden group-hover:opacity-95 transition-opacity;
}

.content-card-image {
  @apply absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300;
}

/* Placeholder Styling (when no image) */
.content-card-placeholder {
    @apply p-4 text-center flex flex-col justify-center items-center h-full w-full;
}
.placeholder-text {
    /* تم التعديل: dark:text-brown-dark */
    @apply font-semibold text-base text-brown-dark dark:text-brown-dark line-clamp-3 leading-tight; /* Adjust line-clamp as needed */
}
.placeholder-subtext {
    @apply block text-xs text-gray-500 dark:text-gray-400 mt-1;
}


.content-card .p-4 {
    @apply flex flex-col flex-grow; /* Ensure content below image pushes footer down */
}
.content-card-type {
  @apply text-xs text-gray-500 dark:text-gray-400 mb-1;
}
.content-card-title {
  /* تم التعديل هنا أيضاً: dark:text-brown-dark */
  @apply font-semibold mb-2 line-clamp-2 text-brown-dark dark:text-brown-dark group-hover:text-primary transition-colors flex-grow; /* flex-grow here */
}
.content-card .text-xs {
    @apply mt-auto pt-2; /* Push link to bottom */
}

/* ----- أنماط الوسوم الخاصة بالإعلانات ----- */
.tag-lecture {
    @apply bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200;
}
.tag-live {
     @apply bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200 animate-pulse;
}
.tag-announcement {
    @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200;
}
.tag-default {
     @apply bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200;
}


/* ----- ميزة تقطيع الأسطر ----- */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

/* ----- تأثير نبض زر البث المباشر (والوسم) ----- */
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.02); }
}
.animate-pulse {
  animation: pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>