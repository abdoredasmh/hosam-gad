
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."announcement_type" AS ENUM (
    'lecture',
    'announcement',
    'live'
);


ALTER TYPE "public"."announcement_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_reply_count"("p_parent_id" bigint) RETURNS bigint
    LANGUAGE "sql" STABLE
    AS $$
  SELECT count(*)
  FROM public.comments
  WHERE parent_comment_id = p_parent_id
  -- Optional: Add condition if replies need approval too
  -- AND is_approved = true
$$;


ALTER FUNCTION "public"."get_reply_count"("p_parent_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- افترض أن جدول البروفايلات هو profiles وعمود الدور هو role
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = auth.uid(); -- احصل على الدور للمستخدم الحالي
    RETURN user_role;
END;
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'full_name', -- محاولة أخذ الاسم من بيانات التسجيل الأولية إن وجدت
    new.raw_user_meta_data ->> 'avatar_url', -- محاولة أخذ الصورة الرمزية من بيانات التسجيل الأولية إن وجدت
    'user' -- الدور الافتراضي
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Set the updated_at column of the NEW row to the current transaction timestamp
  NEW.updated_at = timezone('utc', now()); -- Use UTC timezone for consistency
  -- Return the modified NEW row to be inserted or updated
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_updated_at"() IS 'Updates the updated_at timestamp on modification.';



CREATE OR REPLACE FUNCTION "public"."is_user_banned"("user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT is_banned
  FROM public.profiles
  WHERE id = user_id;
$$;


ALTER FUNCTION "public"."is_user_banned"("user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."about_sheikh" (
    "id" smallint DEFAULT 1 NOT NULL,
    "full_bio" "text",
    "short_bio" "text",
    "profile_image_url" "text",
    "contact_info" "jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "enforce_single_row" CHECK (("id" = 1))
);


ALTER TABLE "public"."about_sheikh" OWNER TO "postgres";


COMMENT ON TABLE "public"."about_sheikh" IS 'جدول لتخزين معلومات السيرة الذاتية لصفحة "عن الشيخ"';



COMMENT ON COLUMN "public"."about_sheikh"."id" IS 'معرف ثابت (1) لضمان وجود صف واحد فقط';



COMMENT ON COLUMN "public"."about_sheikh"."full_bio" IS 'النص الكامل والمفصل للسيرة الذاتية للشيخ';



COMMENT ON COLUMN "public"."about_sheikh"."short_bio" IS 'نبذة مختصرة للسيرة تستخدم في أماكن مثل الصفحة الرئيسية';



COMMENT ON COLUMN "public"."about_sheikh"."profile_image_url" IS 'رابط URL لصورة الشيخ الشخصية الرئيسية';



COMMENT ON COLUMN "public"."about_sheikh"."contact_info" IS 'بيانات الاتصال بتنسيق JSON (مثل {"email": "...", "telegram": "..."})';



COMMENT ON COLUMN "public"."about_sheikh"."updated_at" IS 'تاريخ آخر مرة تم فيها تعديل هذه المعلومات';



CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "details" "text",
    "date" timestamp with time zone,
    "type" "public"."announcement_type" DEFAULT 'announcement'::"public"."announcement_type" NOT NULL,
    "link" "text",
    "is_published" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


COMMENT ON TABLE "public"."announcements" IS 'جدول لتخزين الإعلانات ومواعيد المحاضرات والدروس';



COMMENT ON COLUMN "public"."announcements"."date" IS 'تاريخ ووقت الحدث (محاضرة مثلاً) أو تاريخ نشر الإعلان';



COMMENT ON COLUMN "public"."announcements"."is_published" IS 'هل الإعلان منشور وظاهر للجميع؟';



ALTER TABLE "public"."announcements" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."announcements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" integer NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "cover_image_url" "text",
    "is_research" boolean DEFAULT false,
    "is_transcript" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "linked_lesson_id" bigint,
    "storage_path" "text",
    "category_id" bigint,
    "course_id" bigint
);


ALTER TABLE "public"."books" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."books_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."books_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."books_id_seq" OWNED BY "public"."books"."id";



CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."categories_id_seq" OWNED BY "public"."categories"."id";



CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "parent_comment_id" bigint,
    "lesson_id" integer,
    "book_id" integer,
    "study_course_id" integer,
    "is_approved" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "check_single_content_link" CHECK (((("lesson_id" IS NOT NULL) AND ("book_id" IS NULL) AND ("study_course_id" IS NULL)) OR (("lesson_id" IS NULL) AND ("book_id" IS NOT NULL) AND ("study_course_id" IS NULL)) OR (("lesson_id" IS NULL) AND ("book_id" IS NULL) AND ("study_course_id" IS NOT NULL)))),
    CONSTRAINT "comments_content_check" CHECK (("length"("content") > 0))
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


ALTER TABLE "public"."comments" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."comments_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."course_enrollments" (
    "user_id" "uuid" NOT NULL,
    "course_id" integer NOT NULL,
    "enrolled_at" timestamp with time zone DEFAULT "now"(),
    "last_accessed_lesson_id" integer
);


