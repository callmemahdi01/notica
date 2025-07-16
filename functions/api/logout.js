// functions/api/logout.js

// تابع را به onRequestPost تغییر می‌دهیم
export async function onRequestPost(context) {
  // این شرط دیگر ضروری نیست
  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  return new Response("Logged out", {
    headers: {
      "Set-Cookie": "token=deleted; Path=/; Max-Age=0",
    },
  });
}