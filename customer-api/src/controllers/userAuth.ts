import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../../shared/models';
import { AppDataSource } from '../../shared/data-source';
import { encrypt_password, compare_password, requireSecret } from '../utils/helper';

const userRepository = AppDataSource.getRepository(User);

interface RegisterRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    profileUrl?: string;
  }
}

interface LoginRequest extends Request {
  body: {
    username: string;
    password: string;
  }
}

interface JwtPayload {
  id: number;
  roles: string[];
}

export const register = async (req: RegisterRequest, res: Response) => {
  const { username, email, password, firstName, lastName, phone, profileUrl } = req.body;

  try {
    // Check if user exists
    const existingUser = await userRepository.findOne({
      where: [{ email }, { username }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(400).json({
        error: `This ${field} is already registered.`
      });
    }

    // Create new user
    const user = new User();
    user.username = username;
    user.email = email;
    user.passwordHash = await encrypt_password(password);
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone || null;
    user.profileUrl = profileUrl || null;
    user.roles = ['customer']; // Default role
    user.staffStatus = null;
    user.workerRoles = [];
    user.weeklyAvailability = null;

    // Save user
    const savedUser = await userRepository.save(user);

    // Generate JWT token
    const payload: JwtPayload = { 
      id: savedUser.id, 
      roles: savedUser.roles 
    };

    const token = jwt.sign(
      payload,
      requireSecret(),
      { expiresIn: '24h' as const }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        roles: savedUser.roles
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Registration failed',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const login = async (req: LoginRequest, res: Response) => {
  const { username, password } = req.body;

  try {
    // Find user
    const user = await userRepository.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Verify password
    const isValidPassword = await compare_password(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const payload: JwtPayload = { 
      id: user.id, 
      roles: user.roles 
    };

    const token = jwt.sign(
      payload,
      requireSecret(),
      { expiresIn: '24h' as const }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        staffStatus: user.staffStatus,
        workerRoles: user.workerRoles,
        phone: user.phone,
        profileUrl: user.profileUrl
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Login failed',
      message: error.message || 'An unknown error occurred'
    });
  }
};

interface UpdateProfileRequest extends Request {
  body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
  }
}

export const updateProfile = async (req: UpdateProfileRequest, res: Response) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    const currentUser = req.currentUser as JwtPayload;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find current user
    const user = await userRepository.findOne({
      where: { id: currentUser.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await userRepository.findOne({
        where: { email }
      });
      if (existingUser) {
        return res.status(400).json({
          error: 'Email already in use'
        });
      }
      user.email = email;
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone || null;
    
    // Update password if provided
    if (password) {
      user.passwordHash = await encrypt_password(password);
    }

    // Save updated user
    await userRepository.save(user);

    // Return updated user info
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        staffStatus: user.staffStatus,
        workerRoles: user.workerRoles,
        phone: user.phone,
        profileUrl: user.profileUrl
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Update profile error:', error);
    return res.status(500).json({
      error: 'Profile update failed',
      message: error.message || 'An unknown error occurred'
    });
  }
};