ALTER TABLE "public"."course_enrollments" OWNER TO "postgres";


COMMENT ON COLUMN "public"."course_enrollments"."last_accessed_lesson_id" IS 'Tracks the last lesson the student accessed within this course enrollment.';



CREATE TABLE IF NOT EXISTS "public"."course_modules" (
    "id" bigint NOT NULL,
    "course_id" integer NOT NULL,
    "module_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."course_modules" OWNER TO "postgres";


COMMENT ON TABLE "public"."course_modules" IS 'الوحدات الدراسية المعرفة لكل دورة (Modules).';



COMMENT ON COLUMN "public"."course_modules"."course_id" IS 'الدورة التي تنتمي إليها الوحدة.';



COMMENT ON COLUMN "public"."course_modules"."module_number" IS 'رقم تسلسلي للوحدة داخل الدورة (للترتيب والربط بالدروس).';



COMMENT ON COLUMN "public"."course_modules"."title" IS 'العنوان الوصفي للوحدة.';



ALTER TABLE "public"."course_modules" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."course_modules_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."lesson_completions" (
    "user_id" "uuid" NOT NULL,
    "lesson_id" integer NOT NULL,
    "completed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lesson_completions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lessons" (
    "id" integer NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "youtube_url" "text",
    "category_id" integer,
    "course_id" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "lesson_order" integer,
    "module_number" integer
);


ALTER TABLE "public"."lessons" OWNER TO "postgres";


COMMENT ON COLUMN "public"."lessons"."lesson_order" IS 'Order of the lesson within its course (if applicable). Lower numbers appear first.';



COMMENT ON COLUMN "public"."lessons"."module_number" IS 'رقم الوحدة التي ينتمي إليها الدرس داخل الدورة (إذا كان جزءًا من دورة).';



CREATE SEQUENCE IF NOT EXISTS "public"."lessons_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."lessons_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."lessons_id_seq" OWNED BY "public"."lessons"."id";



CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "message" "text" NOT NULL,
    "link" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_read" boolean DEFAULT false
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."notifications_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."notifications_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."notifications_id_seq" OWNED BY "public"."notifications"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "points" integer DEFAULT 0 NOT NULL,
    "bio" "text",
    "is_banned" boolean DEFAULT false NOT NULL,
    "comment_suspended_until" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."points" IS 'نقاط الخبرة أو الترتيب للطالب.';



COMMENT ON COLUMN "public"."profiles"."bio" IS 'نبذة تعريفية قصيرة يكتبها المستخدم.';



COMMENT ON COLUMN "public"."profiles"."is_banned" IS 'هل المستخدم محظور من استخدام الموقع؟';



COMMENT ON COLUMN "public"."profiles"."comment_suspended_until" IS 'تاريخ ووقت انتهاء إيقاف المستخدم عن التعليق (NULL يعني غير موقوف).';



COMMENT ON COLUMN "public"."profiles"."created_at" IS 'Timestamp when the profile row was created.';



CREATE TABLE IF NOT EXISTS "public"."question_categories" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."question_categories" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."question_categories" IS 'Categories for organizing questions submitted to the Sheikh.';



COMMENT ON COLUMN "public"."question_categories"."name" IS 'The name of the question category (e.g., Fiqh, Aqeedah).';



ALTER TABLE "public"."question_categories" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."question_categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."question_options" (
    "id" bigint NOT NULL,
    "question_id" bigint NOT NULL,
    "option_text" "text" NOT NULL,
    "is_correct" boolean DEFAULT false NOT NULL,
    "option_order" integer,
    CONSTRAINT "question_options_option_text_check" CHECK (("char_length"("option_text") > 0))
);


ALTER TABLE "public"."question_options" OWNER TO "postgres";


COMMENT ON TABLE "public"."question_options" IS 'جدول لتخزين خيارات الإجابة لأسئلة الاختيار من متعدد والصح/الخطأ.';



COMMENT ON COLUMN "public"."question_options"."question_id" IS 'المعرف الخاص بالسؤال الذي ينتمي إليه هذا الخيار.';



COMMENT ON COLUMN "public"."question_options"."is_correct" IS 'يشير إذا كان هذا الخيار هو الإجابة الصحيحة.';



