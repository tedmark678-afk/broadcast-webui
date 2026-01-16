import type { NextApiRequest, NextApiResponse } from 'next';

interface TiltResponse {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TiltResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { speed = 0.5, direction = 'up' } = req.query;

  try {
    // TODO: Implement actual ONVIF tilt control
    // direction: 'up' | 'down'
    // speed: 0-1

    console.log(`Tilt ${direction} at speed ${speed}`);

    res.status(200).json({
      success: true,
      message: `Tilting ${direction} at speed ${speed}`,
    });
  } catch (error) {
    console.error('Tilt error:', error);
    res.status(500).json({ error: 'Failed to execute tilt' });
  }
}
