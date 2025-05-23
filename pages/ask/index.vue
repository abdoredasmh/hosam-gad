<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark mb-8 border-b-2 border-olive-green pb-2">
      اسأل الشيخ
    </h1>

    <!-- قسم إرسال السؤال (للمستخدم المسجل) -->
    <section v-if="user" class="mb-10 p-6 bg-beige-light dark:bg-cream-gray rounded-lg shadow-md border border-cream-gray dark:border-gray-700">
      <h2 class="text-xl font-semibold text-brown-dark dark:text-brown-dark mb-4">
        أرسل سؤالك للشيخ
      </h2>
      <form @submit.prevent="submitQuestion">
        <div>
          <textarea
            v-model="questionText"
            rows="4"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-70"
            placeholder="اكتب سؤالك هنا..."
            required
            :aria-describedby="questionError ? 'question-error-message' : 'question-help-text'"
            :class="{ 'border-red-500 dark:border-red-600': questionError }"
            :disabled="isSubmitting"
            @input="validateQuestionLength"
          ></textarea>
          <p id="question-help-text" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            يجب أن يكون السؤال {{ MIN_QUESTION_LENGTH }} حروف على الأقل. (الحالي: {{ questionText.trim().length }} حرف)
          </p>
          <p v-if="questionError" id="question-error-message" class="mt-1 text-xs text-red-600 dark:text-red-400">
            {{ questionError }}
          </p>
        </div>

        <div class="mt-4 flex items-center justify-end gap-4 flex-wrap">
          <!-- رسالة النجاح -->
          <transition name="fade">
            <p v-if="submitSuccess" class="text-sm text-green-600 dark:text-green-400 order-1 sm:order-none">
              تم إرسال سؤالك بنجاح!
            </p>
          </transition>
           <!-- رسالة الخطأ العام للإرسال -->
          <p v-if="submitError" class="text-sm text-red-600 dark:text-red-400 order-1 sm:order-none">
            {{ submitError }}
          </p>

          <button
            type="submit"
            :disabled="isSubmitting || isQuestionInvalid"
            class="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:focus:ring-offset-gray-900 order-2 sm:order-none"
            :style="{ backgroundColor: 'var(--color-olive-green)' }"
            >
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-if="isSubmitting">جاري الإرسال...</span>
            <span v-else>إرسال السؤال</span>
          </button>
        </div>
      </form>
    </section>

    <!-- رسالة لغير المسجلين -->
    <section v-else class="mb-10 p-6 text-center bg-gray-100 dark:bg-gray-800 rounded-md">
       <p class="text-gray-700 dark:text-gray-300">
         <NuxtLink to="/login" class="text-primary-600 hover:underline dark:text-primary-400 font-medium">سجّل الدخول</NuxtLink>
         أو <NuxtLink to="/signup" class="text-primary-600 hover:underline dark:text-primary-400 font-medium">أنشئ حسابًا جديدًا</NuxtLink> لتتمكن من إرسال سؤالك.
       </p>
     </section>

    <!-- قسم الأسئلة العامة المجابة -->
    <section>
      <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-6 border-b border-cream-gray dark:border-gray-700 pb-2">
        أسئلة شائعة ومجابة
      </h2>

      <!-- حالات التحميل والخطأ للأسئلة العامة -->
      <div v-if="isLoadingPublic && publicQuestions.length === 0" class="text-center py-10">
        <LoadingSpinner />
        <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل الأسئلة...</p>
      </div>
      <div v-else-if="fetchErrorPublic" class="text-center py-10 text-red-600 dark:text-red-400">
        حدث خطأ أثناء تحميل الأسئلة: {{ fetchErrorPublic }}
        <button @click="refreshPublicData" class="mt-2 block mx-auto text-sm text-primary-600 hover:underline">إعادة المحاولة</button>
      </div>

      <!-- عرض الفلاتر والأسئلة -->
      <div v-else>
        <!-- فلاتر التصنيف -->
        <div class="flex flex-wrap gap-2 mb-8 items-center">
          <button
            @click="selectedCategory = null"
            :disabled="isLoadingPublic"
            :class="[
              'px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-150',
              selectedCategory === null
                ? 'bg-olive-green text-white shadow'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
              isLoadingPublic ? 'opacity-70 cursor-not-allowed' : ''
            ]"
          >
            الكل
          </button>
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :disabled="isLoadingPublic"
            :class="[
              'px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-150',
              selectedCategory === category.id
                ? 'bg-olive-green text-white shadow'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
              isLoadingPublic ? 'opacity-70 cursor-not-allowed' : ''
            ]"
          >
            {{ category.name }}
          </button>
           <span v-if="isLoadingCategories && !categories.length" class="text-sm text-gray-500 italic">جارٍ تحميل التصنيفات...</span>
           <!-- مؤشر تحميل صغير عند تغيير الفلتر أو الصفحة -->
            <LoadingSpinner v-if="isLoadingPublic" class="w-4 h-4 text-gray-500 inline-block ms-2" />
        </div>

        <!-- قائمة الأسئلة -->
        <div v-if="publicQuestions.length > 0" class="space-y-6">
          <div
            v-for="qa in publicQuestions"
            :key="qa.id"
            class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow duration-200 hover:shadow-md"
          >
            <div class="p-5">
              <span v-if="qa.question_categories?.name" class="inline-block bg-blue-100 text-blue-800 text-xs font-medium mb-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                {{ qa.question_categories.name }}
              </span>
              <h3 class="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2">
                <span class="text-gray-500 dark:text-gray-400">س:</span>
                {{ qa.question_text }}
              </h3>
            </div>
            <div v-if="qa.answer_text" class="bg-gray-50 dark:bg-gray-700/50 p-5 border-t border-gray-200 dark:border-gray-600">
              <h4 class="font-semibold text-md text-olive-green dark:text-yellow-400 mb-2 flex items-center">
                 <span class="bg-olive-green dark:bg-yellow-400 text-white dark:text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs me-2">ج</span>
                <span>جواب الشيخ:</span>
              </h4>
               <div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-200">
                 <p class="whitespace-pre-wrap">{{ qa.answer_text }}</p>
               </div>
            </div>
          </div>
        </div>

        <!-- حالة عدم وجود أسئلة (بعد الفلترة أو بشكل عام لهذه الصفحة) -->
        <div v-else-if="!isLoadingPublic && publicQuestions.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
          <p v-if="selectedCategory === null">لا توجد أسئلة مجابة متاحة حاليًا.</p>
          <p v-else>لا توجد أسئلة مجابة تطابق هذا التصنيف حاليًا.</p>
        </div>

         <!-- عناصر التحكم في الصفحات -->
       <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center space-x-2 rtl:space-x-reverse">
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1 || isLoadingPublic"
            class="px-3 py-1 text-sm rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
           >
            السابق
          </button>
          <span class="text-sm text-gray-700 dark:text-gray-300">
            صفحة {{ currentPage }} من {{ totalPages }}
          </span>
          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages || isLoadingPublic"
            class="px-3 py-1 text-sm rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
           >
            التالي
          </button>
       </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';

