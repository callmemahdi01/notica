// functions/api/auth.js
import { jwtVerify } from 'jose';

export async function onRequestGet(context) {
    const { request, env } = context;

    if (!env.JWT_SECRET) {
        return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
    }

    const cookie = request.headers.get("Cookie") || "";
    const token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];

    if (!token || token === 'deleted') {
        return new Response(JSON.stringify({ isAuthenticated: false, user: null }), { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret, {
            issuer: 'notica-auth',
        });

        return new Response(JSON.stringify({ isAuthenticated: true, user: { name: payload.name, studentId: payload.sub } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error("Auth Error:", e.message);
        return new Response(JSON.stringify({ isAuthenticated: false, user: null }), { status: 401 });
    }
}