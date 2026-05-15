import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { login } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'No access token provided' }, { status: 400 });
    }

    // Fetch user info from Facebook Graph API
    const fbRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
    const fbData = await fbRes.json();

    if (!fbData || fbData.error) {
      console.error('Facebook Graph API Error:', fbData.error);
      return NextResponse.json({ error: 'Invalid Facebook token' }, { status: 400 });
    }

    const { id: facebookId, name, email } = fbData;
    const avatar = fbData.picture?.data?.url || "";

    // Note: Facebook might not return email if the user hasn't provided it or if it's not verified
    if (!email) {
      return NextResponse.json({ error: 'Email is required from Facebook' }, { status: 400 });
    }

    await dbConnect();

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email },
        { provider: 'facebook', providerId: facebookId }
      ]
    });

    if (!user) {
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        avatar: avatar || "",
        provider: 'facebook',
        providerId: facebookId,
        isVerified: true,
      });
    } else {
      // Update existing user if needed
      if (user.provider === 'local') {
        user.provider = 'facebook';
        user.providerId = facebookId;
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

    // Establish session
    await login(userData);

    return NextResponse.json(userData);
  } catch (error: any) {
    console.error('Facebook Auth Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
