export interface VttCue {
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

function parseVttTime(timeStr: string): number {
  const parts = timeStr.split(':');
  const hours = parseInt(parts[0] || '0');
  const minutes = parseInt(parts[1] || '0');
  const secondsParts = (parts[2] || '0').split('.');
  const seconds = parseInt(secondsParts[0] || '0');
  const ms = parseInt(secondsParts[1] || '0');

  return hours * 3600 + minutes * 60 + seconds + ms / 1000;
}

export function parseVtt(content: string): VttCue[] {
  const cues: VttCue[] = [];
  const lines = content.split('\n');


  let i = 0;
  while (i < lines.length) {
    const line = lines[i]?.trim();

    if (line && line.includes('-->')) {
      const timeParts = line.split(' --> ');
      const startTime = timeParts[0];
      const endTime = timeParts[1];

      if (startTime && endTime) {
        const nextLine = lines[i + 1]?.trim();
        const xywhMatch = nextLine?.match(/#xywh=(\d+),(\d+),(\d+),(\d+)/);

        if (xywhMatch) {
          cues.push({
            startTime: parseVttTime(startTime),
            endTime: parseVttTime(endTime),
            x: parseInt(xywhMatch[1] || '0'),
            y: parseInt(xywhMatch[2] || '0'),
            width: parseInt(xywhMatch[3] || '0'),
            height: parseInt(xywhMatch[4] || '0')
          });
        }
      }
    }
    i++;
  }

  return cues;

}