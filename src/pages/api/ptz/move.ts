import type { NextApiRequest, NextApiResponse } from 'next';

interface PTZCommand {
  pan: number;
  tilt: number;
  zoom?: number;
}

interface PTZResponse {
  success: boolean;
  message: string;
  position?: {
    pan: number;
    tilt: number;
    zoom: number;
  };
}

let currentPosition = {
  pan: 0,
  tilt: 0,
  zoom: 1.0,
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PTZResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { pan, tilt, zoom }: PTZCommand = req.body;

  try {
    // Validate input
    if (typeof pan !== 'number' || typeof tilt !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid pan/tilt values',
      });
    }

    // Clamp values
    const clampedPan = Math.max(-1, Math.min(1, pan));
    const clampedTilt = Math.max(-1, Math.min(1, tilt));
    const clampedZoom = zoom ? Math.max(1, Math.min(10, zoom)) : currentPosition.zoom;

    // Update current position
    currentPosition = {
      pan: clampedPan * 100,
      tilt: clampedTilt * 100,
      zoom: clampedZoom,
    };

    // TODO: Send ONVIF commands to actual camera
    // This would integrate with the ONVIF client
    console.log('PTZ Command:', {
      pan: clampedPan,
      tilt: clampedTilt,
      zoom: clampedZoom,
    });

    res.status(200).json({
      success: true,
      message: 'PTZ command sent',
      position: currentPosition,
    });
  } catch (error) {
    console.error('PTZ error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute PTZ command',
    });
  }
}
