// stores/notifications.ts
import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';
import type { Database, Tables } from '~/types/database.types';

// تعريف نوع الإشعار
// لا نحتاج isUpdating هنا حاليًا، لكن يمكن إضافته إذا احتجت حالة تحميل لكل إشعار
type NotificationWithState = Tables<'notifications'>;

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as NotificationWithState[], // قائمة الإشعارات النهائية المعروضة
    unreadCount: 0,                         // عدد الإشعارات غير المقروءة
    isLoading: false,                       // هل يتم جلب الإشعارات حاليًا؟
    error: null as string | null,           // رسالة الخطأ إن وجدت
    hasFetchedOnce: false,                  // هل تم الجلب مرة واحدة على الأقل؟
    subscriptionChannel: null as any,       // لتخزين قناة Realtime للمستخدم
    currentSubscribedUserId: null as string | null, // ✅  لتتبع المستخدم المشترك به حاليًا
    _internalNotificationLimit: 30, // حد الإشعارات الخاصة بالمستخدم للعرض والحذف
    _internalPublicNotificationDays: 10, // حد أيام الإشعارات العامة
  }),

  getters: {
    // يمكنك إضافة getters أخرى إذا احتجت
  },

  actions: {
    // --- دالة جلب الإشعارات (معدلة) ---
    async fetchNotifications(userId: string) {
      if (this.isLoading) return; // منع الجلب المتعدد

      this.isLoading = true;
      this.error = null;
      const client = useSupabaseClient<Database>();

      try {
        // --- الخطوة 1: تنظيف الإشعارات القديمة للمستخدم (قبل الجلب) ---
        try {
          const { count: userNotificationsCount, error: countError } = await client
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);

          if (countError) {
            console.error('NotificationStore: Error counting user notifications for cleanup:', countError.message);
          } else if (userNotificationsCount && userNotificationsCount > this._internalNotificationLimit) {
            const limit = this._internalNotificationLimit;
            const countToDelete = userNotificationsCount - limit;

            const { data: idsToDelete, error: fetchIdsError } = await client
              .from('notifications')
              .select('id')
              .eq('user_id', userId)
              .order('created_at', { ascending: true })
              .limit(countToDelete);

            if (fetchIdsError) {
              console.error('NotificationStore: Error fetching old notification IDs for deletion:', fetchIdsError.message);
            } else if (idsToDelete && idsToDelete.length > 0) {
              const { error: deleteError } = await client
                .from('notifications')
                .delete()
                .in('id', idsToDelete.map(n => n.id));

              if (deleteError) {
                console.error('NotificationStore: Error deleting old notifications:', deleteError.message);
              } else {
                console.log(`NotificationStore: Cleaned up ${idsToDelete.length} old notifications for user ${userId}.`);
              }
            }
          }
        } catch (cleanupErr: any) {
          console.error('NotificationStore: Unexpected error during notification cleanup:', cleanupErr.message);
        }
        // --- نهاية خطوة التنظيف ---


        // --- الخطوة 2: جلب الإشعارات المطلوبة للعرض ---
        const publicNotificationCutoffDate = new Date();
        publicNotificationCutoffDate.setDate(publicNotificationCutoffDate.getDate() - this._internalPublicNotificationDays);
        const publicNotificationCutoffISOString = publicNotificationCutoffDate.toISOString();

        const userNotificationsPromise = client
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(this._internalNotificationLimit);

        const publicNotificationsPromise = client
          .from('notifications')
          .select('*')
          .is('user_id', null)
          .gte('created_at', publicNotificationCutoffISOString)
          .order('created_at', { ascending: false });

        const [
          { data: userData, error: userError },
          { data: publicData, error: publicError }
        ] = await Promise.all([userNotificationsPromise, publicNotificationsPromise]);

        if (userError) {
           console.error('NotificationStore: Error fetching user notifications:', userError.message);
        }
        if (publicError) {
           console.error('NotificationStore: Error fetching public notifications:', publicError.message);
        }

        if (userError && publicError) {
             throw new Error("Failed to fetch both user and public notifications.");
        }

        const combinedNotifications = [
            ...(userData || []),
            ...(publicData || [])
        ];

        combinedNotifications.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
        });

        this.notifications = combinedNotifications;
        this.unreadCount = this.notifications.filter(n => !n.is_read).length;
        this.hasFetchedOnce = true;

      } catch (err: any) {
        console.error('NotificationStore: Failed to load notifications:', err.message);
        this.error = "فشل تحميل الإشعارات.";
      } finally {
        this.isLoading = false;
      }
    },

    // --- دالة تعليم إشعار كمقروء (بدون تغيير جوهري) ---
    async markAsRead(notificationId: number) {
        const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);

        if (notificationIndex === -1 || this.notifications[notificationIndex].is_read) {
            return;
        }

        const originalState = this.notifications[notificationIndex].is_read;
        this.notifications[notificationIndex].is_read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);

        const client = useSupabaseClient<Database>();
        try {
            const { error } = await client
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) {
                console.error('NotificationStore: Error marking notification as read:', error.message);
                this.notifications[notificationIndex].is_read = originalState;
                this.unreadCount++;
                // TODO: Show error to user
            }
        } catch (err: any) {
            console.error('NotificationStore: Unexpected error marking notification as read:', err.message);
            this.notifications[notificationIndex].is_read = originalState;
            this.unreadCount++;
             // TODO: Show error to user
        }
    },

    // --- دالة تعليم كل الإشعارات كمقروءة (بدون تغيير جوهري) ---
    async markAllAsRead(userId: string) {
       if (this.unreadCount === 0) return;

       const previouslyUnreadIds = this.notifications
            .filter(n => !n.is_read && n.user_id === userId)
            .map(n => n.id);
       if(previouslyUnreadIds.length === 0) return;

       const oldUnreadCount = this.unreadCount;
       let actualReducedCount = 0;

       this.notifications.forEach(n => {
           if (previouslyUnreadIds.includes(n.id)) {
               n.is_read = true;
               actualReducedCount++;
           }
       });
       this.unreadCount = Math.max(0, this.unreadCount - actualReducedCount);

       const client = useSupabaseClient<Database>();
       try {
           const { error } = await client
               .from('notifications')
               .update({ is_read: true })
               .eq('user_id', userId)
               .eq('is_read', false);

           if (error) {
               console.error('NotificationStore: Error marking all notifications as read:', error.message);
               this.notifications.forEach(n => {
                   if (previouslyUnreadIds.includes(n.id)) {
                       n.is_read = false;
                   }
               });
               this.unreadCount = oldUnreadCount;
               // TODO: Show error to user
           }
       } catch (err: any) {
           console.error('NotificationStore: Unexpected error marking all notifications as read:', err.message);
           this.notifications.forEach(n => { if (previouslyUnreadIds.includes(n.id)) n.is_read = false; });
           this.unreadCount = oldUnreadCount;
            // TODO: Show error to user
       }
    },

    // --- إعداد Realtime (لإشعارات المستخدم فقط) ---
    subscribeToNotifications(userId: string) {
        // ✅  1. إذا كانت هناك قناة موجودة لمستخدم مختلف → نفذ unsubscribeFromNotifications() أولاً.
        if (this.subscriptionChannel && this.currentSubscribedUserId !== userId) {
            console.log(`NotificationStore: Switching subscription from user ${this.currentSubscribedUserId} to ${userId}. Unsubscribing from old channel.`);
            this.unsubscribeFromNotifications();
        }

        // ✅  2. إذا كانت القناة موجودة لنفس userId → لا تنشئ قناة جديدة.
        if (this.subscriptionChannel && this.currentSubscribedUserId === userId) {
            console.log(`NotificationStore: Already subscribed to notifications for user ${userId}.`);
            return;
        }

        console.log(`NotificationStore: Attempting to subscribe to notifications for user ${userId}`);
        const client = useSupabaseClient<Database>();
        this.subscriptionChannel = client
            .channel(`public:notifications:user_id=eq.${userId}`)
            .on<Tables<'notifications'>>(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('NotificationStore: Realtime INSERT received:', payload);
                    const newNotification = payload.new as NotificationWithState;

                     if (!this.notifications.some(n => n.id === newNotification.id)) {
                        this.notifications.unshift(newNotification);

                        const userNotificationsInList = this.notifications.filter(n => n.user_id === userId);
                        if (userNotificationsInList.length > this._internalNotificationLimit) {
                            let oldestUserIndex = -1;
                            let oldestTime = Infinity;
                            for (let i = 0; i < this.notifications.length; i++) {
                                if (this.notifications[i].user_id === userId) {
                                    const time = this.notifications[i].created_at ? new Date(this.notifications[i].created_at!).getTime() : 0;
                                    if (time < oldestTime) {
                                        oldestTime = time;
                                        oldestUserIndex = i;
                                    }
                                }
                            }
                            if (oldestUserIndex !== -1) {
                                this.notifications.splice(oldestUserIndex, 1);
                                console.log('NotificationStore: Removed oldest notification from UI to maintain limit due to new realtime notification.');
                            }
                        }

                        if (!newNotification.is_read) {
                            this.unreadCount++;
                        }
                        // TODO: يمكنك هنا إظهار إشعار Toast للمستخدم
                    }
                }
            )
            .subscribe((status, err) => {
                 if (status === 'SUBSCRIBED') {
                    console.log(`NotificationStore: Successfully subscribed to notifications for user ${userId}`);
                    this.currentSubscribedUserId = userId; // ✅ حدث currentUserId بعد الاشتراك الجديد الناجح
                 } else if (status === 'CHANNEL_ERROR') {
                    console.error('NotificationStore: Realtime channel error during subscription:', err);
                    this.error = "حدث خطأ في اتصال الإشعارات المباشرة.";
                    // No need to explicitly set currentSubscribedUserId to null here,
                    // as it's only set on 'SUBSCRIBED'. If a previous subscription existed for another user,
                    // it would have been cleared by unsubscribeFromNotifications.
                    // If this was the first attempt or an attempt for a new user after clearing, currentSubscribedUserId is already null or old.
                 } else if (status === 'TIMED_OUT') {
                     console.warn(`NotificationStore: Realtime subscription timed out for user ${userId}`);
                     // Similar to CHANNEL_ERROR, currentSubscribedUserId is not updated.
                 } else {
                    console.log(`NotificationStore: Realtime status update for user ${userId}:`, status);
                 }
            });
    },

    // --- إلغاء اشتراك Realtime ---
    unsubscribeFromNotifications() {
        if (this.subscriptionChannel) {
            console.log(`NotificationStore: Unsubscribing from notifications for user ${this.currentSubscribedUserId || 'unknown'}.`);
            this.subscriptionChannel.unsubscribe()
                .then((status: string) => console.log('NotificationStore: Unsubscribe status:', status))
                .catch((err: Error) => console.error('NotificationStore: Unsubscribe error:', err))
                .finally(() => {
                    this.subscriptionChannel = null;
                    this.currentSubscribedUserId = null; // ✅ أعد تعيين currentUserId
                    console.log('NotificationStore: Subscription channel and currentSubscribedUserId reset.');
                });
        } else {
            // If no channel object, ensure currentSubscribedUserId is also null, just in case.
            if(this.currentSubscribedUserId !== null) {
                 console.log('NotificationStore: No active subscription channel, but resetting currentSubscribedUserId.');
                 this.currentSubscribedUserId = null; // ✅ أعد تعيين currentUserId
            }
        }
    },

     // --- دالة لمسح الحالة عند تسجيل الخروج ---
     clearNotifications() {
        console.log('NotificationStore: Clearing notifications state and unsubscribing.');
        this.unsubscribeFromNotifications(); //  سيقوم هذا بإلغاء الاشتراك وإعادة تعيين currentSubscribedUserId
        this.notifications = [];
        this.unreadCount = 0;
        this.isLoading = false;
        this.error = null;
        this.hasFetchedOnce = false;
        // this.currentSubscribedUserId is reset by unsubscribeFromNotifications() called above.
     }
  }
});