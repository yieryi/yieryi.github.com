import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const args = process.argv.slice(2);

export function getFlag(name: string): string | undefined {
  const index = args.indexOf(`--${name}`);
  if (index >= 0) return args[index + 1];
  const prefix = `--${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

export function createPrompt() {
  if (stdin.isTTY) {
    const rl = createInterface({ input: stdin, output: stdout });
    return {
      ask: async (question: string, fallback = '', value?: string) => {
        if (value !== undefined) return value;
        const suffix = fallback ? ` (${fallback})` : '';
        const answer = (await rl.question(`${question}${suffix}: `)).trim();
        return answer || fallback;
      },
      close: () => rl.close(),
    };
  }

  const lines = readFileSync(0, 'utf8').split(/\r?\n/);
  let index = 0;

  return {
    ask: async (_question: string, fallback = '', value?: string) => {
      if (value !== undefined) return value;
      const answer = (lines[index++] ?? '').trim();
      return answer || fallback;
    },
    close: () => {},
  };
}