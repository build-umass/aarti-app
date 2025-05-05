// lib/auth.ts
import * as jose from 'jose';
import { UserPayload } from './types'; // Import your type definition

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error('JWT_SECRET environment variable is not set!');
}

// Encode the secret into a Uint8Array for jose
const secretKey = new TextEncoder().encode(secret);
const algorithm = 'HS256'; // Explicitly define the algorithm

// Function to encode a payload into a JWT using jose
export async function encodeToken(payload: Omit<UserPayload, 'iat' | 'exp'>): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expirationTime = issuedAt + 60 * 60; // 1 hour in seconds

  console.log(`Encoding token for sub: ${payload.sub}, role: ${payload.role}`);

  return await new jose.SignJWT({ ...payload }) // Pass the custom payload
    .setProtectedHeader({ alg: algorithm })
    .setIssuedAt(issuedAt)
    .setExpirationTime(expirationTime)
    .setSubject(payload.sub) // Standard 'sub' claim
    .sign(secretKey);
}

// Function to decode and validate a JWT using jose
export async function decodeToken(token: string): Promise<UserPayload | null> {
  try {
    console.log('Attempting to decode/verify token...');
    const { payload } = await jose.jwtVerify<UserPayload>(
        token,
        secretKey,
        { algorithms: [algorithm] } // Specify expected algorithms
    );
    console.log('Token verified successfully. Payload:', payload);

    // Basic check for expected structure after verification
    if (!payload || typeof payload.sub !== 'string' || payload.role !== 'admin') {
        console.error('Decoded token payload is missing expected fields or has incorrect role.');
        return null;
    }

    return payload; // Payload structure should match UserPayload

  } catch (error: any) {
    console.error('Error decoding/verifying token:', error.code || error.message);
    // Example error codes: JOSE_ERR_JWT_EXPIRED, JOSE_ERR_SIGNATURE_VERIFICATION_FAILED, JOSE_ERR_JWT_MALFORMED
    return null;
  }
}