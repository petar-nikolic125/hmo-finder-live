import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage, type PropertySearchParams } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const searchParams: PropertySearchParams = {
      city: req.query.city as string,
      count: req.query.count ? parseInt(req.query.count as string) : undefined,
      minSize: req.query.minSize ? parseInt(req.query.minSize as string) : undefined,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
      excludeArticle4: req.query.excludeArticle4 === 'true',
      sortBy: req.query.sortBy as 'profit' | 'price' | 'size' | 'recent',
    };

    const properties = await storage.getProperties(searchParams);
    res.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
}