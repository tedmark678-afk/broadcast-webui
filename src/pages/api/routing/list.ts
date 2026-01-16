import type { NextApiRequest, NextApiResponse } from 'next';

interface Route {
  id: string;
  name: string;
  source: string;
  destinations: string[];
  active: boolean;
  createdAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Route[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: Load routes from configuration file
    const routes: Route[] = [];

    res.status(200).json(routes);
  } catch (error) {
    console.error('Routes error:', error);
    res.status(500).json({ error: 'Failed to get routes' });
  }
}
