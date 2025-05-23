// middleware/admin.ts
import { useUserStore } from '~/stores/user';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

export default defineNuxtRouteMiddleware(async (to, from) => {
  
  const user = useSupabaseUser();

  // 1. التحقق الفوري من تسجيل الدخول
  if (!user.value) {
    
    return navigateTo('/login', { replace: true });
  }

  const userStore = useUserStore();
  const { profile, isFetchingProfile } = storeToRefs(userStore);

  // --- <<< التحسين الرئيسي: تحقق من الحالة الحالية أولاً >>> ---
  // إذا كان البروفايل موجوداً بالفعل وكان المستخدم admin، اسمح بالمرور فوراً
  if (profile.value && profile.value.role === 'admin') {
    
    return; // <-- السماح بالمرور
  }
  // --- <<< نهاية التحسين >>> ---


  // 2. التحقق من تحميل البروفايل والانتظار فقط إذا لزم الأمر
  // (إذا لم يكن البروفايل موجوداً أو لم يكن admin، وكان الجلب جارياً)
  if (!profile.value && isFetchingProfile.value) {
    
    try {
        await new Promise<void>((resolve, reject) => { // ابقِ reject هنا لمعالجة الخطأ
            const unwatch = watch(isFetchingProfile, (newValue) => {
                if (!newValue) {
                    
                    unwatch();
                    resolve(); // أكمل عندما ينتهي الجلب
                }
            });

            const timeoutId = setTimeout(() => {
                
                unwatch();
                 // --- <<< تعديل معالجة Timeout >>> ---
                 // بدلاً من reject، سنقوم بـ resolve للسماح بالوصول إلى التحققات التالية
                 // الـ reject كان يسبب إعادة التوجيه الفورية في الـ catch
                 resolve();
                 // reject(new Error('Profile fetch timed out')); // <-- لا نستخدم reject هنا
                 // --- <<< نهاية التعديل >>> ---
            }, 15000); // 5 ثوانٍ مهلة
        });
    } catch (waitError: any) {
        // هذا الـ catch سيتم استدعاؤه فقط إذا حدث خطأ آخر غير Timeout
        
        return navigateTo('/', { replace: true }); // توجيه آمن في حالة الخطأ
    }
  }

  // 3. إعادة التحقق النهائي بعد الانتظار المحتمل (أو إذا لم ندخل مرحلة الانتظار)
  // تحقق مرة أخرى لأن الحالة قد تكون تغيرت أثناء الانتظار
  if (!profile.value) {
    
     if (userStore.fetchProfileError) {
        
     }
    return navigateTo('/', { replace: true });
  }

  // 4. التحقق النهائي من دور المستخدم
  if (profile.value.role !== 'admin') {
    
    return navigateTo('/', { replace: true });
  }

  // 5. السماح بالمرور للمشرف
  
  // لا حاجة لـ return
});