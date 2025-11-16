require('dotenv').config();
const connectDB = require('../config/db');
const Product = require('../models/Product');

async function setLocalImages() {
  try {
    await connectDB();

    const updates = [
      { name: 'Mechanical Keyboard', images: ['/images/mechanical-keyboard.jpg'] },
      { name: 'Phone Stand', images: ['/images/phone-stand.jpg'] },
    ];

    for (const u of updates) {
      const res = await Product.findOneAndUpdate(
        { name: u.name },
        { $set: { images: u.images } },
        { new: true }
      );
      if (res) {
        console.log(`Updated ${u.name} -> ${u.images[0]}`);
      } else {
        console.log(`Product not found: ${u.name}`);
      }
    }

    // Show resulting products
    const docs = await Product.find({ name: { $in: updates.map(x => x.name) } }).select('name images');
    docs.forEach(d => console.log(JSON.stringify(d, null, 2)));
    process.exit(0);
  } catch (err) {
    console.error('Error updating images:', err.message || err);
    process.exit(1);
  }
}

setLocalImages();