ALTER TABLE "public"."question_options" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."question_options_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."questions_to_sheikh" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "question_text" "text",
    "submitted_at" timestamp with time zone DEFAULT "now"(),
    "answer_text" "text",
    "answered_at" timestamp with time zone,
    "is_public" boolean DEFAULT false,
    "is_answered" boolean DEFAULT false,
    "category_id" integer
);

ALTER TABLE ONLY "public"."questions_to_sheikh" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."questions_to_sheikh" OWNER TO "postgres";


COMMENT ON TABLE "public"."questions_to_sheikh" IS 'Stores questions submitted by users to the Sheikh.';



COMMENT ON COLUMN "public"."questions_to_sheikh"."user_id" IS 'FK to the profile of the user who asked.';



COMMENT ON COLUMN "public"."questions_to_sheikh"."is_public" IS 'Should the question and answer be publicly visible?';



COMMENT ON COLUMN "public"."questions_to_sheikh"."is_answered" IS 'Has the question been answered by the admin/Sheikh?';



ALTER TABLE "public"."questions_to_sheikh" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."questions_to_sheikh_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."quiz_attempts" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "quiz_id" bigint NOT NULL,
    "started_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "submitted_at" timestamp with time zone,
    "score" integer,
    "manual_score" integer,
    "total_score" integer,
    "grading_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "attempt_number" integer DEFAULT 1 NOT NULL,
    "answers" "jsonb",
    "passed" boolean,
    CONSTRAINT "quiz_attempts_grading_status_check" CHECK (("grading_status" = ANY (ARRAY['pending'::"text", 'auto_graded'::"text", 'pending_manual'::"text", 'graded'::"text"])))
);


ALTER TABLE "public"."quiz_attempts" OWNER TO "postgres";


COMMENT ON TABLE "public"."quiz_attempts" IS 'جدول لتخزين محاولات الطلاب في الإجابة على الاختبارات.';



COMMENT ON COLUMN "public"."quiz_attempts"."score" IS 'النتيجة المحسوبة تلقائيًا لأسئلة MCQ و T/F.';



COMMENT ON COLUMN "public"."quiz_attempts"."manual_score" IS 'النتيجة المضافة يدويًا للأسئلة الكتابية بعد التصحيح.';



COMMENT ON COLUMN "public"."quiz_attempts"."total_score" IS 'النتيجة الإجمالية للمحاولة (auto + manual).';



COMMENT ON COLUMN "public"."quiz_attempts"."grading_status" IS 'حالة تصحيح المحاولة (معلقة، مصححة آليًا، تحتاج تصحيح يدوي، مصححة بالكامل).';



COMMENT ON COLUMN "public"."quiz_attempts"."attempt_number" IS 'رقم محاولة الطالب لهذا الاختبار المحدد.';



COMMENT ON COLUMN "public"."quiz_attempts"."answers" IS 'تخزين إجابات الطالب بتنسيق JSON (مثل {"question_id": answer}).';



COMMENT ON COLUMN "public"."quiz_attempts"."passed" IS 'يشير إلى ما إذا كانت درجة المحاولة أعلى من أو تساوي درجة النجاح.';



ALTER TABLE "public"."quiz_attempts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."quiz_attempts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."quiz_questions" (
    "id" bigint NOT NULL,
    "quiz_id" bigint NOT NULL,
    "question_text" "text" NOT NULL,
    "type" "text" NOT NULL,
    "question_order" integer,
    "points" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "quiz_questions_points_check" CHECK (("points" >= 0)),
    CONSTRAINT "quiz_questions_question_text_check" CHECK (("char_length"("question_text") > 0)),
    CONSTRAINT "quiz_questions_type_check" CHECK (("type" = ANY (ARRAY['mcq'::"text", 'true_false'::"text", 'written'::"text"])))
);


ALTER TABLE "public"."quiz_questions" OWNER TO "postgres";


COMMENT ON TABLE "public"."quiz_questions" IS 'جدول لتخزين أسئلة الاختبارات المختلفة.';



COMMENT ON COLUMN "public"."quiz_questions"."quiz_id" IS 'المعرف الخاص بالاختبار الذي ينتمي إليه السؤال.';



COMMENT ON COLUMN "public"."quiz_questions"."type" IS 'نوع السؤال (اختيار من متعدد، صح/خطأ، كتابي).';



COMMENT ON COLUMN "public"."quiz_questions"."question_order" IS 'ترتيب عرض السؤال داخل الاختبار.';



COMMENT ON COLUMN "public"."quiz_questions"."points" IS 'عدد النقاط المخصصة لهذا السؤال.';



