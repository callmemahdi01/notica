import { verifyJWT } from './utils';
import { findUserByStudentId } from './db';

const authMiddleware = async (context) => {
  const { request, env, data } = context;
  const { pathname } = new URL(request.url);

  const publicPaths = ['/api/login', '/api/signup'];
  if (publicPaths.includes(pathname)) {
    return await context.next();
  }

  const cookie = request.headers.get('Cookie') || '';
  const token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await verifyJWT(env.JWT_SECRET, token);
    const { sub: userId, sessionId: tokenSessionId } = payload;

    if (!userId || !tokenSessionId) {
      return new Response(JSON.stringify({ error: 'Invalid token payload' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await findUserByStudentId(env.notica_db, userId);

    if (!user || user.session_id !== tokenSessionId) {
      return new Response(JSON.stringify({ error: 'Session expired' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    data.user = { id: userId, name: user.name };
    return await context.next();
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const onRequest = [authMiddleware];