import type { NextApiRequest, NextApiResponse } from 'next';

interface EncodeRequest {
  input: string;
  output: string;
  preset: string;
}

interface EncodeResponse {
  success: boolean;
  processId: string;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EncodeResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { input, output, preset } = req.body as EncodeRequest;

    // TODO: Implement actual FFmpeg encoding start
    // This should spawn an FFmpeg process based on the preset

    const processId = `encode-${Date.now()}`;

    res.status(200).json({
      success: true,
      processId,
      message: `Started encoding from ${input} to ${output}`,
    });
  } catch (error) {
    console.error('Encode start error:', error);
    res.status(500).json({ error: 'Failed to start encoding' });
  }
}
