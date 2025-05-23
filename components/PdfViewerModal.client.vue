<template>
  <ClientOnly>
    <TransitionRoot appear :show="show" as="div">
      <Dialog as="div" @close="closeModal" class="relative z-50">
        <!-- Backdrop -->
        <TransitionChild as="div" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75" />
        </TransitionChild>

        <!-- Modal Container -->
        <div class="fixed inset-0 overflow-hidden">
          <div class="flex min-h-full items-stretch justify-center text-center">
            <TransitionChild as="div" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
              <!-- Modal Panel - Occupies full height -->
              
              <DialogPanel class="w-screen sm:w-full max-w-6xl transform rounded-none bg-beige-light dark:bg-cream-gray text-end shadow-xl transition-all flex flex-col h-screen">

                
                <div class="bg-gray-100 dark:bg-gray-800 p-2 border-b border-gray-300 dark:border-gray-700 flex-shrink-0 shadow-sm">
                   
                   <div class="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-y-2 gap-x-4 max-w-4xl mx-auto">

                       
                       
                       <div class="flex items-center space-x-2 rtl:space-x-reverse flex-grow min-w-0 order-1 sm:order-none w-full sm:w-auto justify-center sm:justify-start">
                           <DialogTitle as="h3" class="text-base font-medium text-gray-800 dark:text-gray-200 truncate hidden sm:block" :title="bookTitle">
                               {{ bookTitle || 'عرض المستند' }}
                           </DialogTitle>
                           <div class="flex items-center" v-if="pdfDoc">
                                <button @click="prevPage" :disabled="currentPage <= 1 || isRenderingPage" class="button-toolbar-mobile" aria-label="الصفحة السابقة" title="الصفحة السابقة"> <svg class="icon-toolbar" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg> </button>
                                <input type="number" v-model.number="pageInput" @change="goToPage" @keyup.enter="goToPage" :min="1" :max="numPages" :disabled="isRenderingPage || numPages === 0" class="page-input-toolbar-mobile" aria-label="رقم الصفحة الحالي">
                                <span class="mx-1 text-sm text-gray-600 dark:text-gray-400"> / {{ numPages || '؟' }} </span>
                                <button @click="nextPage" :disabled="currentPage >= numPages || isRenderingPage || numPages === 0" class="button-toolbar-mobile" aria-label="الصفحة التالية" title="الصفحة التالية"> <svg class="icon-toolbar" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg> </button>
                           </div>
                       </div>

                       
                       
                       <div class="flex items-center space-x-1 rtl:space-x-reverse order-3 sm:order-none mx-auto sm:mx-0">
                           <button @click="zoomOut" :disabled="currentScale <= MIN_ZOOM || isRenderingPage || !pdfDoc" class="button-toolbar-mobile" aria-label="تصغير" title="تصغير"> <svg class="icon-toolbar" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg> </button>
                           <select v-model="zoomLevel" @change="applyZoomLevel" :disabled="isRenderingPage || !pdfDoc" class="zoom-select-toolbar-mobile">
                               <option value="auto">تلقائي</option>
                               <option value="page-actual">الحجم الأصلي</option>
                               <option value="page-width">ملاءمة العرض</option>
                               <option value="page-height">ملاءمة الطول</option>
                               <option value="page-fit">ملاءمة الصفحة</option>
                               <option v-for="z in zoomOptions" :key="z" :value="z/100">{{ z }}%</option>
                           </select>
                           <button @click="zoomIn" :disabled="currentScale >= MAX_ZOOM || isRenderingPage || !pdfDoc" class="button-toolbar-mobile" aria-label="تكبير" title="تكبير"> <svg class="icon-toolbar" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" /></svg> </button>
                           
                           <div class="separator-toolbar hidden sm:block"></div>
                           
                           <button @click="rotateCounterClockwise" :disabled="isRenderingPage || !pdfDoc" class="button-toolbar-mobile" aria-label="تدوير لليسار" title="تدوير لليسار"> <svg class="icon-toolbar" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M15.312 11.34a7.5 7.5 0 11-10.616.008 1 1 0 111.415-1.415 5.5 5.5 0 107.779-.002l.006-.006a1 1 0 111.416 1.415zM10 4.5a.75.75 0 01.75.75v4.477l2.474-1.165a.75.75 0 11.602 1.278l-3.5 1.65a.75.75 0 01-.602 0l-3.5-1.65a.75.75 0 01.602-1.278L9.25 9.727V5.25A.75.75 0 0110 4.5z" clip-rule="evenodd" /></svg> </button>
                           <button @click="rotateClockwise" :disabled="isRenderingPage || !pdfDoc" class="button-toolbar-mobile" aria-label="تدوير لليمين" title="تدوير لليمين"> <svg class="icon-toolbar" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.688 11.34a7.5 7.5 0 1110.616.008 1 1 0 11-1.415-1.415 5.5 5.5 0 10-7.779-.002l-.006-.006a1 1 0 11-1.416 1.415zM10 4.5a.75.75 0 01.75.75v4.477l2.474 1.165a.75.75 0 11-.602 1.278l-3.5-1.65a.75.75 0 01-.602 0l-3.5 1.65a.75.75 0 11-.602-1.278L9.25 9.727V5.25A.75.75 0 0110 4.5z" clip-rule="evenodd" /></svg> </button>
                       </div>

                       
                       
                       <div class="flex items-center space-x-1 rtl:space-x-reverse order-2 sm:order-none">
                            <button v-if="pdfBlob && !pdfError" @click="downloadPdfBlob" class="button-toolbar-mobile" title="تنزيل الملف" aria-label="تنزيل"> <svg class="icon-toolbar" viewBox="0 0 20 20" fill="currentColor"> <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75Z" /> <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" /> </svg> </button>
                           <button @click="printDocument" :disabled="!pdfDoc || isRenderingPage" class="button-toolbar-mobile" title="طباعة" aria-label="طباعة"> <svg class="icon-toolbar" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.588c0 .47-.187.921-.518 1.251L13.25 9h-6.5L5.518 7.588A1.75 1.75 0 015 6.338V2.75zm11.754 5.996a1.75 1.75 0 00-1.252-.518H4.498a1.75 1.75 0 00-1.252.518C2.21 9.494 2 10.384 2 11.338v3.912c0 .954.784 1.75 1.75 1.75h12.5c.966 0 1.75-.796 1.75-1.75v-3.912c0-.954-.21-1.844-.746-2.592zM16 12.5a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd" /></svg> </button>
                           <button type="button" class="button-toolbar-mobile text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900" @click="closeModal" aria-label="إغلاق العارض" title="إغلاق"> <svg class="icon-toolbar" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg> </button>
                       </div>
                   </div>
                </div>


                <div class="flex-grow overflow-hidden relative bg-gray-500 dark:bg-gray-900">

                  <div v-if="loading" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-500/70 dark:bg-gray-900/70 z-10" aria-live="polite">
                    <LoadingSpinner />
                    <p class="mt-2 text-white">{{ loadingMessage }}</p>
                  </div>

                  <div v-else-if="pdfError" class="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 text-white text-center" aria-live="assertive">
                    <svg class="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-red-400" fill="currentColor" viewBox="0 0 20 20"> <title>خطأ</title> <path fill-rule="evenodd" d="M8.257 3.099c.763-1.36 2.683-1.36 3.446 0l6.518 11.636c.75 1.34-.213 3.01-1.723 3.01H3.462c-1.51 0-2.473-1.67-1.723-3.01L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-6a1 1 0 00-.993.883L9 8v3a1 1 0 001.993.117L11 11V8a1 1 0 00-1-1z" clip-rule="evenodd" /> </svg>
                    <p class="font-semibold text-lg">حدث خطأ</p>
                    <p class="text-base mt-1">{{ pdfError }}</p>
                    <button @click="attemptLoadPdf" class="mt-6 button-secondary text-sm"> إعادة المحاولة </button>
                  </div>

                   
                  <div v-else-if="pdfDoc" ref="canvasContainer" class="w-full h-full overflow-auto p-2 sm:p-4 flex justify-center items-start">
                      <canvas ref="pdfCanvas" class="pdf-canvas-shadow"></canvas>
                  </div>

                   <div v-else class="absolute inset-0 flex items-center justify-center text-gray-400 p-4 text-center">
                    <p>لم يتم تحديد ملف لعرضه أو جارٍ البدء.</p>
                  </div>
                </div>

              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </ClientOnly>
