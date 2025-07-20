import { notes } from "../../notes/index.js";

export async function onRequestGet(context) {
    const { request, env, params } = context;

    // 1. بررسی احراز هویت کاربر
    const token = getTokenFromCookie(request.headers.get("Cookie") || "");
    if (!token) {
        return new Response("Unauthorized: No token provided", { status: 401 });
    }
    try {
        await verifyJWT(token, env.JWT_SECRET);
    } catch (err) {
        return new Response(`Unauthorized: ${err.message}`, { status: 401 });
    }

    // 2. محدود کردن به نمایش فقط از طریق iframe سایت شما
    const referer = request.headers.get("Referer") || "";

    if (
        !referer.includes("https://notica.pages.dev") &&
        !referer.includes("127.0.0.1")
    ) {
        return new Response("Access denied: must be embedded in site", {
            status: 403,
        });
    }

    // 3. دریافت محتوای جزوه از manifest
    const noteKey =
        params.id && Array.isArray(params.id)
            ? params.id.filter((segment) => segment).join("/")
            : "";

    const noteContent = notes[noteKey];

    if (noteContent !== undefined) {
        return new Response(noteContent, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                // جلوگیری از نمایش مستقیم توسط مرورگر (افزایش امنیت)
                "X-Frame-Options": "SAMEORIGIN",
            },
        });
    } else {
        return new Response("Not Found", { status: 404 });
    }
}

// --- توابع کمکی ---

function getTokenFromCookie(cookieHeader) {
    const tokenCookie = cookieHeader
        .split(";")
        .find((c) => c.trim().startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
}

async function verifyJWT(token, secret) {
    const encoder = new TextEncoder();
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) {
        throw new Error("Invalid token format");
    }
    const data = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );
    const signature = Uint8Array.from(
        atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        signature,
        encoder.encode(data)
    );
    if (!valid) {
        throw new Error("Invalid signature");
    }
    const payload = JSON.parse(
        atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error("Token expired");
    }
    return payload;
}