ALTER TABLE "public"."quiz_questions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."quiz_questions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."quizzes" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "course_id" integer,
    "lesson_id" integer,
    "type" "text",
    "module_number" integer,
    "pass_mark_percentage" integer DEFAULT 50 NOT NULL,
    "max_attempts" integer,
    "time_limit_minutes" integer,
    "due_date" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "check_final_quiz_reqs" CHECK ((("type" <> 'final'::"text") OR ("course_id" IS NOT NULL))),
    CONSTRAINT "check_lesson_quiz_reqs" CHECK ((("type" <> 'lesson'::"text") OR ("lesson_id" IS NOT NULL))),
    CONSTRAINT "check_module_quiz_reqs" CHECK ((("type" <> 'module'::"text") OR (("course_id" IS NOT NULL) AND ("module_number" IS NOT NULL)))),
    CONSTRAINT "quizzes_pass_mark_percentage_check" CHECK ((("pass_mark_percentage" >= 0) AND ("pass_mark_percentage" <= 100))),
    CONSTRAINT "quizzes_time_limit_minutes_check" CHECK (("time_limit_minutes" > 0)),
    CONSTRAINT "quizzes_title_check" CHECK (("char_length"("title") > 0)),
    CONSTRAINT "quizzes_type_check" CHECK (("type" = ANY (ARRAY['lesson'::"text", 'module'::"text", 'final'::"text", 'practice'::"text"])))
);


ALTER TABLE "public"."quizzes" OWNER TO "postgres";


COMMENT ON TABLE "public"."quizzes" IS 'جدول لتخزين معلومات الاختبارات المختلفة.';



COMMENT ON COLUMN "public"."quizzes"."course_id" IS 'المعرف الخاص بالدورة الدراسية المرتبط بها الاختبار (إن وجد).';



COMMENT ON COLUMN "public"."quizzes"."lesson_id" IS 'المعرف الخاص بالدرس المرتبط به الاختبار (إن وجد).';



COMMENT ON COLUMN "public"."quizzes"."type" IS 'نوع الاختبار (درس، وحدة، نهائي، تدريبي).';



COMMENT ON COLUMN "public"."quizzes"."module_number" IS 'رقم الوحدة المرتبط بها الاختبار داخل الدورة (إن وجد).';



COMMENT ON COLUMN "public"."quizzes"."pass_mark_percentage" IS 'النسبة المئوية المطلوبة لاجتياز الاختبار.';



COMMENT ON COLUMN "public"."quizzes"."max_attempts" IS 'أقصى عدد محاولات مسموح للطالب (NULL يعني غير محدود).';



COMMENT ON COLUMN "public"."quizzes"."time_limit_minutes" IS 'الوقت المسموح به للاختبار بالدقائق (NULL يعني غير محدد).';



COMMENT ON COLUMN "public"."quizzes"."due_date" IS 'آخر موعد لتقديم الاختبار (اختياري).';



COMMENT ON COLUMN "public"."quizzes"."is_active" IS 'هل الاختبار متاح حاليًا للطلاب؟';



