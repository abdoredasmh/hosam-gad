// supabase/functions/grade-quiz-attempt/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
// Update path if your types file location differs
import type { Database, Tables, Json, Enums } from '../../../types/database.types.ts';

// --- Types ---
// Ensure these types match your UPDATED database.types.ts
type Option = Pick<Tables<'question_options'>, 'id' | 'question_id' | 'option_text' | 'is_correct'>;
type QuestionWithOptions = Pick<Tables<'quiz_questions'>, 'id' | 'type' | 'points' | 'question_text'> & { // No model_answer needed here
  question_options: Option[];
};
type QuizAttempt = Tables<'quiz_attempts'>; // Includes manual_score now
type Quiz = Pick<Tables<'quizzes'>, 'id' | 'pass_mark_percentage'>;
type GradingStatusEnum = Enums<'grading_status_enum'>; // Use enum if defined in types

// --- Helper: Create Error ---
// Basic error helper if you don't have a shared one
class HttpError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}
function createError(options: { status: number; message: string }): HttpError {
    return new HttpError(options.message, options.status);
}


// --- Helper: Get Correct TF Answer ---
function getCorrectAnswerTf(options: Option[] | null | undefined): boolean | null {
  const correctOption = options?.find(opt => opt.is_correct);
  if (!correctOption?.option_text) return null;
  // Keep the robust check, but ensure your option_text for TF is consistent ('true'/'false' preferred)
  return /^(true|1|صح|نعم)$/i.test(correctOption.option_text);
}

