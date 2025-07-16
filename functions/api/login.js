import { findUserByStudentId, updateUserSession } from './db';
import { createJWT } from './utils';

export const onRequestPost = async ({ request, env }) => {
  try {
    const { student_id, password } = await request.json();

    if (!student_id || !password) {
      return new Response(
        JSON.stringify({ error: 'Student ID and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await findUserByStudentId(env.notica_db, student_id);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hashedPassword = await hashPassword(password);
    if (user.password !== hashedPassword) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sessionId = crypto.randomUUID();
    await updateUserSession(env.notica_db, user.student_id, sessionId);

    const token = await createJWT(env.JWT_SECRET, user.student_id, user.name, sessionId);

    return new Response(JSON.stringify({ message: 'Logged in successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `token=${token}; HttpOnly; Secure; Path=/; SameSite=Strict`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};