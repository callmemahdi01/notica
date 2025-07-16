// functions/api/login.js
import { SignJWT } from 'jose';

// (تابع hashPassword بدون تغییر باقی می‌ماند)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
    const { request, env } = context;

    if (!env.notica_db || !env.JWT_SECRET) {
        return new Response(JSON.stringify({ error: `تنظیمات سمت سرور ناقص است.` }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        const { studentId, password } = await request.json();
        if (!studentId || !password) {
            return new Response(JSON.stringify({ error: "شماره دانشجویی و رمز عبور الزامی است." }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const user = await env.notica_db.prepare('SELECT student_id, password, full_name FROM users WHERE student_id = ?').bind(studentId).first();
        const hashedInputPassword = await hashPassword(password);

        if (!user || user.password !== hashedInputPassword) {
            return new Response(JSON.stringify({ error: "شماره دانشجویی یا رمز عبور اشتباه است." }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        
        // --- شروع تغییرات ---

        // 1. ایجاد شناسه جلسه منحصر به فرد
        const newSessionId = crypto.randomUUID();

        // 2. ذخیره شناسه جلسه جدید در دیتابیس
        await env.notica_db.prepare('UPDATE users SET session_id = ? WHERE student_id = ?').bind(newSessionId, studentId).run();

        // 3. ساخت توکن با شناسه جلسه جدید
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const alg = 'HS256';

        const jwt = await new SignJWT({
                name: user.full_name,
                sessionId: newSessionId // اضافه کردن شناسه جلسه به توکن
            })
            .setProtectedHeader({ alg })
            .setSubject(user.student_id)
            .setIssuer('notica-auth')
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secret);

        // --- پایان تغییرات ---

        return new Response(JSON.stringify({ message: "ورود موفقیت‌آمیز" }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': `token=${jwt}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
            },
        });

    } catch (error) {
        console.error('Login Error:', error);
        return new Response(JSON.stringify({ error: 'خطای داخلی سرور رخ داد.', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}