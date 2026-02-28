import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bb493b8dc86be9bdec36f17df8316a33c9a8ae0e.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Lazy initialization or Proxy to prevent crash on module load if key is missing
export const supabase = supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({} as any, {
      get: (_, prop) => {
        if (prop === 'auth') {
          return new Proxy({} as any, {
            get: (_, authProp) => {
              return () => {
                console.warn(`Supabase ${String(authProp)} called but VITE_SUPABASE_ANON_KEY is missing.`);
                return Promise.resolve({ data: { session: null }, error: null });
              };
            }
          });
        }
        return () => {
          throw new Error('Supabase key is missing. Please set VITE_SUPABASE_ANON_KEY in your environment variables to use this feature.');
        };
      }
    });
