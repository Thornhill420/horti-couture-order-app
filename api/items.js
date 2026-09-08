import { kv } from '@vercel/kv';

const DEFAULT_CATALOG = {
  "categories": [
    { "name": "15cm Resin Planters", "items": ["Anna", "Emma", "Casey", "Tina", "TC 15"] },
    { "name": "Small Resin Planters", "items": ["Evie", "Amy", "Ruby", "Lucy", "TC 8", "TC 6", "TC 5"] },
    { "name": "Fiberglass Planters", "items": ["Boston 110x50x80", "Boston 110x50x65", "Boston 110x50x50", "Boston With Feet 100x50x80", "Boston Feet 100x50x65", "Boston Feet 100x50x50", "Paris 100x38x80", "Paris 100x38x65", "Paris 100x38x50", "New Yorker 45x80", "New Yorker 45x65", "New Yorker 45x50", "Nile 36x80", "Nile 36x65", "Nile 36x50", "Everest Large 73x75", "Everest Medium 73x60", "Victoria Large 39x43", "Victoria Small 39x36", "Aurora 40cm", "Aurora 32cm", "Rio 33cm", "Sahara", "Sydney"] },
    { "name": "Ceramic Planters", "items": ["Amazon", "Cairo 27cm", "Cairo 22cm", "Barcelona"] },
    { "name": "Mini Planters & More", "items": ["Groot Happy", "Groot Thinking", "Tree Stump", "Skull", "Cactus Planter", "Buddha", "Buddha Laughing", "Buddha Head", "Buddha Candle Holder", "Hands", "Bonsai Rectangle", "Bonsai Oval", "Texture Pot", "Texture Pot tapered", "Box Crate", "Square Large", "Square Medium", "Square Small", "Air plant", "Heart With Lid", "Heart", "Mushroom", "Frog", "Short Cactus", "Tall Cactus", "Gnome", "Mini Friend", "Mini Flower", "Mini Happy", "Mini Smile", "Mini Baby", "Mini Love", "Mini Hearts"] },
    { "name": "Sticker Pots", "items": ["Grinch Amy", "Grinch Ruby", "Santa Belt Amy", "Santa Belt Ruby", "Reindier Wink Amy", "Reindier Wink Ruby", "Reindier Smile Ruby", "Reindier Smile Amy", "Faces Amy", "Faces Ruby"] }
  ],
  "colors": ["White", "LightGrey", "DarkGrey", "Black", "BlackGlossy", "MountainStream", "Navy", "AloeLeaf", "DryGold", "Terracotta", "Primer", "Burned_Ash", "Desert_Sand", "Gold", "Groot_TC_Aloe_Black", "Tree_Stump_Black_TC", "Cactus_Planter", "Mike_Knows"],
  "lineArtColors": ["LinArt_White", "LinArt_LightGrey", "LinArt_DarkGrey", "LinArt_Black", "LinArt_BlackGlossy", "LinArt_MountainStream", "LinArt_Navy", "LinArt_AloeLeaf", "LinArt_DryGold", "LinArt_CanyonWall", "LinArt_Gold"]
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      let catalog = await kv.get('catalog');
      if (!catalog) {
        catalog = DEFAULT_CATALOG;
        await kv.set('catalog', catalog);
      }
      return res.status(200).json(catalog);
    }

    if (req.method === 'POST') {
      const catalog = req.body;
      await kv.set('catalog', catalog);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    // Fallback to default catalog if KV fails
    if (req.method === 'GET') {
      return res.status(200).json(DEFAULT_CATALOG);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}