import mongoose from 'mongoose';
import Movie from '../models/Movie';

async function patchImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/movietickets');
    console.log('Connected to MongoDB');

    const patches = [
      { 
        regex: /1563914841773/, 
        new: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=800' 
      },
      { 
        regex: /1568872307449/, 
        new: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=800' 
      },
      { 
        regex: /1514525253344/, 
        new: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=800' 
      }
    ];

    for (const patch of patches) {
      const result = await Movie.updateMany({ image: { $regex: patch.regex } }, { $set: { image: patch.new } });
      console.log(`Updated ${patch.regex} -> ${result.modifiedCount} documents`);
    }

    console.log('Patching complete!');
    process.exit(0);
  } catch (error) {
    console.error('Patching failed:', error);
    process.exit(1);
  }
}

patchImages();
