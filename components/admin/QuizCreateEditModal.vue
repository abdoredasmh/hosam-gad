<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-40">
      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3">
                {{ isEditing ? 'تعديل الاختبار' : 'إنشاء اختبار جديد' }}
              </DialogTitle>

              <form @submit.prevent="saveQuiz">
                <div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <!-- عنوان الاختبار -->
                  <div class="sm:col-span-2">
                    <label for="quiz-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">عنوان الاختبار *</label>
                    <input type="text" id="quiz-title" v-model="form.title" required class="mt-1 block w-full input-field" />
                  </div>

                  <!-- وصف الاختبار -->
                  <div class="sm:col-span-2">
                    <label for="quiz-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الوصف (اختياري)</label>
                    <textarea id="quiz-description" v-model="form.description" rows="3" class="mt-1 block w-full input-field"></textarea>
                  </div>

                  <!-- نوع الاختبار -->
                  <div>
                     <label for="quiz-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300">نوع الاختبار *</label>
                     <select id="quiz-type" v-model="form.type" required @change="handleTypeChange" class="mt-1 block w-full input-field">
                         <option :value="null" disabled>-- اختر النوع --</option>
                         <option value="lesson">اختبار درس</option>
                         <option value="module">اختبار وحدة</option>
                         <option value="final">اختبار نهائي</option>
                         <!-- <option value="practice">اختبار تدريبي</option> -->
                     </select>
                  </div>

                   <!-- الدورة (تظهر للوحدة والنهائي) -->
                  <div v-if="form.type === 'module' || form.type === 'final'">
                     <label for="quiz-course" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الدورة الدراسية *</label>
                      <div v-if="isLoadingCourses" class="mt-1 text-sm text-gray-500">جار تحميل الدورات...</div>
                     <select v-else id="quiz-course" v-model="form.course_id" required @change="handleCourseChange" class="mt-1 block w-full input-field">
                         <option :value="null" disabled>-- اختر الدورة --</option>
                         <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
                          <option v-if="!isLoadingCourses && courses.length === 0" disabled>-- لا توجد دورات --</option>
                     </select>
                  </div>

                   <!-- الدرس (يظهر لاختبار الدرس) -->
                   <div v-if="form.type === 'lesson'">
                     <label for="quiz-lesson-course" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الدورة (لتحديد الدرس) *</label>
                      <div v-if="isLoadingCourses" class="mt-1 text-sm text-gray-500">جار تحميل الدورات...</div>
                     <select v-else id="quiz-lesson-course" v-model="selectedCourseForLesson" required @change="fetchLessonsForCourse" class="mt-1 block w-full input-field">
                         <option :value="null" disabled>-- اختر دورة لعرض دروسها --</option>
                         <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
                          <option v-if="!isLoadingCourses && courses.length === 0" disabled>-- لا توجد دورات --</option>
                     </select>
                  </div>
                   <div v-if="form.type === 'lesson'">
                     <label for="quiz-lesson" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الدرس *</label>
                      <div v-if="isLoadingLessons" class="mt-1 text-sm text-gray-500">جار تحميل الدروس...</div>
                     <select v-else id="quiz-lesson" v-model="form.lesson_id" required :disabled="!selectedCourseForLesson || lessons.length === 0" class="mt-1 block w-full input-field">
                         <option :value="null" disabled>-- اختر الدرس --</option>
                         <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">{{ lesson.title }}</option>
                         <option v-if="!isLoadingLessons && lessons.length === 0 && selectedCourseForLesson" disabled>-- لا توجد دروس لهذه الدورة --</option>
                          <option v-if="!selectedCourseForLesson" disabled>-- اختر دورة أولاً --</option>
                     </select>
                  </div>

                   <!-- رقم الوحدة (يظهر لاختبار الوحدة) -->
                  <div v-if="form.type === 'module'">
                     <label for="quiz-module" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رقم الوحدة *</label>
                     <input type="number" id="quiz-module" v-model.number="form.module_number" required min="1" class="mt-1 block w-full input-field" />
                  </div>

                  <!-- درجة النجاح -->
                  <div>
                     <label for="quiz-pass-mark" class="block text-sm font-medium text-gray-700 dark:text-gray-300">درجة النجاح (%) *</label>
                     <input type="number" id="quiz-pass-mark" v-model.number="form.pass_mark_percentage" required min="0" max="100" class="mt-1 block w-full input-field" />
                  </div>

                  <!-- عدد المحاولات (تم الحذف) -->
                  <!--
                  <div>
                     <label for="quiz-max-attempts" class="block text-sm font-medium text-gray-700 dark:text-gray-300">أقصى عدد محاولات</label>
                     <input type="number" id="quiz-max-attempts" v-model.number="form.max_attempts" min="1" placeholder="غير محدود" class="mt-1 block w-full input-field" />
                      <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">اتركه فارغًا لمحاولات غير محدودة.</p>
                  </div>
                  -->

                   <!-- الوقت المحدد -->
                  <div>
                     <label for="quiz-time-limit" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الوقت المحدد (بالدقائق)</label>
                     <input type="number" id="quiz-time-limit" v-model.number="form.time_limit_minutes" min="1" class="mt-1 block w-full input-field" />
                  </div>

                  <!-- تاريخ الاستحقاق -->
                  <div>
                     <label for="quiz-due-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300">تاريخ الاستحقاق (اختياري)</label>
                     <input type="datetime-local" id="quiz-due-date" v-model="form.due_date" class="mt-1 block w-full input-field" />
                  </div>

                   <!-- نشط -->
                  <div class="sm:col-span-2">
                    <div class="flex items-center">
                      <input id="quiz-is-active" type="checkbox" v-model="form.is_active" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600">
                      <label for="quiz-is-active" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">الاختبار نشط ومتاح للطلاب؟</label>
                    </div>
                  </div>

                </div>

                <p v-if="formError" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ formError }}</p>

                 <div class="mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5">
                    <button
                      type="submit"
                      :disabled="isSaving"
                      class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                    >
                       <LoadingSpinner v-if="isSaving" class="w-5 h-5 text-white -ml-1 mr-2" />
                      {{ isSaving ? 'جاري الحفظ...' : (isEditing ? 'حفظ التعديلات' : 'إنشاء الاختبار') }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      @click="closeModal"
                      :disabled="isSaving"
                    >
                      إلغاء
                    </button>
                 </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import {
  Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild
} from '@headlessui/vue';
// ** تأكد من استيراد الأنواع الصحيحة للإضافة والتحديث **
import type { Database, Tables, TablesInsert, TablesUpdate } from '~/types/database.types';
import { useSupabaseClient, useNuxtApp } from '#imports';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import type { PostgrestError } from '@supabase/supabase-js';
import { useToast } from 'vue-toastification';

// Define Quiz type from generated types
type Quiz = Tables<'quizzes'>;
type Course = Pick<Tables<'study_courses'>, 'id' | 'title'>;
type Lesson = Pick<Tables<'lessons'>, 'id' | 'title'>;

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  quizData: { type: Object as () => Quiz | null, default: null }
});

