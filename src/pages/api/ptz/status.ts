import type { NextApiRequest, NextApiResponse } from 'next';

interface PTZStatus {
  position: { x: number; y: number; z: number };
  preset: string;
  connected: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PTZStatus | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: Implement actual ONVIF PTZ status query
    const status: PTZStatus = {
      position: { x: 0, y: 0, z: 1 },
      preset: 'Home',
      connected: !!process.env.ONVIF_HOST,
    };

    res.status(200).json(status);
  } catch (error) {
    console.error('PTZ status error:', error);
    res.status(500).json({ error: 'Failed to get PTZ status' });
  }
}
