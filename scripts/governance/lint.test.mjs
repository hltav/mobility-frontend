import assert from 'node:assert/strict';
import test from 'node:test';
import { ESLint } from 'eslint';

const eslint = new ESLint();
test('lint rejeita any em arquivo novo', async () => {
  const results = await eslint.lintText('export const value: any = null;', {
    filePath: 'src/app/lint-probe.ts',
  });
  assert.ok(
    results.some((result) =>
      result.messages.some(
        (message) =>
          message.ruleId === '@typescript-eslint/no-explicit-any' && message.severity === 2,
      ),
    ),
  );
});
test('lint valida template externo e preserva comparação intencional com null', async () => {
  const invalid = await eslint.lintText('<img src="x"><span>{{ value == 1 }}</span>', {
    filePath: 'src/app/lint-probe.component.html',
  });
  assert.ok(
    invalid.some((result) =>
      result.messages.some((message) => message.ruleId === '@angular-eslint/template/alt-text'),
    ),
  );
  assert.ok(
    invalid.some((result) =>
      result.messages.some((message) => message.ruleId === '@angular-eslint/template/eqeqeq'),
    ),
  );
  const valid = await eslint.lintText('<span>{{ value == null }}</span>', {
    filePath: 'src/app/lint-probe.component.html',
  });
  assert.equal(
    valid.reduce((total, result) => total + result.errorCount, 0),
    0,
  );
});
test('lint valida template inline sem escrever no arquivo', async () => {
  const results = await eslint.lintText(
    `import { Component } from '@angular/core';
@Component({ selector: 'app-lint-probe', template: '<img src="x">' })
export class LintProbeComponent {}`,
    { filePath: 'src/app/lint-probe.component.ts' },
  );
  assert.ok(
    results.some((result) =>
      result.messages.some(
        (message) =>
          message.ruleId === '@angular-eslint/template/alt-text' && message.severity === 2,
      ),
    ),
  );
});

test('lint impede importações Zod que retêm namespaces no esbuild', async () => {
  for (const declaration of ["import z from 'zod';", "import { z } from 'zod';"]) {
    const result = await eslint.lintText(`${declaration} export const schema = z.string();`, {
      filePath: 'src/app/lint-probe.ts',
    });
    assert.ok(
      result.some((entry) =>
        entry.messages.some(
          (message) => message.ruleId === 'no-restricted-syntax' && message.severity === 2,
        ),
      ),
    );
  }
  const valid = await eslint.lintText(
    "import * as z from 'zod'; export const schema = z.string();",
    {
      filePath: 'src/app/lint-probe.ts',
    },
  );
  assert.equal(
    valid.reduce((total, result) => total + result.errorCount, 0),
    0,
  );
});
