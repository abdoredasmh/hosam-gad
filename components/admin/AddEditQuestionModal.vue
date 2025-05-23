<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">

      <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      </TransitionChild>

 
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3">
                {{ isEditing ? 'تعديل السؤال' : 'إضافة سؤال جديد' }} للاختبار
              </DialogTitle>

              <form @submit.prevent="saveQuestion" class="space-y-6">
           
                <div>
                  <label for="question-text" class="block text-sm font-medium text-gray-700 dark:text-gray-300">نص السؤال *</label>
                  <textarea id="question-text" v-model="form.question_text" required rows="4" class="mt-1 block w-full input-field"></textarea>
                </div>

            
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label for="question-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300">نوع السؤال *</label>
                    <select id="question-type" v-model="form.type" required @change="resetOptionsBasedOnType" class="mt-1 block w-full input-field">
                      <option value="mcq">اختيار من متعدد (MCQ)</option>
                      <option value="true_false">صح / خطأ (T/F)</option>
                      <option value="written">كتابي (Written)</option>
                    </select>
                  </div>
                  <div>
                    <label for="question-points" class="block text-sm font-medium text-gray-700 dark:text-gray-300">النقاط *</label>
                    <input type="number" id="question-points" v-model.number="form.points" required min="0" class="mt-1 block w-full input-field" />
                  </div>
                  <div>
                    <label for="question-order" class="block text-sm font-medium text-gray-700 dark:text-gray-300">ترتيب السؤال</label>
                    <input type="number" id="question-order" v-model.number="form.question_order" min="1" placeholder="اختياري" class="mt-1 block w-full input-field" />
                  </div>
                </div>

             
                <div v-if="form.type === 'mcq' || form.type === 'true_false'" class="space-y-4 pt-4 border-t dark:border-gray-700">
                  <h4 class="text-md font-medium text-gray-800 dark:text-gray-200">
                    {{ form.type === 'mcq' ? 'خيارات الإجابة (MCQ)' : 'تحديد الإجابة الصحيحة (صح/خطأ)' }}
                    <span class="text-red-600">*</span>
                  </h4>

               
                  <div v-if="form.type === 'mcq'" class="space-y-3">
                    <div v-for="(option, index) in mcqOptions" :key="option.tempId" class="flex items-center gap-2 p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50">
                 
                      <input
                        :id="'mcq-correct-' + option.tempId" type="radio" name="correct_mcq_option"
                        :value="option.tempId" :checked="option.is_correct"
                        @change="setCorrectMcqOption(option.tempId)"
                        class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 flex-shrink-0"
                        title="تحديد كإجابة صحيحة"
                      />
                     
                      <input
                        :id="'mcq-option-' + option.tempId" type="text" v-model="option.option_text" required
                        :placeholder="`نص الخيار ${index + 1}`"
                        class="flex-grow input-field input-sm"
                      />
                    
                      <button
                        type="button" @click="removeMcqOption(option.tempId)" :disabled="mcqOptions.length <= 2"
                        class="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:text-red-400 flex-shrink-0"
                        title="حذف الخيار"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.5-.75v.75h1V2.5h-1Z" clip-rule="evenodd" /></svg>
                      </button>
                    </div>
                  
                    <button type="button" @click="addMcqOption" class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z" clip-rule="evenodd" /></svg>
                      <span>إضافة خيار آخر</span>
                    </button>
                  </div>

               
                  <div v-if="form.type === 'true_false'" class="flex items-center space-x-6 rtl:space-x-reverse">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">الإجابة الصحيحة هي:</span>
                    <div class="flex items-center gap-4">
                      <label class="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="tf_correct" :value="true" :checked="isTrueFalseCorrect === true" @change="setTrueFalseCorrect(true)" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500">
                        <span class="text-sm text-green-700 dark:text-green-300 font-medium">صحيح</span>
                      </label>
                      <label class="flex items-center gap-1 cursor-pointer">
                        <input type="radio" name="tf_correct" :value="false" :checked="isTrueFalseCorrect === false" @change="setTrueFalseCorrect(false)" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500">
                        <span class="text-sm text-red-700 dark:text-red-300 font-medium">خطأ</span>
                      </label>
                    </div>
                  </div>
                </div>

                
                <div v-if="form.type === 'written'">
                  <p class="text-sm text-gray-600 dark:text-gray-400 italic">سيتم تصحيح إجابات الأسئلة الكتابية يدويًا.</p>
                </div>

              
                <p v-if="formError" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ formError }}</p>

               
                <div class="mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5">
                  <button
                    type="submit"
                    :disabled="isSaving || !isFormValid"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                  >
                    <LoadingSpinner v-if="isSaving" class="w-5 h-5 text-white -ml-1 mr-2" />
                    {{ isSaving ? 'جاري الحفظ...' : (isEditing ? 'حفظ التعديلات' : 'إضافة السؤال') }}
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
import { ref, watch, computed, type PropType } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue';
import type { Database, Tables } from '~/types/database.types';
import { useSupabaseClient, useNuxtApp } from '#imports';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import type { PostgrestError } from '@supabase/supabase-js';