</template>

<script setup lang="ts">
// ... (نفس الكود الموجود في script setup) ...
import { ref, watch, shallowRef, onMounted, onUnmounted, nextTick, computed } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';
import type { Database } from '~/types/database.types';
import type { StorageError } from '@supabase/storage-js';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask, PDFPageViewport } from 'pdfjs-dist';
import LoadingSpinner from '~/components/LoadingSpinner.vue';

// --- PDF.js Worker Configuration ---
const WORKER_URL = '/pdf.worker.mjs';
if (typeof window !== 'undefined') {
   pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
  
}


const props = defineProps({
  show: Boolean,
  storagePath: String,
  bookTitle: String
});

const emit = defineEmits(['close']);

const supabase = useSupabaseClient<Database>();
const loading = ref(false);
const loadingMessage = ref('جارٍ تحميل الملف...');
const pdfError = ref<string | null>(null);
const pdfBlob = ref<Blob | null>(null);
const pdfDoc = shallowRef<PDFDocumentProxy | null>(null);
const pdfCanvas = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLDivElement | null>(null);
const currentPage = ref(1);
const numPages = ref(0);
const isRenderingPage = ref(false);
let currentRenderTask: RenderTask | null = null;
let pdfBlobUrl: string | null = null;

// --- State for Zoom, Page Input, and Rotation ---
const currentScale = ref(1.0);
const pageInput = ref(currentPage.value);
const currentRotation = ref(0);
type ZoomLevel = number | 'auto' | 'page-actual' | 'page-width' | 'page-fit' | 'page-height';
const zoomLevel = ref<ZoomLevel>('auto');