ALTER TABLE "public"."quizzes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."quizzes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."settings" (
    "key" "text" NOT NULL,
    "value" "text",
    "description" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."site_stats" (
    "id" bigint NOT NULL,
    "type" "text" NOT NULL,
    "user_id" "uuid",
    "related_id" integer,
    "timestamp" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "site_stats_type_check" CHECK (("type" = ANY (ARRAY['login'::"text", 'register'::"text", 'visit'::"text", 'lesson_view'::"text", 'book_download'::"text"])))
);


ALTER TABLE "public"."site_stats" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."site_stats_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."site_stats_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."site_stats_id_seq" OWNED BY "public"."site_stats"."id";



CREATE TABLE IF NOT EXISTS "public"."study_courses" (
    "id" integer NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "category_id" integer,
    "youtube_playlist_url" "text",
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT false
);


ALTER TABLE "public"."study_courses" OWNER TO "postgres";


COMMENT ON COLUMN "public"."study_courses"."is_active" IS 'Indicates if the course is published and visible to students.';



CREATE SEQUENCE IF NOT EXISTS "public"."study_courses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."study_courses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."study_courses_id_seq" OWNED BY "public"."study_courses"."id";



CREATE TABLE IF NOT EXISTS "public"."user_private_messages" (
    "id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "source" "text",
    "related_question_id" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_read" boolean DEFAULT false,
    "user_reply_text" "text",
    "user_replied_at" timestamp with time zone,
    "admin_read_reply" boolean DEFAULT false,
    CONSTRAINT "user_private_messages_source_check" CHECK (("source" = ANY (ARRAY['ask_sheikh_reply'::"text", 'admin_direct_message'::"text", 'system_notification'::"text"])))
);


ALTER TABLE "public"."user_private_messages" OWNER TO "postgres";


COMMENT ON COLUMN "public"."user_private_messages"."user_reply_text" IS 'نص رد المستخدم على الرسالة الواردة.';



COMMENT ON COLUMN "public"."user_private_messages"."user_replied_at" IS 'تاريخ ووقت رد المستخدم.';



COMMENT ON COLUMN "public"."user_private_messages"."admin_read_reply" IS 'هل قام المشرف بقراءة رد المستخدم؟';



CREATE SEQUENCE IF NOT EXISTS "public"."user_private_messages_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."user_private_messages_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_private_messages_id_seq" OWNED BY "public"."user_private_messages"."id";



ALTER TABLE ONLY "public"."books" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."books_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."lessons" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."lessons_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."notifications" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."notifications_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."site_stats" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."site_stats_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."study_courses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."study_courses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_private_messages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_private_messages_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."about_sheikh"
    ADD CONSTRAINT "about_sheikh_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_enrollments"
    ADD CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("user_id", "course_id");



ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "course_modules_course_id_module_number_key" UNIQUE ("course_id", "module_number");



COMMENT ON CONSTRAINT "course_modules_course_id_module_number_key" ON "public"."course_modules" IS 'يضمن عدم تكرار رقم نفس الوحدة في الدورة الواحدة.';



ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lesson_completions"
    ADD CONSTRAINT "lesson_completions_pkey" PRIMARY KEY ("user_id", "lesson_id");



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_youtube_url_key" UNIQUE ("youtube_url");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_categories"
    ADD CONSTRAINT "question_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."question_categories"
    ADD CONSTRAINT "question_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_options"
    ADD CONSTRAINT "question_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questions_to_sheikh"
    ADD CONSTRAINT "questions_to_sheikh_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."site_stats"
    ADD CONSTRAINT "site_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."study_courses"
    ADD CONSTRAINT "study_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "unique_user_quiz_attempt" UNIQUE ("user_id", "quiz_id", "attempt_number");



ALTER TABLE ONLY "public"."user_private_messages"
    ADD CONSTRAINT "user_private_messages_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_books_category_id" ON "public"."books" USING "btree" ("category_id");



CREATE INDEX "idx_books_course_id" ON "public"."books" USING "btree" ("course_id");



CREATE INDEX "idx_comments_book_created" ON "public"."comments" USING "btree" ("book_id", "created_at" DESC) WHERE ("parent_comment_id" IS NULL);



CREATE INDEX "idx_comments_book_id" ON "public"."comments" USING "btree" ("book_id");



CREATE INDEX "idx_comments_content_created" ON "public"."comments" USING "btree" ("lesson_id", "created_at" DESC) WHERE ("parent_comment_id" IS NULL);



CREATE INDEX "idx_comments_course_created" ON "public"."comments" USING "btree" ("study_course_id", "created_at" DESC) WHERE ("parent_comment_id" IS NULL);



CREATE INDEX "idx_comments_lesson_id" ON "public"."comments" USING "btree" ("lesson_id");



CREATE INDEX "idx_comments_parent_comment_id" ON "public"."comments" USING "btree" ("parent_comment_id");



CREATE INDEX "idx_comments_profile_id" ON "public"."comments" USING "btree" ("profile_id");



CREATE INDEX "idx_comments_replies_sorted" ON "public"."comments" USING "btree" ("parent_comment_id", "created_at") WHERE ("parent_comment_id" IS NOT NULL);



CREATE INDEX "idx_comments_study_course_id" ON "public"."comments" USING "btree" ("study_course_id");



CREATE INDEX "idx_comments_user_id" ON "public"."comments" USING "btree" ("user_id");



CREATE INDEX "idx_lessons_course_order" ON "public"."lessons" USING "btree" ("course_id", "lesson_order");



CREATE INDEX "idx_lessons_module_number" ON "public"."lessons" USING "btree" ("module_number");



CREATE INDEX "idx_notifications_user_read_created" ON "public"."notifications" USING "btree" ("user_id", "is_read", "created_at" DESC);



CREATE INDEX "idx_question_categories_name" ON "public"."question_categories" USING "btree" ("name");



CREATE INDEX "idx_question_options_question_id" ON "public"."question_options" USING "btree" ("question_id");



CREATE INDEX "idx_questions_to_sheikh_category_id" ON "public"."questions_to_sheikh" USING "btree" ("category_id");



CREATE INDEX "idx_questions_to_sheikh_is_answered" ON "public"."questions_to_sheikh" USING "btree" ("is_answered");



CREATE INDEX "idx_questions_to_sheikh_is_public" ON "public"."questions_to_sheikh" USING "btree" ("is_public");



CREATE INDEX "idx_questions_to_sheikh_user_id" ON "public"."questions_to_sheikh" USING "btree" ("user_id");



CREATE INDEX "idx_quiz_attempts_quiz_id" ON "public"."quiz_attempts" USING "btree" ("quiz_id");



CREATE INDEX "idx_quiz_attempts_user_id" ON "public"."quiz_attempts" USING "btree" ("user_id");



CREATE INDEX "idx_quiz_attempts_user_quiz" ON "public"."quiz_attempts" USING "btree" ("user_id", "quiz_id");



CREATE INDEX "idx_quiz_questions_quiz_id" ON "public"."quiz_questions" USING "btree" ("quiz_id");



CREATE INDEX "idx_quizzes_course_id" ON "public"."quizzes" USING "btree" ("course_id");



CREATE INDEX "idx_quizzes_is_active" ON "public"."quizzes" USING "btree" ("is_active");



CREATE INDEX "idx_quizzes_lesson_id" ON "public"."quizzes" USING "btree" ("lesson_id");



CREATE INDEX "idx_quizzes_type" ON "public"."quizzes" USING "btree" ("type");



CREATE INDEX "idx_study_courses_is_active" ON "public"."study_courses" USING "btree" ("is_active");



CREATE INDEX "lessons_title_trgm_idx" ON "public"."lessons" USING "gin" ("title" "public"."gin_trgm_ops");


CREATE OR REPLACE TRIGGER "grade_submitted_attempt" AFTER INSERT OR UPDATE ON "public"."quiz_attempts" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://ujcgpifvyusngxmkaqsc.supabase.co/functions/v1/grade-quiz-attempt', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqY2dwaWZ2eXVzbmd4bWthcXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5ODcwMTEsImV4cCI6MjA1OTU2MzAxMX0.J0BPvS0mKdIf2tZl0hbKGQG2IB2BupKgaQrDYa6OPZQ"}', '{}', '5000');




CREATE OR REPLACE TRIGGER "handle_comment_update" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_profile_update" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."course_modules" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');



CREATE OR REPLACE TRIGGER "on_quiz_question_update" BEFORE UPDATE ON "public"."quiz_questions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "on_quiz_update" BEFORE UPDATE ON "public"."quizzes" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_study_course_id_fkey" FOREIGN KEY ("study_course_id") REFERENCES "public"."study_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "fk_attempts_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "fk_books_category" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "fk_books_course" FOREIGN KEY ("course_id") REFERENCES "public"."study_courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "fk_books_linked_lesson" FOREIGN KEY ("linked_lesson_id") REFERENCES "public"."lessons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "fk_comments_lesson_id" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lesson_completions"
    ADD CONSTRAINT "fk_completions_lesson_id" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lesson_completions"
    ADD CONSTRAINT "fk_completions_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "fk_course_modules_course_id" FOREIGN KEY ("course_id") REFERENCES "public"."study_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_enrollments"
    ADD CONSTRAINT "fk_enrollments_course_id" FOREIGN KEY ("course_id") REFERENCES "public"."study_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_enrollments"
    ADD CONSTRAINT "fk_enrollments_last_lesson" FOREIGN KEY ("last_accessed_lesson_id") REFERENCES "public"."lessons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."course_enrollments"
    ADD CONSTRAINT "fk_enrollments_user_id" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "fk_lessons_course_id" FOREIGN KEY ("course_id") REFERENCES "public"."study_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_options"
    ADD CONSTRAINT "fk_question_options_question_id" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "fk_quiz_attempts_quiz_id" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quiz_questions"
    ADD CONSTRAINT "fk_quiz_questions_quiz_id" FOREIGN KEY ("quiz_id") REFERENCES "public"."quizzes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "fk_quizzes_course_id" FOREIGN KEY ("course_id") REFERENCES "public"."study_courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quizzes"
    ADD CONSTRAINT "fk_quizzes_lesson_id" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."lessons"
    ADD CONSTRAINT "lessons_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions_to_sheikh"
    ADD CONSTRAINT "questions_to_sheikh_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."question_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."questions_to_sheikh"
    ADD CONSTRAINT "questions_to_sheikh_profile_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."site_stats"
    ADD CONSTRAINT "site_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."study_courses"
    ADD CONSTRAINT "study_courses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_private_messages"
    ADD CONSTRAINT "user_private_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow admin full access" ON "public"."question_options" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."quiz_attempts" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."quiz_questions" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."quizzes" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to announcements" ON "public"."announcements" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to books" ON "public"."books" TO "authenticated" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to categories" ON "public"."categories" TO "authenticated" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to course modules" ON "public"."course_modules" USING ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"text")) WITH CHECK ((( SELECT "profiles"."role"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())) = 'admin'::"text"));



