// functions/api/_middleware.js

import { jwtVerify } from 'jose';

const chain = (...middlewares) => {
  return async (context) => {
    let response;
    for (const middleware of middlewares) {
      response = await middleware(context);
      if (response) {
        return response;
      }
    }
    return await context.next();
  };
};

const authMiddleware = async (context) => {
  const { request, env, data } = context;
  const { pathname } = new URL(request.url);

  const publicPaths = ['/api/login', '/api/signup'];
  if (publicPaths.includes(pathname)) {
    return;
  }

  const cookie = request.headers.get("Cookie") || "";
  const token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, { issuer: 'notica-auth' });

    const userId = payload.sub;
    const tokenSessionId = payload.sessionId;

    if (!userId || !tokenSessionId) {
        return new Response(JSON.stringify({ error: "Invalid token payload" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const user = await env.notica_db.prepare('SELECT session_id FROM users WHERE student_id = ?').bind(userId).first();

    if (!user || user.session_id !== tokenSessionId) {
        return new Response(JSON.stringify({ error: "Session expired" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    data.user = { id: userId, name: payload.name };
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
};

export const onRequest = chain(authMiddleware);