// Define types
type Question = Tables<'quiz_questions'>;
type Option = Tables<'question_options'>;
type QuestionWithOptions = Question & { question_options?: Option[] };
type McqOptionForm = { tempId: number; id?: number; option_text: string; is_correct: boolean };

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  quizId: { type: Number, required: true },
  questionData: { type: Object as PropType<QuestionWithOptions | null>, default: null }
});

const emit = defineEmits(['update:modelValue', 'saved']);

const supabase = useSupabaseClient<Database>();
const { $toast } = useNuxtApp();

const isOpen = ref(props.modelValue);
const isSaving = ref(false);
const formError = ref<string | null>(null);

// Form state
const form = ref<Partial<Omit<Question, 'created_at' | 'updated_at'>>>({}); // Omit auto-managed fields
const mcqOptions = ref<McqOptionForm[]>([]);
const isTrueFalseCorrect = ref<boolean | null>(null);

const isEditing = computed(() => !!props.questionData?.id);
let nextOptionTempId = Date.now(); // More robust unique ID generation

// --- Form Initialization ---
const initializeForm = () => {
  formError.value = null; isSaving.value = false; mcqOptions.value = []; isTrueFalseCorrect.value = null; nextOptionTempId = Date.now();
  if (isEditing.value && props.questionData) {
    form.value = { ...props.questionData };
    if (form.value.type === 'mcq' && props.questionData.question_options) {
      mcqOptions.value = props.questionData.question_options.map((opt, index) => ({ tempId: nextOptionTempId + index, id: opt.id, option_text: opt.option_text, is_correct: opt.is_correct }));
      nextOptionTempId += props.questionData.question_options.length;
    } else if (form.value.type === 'true_false' && props.questionData.question_options) {
      const correctOption = props.questionData.question_options.find(opt => opt.is_correct);
      isTrueFalseCorrect.value = correctOption?.option_text.toLowerCase() === 'true';
    }
  } else {
    form.value = { question_text: '', type: 'mcq', points: 1, question_order: null, quiz_id: props.quizId };
    addMcqOption(); addMcqOption();
  }
  resetOptionsBasedOnType();
};

// --- Watchers ---
watch(() => props.modelValue, (newVal) => { isOpen.value = newVal; if (newVal) initializeForm(); });

// --- MCQ Option Management ---
const addMcqOption = () => { if (form.value.type !== 'mcq') return; mcqOptions.value.push({ tempId: nextOptionTempId++, option_text: '', is_correct: false }); };
const removeMcqOption = (tempIdToRemove: number) => {
    if (form.value.type !== 'mcq' || mcqOptions.value.length <= 2) return;
    const indexToRemove = mcqOptions.value.findIndex(opt => opt.tempId === tempIdToRemove);
    if (indexToRemove !== -1) {
        const wasCorrect = mcqOptions.value[indexToRemove].is_correct;
        mcqOptions.value.splice(indexToRemove, 1);
        if (wasCorrect && mcqOptions.value.length > 0 && !mcqOptions.value.some(opt => opt.is_correct)) { mcqOptions.value[0].is_correct = true; }
    }
};
const setCorrectMcqOption = (correctTempId: number) => { if (form.value.type !== 'mcq') return; mcqOptions.value = mcqOptions.value.map(opt => ({ ...opt, is_correct: opt.tempId === correctTempId })); };

// --- T/F Option Management ---
const setTrueFalseCorrect = (isCorrect: boolean) => { isTrueFalseCorrect.value = isCorrect; };

