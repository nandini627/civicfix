const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/civicfix').then(async () => {
  await mongoose.connection.db.collection('users').updateOne({name: 'mohan'}, {$set: {role: 'admin'}});
  console.log('Updated mohan to admin');
  process.exit(0);
});
