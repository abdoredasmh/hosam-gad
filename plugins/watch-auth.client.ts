// plugins/watch-auth.client.ts
import { useUserStore } from '~/stores/user'; // تأكد من المسار الصحيح

export default defineNuxtPlugin(() => {
  const userStore = useUserStore();
  const supabase = useSupabaseClient();
  const user = useSupabaseUser(); // استخدم useSupabaseUser للمراقبة

  // 1. تعيين المستخدم الأولي (قد يكون null أو المستخدم الحالي)
  userStore.setSupabaseUser(user.value);

  // 2. جلب البروفايل الأولي إذا كان المستخدم مسجلاً دخوله بالفعل
  if (user.value) {
    
    // لا تستخدم await هنا لتجنب حظر تحميل الـ plugin الأولي للصفحة
    userStore.fetchProfile();
  }

  // 3. مراقبة تغييرات حالة Supabase Auth (للتسجيل، الخروج، تحديث التوكن)
  supabase.auth.onAuthStateChange(async (event, session) => {
    
    // قم بتحديث المستخدم في المتجر بناءً على المستخدم الحالي من Supabase
    const currentUser = useSupabaseUser().value;
    userStore.setSupabaseUser(currentUser);

    // إذا تم تسجيل الدخول بنجاح أو تحديث الجلسة، حاول جلب البروفايل
    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && currentUser) {
      
      // يمكنك استخدام await هنا لأن onAuthStateChange يعمل بشكل غير متزامن
      await userStore.fetchProfile();
    }
    // عند تسجيل الخروج، setSupabaseUser(null) في المتجر سيمسح البروفايل
     else if (event === 'SIGNED_OUT') {
         
         // لا حاجة لـ clearProfile هنا، setSupabaseUser يعالجها
         // يمكن إضافة توجيه إضافي هنا إذا لزم الأمر
         // await navigateTo('/login');
     }
  });

  // 4. مراقبة تغييرات user composable مباشرة (قد يكون زائدًا عن الحاجة مع onAuthStateChange لكنه لا يضر)
  // watch(user, (newUser) => {
  //   
  //   userStore.setSupabaseUser(newUser);
  //   if (newUser) {
  //     userStore.fetchProfile();
  //   }
  // }, { immediate: false }); // immediate: false لأننا عالجنا الحالة الأولية أعلاه
});