const emit = defineEmits(['update:modelValue', 'saved', 'closed']);

const supabase = useSupabaseClient<Database>();
const toast = useToast();

const isOpen = ref(props.modelValue);
const isSaving = ref(false);
const formError = ref<string | null>(null);

// Form state reactive object
const form = ref<Partial<Quiz>>({});

// Separate state for dropdowns
const courses = ref<Course[]>([]);
const lessons = ref<Lesson[]>([]);
const isLoadingCourses = ref(false);
const isLoadingLessons = ref(false);
const selectedCourseForLesson = ref<number | null>(null);

const isEditing = computed(() => !!props.quizData?.id);

// --- Helper to format date for datetime-local input ---
const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try { const date = new Date(dateString); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); } catch { return ''; }
};

// --- Watchers ---
watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal;
  if (newVal) { resetForm(); fetchCourses(); }
});

watch(() => props.quizData, (newQuiz) => { resetForm(); }, { deep: true });

// *** Watcher to update form.course_id when selectedCourseForLesson changes for lesson quizzes ***
// This watcher is NO LONGER NEEDED because we handle it directly in saveQuiz
// watch(selectedCourseForLesson, (newCourseId) => {
//     if (form.value.type === 'lesson') {
//         form.value.course_id = newCourseId;
//         
//     }
// });

