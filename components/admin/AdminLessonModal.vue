<!-- components/admin/AdminLessonModal.vue -->
<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">

      <!-- Backdrop -->
      <TransitionChild
        as="div"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm"
        enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0"
      />

      <!-- Full-screen container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">

          <!-- Modal panel -->
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all">
              <DialogTitle as="h3" class="admin-modal-title">
                {{ isEditing ? 'تعديل الدرس' : 'إضافة درس جديد' }}
              </DialogTitle>

              <form @submit.prevent="saveLesson" class="space-y-4">

                <!-- Title Field -->
                <div>
                  <label for="title" class="admin-label">العنوان *</label>
                  <input type="text" id="title" v-model="form.title" required class="admin-input" aria-describedby="title-error"/>
                  <p v-if="validationErrors.title" class="form-error" id="title-error">{{ validationErrors.title }}</p>
                </div>

                <!-- Description Field -->
                <div>
                  <label for="description" class="admin-label">الوصف</label>
                  <textarea id="description" rows="4" v-model="form.description" class="admin-textarea"></textarea>
                </div>

                <!-- YouTube URL Field -->
                <div>
                   <label for="youtube_url" class="admin-label">رابط يوتيوب *</label>
                   <input type="url" id="youtube_url" v-model="form.youtube_url" required placeholder="https://..." class="admin-input" aria-describedby="youtube-error"/>
                   <p v-if="validationErrors.youtube_url" class="form-error" id="youtube-error">{{ validationErrors.youtube_url }}</p>
                </div>

                 <!-- Category Select Field (Mandatory) -->
                  <div>
                      <label for="category_id" class="admin-label">الفئة *</label>
                       <div v-if="loadingCategories" class="form-loading-text">جار تحميل الفئات...</div>
                      <select
                          v-else
                          id="category_id"
                          v-model="form.category_id"
                          required 
                          class="admin-select"
                          aria-describedby="category-error" 
                      >
                          <option :value="null" disabled>-- اختر فئة * --</option> 
                          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                          <option v-if="!loadingCategories && categories.length === 0" disabled>-- لا توجد فئات متاحة --</option>
                      </select>
                       <p v-if="validationErrors.category_id" class="form-error" id="category-error">{{ validationErrors.category_id }}</p> 
                  </div>

                  <!-- Course Select Field -->
                   <div>
                       <label for="course_id" class="admin-label">الدورة الدراسية (اختياري)</label>
                       <div v-if="loadingCourses" class="form-loading-text">جار تحميل الدورات...</div>
                       <select
                           v-else
                           id="course_id"
                           v-model="form.course_id"
                           @change="handleCourseChange"
                           class="admin-select"
                       >
                           <option :value="null">-- درس عام (لا يتبع دورة) --</option>
                           <option v-for="course in courses" :key="course.id" :value="course.id">
                               {{ course.title }}
                           </option>
                            <option v-if="!loadingCourses && courses.length === 0" disabled>-- لا توجد دورات متاحة --</option>
                       </select>
                   </div>

                 <!-- =========================================== -->
                 <!-- Module & Order Fields (Conditional on Course) -->
                 <!-- =========================================== -->
                  <div v-if="form.course_id" class="space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">

                      <div>
                          <label for="module_number" class="admin-label">الوحدة داخل الدورة</label>
                           <div v-if="loadingModules" class="form-loading-text">جار تحميل الوحدات...</div>
                           <p v-else-if="!loadingModules && courseModules.length === 0 && !modulesError" class="form-hint bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-700">
                               لم يتم تعريف وحدات لهذه الدورة بعد. يمكنك إضافتها من شاشة "تعديل الدورة".
                           </p>
                           <p v-else-if="modulesError" class="form-error bg-red-100 dark:bg-red-900/30 p-2 rounded">خطأ تحميل الوحدات: {{ modulesError }}</p>
                          <select
                              v-else-if="courseModules.length > 0"
                              id="module_number"
                              v-model.number="form.module_number"
                              class="admin-select"
                          >
                              <option :value="null">-- درس بدون وحدة (عام داخل الدورة) --</option>
                              <option v-for="module in courseModules" :key="module.module_number" :value="module.module_number">
                                  #{{ module.module_number }} - {{ module.title }}
                              </option>
                          </select>
                          <!-- Placeholder if no modules and not loading/error -->
                          <div v-else-if="!loadingModules && courseModules.length === 0" class="admin-input bg-gray-100 dark:bg-gray-600 cursor-not-allowed italic text-gray-500 dark:text-gray-400">لا توجد وحدات</div>
                      </div>

                      <!-- Lesson Order Field -->
                      <div>
                          <label for="lesson_order" class="admin-label">ترتيب الدرس</label>
                          <input
                              type="number" id="lesson_order" v-model.number="form.lesson_order" min="1"
                              class="admin-input"
                              placeholder="اتركه فارغًا للترتيب التلقائي/الأخير"
                          />
                          <p class="form-hint">
                              ترتيب الدرس {{ form.module_number ? `داخل الوحدة #${form.module_number}` : 'العام داخل الدورة' }}. (مثال: 1 هو الأول)
                          </p>
                      </div>
                  </div>
                 <!-- =========================================== -->
                 <!-- End Module & Order Fields                  -->
                 <!-- =========================================== -->

                <!-- General Error Message -->
                <p v-if="errorMessage" class="form-error p-2 bg-red-100 dark:bg-red-900/30 rounded">
                  خطأ: {{ errorMessage }}
                </p>

                <!-- Action Buttons -->
                <div class="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse">
                    <button type="button" @click="closeModal" class="button-secondary">إلغاء</button>
                    <button type="submit" :disabled="isSaving || loadingCategories || loadingCourses || loadingModules" class="button-primary">
                       <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      {{ isSaving ? 'جاري الحفظ...' : (isEditing ? 'حفظ التعديلات' : 'إضافة الدرس') }}
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
import { ref, watch, computed, reactive } from 'vue';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import type { Database, Tables, TablesInsert, TablesUpdate } from '~/types/database.types'; // تأكد أن المسار صحيح
import { useSupabaseClient } from '#imports';
import { useToast } from 'vue-toastification'; // استيراد useToast