// --- Zoom Constants ---
const ZOOM_STEP = 0.25;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10.0;
const zoomOptions = [25, 50, 75, 100, 125, 150, 200, 300, 400];

const BUCKET_NAME = 'book-files';

// --- Error Message Function ---
function getUserFriendlyErrorMessage(error: StorageError | Error | unknown): string {

  if (error instanceof Error) {
      // ... (same error handling logic)
       if ('statusCode' in error && typeof error.statusCode === 'string') {
           switch (error.statusCode) {
           case '404': return 'الملف المطلوب غير موجود (404). قد يكون تم حذفه أو تغيير مساره.';
           case '403': return 'ليس لديك الصلاحية للوصول إلى هذا الملف (403).';
           case '400': return 'طلب ملف غير صالح (400). يرجى التحقق من صحة المسار.';
           // Improved generic storage error
           case 'BUCKET_NOT_FOUND': return `خطأ في التخزين: الحاوية '${BUCKET_NAME}' غير موجودة.`;
           case 'OBJECT_NOT_FOUND': return `خطأ في التخزين: الكائن '${props.storagePath}' غير موجود في الحاوية '${BUCKET_NAME}'.`;
           default: return `حدث خطأ في التخزين (رمز الحالة: ${error.statusCode}). ${error.message}`;
           }
       } else if (error.message?.includes('Failed to fetch')) {
           return 'فشل الاتصال بالخادم لجلب الملف. يرجى التحقق من اتصال الإنترنت.';
       } else if (error.message?.includes('password')) { // More robust password check
            return 'الملف محمي بكلمة مرور ولا يمكن عرضه.';
       } else if (error.name === 'InvalidPDFException' || error.message?.includes('Invalid PDF structure')) {
            return 'ملف PDF غير صالح أو تالف.';
       } else if (error.name === 'MissingPDFException') {
            return 'ملف PDF مفقود أو لا يمكن الوصول إليه.';
       } else if (error.name === 'UnexpectedResponseException') {
            return 'استجابة غير متوقعة من الخادم أثناء محاولة تحميل الملف.';
       }
      // ... end error handling logic
      else return error.message || 'حدث خطأ غير معروف أثناء معالجة الملف.';
  }
  return 'حدث خطأ غير متوقع وغير معروف.';
}