// --- Form Handling ---
const resetForm = () => {
    formError.value = null;
    isSaving.value = false;
    selectedCourseForLesson.value = null;
    lessons.value = [];
    if (isEditing.value && props.quizData) {
        form.value = {
            ...props.quizData,
            due_date: formatDateForInput(props.quizData.due_date),
            // ** max_attempts removed **
            time_limit_minutes: props.quizData.time_limit_minutes ?? null,
            module_number: props.quizData.module_number ?? null,
        };
         if (form.value.type === 'lesson' && form.value.course_id) { // Use existing course_id
             selectedCourseForLesson.value = form.value.course_id;
             fetchLessonsForCourse();
             // Preselect lesson if lesson_id also exists
             if (form.value.lesson_id){
                 // Ensure the lesson_id exists in the fetched lessons
                 // (This part of resetForm runs after fetchCourses but before fetchLessonsForCourse completes,
                 // so pre-selection needs to happen *after* fetchLessonsForCourse finishes if needed)
                 // We handle pre-selection inside fetchLessonsForCourse now.
             }
         }
    } else {
        // Creating: Initialize with defaults
        form.value = {
            title: '', description: null, type: null, course_id: null, lesson_id: null,
            module_number: null, pass_mark_percentage: 50, max_attempts: null, // max_attempts still exists in DB type but not used in form
            time_limit_minutes: null, due_date: null, is_active: true,
        };
    }
};

// Fetch courses for dropdown
// داخل <script setup lang="ts"> في AdminQuizCreateEditModal.vue

// Fetch courses for dropdown
const fetchCourses = async () => {
    // قم بإزالة أو تعليق الشرط التالي مؤقتًا إذا أردت التأكد من إعادة الجلب دائمًا
    // if (courses.value.length > 0) {
    //     
    //     return;
    // }

     // للتحقق من استدعاء الدالة
    isLoadingCourses.value = true; // تفعيل مؤشر تحميل الدورات
    formError.value = null; // مسح أي رسائل خطأ سابقة في الفورم

    try {
        // استعلام لجلب معرف وعنوان الدورات فقط، مرتبة حسب العنوان
        const { data, error } = await supabase
            .from('study_courses')
            .select('id, title')
            .order('title'); // ترتيب أبجدي حسب العنوان

         // للتحقق من استجابة Supabase
         // اطبع الخطأ (إذا وجد)
         // اطبع البيانات المستلمة

        // التحقق من وجود خطأ في الاستعلام
        if (error) {
            // إلقاء الخطأ ليتم التقاطه بواسطة كتلة catch
            throw error;
        }

        // تحديث قائمة الدورات بالبيانات المستلمة (أو مصفوفة فارغة إذا كانت البيانات null)
        courses.value = data || [];
         // للتحقق من عدد الدورات المحملة

    } catch (err: any) {
        // التعامل مع أي خطأ يحدث أثناء الجلب
        
        formError.value = "فشل تحميل قائمة الدورات."; // عرض رسالة خطأ مناسبة للمستخدم في الفورم
        courses.value = []; // تفريغ قائمة الدورات عند حدوث خطأ
        toast.error(formError.value); // عرض تنبيه toast بالخطأ أيضًا

    } finally {
        // إيقاف مؤشر التحميل دائمًا، سواء نجح الجلب أو فشل
        isLoadingCourses.value = false;
         // للتحقق من انتهاء الدالة
    }
};

// Fetch lessons when a course is selected for a lesson quiz
const fetchLessonsForCourse = async () => {
    lessons.value = [];
    form.value.lesson_id = null;
    if (!selectedCourseForLesson.value || form.value.type !== 'lesson') return;
    isLoadingLessons.value = true;
    try {
        const { data, error } = await supabase
            .from('lessons').select('id, title').eq('course_id', selectedCourseForLesson.value)
            .order('lesson_order', { nulls: 'last' }).order('title');
        if (error) throw error;
        lessons.value = data || [];
         // ** Pre-select the lesson if editing AND the lesson_id matches the current props data **
         if (isEditing.value && props.quizData?.lesson_id && props.quizData?.course_id === selectedCourseForLesson.value) {
             form.value.lesson_id = props.quizData.lesson_id;
         }
    } catch (err: any) {  formError.value = "فشل تحميل قائمة الدروس لهذه الدورة."; }
    finally { isLoadingLessons.value = false; }
};