// --- تعريف الأنواع ---
type QuestionCategory = Tables<'question_categories'>;
type PublicQuestion = Omit<Tables<'questions_to_sheikh'>, 'user_id'> & {
  question_categories: Pick<QuestionCategory, 'name'> | null;
};

// --- الثوابت ---
const MIN_QUESTION_LENGTH = 10;

// --- استخدام المكونات والخدمات ---
const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

// --- حالة نموذج الإرسال ---
const questionText = ref('');
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref<string | null>(null);
const questionError = ref<string | null>(null);

// --- حالة عرض الأسئلة العامة ---
const publicQuestions = ref<PublicQuestion[]>([]); // ستحتوي فقط على أسئلة الصفحة الحالية
const categories = ref<QuestionCategory[]>([]);
const selectedCategory = ref<number | null>(null);
const isLoadingPublic = ref(true); // للتحميل العام (أسئلة أو تغيير فلتر/صفحة)
const fetchErrorPublic = ref<string | null>(null);
const isLoadingCategories = ref(true); // حالة تحميل منفصلة للتصنيفات (تحدث مرة واحدة)

// --- حالة التقسيم ---
const currentPage = ref(1);
const pageSize = ref(15); // عدد الأسئلة في كل صفحة
const totalQuestions = ref(0); // العدد الإجمالي للأسئلة (للتحكم بالصفحات)

// --- التحقق من صحة السؤال (Computed Property) ---
const isQuestionInvalid = computed(() => {
  return questionText.value.trim().length < MIN_QUESTION_LENGTH;
});

// --- حساب عدد الصفحات الإجمالي ---
const totalPages = computed(() => {
  if (totalQuestions.value === 0) return 1; // على الأقل صفحة واحدة
  return Math.ceil(totalQuestions.value / pageSize.value);
});

// --- دالة للتحقق من الطول أثناء الكتابة ---
function validateQuestionLength() {
  if (questionText.value.trim() && questionText.value.trim().length < MIN_QUESTION_LENGTH) {
    questionError.value = `يجب أن يكون السؤال ${MIN_QUESTION_LENGTH} حروف على الأقل.`;
  } else {
    questionError.value = null;
  }
}

// --- دالة إرسال السؤال (مع التحقق المسبق) ---
async function submitQuestion() {
  validateQuestionLength();
  if (!user.value || isQuestionInvalid.value || questionError.value) return;

  isSubmitting.value = true;
  submitSuccess.value = false;
  submitError.value = null;

  try {
    const { error } = await supabase.from('questions_to_sheikh').insert({
      user_id: user.value.id,
      question_text: questionText.value.trim(),
      // القيم الافتراضية لـ is_public, is_answered, category_id إلخ يتم تعيينها عادة في قاعدة البيانات
    });

    if (error) {
         if (error.code === '23514' && error.message.includes('_check')) {
            
            questionError.value = `فشل الإرسال. تأكد أن السؤال لا يقل عن ${MIN_QUESTION_LENGTH} حروف.`;
         } else {
            throw error;
         }
    } else {
        questionText.value = '';
        submitSuccess.value = true;
        questionError.value = null;
        setTimeout(() => { submitSuccess.value = false; }, 3000);
    }

  } catch (err: any) {
    
     if (!questionError.value) {
        submitError.value = 'حدث خطأ أثناء إرسال السؤال. يرجى المحاولة مرة أخرى.';
     }
  } finally {
    isSubmitting.value = false;
  }
}

