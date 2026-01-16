import type { NextApiRequest, NextApiResponse } from 'next';

interface EncodingPreset {
  id: string;
  name: string;
  codec: string;
  bitrate: string;
  resolution: string;
  framerate: number;
}

const PRESETS: EncodingPreset[] = [
  {
    id: 'h264_1080p_5000k',
    name: 'H.264 1080p 5Mbps',
    codec: 'h264',
    bitrate: '5000k',
    resolution: '1920x1080',
    framerate: 30,
  },
  {
    id: 'h264_720p_3000k',
    name: 'H.264 720p 3Mbps',
    codec: 'h264',
    bitrate: '3000k',
    resolution: '1280x720',
    framerate: 30,
  },
  {
    id: 'h265_1080p_2500k',
    name: 'H.265 1080p 2.5Mbps',
    codec: 'hevc',
    bitrate: '2500k',
    resolution: '1920x1080',
    framerate: 30,
  },
  {
    id: 'h265_4k_8000k',
    name: 'H.265 4K 8Mbps',
    codec: 'hevc',
    bitrate: '8000k',
    resolution: '3840x2160',
    framerate: 30,
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EncodingPreset[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json(PRESETS);
  } catch (error) {
    console.error('Presets error:', error);
    res.status(500).json({ error: 'Failed to get encoding presets' });
  }
}
