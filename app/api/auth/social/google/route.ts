import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { login } from '@/lib/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ error: 'No credential provided' }, { status: 400 });
    }

    // Verify the Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const { email, name, sub: googleId, picture: avatar } = payload;

    await dbConnect();

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email },
        { provider: 'google', providerId: googleId }
      ]
    });

    if (!user) {
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        avatar: avatar || "",
        provider: 'google',
        providerId: googleId,
        isVerified: true, // Google accounts are verified
      });
    } else {
      // Update existing user if needed
      if (user.provider === 'local') {
        user.provider = 'google';
        user.providerId = googleId;
        user.avatar = user.avatar || avatar || "";
        await user.save();
      }
    }

    // Prepare user data for session
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      points: user.points,
      rank: user.rank,
      totalSpent: user.totalSpent || 0,
    };

    // Use existing login utility to set cookie
    await login(userData);

    return NextResponse.json(userData);
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