// --- Fetch PDF Data ---
async function fetchPdfData() {
  if (!process.client || !props.storagePath || props.storagePath.trim() === '') { pdfError.value = 'لم يتم توفير مسار صالح للملف.'; resetViewerState(); return null; }
  loading.value = true; loadingMessage.value = 'جارٍ تحميل الملف...'; pdfError.value = null; pdfBlob.value = null;
  try { const { data, error } = await supabase.storage.from(BUCKET_NAME).download(props.storagePath); if (error) throw error; if (!data) throw new Error('لم يتم استلام بيانات الملف من الخادم.'); pdfBlob.value = data; return data; }
  catch (err: any) { pdfError.value = getUserFriendlyErrorMessage(err); resetViewerState(); return null; }
}

// --- Get Viewport Function ---
async function getViewport(pageNumber: number, scale: number): Promise<PDFPageViewport | null> {
    if (!pdfDoc.value) return null;
    try { const page = await pdfDoc.value.getPage(pageNumber); return page.getViewport({ scale: scale, rotation: currentRotation.value }); }
    catch (error) { console.error("Error getting viewport:", error); return null; }
}

// --- Calculate Scale Function ---
// This function now relies more on container size, which is good for responsiveness
async function calculateScale(level: ZoomLevel): Promise<number> {
    // Added check for pdfDoc first
    if (!pdfDoc.value) {

        return currentScale.value;
    }
     // Check container *after* ensuring pdfDoc exists
    if (!canvasContainer.value || canvasContainer.value.clientWidth <= 0 || canvasContainer.value.clientHeight <= 0) {

        // Attempt to wait a tick for layout changes, then try again or return current scale
        await nextTick();
        if (!canvasContainer.value || canvasContainer.value.clientWidth <= 0 || canvasContainer.value.clientHeight <= 0) {

             return currentScale.value;
        }
    }

    try {
        // Use the currently loaded page if possible, fallback to page 1
        const pageNumToMeasure = currentPage.value > 0 && currentPage.value <= numPages.value ? currentPage.value : 1;
        if (pageNumToMeasure > numPages.value) {

             return currentScale.value;
        }
        const page = await pdfDoc.value.getPage(pageNumToMeasure);
        const tempViewport = page.getViewport({ scale: 1, rotation: currentRotation.value });
        const pageHeight = tempViewport.height;
        const pageWidth = tempViewport.width;

        // Ensure page dimensions are valid
        if (pageWidth <= 0 || pageHeight <= 0) {

            return currentScale.value; // Avoid division by zero or invalid calculations
        }

        const containerWidth = canvasContainer.value.clientWidth;
        const containerHeight = canvasContainer.value.clientHeight;
        // Use smaller padding values consistent with the template changes for mobile
        const vPadding = 16; // Corresponds to p-2 * 2 (top/bottom)
        const hPadding = 16; // Corresponds to p-2 * 2 (left/right)
        // Ensure available dimensions are at least 1 to prevent division by zero
        const availableWidth = Math.max(1, containerWidth - hPadding);
        const availableHeight = Math.max(1, containerHeight - vPadding);

        let newScale = currentScale.value; // Default to current scale

        switch (level) {
            case 'page-actual': newScale = 1.0; break;
            case 'page-width': newScale = availableWidth / pageWidth; break;
            case 'page-height': newScale = availableHeight / pageHeight; break;
            case 'page-fit': newScale = Math.min(availableWidth / pageWidth, availableHeight / pageHeight); break;
            case 'auto':
                // Consider screen size for 'auto' - maybe default to 'page-fit' on small screens?
                // This requires knowing the screen size reliably, which can be tricky.
                // Let's stick to page-width as a reasonable default 'auto' for now.
                newScale = availableWidth / pageWidth;
                break;
            default: // Handle numeric values passed directly
                 if (typeof level === 'number' && !isNaN(level)) {
                    newScale = level;
                 } else {
                     // Fallback if level is an unexpected string

                     newScale = availableWidth / pageWidth;
                 }
                break;
        }
        // Clamp the scale between MIN_ZOOM and MAX_ZOOM
        return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newScale));

    } catch (error) {

        // Return the last known good scale if calculation fails
        return currentScale.value;
    }
}

