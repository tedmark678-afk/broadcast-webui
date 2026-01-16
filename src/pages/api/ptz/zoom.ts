import type { NextApiRequest, NextApiResponse } from 'next';

interface ZoomResponse {
  success: boolean;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZoomResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { speed = 0.3, direction = 'in' } = req.query;

  try {
    // TODO: Implement actual ONVIF zoom control
    // direction: 'in' | 'out'
    // speed: 0-1

    console.log(`Zoom ${direction} at speed ${speed}`);

    res.status(200).json({
      success: true,
      message: `Zooming ${direction} at speed ${speed}`,
    });
  } catch (error) {
    console.error('Zoom error:', error);
    res.status(500).json({ error: 'Failed to execute zoom' });
  }
}
