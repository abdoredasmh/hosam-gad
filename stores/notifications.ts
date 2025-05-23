// stores/notifications.ts
import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';
import type { RealtimeChannel } from '@supabase/supabase-js'; // Import RealtimeChannel
import type { Database, Tables } from '~/types/database.types';

// تعريف نوع الإشعار
type NotificationWithState = Tables<'notifications'>;

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as NotificationWithState[], // قائمة الإشعارات النهائية المعروضة
    unreadCount: 0,                         // عدد الإشعارات غير المقروءة
    isLoading: false,                       // هل يتم جلب الإشعارات حاليًا؟
    error: null as string | null,           // رسالة الخطأ إن وجدت
    hasFetchedOnce: false,                  // هل تم الجلب مرة واحدة على الأقل؟
    subscriptionChannel: null as RealtimeChannel | null, // لتخزين قناة Realtime (الآن مشتركة)
    currentSubscribedUserId: null as string | null, // المستخدم الذي تتم معالجة إشعاراته حاليًا
    _internalNotificationLimit: 30, // حد الإشعارات الخاصة بالمستخدم للعرض والحذف
    _internalPublicNotificationDays: 10, // حد أيام الإشعارات العامة
    _fixedChannelName: 'user_notifications_shared_channel', // ✅ اسم القناة الثابت
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
            }
        } catch (err: any) {
            console.error('NotificationStore: Unexpected error marking notification as read:', err.message);
            this.notifications[notificationIndex].is_read = originalState;
            this.unreadCount++;
        }
    },

    // --- دالة تعليم كل الإشعارات كمقروءة (بدون تغيير جوهري) ---
    async markAllAsRead(userId: string) {
       if (this.unreadCount === 0) return;

       const previouslyUnreadIds = this.notifications
            .filter(n => !n.is_read && n.user_id === userId) // Only mark user's notifications
            .map(n => n.id);

       if(previouslyUnreadIds.length === 0) return;

       const oldUnreadCount = this.unreadCount;
       let actualReducedCount = 0;

       this.notifications.forEach(n => {
           if (previouslyUnreadIds.includes(n.id)) { // Check against IDs that were user-specific and unread
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
               .eq('user_id', userId) // Target only this user's notifications in DB
               .eq('is_read', false);

           if (error) {
               console.error('NotificationStore: Error marking all notifications as read for user:', error.message);
               this.notifications.forEach(n => {
                   if (previouslyUnreadIds.includes(n.id)) {
                       n.is_read = false;
                   }
               });
               this.unreadCount = oldUnreadCount;
           }
       } catch (err: any) {
           console.error('NotificationStore: Unexpected error marking all notifications as read for user:', err.message);
           this.notifications.forEach(n => { if (previouslyUnreadIds.includes(n.id)) n.is_read = false; });
           this.unreadCount = oldUnreadCount;
       }
    },

    // --- إعداد Realtime (معدل ليستخدم قناة مشتركة وفلترة من جهة العميل) ---
    subscribeToNotifications(userId: string) {
        const client = useSupabaseClient<Database>();

        // إذا كنا نعالج بالفعل إشعارات هذا المستخدم على قناة نشطة، فلا تفعل شيئًا.
        if (this.currentSubscribedUserId === userId && this.subscriptionChannel?.state === 'joined') {
            console.log(`NotificationStore: Already subscribed and processing notifications for user ${userId} on channel '${this._fixedChannelName}'.`);
            return;
        }

        // تحديث معرّف المستخدم الذي نريد معالجة إشعاراته.
        // هذا أمر بالغ الأهمية لفلتر الكولباك.
        console.log(`NotificationStore: Setting active user for notifications to: ${userId}. Previous: ${this.currentSubscribedUserId}`);
        this.currentSubscribedUserId = userId;

        // إذا لم يتم إعداد القناة المشتركة أو لم تكن 'joined'، قم بإنشائها/إعادة تأسيسها.
        if (!this.subscriptionChannel || this.subscriptionChannel.state !== 'joined') {
            // إذا كان هناك كائن قناة قديم (على سبيل المثال، من محاولة فاشلة أو حالة مغلقة)، حاول إزالته أولاً.
            if (this.subscriptionChannel) {
                console.log(`NotificationStore: Previous channel instance found (state: ${this.subscriptionChannel.state}). Attempting to remove it before creating a new one for '${this._fixedChannelName}'.`);
                client.removeChannel(this.subscriptionChannel); // محاولة إزالة بأفضل جهد
                // this.subscriptionChannel = null; // سيتم تعيينه إلى القناة الجديدة أدناه
            }

            console.log(`NotificationStore: Subscribing to shared channel '${this._fixedChannelName}' for all user notifications.`);
            const channel = client.channel(this._fixedChannelName); // ✅ استخدام اسم القناة الثابت

            // قم بتخزين القناة على الفور حتى يتمكن إلغاء الاشتراك من العثور عليها حتى لو فشل الاشتراك
            this.subscriptionChannel = channel;

            channel.on<Tables<'notifications'>>(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    // ✅ لا يوجد فلتر user_id هنا. تتم الفلترة في الكولباك.
                },
                (payload) => {
                    // console.log('NotificationStore: Realtime INSERT received on shared channel:', payload.new);
                    const newNotification = payload.new as NotificationWithState;

                    // ✅ الفلترة لمعرف المستخدم النشط حاليًا في الـ store
                    if (newNotification.user_id === this.currentSubscribedUserId) {
                        console.log(`NotificationStore: Notification (ID: ${newNotification.id}) is for current user ${this.currentSubscribedUserId}. Processing...`);

                        if (!this.notifications.some(n => n.id === newNotification.id)) {
                            this.notifications.unshift(newNotification); // الإضافة إلى البداية

                            // --- إدارة حد واجهة المستخدم للإشعارات الخاصة بالمستخدم ---
                            const currentUserNotificationsInList = this.notifications.filter(n => n.user_id === this.currentSubscribedUserId);
                            if (currentUserNotificationsInList.length > this._internalNotificationLimit) {
                                // فرز إشعارات المستخدم الحالي حسب الوقت تصاعديًا للعثور على الأقدم
                                const sortedCurrentUserNotifications = [...currentUserNotificationsInList].sort((a, b) =>
                                    (a.created_at ? new Date(a.created_at).getTime() : 0) -
                                    (b.created_at ? new Date(b.created_at).getTime() : 0)
                                );
                                const oldestNotificationToRemove = sortedCurrentUserNotifications[0];
                                const indexInMainArray = this.notifications.findIndex(n => n.id === oldestNotificationToRemove.id);
                                if (indexInMainArray !== -1) {
                                    this.notifications.splice(indexInMainArray, 1);
                                    console.log(`NotificationStore: Removed oldest notification (ID: ${oldestNotificationToRemove.id}) for user ${this.currentSubscribedUserId} from UI to maintain limit after realtime insert.`);
                                }
                            }
                            // --- نهاية إدارة حد واجهة المستخدم ---

                            if (!newNotification.is_read) {
                                this.unreadCount++;
                            }
                        } else {
                            // console.log(`NotificationStore: Notification (ID: ${newNotification.id}) already exists in the list. Ignoring.`);
                        }
                    } else {
                        // تجاهل الإشعار إذا لم يكن للمستخدم النشط حاليًا
                        // console.log(`NotificationStore: Realtime INSERT ignored. Notification user_id (${newNotification.user_id}) does not match current store user_id (${this.currentSubscribedUserId}).`);
                    }
                }
            )
            .subscribe((status, err) => {
                 if (status === 'SUBSCRIBED') {
                    console.log(`NotificationStore: Successfully subscribed to '${this._fixedChannelName}'. Processing for user ${this.currentSubscribedUserId}.`);
                    // this.subscriptionChannel تم تعيينه بالفعل
                 } else if (status === 'CHANNEL_ERROR') {
                    console.error(`NotificationStore: Realtime channel error for '${this._fixedChannelName}':`, err);
                    this.error = "حدث خطأ في اتصال الإشعارات المباشرة.";
                    // القناة قد تحاول إعادة الاتصال تلقائيًا.
                 } else if (status === 'TIMED_OUT') {
                     console.warn(`NotificationStore: Realtime subscription timed out for '${this._fixedChannelName}' for user ${this.currentSubscribedUserId}`);
                 } else {
                    // console.log(`NotificationStore: Realtime status update for '${this._fixedChannelName}': ${status}`);
                 }
            });
        } else {
            // القناة المشتركة موجودة بالفعل و 'joined'.
            // لقد قمنا بالفعل بتحديث this.currentSubscribedUserId.
            // سيقوم الكولباك الآن بالفلترة للمستخدم الجديد.
            console.log(`NotificationStore: Shared channel '${this._fixedChannelName}' is already active. Now processing for (new/same) user ${this.currentSubscribedUserId}.`);
        }
    },

    // --- إلغاء اشتراك Realtime (معدل) ---
    unsubscribeFromNotifications() {
        const client = useSupabaseClient<Database>();
        if (this.subscriptionChannel) {
            const channelToUnsubscribe = this.subscriptionChannel; // احتفظ بمرجع للقناة الحالية
            const channelName = channelToUnsubscribe.topic; // أو this._fixedChannelName
            console.log(`NotificationStore: Unsubscribing from channel '${channelName}'. Current user context was ${this.currentSubscribedUserId || 'none'}.`);

            channelToUnsubscribe.unsubscribe()
                .then((status: string) => {
                    console.log(`NotificationStore: Unsubscribe status from '${channelName}': ${status}`);
                })
                .catch((err: Error) => {
                    console.error(`NotificationStore: Unsubscribe error from '${channelName}':`, err);
                })
                .finally(() => {
                    console.log(`NotificationStore: Removing channel '${channelName}' from client.`);
                    // ✅ إزالة القناة من العميل
                    client.removeChannel(channelToUnsubscribe)
                        .then(removeStatus => console.log(`NotificationStore: removeChannel '${channelName}' status:`, removeStatus))
                        .catch(removeErr => console.error(`NotificationStore: removeChannel '${channelName}' error:`, removeErr));

                    // قم بتصفير المرجع فقط إذا كان هو نفس القناة التي قصدنا إزالتها
                    // هذا يحمي من حالات السباق إذا تم إنشاء قناة جديدة بسرعة
                    if (this.subscriptionChannel === channelToUnsubscribe) {
                        this.subscriptionChannel = null;
                    }
                    this.currentSubscribedUserId = null; // إعادة تعيين سياق المستخدم دائمًا
                    console.log(`NotificationStore: Shared subscription channel reference (if it was the active one) and currentSubscribedUserId reset.`);
                });
        } else {
            console.log('NotificationStore: No active shared subscription channel to unsubscribe from.');
            // التأكد من مسح سياق المستخدم حتى لو كانت القناة فارغة بالفعل
            if (this.currentSubscribedUserId !== null) {
                 console.log('NotificationStore: Resetting currentSubscribedUserId as a precaution.');
                 this.currentSubscribedUserId = null;
            }
        }
    },

     // --- دالة لمسح الحالة عند تسجيل الخروج ---
     clearNotifications() {
        console.log('NotificationStore: Clearing notifications state and unsubscribing from any active channel.');
        this.unsubscribeFromNotifications(); // هذا سيتعامل مع channel.unsubscribe() و client.removeChannel()
        this.notifications = [];
        this.unreadCount = 0;
        this.isLoading = false;
        this.error = null;
        this.hasFetchedOnce = false;
        // يتم إعادة تعيين this.currentSubscribedUserId بواسطة unsubscribeFromNotifications()
     }
  }
});
