// functions/notes/[[id]].js
import { jwtVerify } from 'jose';
import notesBundle from '../notes-bundle.json';

async function getUserSubscription(db, studentId) {
    if (!studentId) return 'free';
    const user = await db.prepare('SELECT subscription_type FROM users WHERE student_id = ?').bind(studentId).first();
    return user ? user.subscription_type : 'free';
}

function getTokenFromCookie(cookieHeader) {
    const tokenCookie = cookieHeader.split(';').find(c => c.trim().startsWith('token='));
    return tokenCookie ? tokenCookie.split('=')[1] : null;
}

export async function onRequestGet(context) {
    const { request, env, params } = context;

    const token = getTokenFromCookie(request.headers.get("Cookie") || "");
    if (!token) {
        return new Response("Unauthorized: No token provided", { status: 401 });
    }

    let payload;
    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        ({ payload } = await jwtVerify(token, secret, { issuer: 'notica-auth' }));
    } catch (err) {
        return new Response(`Unauthorized: ${err.message}`, { status: 401 });
    }

    const referer = request.headers.get("Referer") || "";
    const allowedReferers = ["https://notica.pages.dev", "http://127.0.0.1", "localhost"];
    if (!allowedReferers.some(allowed => referer.includes(allowed))) {
        return new Response("Access denied: must be embedded in site", { status: 403 });
    }

    const noteKey = params.id && Array.isArray(params.id)
        ? params.id.filter(Boolean).join("/")
        : "";

    if (!noteKey) {
        return new Response("Not Found: Invalid note path", { status: 404 });
    }
    
    const noteContent = notesBundle[noteKey];

    if (!noteContent) {
        console.error(`Note key not found in bundle: ${noteKey}`);
        return new Response("Not Found", { status: 404 });
    }

    const subscriptionType = await getUserSubscription(env.notica_db, payload.sub);
    const noteId = noteKey.split('/')[1];
    
    const isFreeNote = ['1', '2', '3'].includes(noteId);

    if (subscriptionType === 'pro' || (subscriptionType === 'free' && isFreeNote)) {
         return new Response(noteContent, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "X-Frame-Options": "SAMEORIGIN",
            },
        });
    } else {
         return new Response("Forbidden: Access to this note requires a Pro subscription.", { status: 403 });
    }
}