// --- Load PDF Document ---
async function loadPdfDocument(blob: Blob) {
  if (!blob) return;
  loading.value = true; loadingMessage.value = 'جارٍ تحليل الملف...'; pdfError.value = null;
  if (pdfDoc.value) { await pdfDoc.value.destroy().catch(e => console.error("Error destroying previous doc:", e)); pdfDoc.value = null; }

  try {
    const arrayBuffer = await blob.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Ensure destroy is complete if there was a previous doc
    if(pdfDoc.value) await pdfDoc.value.destroy();

    pdfDoc.value = pdf;
    numPages.value = pdf.numPages;
    currentPage.value = 1;
    pageInput.value = 1;
    currentRotation.value = 0;
    zoomLevel.value = 'auto'; 

    await nextTick(); 

   
    
    // *** أضف هذا الكود بدلاً من المحذوف ***
setTimeout(async () => {
  // تحقق من جاهزية كل شيء بعد التأخير
  if (!pdfDoc.value || !canvasContainer.value) {

    return; // اخرج إذا لم يكن جاهزاً
  }
  try {
    // >> حساب المقياس يحدث الآن داخل التأخير <<
    currentScale.value = await calculateScale('auto');


    // >> العرض يحدث أيضاً داخل التأخير، باستخدام المقياس المحسوب للتو <<
    renderPage(currentPage.value);
  } catch (error) {

    pdfError.value = "حدث خطأ أثناء تهيئة العرض الأولي."; // يمكنك تعيين رسالة خطأ
  }
}, 100); // تأخير 100ms (أو قيمة مناسبة أخرى)
// *** نهاية الكود المضاف ***

  } catch (err: any) { console.error("Error loading PDF:", err); pdfError.value = getUserFriendlyErrorMessage(err); resetViewerState(false); }
  finally { loading.value = false; loadingMessage.value = 'جارٍ تحميل الملف...'; }
}

// --- Render Page ---
async function renderPage(pageNumber: number) {
  // Added check for valid page number
  if (!pdfDoc.value || !pdfCanvas.value || isRenderingPage.value || pageNumber < 1 || pageNumber > numPages.value) {
      if (pageNumber < 1 || pageNumber > numPages.value) {

          // Optionally reset currentPage or pageInput if invalid
          if (currentPage.value !== pageInput.value) currentPage.value = pageInput.value; // Sync if input caused this
      }
      return;
  }

  isRenderingPage.value = true;
  if (currentRenderTask) {

    currentRenderTask.cancel();
    currentRenderTask = null;
  }

  // Debug log



  try {
    const page = await pdfDoc.value.getPage(pageNumber); // Get page first
    const viewport = page.getViewport({ scale: currentScale.value, rotation: currentRotation.value });

    // Check viewport validity
    if (!viewport || viewport.width <= 0 || viewport.height <= 0) {
        throw new Error(`Failed to get valid viewport for page ${pageNumber}`);
    }

    const canvas = pdfCanvas.value;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context unavailable.');

    // Adjust canvas size smoothly
    // Use devicePixelRatio for sharper rendering on high-DPI screens
    const outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      transform: transform // Apply transform for high-DPI rendering
    };

    currentRenderTask = page.render(renderContext); // Assign the RenderTask
    await currentRenderTask.promise;



  } catch (err: any) {
    // Only log error if it's not a cancellation
    if (err.name !== 'RenderingCancelledException' && err.message !== 'Rendering cancelled') {

      // Avoid flooding UI with render errors, maybe show a subtle indicator or log only
      // pdfError.value = `خطأ أثناء عرض الصفحة ${pageNumber}. ${getUserFriendlyErrorMessage(err)}`;
    } else {

    }
  } finally {
    isRenderingPage.value = false;
    // Don't nullify currentRenderTask immediately if cancellation happened,
    // it might be checked elsewhere. Ensure it's nulled before next render starts.
    // currentRenderTask = null; // Nulled at the start of the function now
  }
}

// --- Pagination ---
function nextPage() { if (currentPage.value < numPages.value && !isRenderingPage.value) currentPage.value++; }
function prevPage() { if (currentPage.value > 1 && !isRenderingPage.value) currentPage.value--; }

// --- Go To Page ---
function goToPage() {
    // Ensure input is treated as integer
    const targetPage = parseInt(String(pageInput.value), 10);

    // Check validity and if rendering is ongoing
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= numPages.value && !isRenderingPage.value) {
        if(targetPage !== currentPage.value) {
            currentPage.value = targetPage;
            // Rendering is triggered by the watcher now
        }
    } else {
        // Reset input to current page if invalid or busy
        pageInput.value = currentPage.value;
        if (isRenderingPage.value) {

        } else if (isNaN(targetPage) || targetPage < 1 || targetPage > numPages.value) {

        }
    }
}

