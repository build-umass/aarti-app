
import { Request, Response } from 'express';
import * as userService from '../services/services';

// Extend Express types so you can store user data in `req.user`
declare global {
  namespace Express {
    interface Request {
      user?: IUserProfile;
    }
  }
}

export async function registerUser(req: Request, res: Response) {
  try {
    if (!is<IRegisterUserRequest>(req.body)) {
      return res.status(400).json({ error: 'Malformed register user request' });
    }

    const { email, username, password } = req.body as IRegisterUserRequest;
    const newUser = await userService.registerUser(email, username, password);

    const userProfile: IUserProfile = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      authProvider: newUser.authProvider,
      authProviderId: newUser.authProviderId,
      locationEnabled: newUser.locationEnabled,
      // Make sure to match your extended fields
      emailVerified: newUser.emailVerified,
      emailVerificationToken: newUser.emailVerificationToken,
      profileImageUrl: newUser.profileImageUrl,
      friendCount: 0, // Initialize friend count
      windowsJoinedCount: 0, // Initialize windows joined count
    };

    // 1) Generate a random verification token:
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 2) Store it in the DB (set user.emailVerified=false)
    await userService.setUserVerificationToken(newUser.id, verificationToken);

    // 3) Send an email with that token
    await sendVerificationEmail(newUser.email, newUser.username, verificationToken);

    // The response to the client can remain the same,
    // or you can inform them about next steps:
    const responseBody: IRegisterUserResponse = { user: userProfile };
    return res.status(201).json(responseBody);

  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


export async function getResources(req: Request, res: Response) {
  try {

  }
  catch (error) {
    console.error('Error at getResources:', error);
    return res.status(500).json({ error: 'Internal server error' })
  }

}
