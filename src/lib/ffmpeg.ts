// FFmpeg Wrapper
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface EncodingConfig {
  input: string;
  output: string;
  codec: string;
  bitrate: string;
  resolution: string;
  framerate: number;
  preset?: string; // 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower'
}

export interface EncodeProcess {
  pid: number;
  input: string;
  output: string;
  startTime: number;
  status: 'running' | 'stopped' | 'error';
}

const activeProcesses = new Map<number, EncodeProcess>();

export async function startEncoding(config: EncodingConfig): Promise<number> {
  const ffmpegBin = process.env.FFMPEG_BIN || 'ffmpeg';

  // Build FFmpeg command
  const cmd = [
    ffmpegBin,
    `-i "${config.input}"`,
    `-c:v ${config.codec}`,
    `-b:v ${config.bitrate}`,
    `-s ${config.resolution}`,
    `-r ${config.framerate}`,
    config.preset ? `-preset ${config.preset}` : '',
    `-c:a aac -b:a 128k`,
    `-f flv "${config.output}"`,
  ]
    .filter(Boolean)
    .join(' ');

  // TODO: Implement actual process spawning with node child_process
  // and real-time monitoring
  console.log(`Starting encoding: ${cmd}`);

  const pid = Date.now();
  activeProcesses.set(pid, {
    pid,
    input: config.input,
    output: config.output,
    startTime: Date.now(),
    status: 'running',
  });

  return pid;
}

export async function stopEncoding(pid: number): Promise<void> {
  const process = activeProcesses.get(pid);
  if (process) {
    // TODO: Implement actual process kill
    process.status = 'stopped';
    activeProcesses.delete(pid);
  }
}

export function getActiveProcesses(): EncodeProcess[] {
  return Array.from(activeProcesses.values());
}

export async function getFFmpegVersion(): Promise<string> {
  const ffmpegBin = process.env.FFMPEG_BIN || 'ffmpeg';
  try {
    const { stdout } = await execAsync(`${ffmpegBin} -version`);
    return stdout.split('\n')[0];
  } catch {
    return 'Not installed';
  }
}
