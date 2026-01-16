import type { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface StatusResponse {
  ptz: { connected: boolean; preset: string };
  encoding: { active: number; total: number };
  routing: { routes: number; active: number };
  ffmpeg: { available: boolean; version: string };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check FFmpeg availability
    let ffmpegVersion = '';
    let ffmpegAvailable = false;

    try {
      const { stdout } = await execAsync('ffmpeg -version');
      ffmpegVersion = stdout.split('\n')[0];
      ffmpegAvailable = true;
    } catch {
      ffmpegAvailable = false;
    }

    // Default status response
    const status: StatusResponse = {
      ptz: {
        connected: process.env.ONVIF_HOST ? true : false,
        preset: 'Default',
      },
      encoding: {
        active: 0,
        total: 3,
      },
      routing: {
        routes: 0,
        active: 0,
      },
      ffmpeg: {
        available: ffmpegAvailable,
        version: ffmpegVersion || 'Unknown',
      },
    };

    res.status(200).json(status);
  } catch (error) {
    console.error('Status endpoint error:', error);
    res.status(500).json({ error: 'Failed to get system status' });
  }
}