// Define Types
type Lesson = Tables<'lessons'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;
type Course = Pick<Tables<'study_courses'>, 'id' | 'title'>;
type CourseModule = Pick<Tables<'course_modules'>, 'id' | 'title' | 'module_number'>;
type NotificationInsert = TablesInsert<'notifications'>; // تعريف نوع الإشعار

// Props and Emits
const props = defineProps<{
  show: boolean;
  lessonData: Lesson | null;
  preselectedCourseId?: number | null;
}>();
const emit = defineEmits(['close', 'saved']);

// Supabase Client & Toast
const supabase = useSupabaseClient<Database>();
const toast = useToast(); // تهيئة Toast

// Component State
const isSaving = ref(false);
const errorMessage = ref<string | null>(null);
const validationErrors = reactive({ title: '', youtube_url: '', category_id: '' }); // إضافة category_id

// Form State - Initialize with potential fields
const form = ref<Partial<Lesson>>({
    title: '',
    description: null,
    youtube_url: '',
    category_id: null, // قيمة أولية null
    course_id: null,
    module_number: null,
    lesson_order: null,
});

// Dropdown State
const categories = ref<Category[]>([]);
const courses = ref<Course[]>([]);
const courseModules = ref<CourseModule[]>([]);
const loadingCategories = ref(false);
const loadingCourses = ref(false);
const loadingModules = ref(false);
const modulesError = ref<string | null>(null);

// Computed Properties
const isEditing = computed(() => !!props.lessonData?.id);

// --- Helper Functions ---

// Fetch course modules based on course ID (الكود الأصلي بدون تغيير)
async function fetchCourseModules(courseId: number | null | undefined) {
  if (!courseId) {
    courseModules.value = [];
    loadingModules.value = false;
    modulesError.value = null;
    
    return;
  }
  
  loadingModules.value = true;
  modulesError.value = null;
  courseModules.value = []; // Clear previous modules
  try {
    const { data, error } = await supabase
      .from('course_modules')
      .select('id, title, module_number')
      .eq('course_id', courseId)
      .order('module_number', { ascending: true });
    if (error) throw error;
    courseModules.value = data || [];
    
  } catch (err: any) {
    
    modulesError.value = err.message || "فشل تحميل وحدات الدورة.";
  } finally {
    loadingModules.value = false;
  }
}

