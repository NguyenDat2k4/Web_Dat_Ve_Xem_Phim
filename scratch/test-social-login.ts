import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb';
import User from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function mockTest() {
  await dbConnect();
  
  console.log('--- Testing Google Auth Logic (Mock) ---');
  const mockGoogleId = 'mock_google_id_' + Date.now();
  const mockEmail = 'mock_user_' + Date.now() + '@gmail.com';
  
  // Simulate the logic in app/api/auth/social/google/route.ts
  let user = await User.findOne({ 
    $or: [
      { email: mockEmail },
      { provider: 'google', providerId: mockGoogleId }
    ]
  });

  if (!user) {
    user = await User.create({
      name: 'Mock Google User',
      email: mockEmail,
      provider: 'google',
      providerId: mockGoogleId,
      isVerified: true,
    });
    console.log('Successfully created mock Google user:', user.email);
  }

  console.log('--- Testing Facebook Auth Logic (Mock) ---');
  const mockFacebookId = 'mock_fb_id_' + Date.now();
  const mockFbEmail = 'mock_fb_' + Date.now() + '@facebook.com';

  let fbUser = await User.findOne({ 
    $or: [
      { email: mockFbEmail },
      { provider: 'facebook', providerId: mockFacebookId }
    ]
  });

  if (!fbUser) {
    fbUser = await User.create({
      name: 'Mock Facebook User',
      email: mockFbEmail,
      provider: 'facebook',
      providerId: mockFacebookId,
      isVerified: true,
    });
    console.log('Successfully created mock Facebook user:', fbUser.email);
  }

  // Cleanup
  await User.deleteOne({ _id: user._id });
  await User.deleteOne({ _id: fbUser._id });
  console.log('Cleaned up mock users.');

  await mongoose.disconnect();
}

mockTest().catch(console.error);