// --- جلب البيانات العامة (معدلة للتقسيم والفلترة من الخادم) ---
async function fetchPublicData(page = 1, categoryId: number | null = selectedCategory.value) {
  // استخدام selectedCategory.value كقيمة افتراضية لـ categoryId
  isLoadingPublic.value = true;
  fetchErrorPublic.value = null;

  const rangeFrom = (page - 1) * pageSize.value;
  const rangeTo = rangeFrom + pageSize.value - 1;

  try {
    // --- جلب التصنيفات (مرة واحدة فقط في البداية) ---
    if (categories.value.length === 0 && isLoadingCategories.value) {
       const { data: catData, error: catError } = await supabase
         .from('question_categories')
         .select('id, name')
         .order('id');
       if (catError) {
         
         // يمكن عرض خطأ بسيط أو تجاهله إذا لم تكن التصنيفات حرجة
       } else {
         categories.value = catData || [];
       }
       isLoadingCategories.value = false; // تم محاولة تحميل التصنيفات
    }

    // --- بناء استعلام الأسئلة ---
    let query = supabase
      .from('questions_to_sheikh')
      .select(`
        id, question_text, submitted_at, answer_text, answered_at,
        is_public, is_answered, category_id,
        question_categories ( name )
      `, { count: 'exact' }) // طلب العدد الإجمالي مع البيانات
      .eq('is_public', true)
      .eq('is_answered', true)
      .order('answered_at', { ascending: false })
      .range(rangeFrom, rangeTo);

    // تطبيق فلتر التصنيف إذا تم تحديده
    if (categoryId !== null) {
      query = query.eq('category_id', categoryId);
    }

    // --- تنفيذ استعلام الأسئلة ---
    const { data, error, count } = await query;

    if (error) throw error;

    publicQuestions.value = data || [];
    totalQuestions.value = count ?? 0;
    // تأكد من أن الصفحة الحالية لا تتجاوز العدد الإجمالي للصفحات بعد الجلب
    if(page > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value; // اذهب إلى آخر صفحة متاحة
        // قد تحتاج إلى إعادة الجلب إذا غيرت الصفحة هنا، لكن الـ watch سيهتم بذلك
    }


  } catch (err: any) {
    
    fetchErrorPublic.value = err.message || 'فشل تحميل البيانات.';
    publicQuestions.value = [];
    totalQuestions.value = 0; // إعادة تعيين العدد عند الخطأ
  } finally {
    isLoadingPublic.value = false;
  }
}

// --- دالة لتغيير الصفحة ---
function changePage(newPage: number) {
  if (newPage >= 1 && newPage <= totalPages.value && newPage !== currentPage.value && !isLoadingPublic.value) {
    currentPage.value = newPage;
    // الـ watch سيكتشف التغيير ويستدعي fetchPublicData
  }
}

// --- مراقبة تغيير الفلتر أو الصفحة لإعادة الجلب ---
watch([currentPage, selectedCategory], ([newPage, newCategory], [oldPage, oldCategory]) => {
    // تحقق مما إذا كان الفلتر قد تغير بالفعل
    if (newCategory !== oldCategory) {
         // إذا تغير الفلتر، يجب أن ننتقل إلى الصفحة الأولى
         if(currentPage.value !== 1) {
             // تغيير currentPage سيُشغل الـ watch مرة أخرى،
             // لذا لا نستدعي fetchPublicData هنا مباشرة
             currentPage.value = 1;
         } else {
             // إذا كنا بالفعل في الصفحة 1، فقم بالجلب مباشرة بالفلتر الجديد
             fetchPublicData(1, newCategory);
         }
    } else {
        // إذا لم يتغير الفلتر، فهذا يعني أن الصفحة هي التي تغيرت
        // قم بالجلب للصفحة الجديدة بنفس الفلتر
        fetchPublicData(newPage, newCategory);
    }
}, { immediate: true }); // immediate: true لجلب البيانات عند تحميل المكون أول مرة


// --- دالة إعادة المحاولة ---
async function refreshPublicData() {
    // أعد جلب الصفحة الحالية بنفس الفلتر
    await fetchPublicData(currentPage.value, selectedCategory.value);
}

// --- SEO ---
useHead({
  title: 'اسأل الشيخ - موقع الشيخ إبراهيم بشندي',
  meta: [
    { name: 'description', content: 'اطرح سؤالك مباشرة على الشيخ إبراهيم بشندي وتصفح الأسئلة المجابة في مختلف الفئات الشرعية مع إمكانية الفلترة والتصفح.' }
  ]
});

</script>

<style scoped>
/* Transitions for success message */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Ensure prose styles apply correctly */
.prose p {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
}
</style>