// Reset linked fields when quiz type changes
const handleTypeChange = () => {
    form.value.course_id = null;
    form.value.lesson_id = null;
    form.value.module_number = null;
    selectedCourseForLesson.value = null;
    lessons.value = [];
};

// Reset lesson when course changes (for module/final types)
const handleCourseChange = () => { form.value.lesson_id = null; };

// --- Save Quiz Logic ---
const saveQuiz = async () => {
  isSaving.value = true;
  formError.value = null;

  // --- Validation ---
  if (!form.value.title?.trim()) { formError.value = "عنوان الاختبار مطلوب."; isSaving.value = false; return; }
  if (!form.value.type) { formError.value = "نوع الاختبار مطلوب."; isSaving.value = false; return; }
  if (form.value.type === 'lesson' && !form.value.lesson_id) { formError.value = "يجب اختيار درس لاختبار الدرس."; isSaving.value = false; return; }
  if ((form.value.type === 'module' || form.value.type === 'final') && !form.value.course_id) { formError.value = "يجب اختيار دورة لاختبار الوحدة أو الاختبار النهائي."; isSaving.value = false; return; }
  if (form.value.type === 'module' && (!form.value.module_number || form.value.module_number < 1)) { formError.value = "رقم الوحدة مطلوب وصحيح لاختبار الوحدة."; isSaving.value = false; return; }
  if (form.value.pass_mark_percentage === null || form.value.pass_mark_percentage === undefined || form.value.pass_mark_percentage < 0 || form.value.pass_mark_percentage > 100) { formError.value = "درجة النجاح يجب أن تكون بين 0 و 100."; isSaving.value = false; return; }
  // ** max_attempts validation removed **
  if (form.value.time_limit_minutes !== null && form.value.time_limit_minutes < 1) { formError.value = "الوقت المحدد يجب أن يكون دقيقة واحدة أو أكثر."; isSaving.value = false; return; }


  // Prepare data for Supabase
  // ** Use correct type based on isEditing for insert/update **
  const basePayload = {
      title: form.value.title,
      description: form.value.description || null,
      type: form.value.type!, // Assert non-null after validation
      // *** Assign course_id correctly based on type ***
      course_id: (form.value.type === 'module' || form.value.type === 'final')
                 ? form.value.course_id
                 : (form.value.type === 'lesson' ? selectedCourseForLesson.value : null),
      lesson_id: form.value.type === 'lesson' ? form.value.lesson_id : null,
      module_number: form.value.type === 'module' ? form.value.module_number : null,
      pass_mark_percentage: form.value.pass_mark_percentage ?? 50,
      max_attempts: null, // ** Set max_attempts to null explicitly **
      time_limit_minutes: form.value.time_limit_minutes || null,
      due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null,
      is_active: form.value.is_active ?? true,
  };


  

  try {
    let savedData: Quiz | null = null;
    let error: PostgrestError | null = null;

    if (isEditing.value && form.value.id) {
      // Update existing quiz
      
      // Define payload type for update
      const updatePayload: TablesUpdate<'quizzes'> = {
          ...basePayload,
          updated_at: new Date().toISOString()
      };
      const { data, error: updateError } = await supabase
        .from('quizzes')
        .update(updatePayload)
        .eq('id', form.value.id)
        .select()
        .single();
      savedData = data;
      error = updateError;
    } else {
      // Insert new quiz
      
      // Define payload type for insert
      const insertPayload: TablesInsert<'quizzes'> = basePayload;
      const { data, error: insertError } = await supabase
        .from('quizzes')
        .insert(insertPayload)
        .select()
        .single();
      savedData = data;
      error = insertError;
    }

    
    

    if (error) throw error;
    if (!savedData) throw new Error("لم يتم إرجاع بيانات الاختبار المحفوظة.");

    
    emit('saved', savedData);

  } catch (err: any) {
    
    formError.value = `فشل حفظ الاختبار: (${(err as PostgrestError).message || 'خطأ غير معروف'})`;
    toast.error(formError.value);
  } finally {
    isSaving.value = false;
  }
};

// --- Modal Control ---
function closeModal() {
  if (isSaving.value) return;
  isOpen.value = false;
  emit('update:modelValue', false);
  emit('closed');
}

</script>

<style scoped>
/* Simple styling for form fields */
.input-field {
    @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70;
}
/* Add other styles if needed */
</style>