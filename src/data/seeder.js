// seeder.js - Utility to seed initial sticker data into Supabase
// This uploads all mock stickers to Supabase once the database table is created.

import { supabase } from '../supabase';
import { stickers } from './mockData';

export const seedDatabase = async () => {
  try {
    // 1. Check if the table is empty by querying it
    const { count, error } = await supabase
      .from('stickers')
      .select('*', { count: 'exact', head: true });
    
    // If the table doesn't exist, Supabase returns a 42P01 error (undefined table) or PGRST205
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        throw new Error("Table 'stickers' not found! Please run the SQL query from schema.sql in your Supabase SQL Editor first.");
      }
      throw error;
    }
    
    // 2. Seed only if the count of stickers is 0
    if (count === 0) {
      console.log('Seeding stickers database in Supabase...');
      
      // Map mock data and format for PostgreSQL insertion
      const stickersPayload = stickers.map(s => ({
        id: s.id, // Keep original IDs (1 to 20)
        name: s.name,
        emoji: s.emoji,
        bgColor: s.bgColor,
        category: s.category,
        price: s.price,
        originalPrice: s.originalPrice,
        rating: s.rating,
        reviews: s.reviews,
        stock: s.stock,
        isNew: s.isNew,
        isTrending: s.isTrending,
        description: s.description,
        tags: s.tags
      }));

      const { error: insertErr } = await supabase
        .from('stickers')
        .insert(stickersPayload);
      
      if (insertErr) throw insertErr;
      console.log('Database seeded successfully!');
      return true;
    } else {
      console.log('Stickers table already has data. Skipping seeding.');
      return false;
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
};