serve(async (req: Request) => {
  // --- CORS Preflight ---
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log("Grade function invoked...");

  try {
    // --- Initialization ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Missing Supabase URL or Service Role Key environment variables.");
        throw new Error("Server configuration error.");
    }

    const supabaseAdminClient: SupabaseClient<Database> = createClient(supabaseUrl, serviceRoleKey);

    // --- Get Attempt ID ---
    const payload = await req.json();
    let attemptId: number | null = null;
    let triggerType: 'INSERT' | 'UPDATE' | 'MANUAL' | null = null;

    // Handle Database Webhook Payload
    if (payload.type && (payload.type === 'INSERT' || payload.type === 'UPDATE') && payload.record?.id) {
        triggerType = payload.type;
        attemptId = Number(payload.record.id);
        console.log(`Webhook Trigger: Type=${triggerType}, Attempt ID=${attemptId}`);

        // Check submission status based on trigger type
        if (triggerType === 'INSERT' && !payload.record.submitted_at) {
             console.log(`Attempt ${attemptId} inserted but not yet submitted. Skipping grading.`);
             return new Response(JSON.stringify({ message: 'Attempt not submitted yet.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        if (triggerType === 'UPDATE') {
            const submittedNow = payload.record.submitted_at !== null;
            const submittedBefore = payload.old_record?.submitted_at !== null;
            if (!submittedNow || submittedBefore) {
                console.log(`Attempt ${attemptId} update did not involve submission or was already submitted. Skipping grading.`);
                return new Response(JSON.stringify({ message: 'No submission detected in update or already submitted.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
        }
         console.log(`Attempt ${attemptId} is ready for grading (via ${triggerType}).`);

    }
    // Handle Direct API call payload
    else if (payload.attemptId) {
        triggerType = 'MANUAL';
        attemptId = Number(payload.attemptId);
        console.log(`Manual Trigger: Attempt ID=${attemptId}`);
    }
    // Invalid Payload
    else {
        console.error("Invalid or missing attemptId in request payload:", payload);
        throw createError({ status: 400, message: "Attempt ID is required in the payload." });
    }

    if (isNaN(attemptId) || attemptId <= 0) {
        throw createError({ status: 400, message: `Invalid Attempt ID provided: ${attemptId}` });
    }

    console.log(`[Grade Function] Processing attempt ID: ${attemptId}`);

    // --- Fetch Necessary Data using Admin Client ---
    // Fetch Attempt
    const { data: attempt, error: attemptError } = await supabaseAdminClient
      .from('quiz_attempts').select('*').eq('id', attemptId).maybeSingle();

    if (attemptError) {
        console.error(`Error fetching attempt ${attemptId}:`, attemptError);
        throw createError({ status: 500, message: `Database error fetching attempt: ${attemptError.message}` });
    }
    if (!attempt) {
        console.error(`Attempt ${attemptId} not found in database.`);
        throw createError({ status: 404, message: `Attempt ${attemptId} not found.` });
    }

    // --- Pre-Grading Checks ---
    // Check if already fully graded or pending manual (unless it's a manual trigger maybe?)
    // Note: You might want to allow manual trigger to re-calculate auto-score even if pending_manual
    if (attempt.grading_status === 'graded' || attempt.grading_status === 'auto_graded') {
        console.warn(`Attempt ${attemptId} status is already '${attempt.grading_status}'. Skipping auto-grading.`);
        // Consider if manual trigger should override this for re-calculation
        return new Response(JSON.stringify({ message: `Attempt already processed (${attempt.grading_status}).` }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    // Ensure it's submitted
    if (!attempt.submitted_at) {
         console.warn(`Attempt ${attemptId} is not submitted (submitted_at is null). Skipping grading.`);
         return new Response(JSON.stringify({ message: 'Attempt not submitted.' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Fetch Quiz
    const { data: quiz, error: quizError } = await supabaseAdminClient
      .from('quizzes').select('id, pass_mark_percentage').eq('id', attempt.quiz_id).single();
    if (quizError || !quiz) {
         console.error(`Error fetching quiz ${attempt.quiz_id}:`, quizError);
         throw createError({ status: 500, message: `Quiz not found or error fetching: ${quizError?.message || 'Not Found'}` });
     }

    // Fetch Questions with Options
    const { data: questions, error: questionsError } = await supabaseAdminClient
      .from('quiz_questions').select(`id, type, points, question_options ( id, question_id, option_text, is_correct )`).eq('quiz_id', quiz.id);
    if (questionsError || !questions) {
         console.error(`Error fetching questions for quiz ${quiz.id}:`, questionsError);
         throw createError({ status: 500, message: `Error fetching questions: ${questionsError?.message || 'Not Found'}` });
     }

    // --- Perform Auto-Grading ---
    console.log(`Auto-Grading ${questions.length} questions for attempt ${attemptId}...`);
    let autoScore = 0;
    let manualScoreRequired = false;
    let totalPossiblePoints = 0;
    const userAnswers = (attempt.answers && typeof attempt.answers === 'object' && !Array.isArray(attempt.answers))
                      ? attempt.answers as Record<string | number, any>
                      : {};

    for (const question of questions as QuestionWithOptions[]) {
      const questionId = question.id;
      const userAnswer = userAnswers[questionId];
      const points = question.points ?? 0;
      totalPossiblePoints += points;

      console.log(`-> Grading Q${questionId} (Type: ${question.type}, Pts: ${points}) | User Answer:`, userAnswer);

      switch (question.type) {
        case 'mcq': { // Assuming 'mcq' is your type for multiple choice
          const correctOption = question.question_options?.find(opt => opt.is_correct);
          if (correctOption && userAnswer !== null && userAnswer !== undefined && String(userAnswer) === String(correctOption.id)) { // Compare as strings for safety
            autoScore += points; console.log(`   Correct (+${points})`);
          } else { console.log(`   Incorrect (Correct Option ID: ${correctOption?.id})`); }
          break;
        }
        case 'true_false': { // Assuming 'tf' is your type for true/false
          const correctAnswerBool = getCorrectAnswerTf(question.question_options);
          const userAnswerBool = typeof userAnswer === 'string' ? userAnswer.toLowerCase() === 'true' : Boolean(userAnswer); // Robust conversion
          if (correctAnswerBool !== null && userAnswerBool === correctAnswerBool) {
            autoScore += points; console.log(`   Correct (+${points})`);
          } else { console.log(`   Incorrect (Correct Answer: ${correctAnswerBool})`); }
          break;
        }
        case 'written':
          manualScoreRequired = true; console.log(`   Written - Manual grading needed.`);
          // DO NOT calculate score here
          break;
        default:
          console.warn(`   Unknown Q type: ${question.type}. Assuming manual grading needed.`);
          manualScoreRequired = true;
          break;
      }
    }

    // --- Determine Final Status & Scores based ONLY on auto-grading ---
    const finalGradingStatus: GradingStatusEnum = manualScoreRequired ? 'pending_manual' : 'auto_graded';
    let finalTotalScore: number | null = null;
    let finalPassedStatus: boolean | null = null;
    const passMark = quiz.pass_mark_percentage ?? 50;

    if (finalGradingStatus === 'auto_graded') {
         // Calculate final score and pass status ONLY if no manual grading is needed
         finalTotalScore = autoScore;
         if (totalPossiblePoints > 0) {
             finalPassedStatus = (finalTotalScore / totalPossiblePoints) * 100 >= passMark;
         } else {
             finalPassedStatus = true; // Pass if quiz has 0 points? Business decision.
         }
    } else {
         // If pending manual, set total score and passed to NULL initially
         finalTotalScore = null;
         finalPassedStatus = null;
         // Keep existing manual_score if any (though it shouldn't exist yet)
    }


    console.log(`Auto-Grading Complete: AutoScore=${autoScore}, ManualNeeded=${manualScoreRequired}, TotalPossible=${totalPossiblePoints}, FinalCalculatedPassed=${finalPassedStatus}, Status=${finalGradingStatus}`);

    // --- Update Attempt Record ---
    const updatePayload: Partial<Tables<'quiz_attempts'>> = {
        score: autoScore,               // Update the auto-score part
        total_score: finalTotalScore,   // Update total score (null if pending manual)
        passed: finalPassedStatus,      // Update pass status (null if pending manual)
        grading_status: finalGradingStatus,
        // DO NOT update manual_score here. It's handled separately.
    };

    // Optional: Reset manual_score to NULL if re-grading automatically?
    // if (finalGradingStatus === 'pending_manual') {
    //    updatePayload.manual_score = null;
    // }

    const { error: updateError } = await supabaseAdminClient
      .from('quiz_attempts')
      .update(updatePayload)
      .eq('id', attemptId);

    if (updateError) {
      console.error(`Error updating attempt record ${attemptId}:`, updateError);
      throw createError({ status: 500, message: `Failed to update attempt record: ${updateError.message}` });
    }

    console.log(`Attempt ${attemptId} successfully auto-graded and updated.`);

    // --- Return Success Response ---
    return new Response(JSON.stringify({
        message: `Attempt ${attemptId} auto-processed. Status: ${finalGradingStatus}.`,
        attemptId: attemptId,
        status: finalGradingStatus,
        autoScore: autoScore,
        // Note: 'passed' here reflects calculation ONLY if auto_graded completes fully
        passed: finalPassedStatus
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Grade Function] Caught Error:', error);
    const statusCode = error instanceof HttpError ? error.statusCode : 500;
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});