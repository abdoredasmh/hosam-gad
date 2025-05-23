// server/api/my-courses.get.ts
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/database.types';

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  const client = await serverSupabaseClient<Database>(event);

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    // 1. جلب الدورات المسجل بها المستخدم مع تفاصيل الدورة
    const { data: enrollments, error: enrollError } = await client
      .from('course_enrollments')
      .select(`
        course_id,
        last_accessed_lesson_id,
        study_courses (
          id,
          title,
          description,
          image_url
        )
      `)
      .eq('user_id', user.id)
      .not('study_courses', 'is', null); // تأكد من أن الدورة المرتبطة موجودة

    if (enrollError) throw enrollError;
    if (!enrollments) return [];

    // 2. لكل دورة مسجل بها، احسب التقدم
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.study_courses;
        if (!course) return null; // تخطي إذا كانت بيانات الدورة غير موجودة لسبب ما

        // جلب عدد الدروس الكلي للدورة
        const { count: totalLessons, error: lessonsError } = await client
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .eq('course_id', course.id);

        if (lessonsError) {
          console.error(`Error fetching lessons count for course ${course.id}:`, lessonsError);
          return { ...course, progress: 0, last_accessed_lesson_id: enrollment.last_accessed_lesson_id }; // Handle error case
        }

        // جلب عدد الدروس المكتملة للمستخدم في هذه الدورة
        const { count: completedLessons, error: completionError } = await client
          .from('lesson_completions')
          .select('lesson_id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('lesson_id', (await client.from('lessons').select('id').eq('course_id', course.id)).data?.map(l => l.id) ?? []); // جلب IDs الدروس لهذه الدورة

        if (completionError) {
          console.error(`Error fetching completed lessons for course ${course.id}:`, completionError);
           return { ...course, progress: 0, last_accessed_lesson_id: enrollment.last_accessed_lesson_id }; // Handle error case
        }

        const progress = (totalLessons ?? 0) > 0 ? Math.round(((completedLessons ?? 0) / totalLessons!) * 100) : 0;

        return {
          ...course,
          progress,
          last_accessed_lesson_id: enrollment.last_accessed_lesson_id,
        };
      })
    );

    // فلترة أي نتائج null ناتجة عن أخطاء أو بيانات غير مكتملة
    return coursesWithProgress.filter(course => course !== null);

  } catch (error: any) {
    console.error('Error fetching user courses:', error.message);
    throw createError({ statusCode: 500, statusMessage: 'Failed to fetch courses' });
  }
});