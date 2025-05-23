// supabase/functions/_shared/cors.ts
export const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // أو حدد نطاقك للإنتاج
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };