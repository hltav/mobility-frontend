import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function validateCommitMessage(message) {
  return /^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)\(OPE-[1-9]\d*\)!?: \S[^\r\n]*$/.test(
    message.split(/\r?\n/)[0] ?? '',
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2] || !validateCommitMessage(readFileSync(process.argv[2], 'utf8'))) {
    console.error(
      'Use Conventional Commits com card real: tipo(OPE-<número>): descrição. A existência do card deve ser conferida no Linear.',
    );
    process.exitCode = 1;
  }
}