// Reset form fields (مع إضافة category_id للتحقق)
const resetForm = (initialCourseId: number | null = null) => {
    
    form.value = {
        title: '',
        description: null,
        youtube_url: '',
        category_id: null, // إعادة تعيين الفئة إلى null
        course_id: initialCourseId,
        module_number: null,
        lesson_order: null,
    };
    errorMessage.value = null;
    validationErrors.title = '';
    validationErrors.youtube_url = '';
    validationErrors.category_id = ''; // إعادة تعيين خطأ الفئة
    courseModules.value = [];
    loadingModules.value = false;
    modulesError.value = null;
    if (initialCourseId) {
        fetchCourseModules(initialCourseId);
    }
};

// Fetch static dropdown data (Categories and Courses) (الكود الأصلي بدون فلتر type)
async function fetchStaticDropdownData() {
    if ((categories.value.length > 0 && courses.value.length > 0) || loadingCategories.value || loadingCourses.value) {
      
      return;
    }
    
    loadingCategories.value = true;
    loadingCourses.value = true;
    errorMessage.value = null;
    try {
        // جلب جميع الفئات بدون فلتر type
        const [catResult, courseResult] = await Promise.all([
            supabase.from('categories').select('id, name').order('name'), // <-- الكود الأصلي لجلب الفئات
            supabase.from('study_courses').select('id, title').order('title')
        ]);

        if (catResult.error) throw new Error(`فشل تحميل الفئات: ${catResult.error.message}`);
        categories.value = catResult.data ?? [];

        if (courseResult.error) throw new Error(`فشل تحميل الدورات: ${courseResult.error.message}`);
        courses.value = courseResult.data ?? [];

        
    } catch (err: any) {
        
        categories.value = [];
        courses.value = [];
        errorMessage.value = err.message || "فشل تحميل بيانات القوائم.";
        toast.error(errorMessage.value); // عرض خطأ تحميل القوائم
    } finally {
        loadingCategories.value = false;
        loadingCourses.value = false;
    }
}

// Handler for when the selected course changes (الكود الأصلي بدون تغيير)
function handleCourseChange() {
  const selectedCourseId = form.value.course_id;
  
  form.value.module_number = null;
  form.value.lesson_order = null;
  fetchCourseModules(selectedCourseId);
}

// --- Watchers --- (الكود الأصلي مع تعديل resetForm)
watch(() => props.show, (newVal, oldVal) => {
    if (newVal && !oldVal) {
        
        fetchStaticDropdownData();

        if (props.lessonData?.id) {
            
            const { id, title, description, youtube_url, category_id, course_id, module_number, lesson_order } = props.lessonData;
            form.value = { id, title, description, youtube_url, category_id, course_id, module_number, lesson_order };
            if (course_id) {
                fetchCourseModules(course_id);
            } else {
                courseModules.value = [];
            }
        } else {
            
            resetForm(props.preselectedCourseId ?? null);
        }
        errorMessage.value = null;
        validationErrors.title = '';
        validationErrors.youtube_url = '';
        validationErrors.category_id = ''; // التأكد من مسح خطأ الفئة عند الفتح
    } else if (!newVal && oldVal) {
         
    }
}, { immediate: true });

// --- Form Actions ---

function closeModal() { if (!isSaving.value) emit('close'); }

