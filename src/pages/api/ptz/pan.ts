import type { NextApiRequest, NextApiResponse } from 'next';

interface PanResponse {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PanResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { speed = 0.5, direction = 'left' } = req.query;

  try {
    // TODO: Implement actual ONVIF pan control
    // direction: 'left' | 'right'
    // speed: 0-1

    console.log(`Pan ${direction} at speed ${speed}`);

    res.status(200).json({
      success: true,
      message: `Panning ${direction} at speed ${speed}`,
    });
  } catch (error) {
    console.error('Pan error:', error);
    res.status(500).json({ error: 'Failed to execute pan' });
  }
}
