import { jwtVerify } from 'jose';
import notesBundle from '../notes-bundle.json';
import coursesData from '../../public/courses.json';

async function getUserSubscription(db, studentId) {
  if (!studentId) return 'free';
  const user = await db.prepare('SELECT subscription_type FROM users WHERE student_id = ?').bind(studentId).first();
  return user?.subscription_type || 'free';
}

function getTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const tokenCookie = cookieHeader.split(';').find(c => c.trim().startsWith('token='));
  return tokenCookie?.split('=')[1] || null;
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const token = getTokenFromCookie(request.headers.get("Cookie"));

  if (!token) {
    return new Response("Unauthorized: No token provided", { status: 401 });
  }

  let payload;
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    ({ payload } = await jwtVerify(token, secret, { issuer: 'notica-auth' }));
  } catch (err) {
    return new Response("Unauthorized: Invalid token", { status: 401 });
  }
  
  const noteKey = params.id?.filter(Boolean).join("/") || "";
  if (!noteKey) {
    return new Response("Not Found: Invalid note path", { status: 404 });
  }
  
  const noteContent = notesBundle[noteKey];
  if (!noteContent) {
    return new Response("Not Found: Note content not available", { status: 404 });
  }

  const [courseId, noteId] = noteKey.split('/');
  const course = coursesData.find(c => c.id === courseId);
  if (!course) {
    return new Response("Not Found: Course ID is invalid.", { status: 404 });
  }

  const note = course.notes.find(n => n.id === noteId);
  if (!note) {
    return new Response("Not Found: Note ID is invalid.", { status: 404 });
  }

  const subscriptionType = await getUserSubscription(env.notica_db, payload.sub);
  const hasAccess = course.isFree || note.free || subscriptionType === 'pro';

  if (!hasAccess) {
    return new Response("Forbidden: Access to this note requires a Pro subscription or is not available for free.", { status: 403 });
  }

  return new Response(noteContent, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