// Validate Form (مع إضافة التحقق من الفئة)
const validateForm = (): boolean => {
    let isValid = true;
    validationErrors.title = '';
    validationErrors.youtube_url = '';
    validationErrors.category_id = ''; // مسح خطأ الفئة السابق
    errorMessage.value = null;

    if (!form.value.title?.trim()) {
        validationErrors.title = 'حقل العنوان مطلوب.';
        isValid = false;
    }
    if (!form.value.youtube_url?.trim()) {
        validationErrors.youtube_url = 'حقل رابط يوتيوب مطلوب.';
        isValid = false;
    } else {
        try {
            const url = new URL(form.value.youtube_url);
            if (!['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname)) {
                validationErrors.youtube_url = 'رابط يوتيوب غير صالح.';
                isValid = false;
            }
        } catch (_) {
            validationErrors.youtube_url = 'صيغة الرابط غير صحيحة.';
            isValid = false;
        }
    }
    // --- إضافة التحقق من الفئة ---
    if (!form.value.category_id) {
        validationErrors.category_id = 'حقل الفئة مطلوب.';
        isValid = false;
    }
    // -----------------------------
    return isValid;
};

// ================================================
// دالة لإرسال الإشعارات (جديدة)
// ================================================
async function sendNewLessonNotifications(lesson: Lesson) {
    // التأكد من وجود البيانات الأساسية للإشعار
    if (!lesson.course_id || !lesson.id || !lesson.title) {
        
        return;
    }

    const courseId = lesson.course_id;
    const lessonId = lesson.id;
    const lessonTitle = lesson.title;

    // البحث عن عنوان الدورة من قائمة الدورات المحملة مسبقًا
    const course = courses.value.find(c => c.id === courseId);
    const courseTitle = course?.title ?? `الدورة #${courseId}`; // عنوان احتياطي

    

    try {
        // 1. الحصول على المستخدمين المسجلين في هذه الدورة
        const { data: enrollments, error: enrollError } = await supabase
            .from('course_enrollments')
            .select('user_id')
            .eq('course_id', courseId);

        if (enrollError) {
            
            toast.warning(`تم حفظ الدرس، لكن فشل جلب الطلاب المسجلين لإرسال الإشعارات: ${enrollError.message}`);
            return; // التوقف هنا لأننا لا نعرف لمن نرسل
        }

        if (!enrollments || enrollments.length === 0) {
            
            return;
        }

        // 2. تجهيز بيانات الإشعار لكل مستخدم مسجل
        const notificationsToSend: NotificationInsert[] = enrollments.map(enrollment => {
            if (!enrollment.user_id) return null; // تجاوز إذا كان user_id غير موجود

            // بناء الرابط للدرس داخل الدورة
            const link = `study/courses/${courseId}/lessons/${lessonId}`;
            const message = `درس جديد: "${lessonTitle}" أُضيف إلى دورة "${courseTitle}".`;

            return {
                user_id: enrollment.user_id,
                message: message,
                link: link,
                is_read: false,
                // created_at يتم التعامل معه بواسطة قاعدة البيانات
            };
        }).filter((n): n is NotificationInsert => n !== null); // تصفية أي إدخالات null

        if (notificationsToSend.length === 0) {
             
             return;
        }

        // 3. إدراج الإشعارات دفعة واحدة
        
        const { error: insertError } = await supabase
            .from('notifications')
            .insert(notificationsToSend);

        if (insertError) {
            
             toast.warning(`تم حفظ الدرس، لكن فشل إرسال بعض أو كل الإشعارات للطلاب: ${insertError.message}`);
        } else {
            
            // toast.info(`تم إرسال ${notificationsToSend.length} إشعارًا للطلاب المسجلين.`); // اختياري
        }

    } catch (err: any) {
        
         toast.error(`حدث خطأ غير متوقع أثناء محاولة إرسال الإشعارات: ${err.message}`);
    }
}

// Save Lesson (مع التعديلات للحصول على البيانات وإرسال الإشعارات)
async function saveLesson() {
  
  if (!validateForm()) {  return; }

  isSaving.value = true;
  errorMessage.value = null;

  // تجهيز البيانات (مع التأكد من تحويل الأرقام)
  const lessonPayload: Partial<TablesInsert<'lessons'> | TablesUpdate<'lessons'>> = {
    title: form.value.title!,
    description: form.value.description?.trim() || null,
    youtube_url: form.value.youtube_url!,
    category_id: form.value.category_id ? Number(form.value.category_id) : null, // تأكد من تحويل الفئة
    course_id: form.value.course_id ? Number(form.value.course_id) : null,
    module_number: form.value.course_id ? (form.value.module_number ? Number(form.value.module_number) : null) : null,
    lesson_order: form.value.course_id ? (form.value.lesson_order ? Number(form.value.lesson_order) : null) : null,
  };

  if (lessonPayload.course_id === null) {
      lessonPayload.module_number = null;
      lessonPayload.lesson_order = null;
  }

  

  try {
    let supabaseError: any = null;
    let savedLessonData: Lesson | null = null; // لتخزين بيانات الدرس المحفوظة/المحدثة

    if (isEditing.value && props.lessonData?.id) { // استخدام props.lessonData.id للتحقق والتحديث
       
       const result = await supabase.from('lessons')
         .update(lessonPayload as TablesUpdate<'lessons'>)
         .eq('id', props.lessonData.id)
         .select() // اختيار الصف المحدث
         .single(); // توقع صف واحد
       supabaseError = result.error;
       savedLessonData = result.data;
    } else {
      
      const result = await supabase.from('lessons')
        .insert(lessonPayload as TablesInsert<'lessons'>)
        .select() // اختيار الصف المُدرج حديثًا
        .single(); // توقع صف واحد
      supabaseError = result.error;
      savedLessonData = result.data;
    }

    
    

    if (supabaseError) throw supabaseError;

    if (!savedLessonData) {
        throw new Error("تم الحفظ بنجاح ولكن لم يتم إرجاع بيانات الدرس.");
    }

    
    toast.success(isEditing.value ? 'تم تحديث الدرس بنجاح!' : 'تم إضافة الدرس بنجاح!');

    // --- إرسال الإشعارات فقط للدروس الجديدة المضافة إلى دورة ---
    if (!isEditing.value && savedLessonData.course_id && savedLessonData.id) {
        
        // انتظر اكتمال محاولة إرسال الإشعارات قبل الإغلاق
        await sendNewLessonNotifications(savedLessonData);
    } else {
        
    }
    // --------------------------------------------------------------

    emit('saved');
    closeModal();

  } catch (err: any) {
    
     let displayError = `فشل حفظ الدرس: ${err.message || 'خطأ غير متوقع'}`;
     if (err.message?.includes('violates foreign key constraint')) {
          // Check if it's category_id or course_id related
          if (err.message.includes('lessons_category_id_fkey')) {
             displayError = 'فشل الحفظ: الفئة المحددة غير موجودة أو غير صالحة.';
          } else if (err.message.includes('lessons_course_id_fkey')) {
             displayError = 'فشل الحفظ: الدورة المحددة غير موجودة أو غير صالحة.';
          } else {
             displayError = 'فشل الحفظ بسبب قيد مفتاح أجنبي غير معروف.';
          }
     } else if (err.code === '23505') { // Unique constraint violation
         displayError = `فشل الحفظ: قد يكون هناك درس آخر بنفس الترتيب في هذه الوحدة/الدورة. (${err.details || err.message})`;
     }
     errorMessage.value = displayError;
     toast.error(displayError); // عرض الخطأ في toast أيضًا
  } finally {
    isSaving.value = false;
    
  }
}

</script>

<style scoped>
/* Using consistent admin styles (الكود الأصلي بدون تغيير) */
.admin-modal-title { @apply text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 mb-4 dark:border-gray-700; }
.admin-label { @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1; }
.admin-input, .admin-select, .admin-textarea {
     @apply mt-1 block w-full px-3 py-2 text-sm rounded-lg shadow-sm
            border border-gray-300 dark:border-gray-600
            bg-gray-50 dark:bg-gray-700
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800
            focus:ring-primary focus:border-primary /* Use primary color for focus */
            focus:outline-none;
}
.admin-textarea { @apply min-h-[80px]; }
.form-hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }
.form-error { @apply mt-1 text-xs text-red-500 dark:text-red-400; }
.form-loading-text { @apply mt-1 text-sm text-gray-500 dark:text-gray-400 italic; }

.button-base { @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150; }
.button-primary { @apply button-base border-transparent text-white bg-primary hover:bg-opacity-85 focus:ring-primary; }
.button-secondary { @apply button-base border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-muted; }

</style>