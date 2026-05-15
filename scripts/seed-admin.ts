import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load biến môi trường từ .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/movietickets';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  role: { type: String, default: 'user' },
  isVerified: { type: Boolean, default: false }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    console.log('Đang kết nối tới MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Kết nối thành công!');

    const adminEmail = 'admin@cinemax.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash('admin123', salt);

    if (existingAdmin) {
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      console.log('Đã cập nhật mật khẩu cho tài khoản Admin cũ.');
    } else {
      await User.create({
        name: 'CineMax Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      console.log('Đã tạo tài khoản Admin mới.');
    }

    console.log('-----------------------------------');
    console.log('TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!');
    console.log('Email: admin@cinemax.com');
    console.log('Mật khẩu: admin123');
    console.log('-----------------------------------');

  } catch (error) {
    console.error('Lỗi khi tạo Admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