// --- Type Change Handling ---
const resetOptionsBasedOnType = () => {
    if (form.value.type === 'mcq') {
        if (mcqOptions.value.length < 2) { mcqOptions.value = []; addMcqOption(); addMcqOption(); }
        if (mcqOptions.value.length > 0 && !mcqOptions.value.some(opt => opt.is_correct)) mcqOptions.value[0].is_correct = true;
        isTrueFalseCorrect.value = null;
    } else if (form.value.type === 'true_false') {
        mcqOptions.value = []; if (isTrueFalseCorrect.value === null) isTrueFalseCorrect.value = true;
    } else { mcqOptions.value = []; isTrueFalseCorrect.value = null; }
};

// --- Form Validation ---
const isFormValid = computed(() => {
  if (!form.value.question_text?.trim() || !form.value.type) return false;
  if (form.value.points === null || form.value.points === undefined || form.value.points < 0) return false;
  if (form.value.type === 'mcq' && (mcqOptions.value.length < 2 || !mcqOptions.value.some(opt => opt.is_correct) || mcqOptions.value.some(opt => !opt.option_text.trim()))) return false;
  if (form.value.type === 'true_false' && isTrueFalseCorrect.value === null) return false;
  return true;
});

// --- Save Question Logic ---
const saveQuestion = async () => {
    if (!isFormValid.value || isSaving.value) return;
    isSaving.value = true; formError.value = null;

    const questionPayload: Omit<Question, 'id' | 'created_at' | 'updated_at'> = { quiz_id: props.quizId, question_text: form.value.question_text!, type: form.value.type!, question_order: form.value.question_order || null, points: form.value.points ?? 1 };
    let optionsPayload: Omit<Option, 'id' | 'question_id'>[] = [];
    if (form.value.type === 'mcq') optionsPayload = mcqOptions.value.map(opt => ({ option_text: opt.option_text, is_correct: opt.is_correct, option_order: null }));
    else if (form.value.type === 'true_false') optionsPayload = [{ option_text: 'True', is_correct: isTrueFalseCorrect.value === true, option_order: 1 },{ option_text: 'False', is_correct: isTrueFalseCorrect.value === false, option_order: 2 }];

    try {
        let savedQuestionId: number | null = null;
        if (isEditing.value && form.value.id) { // --- UPDATE ---
            const { error: updateQError } = await supabase.from('quiz_questions').update({ ...questionPayload, updated_at: new Date().toISOString() }).eq('id', form.value.id); if (updateQError) throw updateQError;
            savedQuestionId = form.value.id;
            const { error: deleteOptError } = await supabase.from('question_options').delete().eq('question_id', form.value.id); if (deleteOptError) throw deleteOptError;
        } else { // --- INSERT ---
            const { data: newQ, error: insertQError } = await supabase.from('quiz_questions').insert(questionPayload).select('id').single(); if (insertQError) throw insertQError; if (!newQ?.id) throw new Error("Failed to get inserted question ID.");
            savedQuestionId = newQ.id;
        }
        // Insert new options if applicable
        if (optionsPayload.length > 0 && savedQuestionId) {
            const optionsToInsert = optionsPayload.map(opt => ({ ...opt, question_id: savedQuestionId! }));
            const { error: insertOptError } = await supabase.from('question_options').insert(optionsToInsert); if (insertOptError) throw insertOptError;
        }
        // Fetch the final saved question with options
        const { data: finalQuestionData, error: finalQError } = await supabase.from('quiz_questions').select(`*, question_options (*)`).eq('id', savedQuestionId!).single();
        if (finalQError) throw finalQError;
        if (!finalQuestionData) throw new Error("Failed to fetch final saved question data.");

        emit('saved', finalQuestionData as QuestionWithOptions); closeModal();
    } catch (err: any) {  formError.value = `فشل حفظ السؤال: (${(err as PostgrestError).message || 'خطأ غير معروف'})`;
    } finally { isSaving.value = false; }
};

// --- Modal Control ---
function closeModal() { if (isSaving.value) return; isOpen.value = false; emit('update:modelValue', false); }

</script>

<style scoped>
.input-field { @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70; }
.input-sm { @apply text-sm px-2 py-1; }
</style>