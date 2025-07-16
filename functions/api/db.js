export const findUserByStudentId = async (db, studentId) => {
  return await db
    .prepare('SELECT student_id, password, name, session_id FROM users WHERE student_id = ?')
    .bind(studentId)
    .first();
};

export const createUser = async (db, studentId, hashedPassword, name) => {
  return await db
    .prepare('INSERT INTO users (student_id, password, name) VALUES (?, ?, ?)')
    .bind(studentId, hashedPassword, name)
    .run();
};

export const updateUserSession = async (db, studentId, sessionId) => {
  return await db
    .prepare('UPDATE users SET session_id = ? WHERE student_id = ?')
    .bind(sessionId, studentId)
    .run();
};