CREATE POLICY "Allow admin full access to lessons" ON "public"."lessons" TO "authenticated" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to notifications" ON "public"."notifications" TO "authenticated" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to private messages" ON "public"."user_private_messages" USING (("auth"."role"() = 'admin'::"text")) WITH CHECK (("auth"."role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to profiles" ON "public"."profiles" TO "authenticated" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to question categories" ON "public"."question_categories" TO "authenticated" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to questions_to_sheikh" ON "public"."questions_to_sheikh" TO "authenticated" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to settings" ON "public"."settings" TO "authenticated" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to study_courses" ON "public"."study_courses" TO "authenticated" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin full access to user_private_messages" ON "public"."user_private_messages" TO "authenticated" USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow admin update access to about page info" ON "public"."about_sheikh" FOR UPDATE USING (("public"."get_user_role"() = 'admin'::"text")) WITH CHECK ((("public"."get_user_role"() = 'admin'::"text") AND ("id" = 1)));



CREATE POLICY "Allow admins to view all course enrollments" ON "public"."course_enrollments" FOR SELECT TO "authenticated" USING (("public"."get_user_role"() = 'admin'::"text"));



CREATE POLICY "Allow authenticated users to insert comments" ON "public"."comments" FOR INSERT WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "user_id")));



CREATE POLICY "Allow authenticated users to insert questions" ON "public"."questions_to_sheikh" FOR INSERT TO "authenticated" WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow authenticated users to read profiles linked from comments" ON "public"."profiles" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."comments"
  WHERE ("comments"."profile_id" = "profiles"."id")))));



