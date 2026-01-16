# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- FFmpeg (for encoding/decoding)
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/tedmark678-afk/broadcast-webui.git
cd broadcast-webui

# Run setup script
bash scripts/setup.sh

# Start development server
npm run dev
```

## Project Structure

```
├── src/
│   ├── pages/
│   │   ├── api/              # Next.js API routes
│   │   │   ├── ptz/         # PTZ control endpoints
│   │   │   ├── encode/      # FFmpeg encoding endpoints
│   │   │   ├── routing/     # Stream routing endpoints
│   │   │   └── status.ts    # System status endpoint
│   │   ├── index.tsx         # Dashboard page
│   │   ├── ptz.tsx           # PTZ control page
│   │   ├── encoding.tsx      # Encoding settings page
│   │   ├── routing.tsx       # Routing configuration page
│   │   └── _app.tsx          # App wrapper
│   ├── components/           # React components
│   ├── lib/                  # Utility libraries
│   └── styles/               # CSS files
├── public/                   # Static assets
├── config/                   # Configuration files
├── scripts/                  # Deployment/maintenance scripts
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

## Development Commands

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Build Docker image
npm run docker:build

# Run with Docker Compose
docker-compose up -d
```

## API Route Development

API routes are in `src/pages/api/` and follow Next.js conventions:

```typescript
// src/pages/api/example.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Your handler logic
  res.status(200).json({ message: 'Success' });
}
```

## React Component Development

Components use React hooks and Tailwind CSS:

```typescript
// src/components/Example.tsx
import React, { useState, useEffect } from 'react';

export default function Example() {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Side effects
  }, []);

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      {/* Component content */}
    </div>
  );
}
```

## Implementing ONVIF Support

### Install ONVIF module

```bash
npm install onvif node-onvif
```

### Example implementation

```typescript
// src/lib/onvif.ts
import { OnvifDevice } from 'node-onvif';

const device = new OnvifDevice({
  xaddr: `http://${process.env.ONVIF_HOST}:${process.env.ONVIF_PORT}/onvif/device_service`,
  user: process.env.ONVIF_USERNAME,
  pass: process.env.ONVIF_PASSWORD,
});

await device.init();
const ptz = device.services.ptz;
await ptz.continuousMove({
  x: 0.5, // pan velocity
  y: 0,   // tilt velocity
  z: 0,   // zoom velocity
});
```

## Implementing FFmpeg Integration

### FFmpeg command building

```typescript
// Example: H.264 encoding
const cmd = [
  'ffmpeg',
  '-i', 'rtsp://camera:554/stream',
  '-c:v', 'libx264',
  '-b:v', '5000k',
  '-s', '1920x1080',
  '-r', '30',
  '-c:a', 'aac',
  '-b:a', '128k',
  '-f', 'flv',
  'rtmp://server/live/stream',
].join(' ');
```

### Process spawning

```typescript
import { spawn } from 'child_process';

const proc = spawn('ffmpeg', args);
proc.stdout.on('data', (data) => console.log(data));
proc.stderr.on('data', (data) => console.error(data));
```

## Testing

### Manual testing

```bash
# Test API endpoint
curl http://localhost:3000/api/status

# Test with data
curl -X POST http://localhost:3000/api/encode/start \
  -H "Content-Type: application/json" \
  -d '{
    "input": "rtsp://camera:554",
    "output": "rtmp://server/live",
    "preset": "h264_1080p_5000k"
  }'
```

### Browser DevTools

1. Open http://localhost:3000
2. F12 -> Network tab
3. Watch API calls and responses
4. Console for JavaScript errors

## Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Server-side debugging

```bash
NODE_OPTIONS="--inspect" npm run dev
```

Then open `chrome://inspect` in Chrome.

## Contributing

### Code style

- Use TypeScript for type safety
- Follow ESLint rules
- Format with Prettier (auto on save)
- Name components and functions descriptively

### Commit messages

Follow conventional commits:

```
feat: Add PTZ preset management
fix: Resolve FFmpeg encoding timeout
docs: Update deployment guide
refactor: Improve error handling
test: Add unit tests for routing
```

### Pull Request Process

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Push and open PR
4. Wait for CI checks and review
5. Merge when approved

## Performance Tips

1. **Memoize expensive computations**: Use `useMemo` and `useCallback`
2. **Lazy load components**: Use dynamic imports
3. **Optimize images**: Use next/image component
4. **Monitor bundle size**: Check `.next/static`
5. **Profile with DevTools**: Check performance metrics

## Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [ONVIF Standard](https://www.onvif.org/specs/)
