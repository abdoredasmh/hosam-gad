// stores/user.ts
import { defineStore } from 'pinia';
import { useSupabaseClient, useSupabaseUser } from '#imports';
import type { Database, Tables } from '~/types/database.types'; // تأكد من المسار الصحيح

// تعريف نوع البروفايل ليشمل الدور والحقول الجديدة
// سيتم تحديث Tables<'profiles'> تلقائياً عند إعادة إنشاء الأنواع
// تأكد من أن types/database.types.ts محدث ليشمل الأعمدة الجديدة
type Profile = Tables<'profiles'>; // النوع يأتي الآن من الأنواع المنشأة

export const useUserStore = defineStore('user', {
  state: () => ({
    supabaseUser: null as ReturnType<typeof useSupabaseUser>['value'],
    // استخدم نوع Profile مباشرة من الأن المنشأة
    profile: null as Profile | null,
    isFetchingProfile: false,
    fetchProfileError: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.supabaseUser,
    userEmail: (state) => state.supabaseUser?.email || '',
    displayName: (state): string => {
         if (state.profile?.full_name) {
            return state.profile.full_name;
         }
         if (state.supabaseUser?.email) {
            // اسم المستخدم الافتراضي هو الجزء الأول من البريد
            return state.supabaseUser.email.split('@')[0];
         }
         return 'مستخدم';
    },
    userAvatar: (state) => state.profile?.avatar_url,
    isAdmin: (state): boolean => state.profile?.role === 'admin',
    userPoints: (state): number => state.profile?.points ?? 0,
    userBio: (state): string | null => state.profile?.bio ?? null,
    isLoadingProfile: (state): boolean => state.isFetchingProfile,
    // Getter للتحقق من حالة إيقاف التعليق
    isCommentingSuspended: (state): boolean => {
        if (!state.profile || !state.profile.comment_suspended_until) {
            return false; // غير موقوف إذا لا يوجد بروفايل أو تاريخ
        }
        try {
            // قارن تاريخ الانتهاء بالتاريخ الحالي
            return new Date(state.profile.comment_suspended_until) > new Date();
        } catch {

            return false; // اعتبره غير موقوف إذا كان التاريخ غير صالح
        }
    },
     // Getter للتحقق من حالة الحظر
     isBanned: (state): boolean => {
        return state.profile?.is_banned ?? false;
     }
  },

  actions: {
    setSupabaseUser(user: ReturnType<typeof useSupabaseUser>['value']) {
      this.supabaseUser = user;
      if (!user) {
        this.profile = null;
        this.fetchProfileError = null;
        this.isFetchingProfile = false;
      }
    },

    async fetchProfile() {
      const user = this.supabaseUser;
      // --- Keep initial checks ---
      if (!user || this.isFetchingProfile) {
         if (this.profile && !this.isFetchingProfile) {  return; }
         if (this.isFetchingProfile) {  return; }
         if (!user) {  return; }
      }

      this.isFetchingProfile = true;
      this.fetchProfileError = null;
      const client = useSupabaseClient<Database>();
      

      try {
        // --- تأكد من طلب كل الأعمدة المطلوبة ---
        const { data, error, status } = await client
          .from('profiles')
          .select(`
            id,
            full_name,
            avatar_url,
            role,
            points,
            bio,
            is_banned,
            comment_suspended_until,
            created_at,
            updated_at
          `) // اطلب كل الأعمدة التي تحتاجها في أي مكان بالتطبيق
          .eq('id', user.id)
          .single();

        if (error && status !== 406) { // 406 means row not found (for .single())
            // Handle specific errors like RLS violation if needed

            throw error;
        }

        if (data) {
          
          this.profile = data; // النوع يجب أن يتطابق الآن بفضل الأنواع المنشأة
        } else {

          this.profile = null;
          // Don't necessarily set an error here, profile might genuinely not exist yet
        }
      } catch (error: any) {

        this.profile = null; // Ensure profile is null on error
        this.fetchProfileError = error.message || 'Failed to fetch profile.';
      } finally {
        this.isFetchingProfile = false; // Crucial: Ensure this always runs
         // Log final state
      }
    },

    async logout() {
        const client = useSupabaseClient();
        
        // Reset state immediately for faster UI feedback
        this.profile = null;
        this.supabaseUser = null;
        this.isFetchingProfile = false; // Reset fetching state
        this.fetchProfileError = null;

        const { error } = await client.auth.signOut();
        if (error) {

            // Maybe show toast error to user
        } else {
            
            // Navigate after state is cleared
            await navigateTo('/');
        }
    }
  }
})