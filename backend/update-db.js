const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecoevent')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const result = await User.updateMany(
      { name: /sumit pathak/i, wardZone: '' },
      { $set: { wardZone: 'L Ward — Kurla' } }
    );
    console.log(`Updated ${result.modifiedCount} user(s) wardZone to L Ward — Kurla.`);

    const collection = User.collection;
    await collection.createIndex({ role: 1 });
    console.log('Index { role: 1 } created.');
    
    await collection.createIndex({ role: 1, wardZone: 1 });
    console.log('Index { role: 1, wardZone: 1 } created.');

    console.log('Done!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
