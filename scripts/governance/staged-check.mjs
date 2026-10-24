import { execFileSync } from 'node:child_process';
import { check, getFileInfo, resolveConfig } from 'prettier';
import { ESLint } from 'eslint';

// Valide os blobs do index usando a configuração Prettier do projeto, sem escrita.
const git = (...args) => execFileSync('git', args, { maxBuffer: 20 * 1024 * 1024 });
const files = git('diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z')
  .toString()
  .split('\0')
  .filter(Boolean);
let failed = false;
const eslint = files.some((file) => /^src\/.*\.(ts|html)$/.test(file)) ? new ESLint() : null;
try {
  git('diff', '--cached', '--check');
} catch (error) {
  console.error(error.stdout?.toString() || 'Falha de whitespace no staging.');
  failed = true;
}
for (const file of files) {
  const { inferredParser } = await getFileInfo(file);
  if (!inferredParser) continue;
  const source = git('show', `:${file}`).toString();
  try {
    if (eslint && /^src\/.*\.(ts|html)$/.test(file)) {
      const results = await eslint.lintText(source, { filePath: file });
      const output = await (await eslint.loadFormatter('stylish')).format(results);
      if (output) console.error(output);
      if (results.some((result) => result.errorCount > 0)) failed = true;
    }
    if (!(await check(source, { ...(await resolveConfig(file)), filepath: file }))) {
      console.error(
        `Formatação inválida no staging: ${file}. Revise e adicione apenas os trechos aprovados.`,
      );
      failed = true;
    }
  } catch (error) {
    console.error(`Falha de análise em ${file}: ${error.message}`);
    failed = true;
  }
}
if (failed) process.exitCode = 1;
else console.log(`Verificação staged aprovada: ${files.length} arquivo(s), sem escrita.`);