// --- Zoom Controls ---
async function applyZoomLevel() {
    if (isRenderingPage.value || !pdfDoc.value) return;

    const newScale = await calculateScale(zoomLevel.value);
    // Check if scale actually changed to avoid unnecessary re-renders
    if (newScale !== currentScale.value) {

        currentScale.value = newScale;
        // Render page is triggered by scale watcher OR called explicitly
        // Calling explicitly ensures render happens even if watchers are delayed
        renderPage(currentPage.value);
    } else {

         // If the selection was manual (e.g., 100%) but scale didn't change,
         // we might still want to update the visual selection if it was 'auto' before.
         // The v-model binding handles this visually.
    }
}
function zoomIn() {
    if (isRenderingPage.value || !pdfDoc.value || currentScale.value >= MAX_ZOOM) return;
    // Find the next predefined zoom option *greater* than the current scale
    let nextZoomOption = zoomOptions.find(z => (z/100) > currentScale.value + 0.01); // Add small tolerance
    let newScale;
    if (nextZoomOption) {
        newScale = nextZoomOption / 100;
    } else {
        // If no predefined option is larger, or we are already past the last one, just step up
        newScale = currentScale.value + ZOOM_STEP;
    }
    newScale = Math.min(MAX_ZOOM, newScale); // Ensure we don't exceed MAX_ZOOM

    if (newScale !== currentScale.value) {
        currentScale.value = newScale;
        // Update zoomLevel select to reflect the new scale if it matches an option
        const matchingLevel = zoomOptions.find(z => Math.abs((z/100) - newScale) < 0.01) ? newScale : 'auto';
        zoomLevel.value = matchingLevel;
        renderPage(currentPage.value);
    }
}

function zoomOut() {
     if (isRenderingPage.value || !pdfDoc.value || currentScale.value <= MIN_ZOOM) return;
    // Find the next predefined zoom option *smaller* than the current scale
    let prevZoomOption = [...zoomOptions].reverse().find(z => (z/100) < currentScale.value - 0.01); // Add small tolerance
     let newScale;
    if (prevZoomOption) {
        newScale = prevZoomOption / 100;
    } else {
        // If no predefined option is smaller, or we are below the first one, just step down
        newScale = currentScale.value - ZOOM_STEP;
    }
    newScale = Math.max(MIN_ZOOM, newScale); // Ensure we don't go below MIN_ZOOM

    if (newScale !== currentScale.value) {
        currentScale.value = newScale;
        // Update zoomLevel select
        const matchingLevel = zoomOptions.find(z => Math.abs((z/100) - newScale) < 0.01) ? newScale : 'auto';
        zoomLevel.value = matchingLevel;
        renderPage(currentPage.value);
    }
}

// --- Rotation Controls ---
// Rotation now also calls applyZoomLevel which inherently calls calculateScale and renderPage
// This ensures the scale recalculates based on the new rotated dimensions fitting the container
function rotateClockwise() {
    if (isRenderingPage.value || !pdfDoc.value) return;
    currentRotation.value = (currentRotation.value + 90) % 360;

    applyZoomLevel(); // Recalculate scale and re-render
}
function rotateCounterClockwise() {
    if (isRenderingPage.value || !pdfDoc.value) return;
    currentRotation.value = (currentRotation.value - 90 + 360) % 360;

    applyZoomLevel(); // Recalculate scale and re-render
}


