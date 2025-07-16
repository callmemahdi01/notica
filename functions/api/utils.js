import { SignJWT, jwtVerify } from 'jose';

export const createJWT = async (secret, id, name, sessionId) => {
  const secretKey = new TextEncoder().encode(secret);
  const payload = {
    sub: id,
    name: name,
    sessionId: sessionId,
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('notica-auth')
    .setExpirationTime('24h')
    .sign(secretKey);
};

export const verifyJWT = async (secret, token) => {
  const secretKey = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, secretKey, {
    issuer: 'notica-auth',
  });
  return payload;
};
