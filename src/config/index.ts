export const config = {
  port: 8000,
  jwtSecret_session: process.env.JWT_SECRET || 'test-secret',
  bcryptRounds: 10,
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || ''
  }
};
