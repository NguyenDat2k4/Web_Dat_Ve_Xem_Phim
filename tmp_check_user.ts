import dbConnect from './lib/mongodb'
import User from './models/User'

async function checkUser() {
  await dbConnect()
  const user = await User.findOne({ email: 'tt@gmail.com' })
  console.log('User points:', user?.points)
  console.log('User id:', user?._id)
  process.exit()
}

checkUser()