// --- Print Function ---
function printDocument() {
  if (!pdfDoc.value || !pdfBlob.value || !process.client) return;

  try {
    // Create a temporary URL for the blob
    const blobUrl = URL.createObjectURL(pdfBlob.value);

    // Create an iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none'; // Hide the iframe
    iframe.src = blobUrl;

    // Append iframe to the body
    document.body.appendChild(iframe);

    // Wait for the iframe to load the PDF
    iframe.onload = () => {
      try {
        // Access the iframe's contentWindow and call print
        if (iframe.contentWindow) {
          iframe.contentWindow.focus(); // Focus is needed for print() in some browsers
          iframe.contentWindow.print();
        } else {

          // Fallback: open in new tab for manual printing (less ideal UX)
          window.open(blobUrl, '_blank');
        }
      } catch (printError) {

        window.open(blobUrl, '_blank'); // Fallback
      } finally {
        // Clean up after a delay (allow print dialog to appear)
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobUrl);
        }, 1000); // Adjust delay if needed
      }
    };

     iframe.onerror = (err) => {

        document.body.removeChild(iframe);
        URL.revokeObjectURL(blobUrl);
        // Fallback for iframe loading errors
        window.open(blobUrl, '_blank');
     }

  } catch (error) {

    // Fallback if blob URL creation fails
    if (pdfBlobUrl) window.open(pdfBlobUrl, '_blank');
  }
}


// --- Download Handler ---
function downloadPdfBlob() {
  if (!pdfBlob.value) return;
  // Revoke previous URL if it exists, to prevent memory leaks
  if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);

  // Create a new Blob URL
  pdfBlobUrl = URL.createObjectURL(pdfBlob.value);

  // Create a temporary link element
  const link = document.createElement('a');
  link.href = pdfBlobUrl;
  // Generate a safe filename, replacing invalid characters
  const safeTitle = props.bookTitle ? props.bookTitle.replace(/[/\\?%*:|"<>]/g, '-') : 'document';
  link.download = `${safeTitle}.pdf`;

  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Note: We don't revoke immediately here, in case the download takes time
  // Revocation happens on next download or component unmount.
}


// --- Modal Control ---
function closeModal() { emit('close'); }

// --- State Reset ---
function resetViewerState(clearError = true) {

    loading.value = false;
    if (clearError) pdfError.value = null;

    // Cancel any ongoing render task before destroying the doc
    if (currentRenderTask) {

        currentRenderTask.cancel();
        currentRenderTask = null;
    }

    // Destroy the PDF document proxy to free memory
    if (pdfDoc.value) {
        pdfDoc.value.destroy().then(() => {

        }).catch(e => console.error("Error destroying PDF doc during reset:", e))
        .finally(() => {
             pdfDoc.value = null; // Ensure it's nullified after attempt
        });
    } else {
        pdfDoc.value = null; // Ensure null if it wasn't set
    }

    // Reset state variables
    currentPage.value = 1;
    pageInput.value = 1;
    numPages.value = 0;
    isRenderingPage.value = false; // Ensure rendering flag is off
    pdfBlob.value = null;
    currentScale.value = 1.0;
    currentRotation.value = 0;
    zoomLevel.value = 'auto';

    // Revoke any existing blob URL
    if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        pdfBlobUrl = null;

    }

     // Clear canvas (optional, but can prevent showing stale content)
    if (pdfCanvas.value) {
        const canvas = pdfCanvas.value;
        const context = canvas.getContext('2d');
        if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);

        }
         // Reset canvas dimensions to avoid stretching issues if reused
         canvas.width = 10;
         canvas.height = 10;
         canvas.style.width = 'auto';
         canvas.style.height = 'auto';
    }
}


// --- Main Load Trigger ---
async function attemptLoadPdf() {
    // Reset state completely before attempting a new load
    resetViewerState();
    // Ensure we are on the client
    if (!process.client) return;
    const blob = await fetchPdfData();
    // Only proceed if blob was successfully fetched (fetchPdfData handles errors)
    if (blob) {
        await loadPdfDocument(blob);
    } else {
        // Error should have been set by fetchPdfData, ensure loading is off
        loading.value = false;
    }
}


// --- Watchers ---
watch(() => props.show, async (isVisible) => {
    if (isVisible && props.storagePath) {

        await attemptLoadPdf();
    } else if (!isVisible) {

        resetViewerState();
    }
});

watch(() => props.storagePath, async (newPath, oldPath) => {
    // Trigger reload only if the modal is *already* shown and the path changes meaningfully
    if (props.show && newPath && newPath !== oldPath) {

        await attemptLoadPdf();
    } else if (props.show && !newPath) {

         pdfError.value = 'تمت إزالة مسار الملف.';
         resetViewerState(false); // Reset but keep the error message
    }
});

