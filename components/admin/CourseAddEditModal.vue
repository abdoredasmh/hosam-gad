<template>
   <!-- Backdrop -->
   <div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="closeModal">
      <!-- Modal Content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
         <div class="p-6">
            <!-- Header -->
            <div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
               <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ isEditing ? 'تعديل الدورة' : 'إضافة دورة جديدة' }}
               </h3>
               <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>

            <!-- Form Sections -->
            <div class="mt-6 space-y-6">

              <!-- Section 1: Course Details Form -->
              <section>
                <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">تفاصيل الدورة الأساسية</h4>
                <form @submit.prevent="handleSubmitCourseDetails" class="space-y-4" id="course-details-form">
                    <!-- الحقول: Title, Description, Category, YouTube URL, Image URL, Is Active -->
                    <!-- ... (الكود الخاص بهذه الحقول يبقى كما هو في الردود السابقة) ... -->
                   <div>
                      <label for="course-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">العنوان *</label>
                      <input type="text" id="course-title" v-model="formData.title" required class="admin-input">
                   </div>
                   <div>
                      <label for="course-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الوصف</label>
                      <textarea id="course-description" v-model="formData.description" rows="4" class="admin-input"></textarea>
                   </div>
                   <div>
                     <label for="course-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الفئة (اختياري)</label>
                     <select id="course-category" v-model="formData.category_id" class="admin-select">
                       <option :value="null">-- اختر فئة --</option>
                       <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                     </select>
                   </div>
                    <div>
                      <label for="course-youtube-playlist" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط قائمة تشغيل يوتيوب (اختياري)</label>
                      <input type="url" id="course-youtube-playlist" v-model="formData.youtube_playlist_url" class="admin-input" placeholder="https://www.youtube.com/playlist?list=...">
                   </div>
                    <div>
                      <label for="course-image-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط صورة الغلاف (اختياري)</label>
                       <input type="url" id="course-image-url" v-model="formData.image_url" class="admin-input" placeholder="https://...">
                       <p class="form-hint">أدخل رابطًا مباشرًا للصورة أو اترك الحقل فارغًا.</p>
                   </div>
                    <div class="flex items-center">
                      <input id="is_active" v-model="formData.is_active" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600">
                      <label for="is_active" class="ms-2 block text-sm text-gray-900 dark:text-gray-300">نشر الدورة (مرئية للطلاب)</label>
                    </div>
                </form>
              </section>

              <!-- ============================================= -->
              <!-- Section 2: Module Management (هذا هو الجزء المضاف) -->
              <!-- ============================================= -->
              <section v-if="isEditing && props.courseData?.id" class="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">إدارة وحدات الدورة</h4>

                  <!-- Loading / Error States for Modules -->
                  <div v-if="modulesLoading" class="text-center py-4">
                      <LoadingSpinner small />
                      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">جاري تحميل الوحدات...</p>
                  </div>
                  <div v-else-if="modulesError" class="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md text-sm">
                      حدث خطأ أثناء تحميل الوحدات: {{ modulesError }}
                      <button @click="fetchModules" class="ms-2 underline font-semibold">إعادة المحاولة</button>
                  </div>

                  <!-- Modules List & Forms -->
                   <div v-else class="space-y-3">
                       <!-- Message if no modules -->
                       <div v-if="courseModules.length === 0 && !showAddModuleForm" class="text-center text-sm text-gray-500 dark:text-gray-400 py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                           لم يتم إضافة وحدات لهذه الدورة بعد.
                       </div>

                       <!-- List of existing modules -->
                       <ul v-else class="space-y-2">
                            <li v-for="module in courseModules" :key="module.id" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600">
                                <div class="flex items-center space-x-3 rtl:space-x-reverse flex-grow min-w-0">
                                    <span class="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded flex-shrink-0">#{{ module.module_number }}</span>
                                    <span class="font-medium text-gray-800 dark:text-gray-200 truncate" :title="module.title">{{ module.title }}</span>
                                    <!-- Optional: Show description tooltip or truncated text -->
                                    <span v-if="module.description" class="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:inline-block" :title="module.description"> - {{ module.description }}</span>
                                </div>
                                <div class="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0">
                                    <!-- Edit Button with SVG Icon -->
                                    <button @click="startEditingModule(module)" type="button" :disabled="moduleActionLoading" class="button-icon text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="تعديل الوحدة">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                                        </svg>
                                    </button>
                                    <!-- Delete Button with SVG Icon -->
                                    <button @click="confirmDeleteModule(module)" type="button" :disabled="moduleActionLoading" class="button-icon text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="حذف الوحدة">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </li>
                       </ul>

                       <!-- Add/Edit Module Form (collapsible or inline) -->
                       <div v-if="showAddModuleForm || editingModule" class="mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700/30">
                           <h5 class="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">
                               {{ editingModule ? `تعديل الوحدة #${editingModule.module_number}` : 'إضافة وحدة جديدة' }}
                           </h5>
                           <form @submit.prevent="saveModule" class="space-y-3">
                               <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                   <div>
                                       <label :for="`module-number-${editingModule?.id ?? 'new'}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رقم الوحدة *</label>
                                       <input type="number" :id="`module-number-${editingModule?.id ?? 'new'}`" v-model.number="moduleFormData.module_number" required min="1" class="admin-input mt-1">
                                   </div>
                                   <div class="sm:col-span-2">
                                       <label :for="`module-title-${editingModule?.id ?? 'new'}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم الوحدة *</label>
                                       <input type="text" :id="`module-title-${editingModule?.id ?? 'new'}`" v-model="moduleFormData.title" required class="admin-input mt-1">
                                   </div>
                               </div>
                               <div>
                                   <label :for="`module-description-${editingModule?.id ?? 'new'}`" class="block text-sm font-medium text-gray-700 dark:text-gray-300">وصف الوحدة (اختياري)</label>
                                   <textarea :id="`module-description-${editingModule?.id ?? 'new'}`" v-model="moduleFormData.description" rows="2" class="admin-textarea mt-1"></textarea>
                               </div>
                               <!-- Module Form Error -->
                               <div v-if="moduleFormError" class="text-red-500 text-xs p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700">{{ moduleFormError }}</div>
                               <!-- Module Form Actions -->
                               <div class="flex justify-end space-x-2 rtl:space-x-reverse pt-2">
                                   <button type="button" @click="cancelModuleForm" :disabled="moduleActionLoading" class="button-secondary-small">إلغاء</button>
                                   <button type="submit" :disabled="moduleActionLoading" class="button-primary-small">
                                       <span v-if="moduleActionLoading">جاري الحفظ...</span>
                                       <span v-else>{{ editingModule ? 'حفظ التعديل' : 'إضافة الوحدة' }}</span>
                                   </button>
                               </div>
                           </form>
                       </div>

                       <!-- Add Module Button (Show only if not adding/editing) -->
                       <div v-if="!showAddModuleForm && !editingModule" class="mt-4">
                           <button @click="showAddModuleForm = true" type="button" class="button-outline w-full sm:w-auto">
                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1">
                                   <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                               </svg>
                               إضافة وحدة جديدة
                           </button>
                       </div>
                  </div>
              </section>
              <!-- ============================================= -->
              <!-- End of Module Management Section            -->
              <!-- ============================================= -->

              <!-- Error Message for Main Course Details Form -->
              <div v-if="errorMessage" class="text-red-600 dark:text-red-400 text-sm p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700">
                 {{ errorMessage }}
              </div>

               <!-- Main Modal Actions -->
               <div class="pt-6 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700">
                  <button type="button" @click="closeModal" :disabled="formLoading || moduleActionLoading" class="button-secondary">إغلاق</button>
                  <button type="submit" form="course-details-form" :disabled="formLoading || moduleActionLoading" class="button-primary">
                     <span v-if="formLoading">جاري حفظ التفاصيل...</span>
                     <span v-else>{{ isEditing ? 'حفظ تفاصيل الدورة' : 'إضافة الدورة' }}</span>
                  </button>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'; // Removed onMounted as watch handles initial fetch now