CREATE POLICY "Allow authenticated users to select active quizzes" ON "public"."quizzes" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND ("is_active" = true)));



CREATE POLICY "Allow authenticated users to select questions for accessible qu" ON "public"."quiz_questions" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."quizzes" "q"
  WHERE (("q"."id" = "quiz_questions"."quiz_id") AND ("q"."is_active" = true))))));



CREATE POLICY "Allow comment owner to delete their comment" ON "public"."comments" FOR DELETE USING ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "user_id")));



CREATE POLICY "Allow comment owner to update their comment" ON "public"."comments" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "user_id"))) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow individual user access" ON "public"."profiles" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Allow inserting site stats." ON "public"."site_stats" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow logged-in users to read options" ON "public"."question_options" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow public read access to about page info" ON "public"."about_sheikh" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to approved comments" ON "public"."comments" FOR SELECT USING (("is_approved" = true));



CREATE POLICY "Allow public read access to books" ON "public"."books" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to categories" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to course modules" ON "public"."course_modules" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to lessons" ON "public"."lessons" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to notifications" ON "public"."notifications" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to published announcements" ON "public"."announcements" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Allow public read access to question categories" ON "public"."question_categories" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to settings" ON "public"."settings" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to study_courses" ON "public"."study_courses" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to user_private_messages" ON "public"."user_private_messages" FOR SELECT USING (true);



CREATE POLICY "Allow user update own enrollment for last access" ON "public"."course_enrollments" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to insert their own attempts" ON "public"."quiz_attempts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to read public answered questions" ON "public"."questions_to_sheikh" FOR SELECT TO "authenticated" USING ((("is_answered" = true) AND ("is_public" = true)));



CREATE POLICY "Allow users to read their notifications and public ones" ON "public"."notifications" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Allow users to read their own questions" ON "public"."questions_to_sheikh" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to read their private messages" ON "public"."user_private_messages" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to select their own attempts" ON "public"."quiz_attempts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update their own attempts" ON "public"."quiz_attempts" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Public can read settings." ON "public"."settings" FOR SELECT USING (true);



CREATE POLICY "Public categories are viewable by everyone." ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Public content is viewable by everyone." ON "public"."books" FOR SELECT USING (true);



CREATE POLICY "Public content is viewable by everyone." ON "public"."lessons" FOR SELECT USING (true);



CREATE POLICY "Public content is viewable by everyone." ON "public"."study_courses" FOR SELECT USING (true);



