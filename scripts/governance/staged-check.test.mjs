import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
const script = fileURLToPath(new URL('./staged-check.mjs', import.meta.url));
test('lint staged lê o index e preserva alterações não staged', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ope25-staged-'));
  const git = (...args) => execFileSync('git', args, { cwd });
  try {
    git('init', '--quiet');
    writeFileSync(join(cwd, 'sample.json'), '{"value":1}\n');
    git('add', '--', 'sample.json');
    writeFileSync(join(cwd, 'sample.json'), '{ "value": 1 }\n');
    const first = spawnSync(process.execPath, [script], { cwd, encoding: 'utf8' });
    assert.equal(first.status, 1, first.stderr);
    assert.equal(readFileSync(join(cwd, 'sample.json'), 'utf8'), '{ "value": 1 }\n');
    git('add', '--', 'sample.json');
    writeFileSync(join(cwd, 'sample.json'), 'alteração local incompleta');
    const second = spawnSync(process.execPath, [script], { cwd, encoding: 'utf8' });
    assert.equal(second.status, 0, second.stderr);
    assert.equal(readFileSync(join(cwd, 'sample.json'), 'utf8'), 'alteração local incompleta');
    assert.equal(git('show', ':sample.json').toString(), '{ "value": 1 }\n');
    writeFileSync(join(cwd, '.prettierrc'), '{"singleQuote":true}\n');
    writeFileSync(join(cwd, 'quote.js'), "const value = 'staged';\n");
    git('add', '--', 'quote.js');
    assert.equal(spawnSync(process.execPath, [script], { cwd }).status, 0);
    mkdirSync(join(cwd, 'src/app'), { recursive: true });
    writeFileSync(
      join(cwd, 'eslint.config.mjs'),
      `export { default } from '${new URL('../../eslint.config.mjs', import.meta.url).href}';\n`,
    );
    writeFileSync(join(cwd, 'src/app/probe.ts'), 'export const value: any = null;\n');
    git('add', '--', 'src/app/probe.ts');
    writeFileSync(join(cwd, 'src/app/probe.ts'), 'export const value: unknown = null;\n');
    const linted = spawnSync(process.execPath, [script], { cwd, encoding: 'utf8' });
    assert.equal(linted.status, 1);
    assert.match(linted.stderr, /no-explicit-any/);
    assert.equal(
      readFileSync(join(cwd, 'src/app/probe.ts'), 'utf8'),
      'export const value: unknown = null;\n',
    );
    git('add', '--', 'src/app/probe.ts');
    assert.equal(spawnSync(process.execPath, [script], { cwd }).status, 0);
    writeFileSync(join(cwd, 'license.txt'), 'trailing space \n');
    git('add', '--', 'license.txt');
    assert.equal(spawnSync(process.execPath, [script], { cwd }).status, 1);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
