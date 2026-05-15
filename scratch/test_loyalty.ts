import dbConnect from '../lib/mongodb';
import User from '../models/User';
import { processLoyaltyUpdate } from '../lib/loyalty';

async function testLoyalty() {
  await dbConnect();
  
  const testEmail = 'test_loyalty@example.com';
  
  // 1. Create or Reset Test User
  await User.deleteOne({ email: testEmail });
  const user = await User.create({
    name: 'Test Loyalty User',
    email: testEmail,
    password: 'password123',
    points: 0,
    totalSpent: 0,
    rank: 'Silver'
  });
  
  console.log('--- Giai đoạn 0: Khởi tạo ---');
  console.log(`User: ${user.name}, Rank: ${user.rank}, Points: ${user.points}, TotalSpent: ${user.totalSpent}`);

  // 2. Simulate First Booking (1,000,000 VND)
  console.log('\n--- Giai đoạn 1: Đặt vé 1,000,000đ ---');
  await processLoyaltyUpdate(testEmail, 1000000, 0);
  let updatedUser = await User.findOne({ email: testEmail });
  console.log(`Rank: ${updatedUser.rank} (Expect: Silver)`);
  console.log(`Points: ${updatedUser.points} (Expect: 50,000)`);
  console.log(`TotalSpent: ${updatedUser.totalSpent} (Expect: 1,000,000)`);

  // 3. Simulate Second Booking (1,500,000 VND) -> Should reach Gold (> 2,000,000)
  console.log('\n--- Giai đoạn 2: Đặt vé thêm 1,500,000đ ---');
  await processLoyaltyUpdate(testEmail, 1500000, 0);
  updatedUser = await User.findOne({ email: testEmail });
  console.log(`Rank: ${updatedUser.rank} (Expect: Gold)`);
  console.log(`Points: ${updatedUser.points} (Expect: 125,000)`);
  console.log(`TotalSpent: ${updatedUser.totalSpent} (Expect: 2,500,000)`);

  // 4. Simulate Large Booking (3,000,000 VND) -> Should reach Diamond (> 5,000,000)
  console.log('\n--- Giai đoạn 3: Đặt vé thêm 3,000,000đ ---');
  await processLoyaltyUpdate(testEmail, 3000000, 0);
  updatedUser = await User.findOne({ email: testEmail });
  console.log(`Rank: ${updatedUser.rank} (Expect: Diamond)`);
  console.log(`TotalSpent: ${updatedUser.totalSpent} (Expect: 5,500,000)`);

  console.log('\n--- TEST HOÀN TẤT ---');
  process.exit(0);
}

testLoyalty().catch(err => {
  console.error(err);
  process.exit(1);
});