CREATE POLICY "Users can enroll themselves in courses." ON "public"."course_enrollments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can mark lessons as completed for themselves." ON "public"."lesson_completions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can mark their messages as read/unread." ON "public"."user_private_messages" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can mark their notifications as read/unread." ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can unenroll themselves from courses." ON "public"."course_enrollments" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own and public notifications." ON "public"."notifications" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Users can view their own completed lessons." ON "public"."lesson_completions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own enrollments." ON "public"."course_enrollments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own private messages." ON "public"."user_private_messages" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."about_sheikh" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_enrollments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_modules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lesson_completions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lessons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questions_to_sheikh" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quiz_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quizzes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."study_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_private_messages" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_in"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_out"("public"."gtrgm") TO "service_role";























































































































































































GRANT ALL ON FUNCTION "public"."get_reply_count"("p_parent_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_reply_count"("p_parent_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reply_count"("p_parent_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_query_trgm"("text", "internal", smallint, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_extract_value_trgm"("text", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_consistent"("internal", smallint, "text", integer, "internal", "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gin_trgm_triconsistent"("internal", smallint, "text", integer, "internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_compress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_consistent"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_decompress"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_distance"("internal", "text", smallint, "oid", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_options"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_penalty"("internal", "internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_picksplit"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_same"("public"."gtrgm", "public"."gtrgm", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "anon";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."gtrgm_union"("internal", "internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_banned"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_banned"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_banned"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "postgres";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "anon";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_limit"(real) TO "service_role";



GRANT ALL ON FUNCTION "public"."show_limit"() TO "postgres";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."show_trgm"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_dist"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strict_word_similarity_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_commutator_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_dist_op"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."word_similarity_op"("text", "text") TO "service_role";


















GRANT ALL ON TABLE "public"."about_sheikh" TO "anon";
GRANT ALL ON TABLE "public"."about_sheikh" TO "authenticated";
GRANT ALL ON TABLE "public"."about_sheikh" TO "service_role";



GRANT ALL ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."announcements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."announcements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."announcements_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";



GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."books_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."course_enrollments" TO "anon";
GRANT ALL ON TABLE "public"."course_enrollments" TO "authenticated";
GRANT ALL ON TABLE "public"."course_enrollments" TO "service_role";



GRANT ALL ON TABLE "public"."course_modules" TO "anon";
GRANT ALL ON TABLE "public"."course_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."course_modules" TO "service_role";



GRANT ALL ON SEQUENCE "public"."course_modules_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."course_modules_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."course_modules_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."lesson_completions" TO "anon";
GRANT ALL ON TABLE "public"."lesson_completions" TO "authenticated";
GRANT ALL ON TABLE "public"."lesson_completions" TO "service_role";



GRANT ALL ON TABLE "public"."lessons" TO "anon";
GRANT ALL ON TABLE "public"."lessons" TO "authenticated";
GRANT ALL ON TABLE "public"."lessons" TO "service_role";



GRANT ALL ON SEQUENCE "public"."lessons_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."lessons_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."lessons_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."question_categories" TO "anon";
GRANT ALL ON TABLE "public"."question_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."question_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."question_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."question_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."question_categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."question_options" TO "anon";
GRANT ALL ON TABLE "public"."question_options" TO "authenticated";
GRANT ALL ON TABLE "public"."question_options" TO "service_role";



GRANT ALL ON SEQUENCE "public"."question_options_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."question_options_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."question_options_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."questions_to_sheikh" TO "anon";
GRANT ALL ON TABLE "public"."questions_to_sheikh" TO "authenticated";
GRANT ALL ON TABLE "public"."questions_to_sheikh" TO "service_role";



GRANT ALL ON SEQUENCE "public"."questions_to_sheikh_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."questions_to_sheikh_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."questions_to_sheikh_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_attempts" TO "anon";
GRANT ALL ON TABLE "public"."quiz_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_attempts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."quiz_attempts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."quiz_attempts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."quiz_attempts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."quiz_questions" TO "anon";
GRANT ALL ON TABLE "public"."quiz_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."quiz_questions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."quiz_questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."quiz_questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."quiz_questions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."quizzes" TO "anon";
GRANT ALL ON TABLE "public"."quizzes" TO "authenticated";
GRANT ALL ON TABLE "public"."quizzes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."quizzes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."quizzes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."quizzes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON TABLE "public"."site_stats" TO "anon";
GRANT ALL ON TABLE "public"."site_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."site_stats" TO "service_role";



GRANT ALL ON SEQUENCE "public"."site_stats_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."site_stats_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."site_stats_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."study_courses" TO "anon";
GRANT ALL ON TABLE "public"."study_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."study_courses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."study_courses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."study_courses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."study_courses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_private_messages" TO "anon";
GRANT ALL ON TABLE "public"."user_private_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."user_private_messages" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_private_messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_private_messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_private_messages_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
