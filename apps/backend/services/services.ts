// apps/user-service/src/services/user.service.ts
import { prisma } from '@database'; // Your shared prisma client
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  IUser,
  ILoginResult,
  IUserMarkerInfo
} from '@middle/types';
import { redisClient } from '@middle/redis-client';

dotenv.config({ path: process.env.ENV_FILE || '.env' });

// Grab secrets from your .env
const JWT_ACCESS_SECRET = process.env.JWT_SECRET || 'somethingsecret';
const JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'somethingrefreshsecret';

// For demonstration, these are in seconds: 1h = 3600
// Adjust to your preference
const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
// or '30d' if you want a full month, etc.

/**
 * Helper to generate short-lived access token
 */
export function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });
}

/**
 * Helper to generate long-lived refresh token
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN
  });
}

/**
 * Verifies a refresh token using the REFRESH_TOKEN_SECRET.
 * Returns the userId if valid, or throws an error if invalid/expired.
 */
function verifyRefreshToken(refreshToken: string): string {
  const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
  return decoded.userId; // if not valid, it will throw before this
}

/**
 * Creates a user with a hashed password, returns the *full* UserEntity.
 */
export async function registerUser(
  email: string,
  username: string,
  password: string
): Promise<IUser> {
  // 1) Check if user already exists
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }]
    }
  });
  if (existing) {
    throw new Error('Email or username already in use');
  }

  // 2) Hash the password
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3) Create user in DB
  const newUser = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      salt
    }
  });

  return newUser;
}

/**
 * Authenticates a user by email + password.
 * Returns a typed LoginResult union (success or failure).
 */
export async function loginUser(
  email: string,
  password: string
): Promise<ILoginResult> {
  // 1) Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }

  // 2) Compare password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return { success: false, message: 'Invalid email or password' };
  }

  // 3) Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  return {
    success: true,
    token: accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      locationEnabled: user.locationEnabled
    }
  };
}

/**
 * Called when the client hits /users/refresh with a valid refresh token.
 * We verify the refresh token → generate new tokens → return them.
 */
export async function refreshTokens(refreshToken: string) {
  // 1) Verify refresh token signature & expiry
  const userId = verifyRefreshToken(refreshToken);

  // 2) (Optional) check if user is still active or if token is revoked
  //    – skipping that for brevity.

  // 3) Generate new tokens
  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = generateRefreshToken(userId);

  return { newAccessToken, newRefreshToken };
}

/**
 * Retrieve a user by ID.
 */
export async function getUserById(userId: string): Promise<IUser | null> {
  return prisma.user.findUnique({ where: { id: userId } });
}

/**
 * Retrieve a user by ID, including counts of friends and windows.
 */
export async function getUserByIdWithCounts(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { friends: true, windows: true },
      },
    },
  });
}


/**
 * Update Profile Image URL
 */
export async function updateProfileImageUrl(userId: string, profileImageUrl: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { profileImageUrl },
  });
}

/**
 * Example friend-markers, same as before
 */
export async function getFriendMarkers(userId: string): Promise<IUserMarkerInfo[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { friends: true }
  });

  if (!user || !user.friends.length) {
    return [];
  }

  const markers: IUserMarkerInfo[] = [];

  for (const friendUser of user.friends) {
    markers.push({
      userId: friendUser.id,
      username: friendUser.username,
      profilePicUrl: friendUser.profileImageUrl
        ? friendUser.profileImageUrl
        : `https://placehold.co/24x24.png`,
    });
  }

  return markers;
}

/**
 * Send friend request...
 * (unchanged)
 */
export async function sendFriendRequest(fromUserId: string, toUsername: string) {
  const toUser = await prisma.user.findUnique({
    where: { username: toUsername },
  });
  if (!toUser) throw new Error('User not found');

  const existingRequest = await prisma.friendRequest.findFirst({
    where: {
      fromUserId,
      toUserId: toUser.id,
      status: 'PENDING',
    },
  });
  if (existingRequest) {
    throw new Error('Friend request already pending');
  }

  await prisma.friendRequest.create({
    data: {
      fromUserId,
      toUserId: toUser.id,
      status: 'PENDING',
    },
  });
}

/**
 * Retrieve friend requests...
 * (unchanged)
 */
export async function getFriendRequests(userId: string) {
  return prisma.friendRequest.findMany({
    where: {
      toUserId: userId,
      status: 'PENDING',
    },
    include: {
      fromUser: true,
    },
  });
}

/**
 * Accept friend request...
 * (unchanged)
 */
export async function acceptFriendRequest(userId: string, friendId: string) {
  const request = await prisma.friendRequest.findFirst({
    where: {
      fromUserId: friendId,
      toUserId: userId,
      status: 'PENDING',
    },
  });
  if (!request) {
    throw new Error('No such friend request');
  }
  await prisma.friendRequest.update({
    where: { id: request.id },
    data: { status: 'ACCEPTED' },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { friends: { connect: { id: friendId } } },
  });

  await prisma.user.update({
    where: { id: friendId },
    data: { friends: { connect: { id: userId } } },
  });

  await redisClient.addFriend(userId, friendId);
}

/**
 * Deny friend request...
 * (unchanged)
 */
export async function denyFriendRequest(userId: string, friendId: string) {
  const request = await prisma.friendRequest.findFirst({
    where: {
      fromUserId: friendId,
      toUserId: userId,
      status: 'PENDING',
    },
  });
  if (!request) {
    throw new Error('No such friend request');
  }

  await prisma.friendRequest.delete({
    where: { id: request.id },
  });
}

/**
 * Get all friends...
 * (unchanged)
 */
export async function getAllFriends(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { friends: true },
  });
  if (!user) {
    throw new Error('User not found');
  }
  return user.friends;
}


/**
 * setUserVerificationToken:
 *  - stores a verification token in the DB for the given user
 *  - also ensures emailVerified is set to false
 */
export async function setUserVerificationToken(
  userId: string,
  token: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: false,
      emailVerificationToken: token,
    },
  });
}


/**
 * verifyUserByToken:
 *  - looks up a user by that token
 *  - if found, sets emailVerified=true and clears the token
 */
export async function verifyUserByToken(token: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token },
  });
  if (!user) {
    return false; // or throw
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
    },
  });
  return true;
}