/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  serverRuntimeConfig: {
    // Only available on the server side
    onvifHost: process.env.ONVIF_HOST,
    onvifPort: process.env.ONVIF_PORT,
    ffmpegBin: process.env.FFMPEG_BIN || '/usr/bin/ffmpeg',
    ffprobeBin: process.env.FFPROBE_BIN || '/usr/bin/ffprobe',
  },
  publicRuntimeConfig: {
    // Exposed to the client
    apiBase: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000',
  },
  env: {
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3000',
  },
};

module.exports = nextConfig;
