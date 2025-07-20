// functions/notes/[[id]].js
import { jwtVerify } from 'jose';

async function verifyAndContinue(context) {
    const { request, env, next } = context;
    const token = getTokenFromCookie(request.headers.get("Cookie") || "");

    if (!token) {
        return new Response("Unauthorized: No token provided", { status: 401 });
    }

    try {
        await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET), { issuer: 'notica-auth' });
    } catch (err) {
        return new Response(`Unauthorized: ${err.message}`, { status: 401 });
    }

    const referer = request.headers.get("Referer") || "";
    const allowedReferers = ["https://notica.pages.dev", "127.0.0.1", "localhost"];
    if (!allowedReferers.some(allowed => referer.includes(allowed))) {
        return new Response("Access denied: must be embedded in site", { status: 403 });
    }

    return next();
}

export const onRequest = [verifyAndContinue];

function getTokenFromCookie(cookieHeader) {
    const tokenCookie = cookieHeader.split(';').find(c => c.trim().startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
}