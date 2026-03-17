const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    console.log('Total Users:', users.length);
    console.log('Users:', users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUsers();