// Watch page changes to trigger render
watch(currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage && pdfDoc.value && !isRenderingPage.value) {

    pageInput.value = newPage; // Sync input field
    renderPage(newPage);
  } else if (isRenderingPage.value) {

     // Maybe queue the render? For now, just sync input.
     pageInput.value = newPage;
  }
});

// Watch scale changes (e.g., from zoom buttons) to potentially trigger render
// Note: applyZoomLevel calls render explicitly, this watcher is more for external changes if any
// Let's comment this out for now as explicit calls in zoom/rotate/applyZoomLevel are preferred
/*
watch(currentScale, (newScale, oldScale) => {
    if (newScale !== oldScale && pdfDoc.value && !isRenderingPage.value) {

        // Update the select dropdown based on the new scale
        const scalePercent = Math.round(newScale * 100);
        const matchingOption = zoomOptions.find(z => z === scalePercent);
        if (matchingOption) {
            // Avoid feedback loop if zoomLevel itself triggered the change
            if (zoomLevel.value !== newScale) zoomLevel.value = newScale;
        } else {
            // If scale doesn't match a predefined %, set select to 'auto' or keep numeric?
            // Setting to 'auto' makes sense if the change wasn't via the select.
            if (typeof zoomLevel.value === 'number' || zoomLevel.value !== 'auto') {
               // zoomLevel.value = 'auto'; // Or maybe keep the numeric value if it was set that way? Decision needed. Let's keep it simple.
               zoomLevel.value = newScale; // Reflect the actual numeric scale maybe? Needs testing.
            }
        }
       // renderPage(currentPage.value); // Render is likely already called by zoomIn/Out etc. Avoid double render.
    }
});
*/

// --- Lifecycle Hooks ---
onMounted(() => {
  // Optional: Add resize listener if needed for complex dynamic scaling
  // window.addEventListener('resize', handleResize);
});

onUnmounted(() => {

  resetViewerState();
  // Remove resize listener if added
  // window.removeEventListener('resize', handleResize);
});

// Optional resize handler (example)
// const handleResize = () => {
//   if (props.show && pdfDoc.value && !isRenderingPage.value && zoomLevel.value === 'auto' || zoomLevel.value === 'page-width' || zoomLevel.value === 'page-height' || zoomLevel.value === 'page-fit') {
//     console.log("Window resized, recalculating scale and re-rendering for adaptive zoom levels.");
//     // Debounce this function in a real application
//     applyZoomLevel();
//   }
// };

</script>

<style scoped>
/* --- KEEP EXISTING STYLES --- */

/* Shared base button style */
.button-toolbar-base {
  @apply inline-flex items-center justify-center rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors;
}

/* Style for mobile (larger tap targets) */
.button-toolbar-mobile {
  @apply button-toolbar-base p-2; /* Increased padding for touch */
}

/* Style for desktop (original padding) - apply using sm: prefix if needed, but base can be mobile first */
/* Example: <button class="button-toolbar-mobile sm:p-1.5"> */

.icon-toolbar {
  @apply h-5 w-5; /* Maintain icon size */
}

/* Page input */
.page-input-toolbar-mobile {
  @apply w-16 px-2 py-1 text-center border border-gray-300 rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 min-w-[4rem]; /* Slightly wider */
}

/* Zoom select dropdown */
.zoom-select-toolbar-mobile {
   /* Base styles ensure minimum tappability */
  @apply text-sm px-2 py-1 border border-gray-300 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50;
   /* Appearance and dropdown arrow */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 0.5rem center; /* Adjust arrow position */
  background-size: 1em 1em;
  padding-right: 2.5rem; /* Ensure text doesn't overlap arrow */
  min-width: 100px; /* Give it some base width */
}


/* Toolbar separator */
.separator-toolbar {
   /* Kept original style, visibility controlled by sm:block */
  @apply border-s border-gray-300 dark:border-gray-600 h-5 mx-1;
}

/* Canvas Shadow */
.pdf-canvas-shadow {
  @apply shadow-lg;
}

/* Canvas styles */
canvas {
  display: block; /* Keep as block */
  max-width: none; /* Important for pdf.js rendering */
  /* height: auto; Let pdf.js control height via style attribute */
  margin: 0 auto; /* Center the canvas */
}

/* Hide number input spinners */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}

/* Improve focus visibility globally if needed */
*:focus-visible {
    @apply ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-gray-800;
}

</style>