import type { Database, Tables } from '~/types/database.types';
import { useSupabaseClient } from '#imports';
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // Assuming you have this

// --- Type Definitions ---
type Course = Tables<'study_courses'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;
type CourseModule = Tables<'course_modules'>;
type CourseModuleInsert = Tables<'course_modules'>['Insert'];
type CourseModuleUpdate = Tables<'course_modules'>['Update'];

// --- Props and Emits ---
const props = defineProps<{
  courseData: Course | null;
  categories: Category[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

// --- Supabase Client ---
const supabase = useSupabaseClient<Database>();

// --- Component State ---
const formLoading = ref(false);
const errorMessage = ref('');

// Course Details State
const isEditing = computed(() => !!props.courseData?.id);
const formData = reactive<Partial<Course>>({
    title: '', description: null, category_id: null, youtube_playlist_url: null, image_url: null, is_active: false,
});

// Module Management State
const courseModules = ref<CourseModule[]>([]);
const modulesLoading = ref(false);
const modulesError = ref<string | null>(null);
const showAddModuleForm = ref(false);
const editingModule = ref<CourseModule | null>(null);
const moduleActionLoading = ref(false);
const moduleFormError = ref<string | null>(null);

const moduleFormData = reactive<Partial<CourseModuleInsert>>({
    module_number: null, title: '', description: null,
});

// --- Watchers ---
watch(() => props.courseData, (newCourse) => {
  
  if (newCourse?.id) {
    
    Object.assign(formData, { /* ... populate formData ... */
        title: newCourse.title, description: newCourse.description, category_id: newCourse.category_id, youtube_playlist_url: newCourse.youtube_playlist_url, image_url: newCourse.image_url, is_active: newCourse.is_active ?? false,
    });
    fetchModules(); // Fetch modules when editing
  } else {
    
    Object.assign(formData, { /* ... reset formData ... */
        title: '', description: null, category_id: null, youtube_playlist_url: null, image_url: null, is_active: false,
    });
    courseModules.value = []; // Clear modules
  }
  errorMessage.value = '';
  resetModuleForm();
}, { immediate: true, deep: true });

// --- Module Management Functions ---
async function fetchModules() {
    if (!isEditing.value || !props.courseData?.id) {
        
        courseModules.value = []; return;
    }
    const currentCourseId = props.courseData.id;
    
    modulesLoading.value = true;
    modulesError.value = null;
    try {
        const { data, error } = await supabase.from('course_modules').select('*').eq('course_id', currentCourseId).order('module_number', { ascending: true });
        if (error) throw error;
        courseModules.value = data || [];
        
    } catch (err: any) {
        
        modulesError.value = err.message || 'Unknown error';
        courseModules.value = [];
    } finally {
        modulesLoading.value = false;
    }
}

function resetModuleForm() {
    showAddModuleForm.value = false;
    editingModule.value = null;
    moduleFormData.module_number = null;
    moduleFormData.title = '';
    moduleFormData.description = null;
    moduleFormError.value = null;
}

function startEditingModule(module: CourseModule) {
    resetModuleForm();
    editingModule.value = { ...module };
    moduleFormData.module_number = module.module_number;
    moduleFormData.title = module.title;
    moduleFormData.description = module.description;
    // Ensure the form is visible if it was hidden
    // No need for showAddModuleForm = true here, v-if handles editingModule
    
}

function cancelModuleForm() {
    resetModuleForm();
}

async function saveModule() {
    if (!props.courseData?.id) { /* ... error handling ... */ return; }
    if (moduleFormData.module_number === null || moduleFormData.module_number <= 0 || !moduleFormData.title?.trim()) {
        moduleFormError.value = "رقم الوحدة (أكبر من 0) واسم الوحدة مطلوبان."; return;
    }

    moduleActionLoading.value = true;
    moduleFormError.value = null;
    const currentCourseId = props.courseData.id;

    const dataToSave: Partial<CourseModuleInsert | CourseModuleUpdate> = {
        course_id: currentCourseId, module_number: moduleFormData.module_number, title: moduleFormData.title.trim(), description: moduleFormData.description?.trim() || null,
    };

    try {
        let error;
        const moduleNumberToCheck = dataToSave.module_number!;

        if (editingModule.value?.id) {
            
            // Check for conflict only if module number changed
            if (editingModule.value.module_number !== moduleNumberToCheck) {
                 const { data: existing, error: checkError } = await supabase.from('course_modules').select('id').eq('course_id', currentCourseId).eq('module_number', moduleNumberToCheck).not('id', 'eq', editingModule.value.id).maybeSingle();
                 if (checkError) throw checkError;
                 if (existing) throw new Error(`رقم الوحدة ${moduleNumberToCheck} موجود بالفعل.`);
             }
            const { error: updateError } = await supabase.from('course_modules').update(dataToSave as CourseModuleUpdate).eq('id', editingModule.value.id);
            error = updateError;
        } else {
            
             const { data: existing, error: checkError } = await supabase.from('course_modules').select('id').eq('course_id', currentCourseId).eq('module_number', moduleNumberToCheck).maybeSingle();
             if (checkError) throw checkError;
             if (existing) throw new Error(`رقم الوحدة ${moduleNumberToCheck} موجود بالفعل.`);
            const { error: insertError } = await supabase.from('course_modules').insert(dataToSave as CourseModuleInsert);
            error = insertError;
        }
        if (error) throw error;
        
        resetModuleForm();
        await fetchModules();
    } catch (err: any) {
        
        moduleFormError.value = `فشل حفظ الوحدة: ${err.message}`;
    } finally {
        moduleActionLoading.value = false;
    }
}

async function confirmDeleteModule(module: CourseModule) {
     if (!props.courseData?.id || !module.id) return;
    if (!confirm(`هل أنت متأكد من حذف الوحدة "${module.title}" (رقم ${module.module_number})؟ \n\nتحذير: سيتم إلغاء ربط أي دروس حالية بهذه الوحدة.`)) return;

    moduleActionLoading.value = true;
     moduleFormError.value = null;
    const currentCourseId = props.courseData.id;
    const moduleNumberToDelete = module.module_number;
    const moduleIdToDelete = module.id;
    

    try {
         
         const { error: updateLessonsError } = await supabase.from('lessons').update({ module_number: null }).eq('course_id', currentCourseId).eq('module_number', moduleNumberToDelete);
        if (updateLessonsError) throw new Error(`فشل إلغاء ربط الدروس: ${updateLessonsError.message}`);
         

         
        const { error: deleteModuleError } = await supabase.from('course_modules').delete().eq('id', moduleIdToDelete);
        if (deleteModuleError) throw deleteModuleError;
        

        await fetchModules();
    } catch (err: any) {
        
         moduleFormError.value = `فشل حذف الوحدة: ${err.message}`;
    } finally {
        moduleActionLoading.value = false;
    }
}

// --- Course Details Submit Function ---
async function handleSubmitCourseDetails() {
    formLoading.value = true;
    errorMessage.value = '';
    const dataToSubmit = { /* ... same as before ... */
        title: formData.title.trim(), description: formData.description?.trim() || null, category_id: formData.category_id || null, youtube_playlist_url: formData.youtube_playlist_url?.trim() || null, image_url: formData.image_url?.trim() || null, is_active: formData.is_active || false,
    };

    try {
         if (isEditing.value && props.courseData?.id) {
            const { error } = await supabase.from('study_courses').update(dataToSubmit as CourseUpdate).eq('id', props.courseData.id);
            if (error) throw error;
        } else {
             const { error } = await supabase.from('study_courses').insert(dataToSubmit as CourseInsert);
            if (error) throw error;
        }
        emit('saved');
        
    } catch (err: any) {
        
        errorMessage.value = `فشل حفظ تفاصيل الدورة: ${err.message}`;
    } finally {
        formLoading.value = false;
    }
}

// --- Modal Close Function ---
function closeModal() {
  if (!formLoading.value && !moduleActionLoading.value) {
    emit('close');
  }
}
</script>

<style scoped>
/* === Generic Inputs & Base Styles === */
.admin-input,
.admin-select,
.admin-textarea {
    @apply block w-full px-3 py-2 text-sm rounded-lg shadow-sm
           border border-gray-300 dark:border-gray-600
           bg-gray-50 dark:bg-gray-700
           text-gray-900 dark:text-gray-100
           placeholder-gray-400 dark:placeholder-gray-500
           focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800
           focus:ring-olive-green focus:border-olive-green
           focus:outline-none;
}
.admin-textarea { @apply min-h-[60px]; }
.form-hint { @apply mt-1 text-xs text-gray-500 dark:text-gray-400; }

/* === Buttons - Base and Variants === */
.button-base {
    @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150;
}
.button-primary {
    @apply button-base border-transparent text-white bg-primary hover:bg-opacity-85 focus:ring-primary; /* primary links to olive-green var */
}
.button-secondary {
    @apply button-base border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-muted;
}

.button-icon {
    @apply p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600/50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-muted disabled:opacity-50 transition-colors duration-150;
}
.button-icon svg { @apply w-4 h-4; } /* Ensure icons have size */

/* === Small Buttons === */
.button-small-base {
     @apply inline-flex items-center justify-center px-3 py-1.5 border text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150;
}
.button-primary-small {
    /* Using blue-muted for small primary actions */
    @apply button-small-base border-transparent text-white bg-blue-muted hover:bg-opacity-85 focus:ring-blue-muted;
}
.button-secondary-small {
    @apply button-small-base border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-muted;
}
</style>