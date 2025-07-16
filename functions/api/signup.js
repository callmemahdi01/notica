// functions/api/signup.js

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function validateInput(data) {
    const { fullName, studentId, password, phoneNumber } = data;
    if (!fullName || !studentId || !password) 
        return 'فیلدهای نام کامل، شماره دانشجویی و رمز عبور اجباری هستند.';
    if (password.length < 4) 
        return 'رمز عبور باید حداقل ۴ کاراکتر باشد.';
    if (!/^\d+$/.test(studentId)) 
        return 'شماره دانشجویی فقط می‌تواند شامل اعداد باشد.';
    if (phoneNumber && !/^09\d{9}$/.test(phoneNumber)) 
        return 'فرمت شماره تلفن صحیح نیست.';
    return null;
}

export async function onRequestPost(context) {
    const { env, request } = context;

    if (!env.notica_db) {
        return new Response(
            JSON.stringify({ error: 'اتصال به دیتابیس (notica_db) برقرار نشد.' }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const body = await request.json();
        const { fullName, studentId, password, phoneNumber } = body;

        const validationError = validateInput(body);
        if (validationError) {
            return new Response(
                JSON.stringify({ error: validationError }), 
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const existingUser = await env.notica_db
            .prepare('SELECT student_id FROM users WHERE student_id = ?')
            .bind(studentId)
            .first();

        if (existingUser) {
            return new Response(
                JSON.stringify({ error: 'کاربری با این شماره دانشجویی قبلاً ثبت‌نام کرده است.' }), 
                { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const hashedPassword = await hashPassword(password);

        await env.notica_db
            .prepare('INSERT INTO users (full_name, student_id, password, phone_number) VALUES (?, ?, ?, ?)')
            .bind(fullName, studentId, hashedPassword, phoneNumber || null)
            .run();

        return new Response(
            JSON.stringify({ message: 'ثبت‌نام با موفقیت انجام شد.' }), 
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Signup Error:', error);
        return new Response(
            JSON.stringify({ error: 'خطای داخلی سرور هنگام ثبت‌نام رخ داد.', details: error.message }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
