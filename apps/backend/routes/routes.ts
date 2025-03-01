// apps/user-service/src/routes/user.routes.ts
import { Router } from 'express';
import {
// user controls
} from '../controllers/user.controller';
import { authenticateToken } from '@middle/utils';
import { googleAuthCallbackController } from '../controllers/user.controller';

const router = Router();

// Register a new user
router.post('/register', registerUser as any);

// Login to get a JWT
router.post('/login', loginUser as any);

// Example protected route: /user/me
// You might protect it with a JWT middleware
router.get('/me', authenticateToken, getUserProfile as any);

router.get('/:userId/friends/markers', authenticateToken, getFriendMarkersController as any)

router.get('/:userId/friend_requests', authenticateToken, getFriendRequestsController as any);
router.post('/:userId/send_request', authenticateToken, sendFriendRequestController as any);
router.post('/:userId/:friendId/accept', authenticateToken, acceptFriendRequestController as any);
router.delete('/:userId/:friendId/deny', authenticateToken, denyFriendRequestController as any);
router.get('/:userId/friends', authenticateToken, getFriendsController as any);

router.get('/auth/callback', googleAuthCallbackController as any);
router.get('/auth/google_register_callback', googleRegisterCallbackController as any);
router.post('/refresh', refreshTokenController as any);

router.get('/verify-email', verifyEmailController as any);

// NEW: image upload routes
router.get('/upload-url', authenticateToken, getUploadUrlController as any);
router.post('/profile-image', authenticateToken, updateUserProfileImageController as any);


export default router;