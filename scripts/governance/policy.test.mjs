import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { validateCommitMessage } from './commit-message.mjs';

const workflow = readFileSync(
  new URL('../../.github/workflows/pr-policy.yml', import.meta.url),
  'utf8',
);
// Executa exatamente o bloco usado por github-script, sem duplicar a política.
const code = workflow
  .split('          script: |\n')[1]
  .split('\n')
  .filter((line) => line.startsWith('            '))
  .map((line) => line.slice(12))
  .join('\n');
function policy(
  head,
  base,
  title = 'ci(OPE-25): configura governança',
  repo = 'hltav/mobility-frontend',
  body = '',
) {
  const failures = [];
  vm.runInNewContext(`(() => {${code}\n})()`, {
    context: {
      payload: {
        pull_request: {
          title,
          body,
          base: { ref: base, repo: { full_name: 'hltav/mobility-frontend' } },
          head: { ref: head, repo: { full_name: repo } },
        },
      },
    },
    core: { setFailed: (message) => failures.push(message), info: () => {} },
  });
  return failures;
}
for (const prefix of ['feature', 'fix', 'docs', 'refactor', 'test', 'chore']) {
  test(`${prefix} → develop permitido`, () =>
    assert.deepEqual(policy(`${prefix}/OPE-25-governanca`, 'develop'), []));
}
for (const prefix of ['feature', 'fix', 'docs']) {
  test(`${prefix} → master rejeitado com mensagem orientativa`, () => {
    assert.equal(
      policy(`${prefix}/OPE-25-governanca`, 'master')[0],
      'Este Pull Request não pode ser integrado à master. Altere a branch de destino para develop. Somente Pull Requests de release originados em develop podem ser integrados à master.',
    );
  });
}
test('develop → master permitido', () => assert.deepEqual(policy('develop', 'master'), []));
test('develop de fork → master rejeitado', () =>
  assert.equal(policy('develop', 'master', 'Release OPE-25', 'outro/fork').length, 1));
test('PR sem card rejeitado', () =>
  assert.equal(policy('feature/OPE-25-governanca', 'develop', 'Configura CI').length, 1));
test('release sem card rejeitada', () =>
  assert.equal(policy('develop', 'master', 'Release').length, 1));
test('card somente em comentário não conta', () =>
  assert.equal(policy('develop', 'master', 'Release', undefined, '<!-- OPE-25 -->').length, 1));
test('card divergente rejeitado', () =>
  assert.equal(policy('fix/OPE-26-governanca', 'develop').length, 1));
test('destino desconhecido rejeitado', () => assert.equal(policy('develop', 'outro').length, 1));
test('placeholders e branch sem card rejeitados', () => {
  assert.equal(policy('feature/OPE-XX-governanca', 'develop').length, 1);
  assert.equal(policy('chore/github-governance', 'develop').length, 1);
});
test('Conventional Commits exige sintaxe OPE numérica', () => {
  for (const message of [
    'feat(OPE-25): configura CI',
    'fix(OPE-25)!: altera regra',
    'docs(OPE-25): explica fluxo\n\nCorpo',
  ])
    assert.equal(validateCommitMessage(message), true);
  for (const message of [
    'feat: configura CI',
    'feat(OPE-XX): configura CI',
    'feat(OPE-0): configura CI',
    'feat(OPE-25): ',
    'Merge branch develop',
  ])
    assert.equal(validateCommitMessage(message), false);
});
test('Rulesets exigem todos os checks, sem bypass ou revisão bloqueante', () => {
  for (const branch of ['master', 'develop']) {
    const ruleset = JSON.parse(
      readFileSync(new URL(`../../.github/rulesets/protect-${branch}.json`, import.meta.url)),
    );
    assert.equal(ruleset.enforcement, 'disabled');
    assert.deepEqual(ruleset.bypass_actors, []);
    assert.deepEqual(ruleset.conditions.ref_name.include, [`refs/heads/${branch}`]);
    const checks = ruleset.rules.find((rule) => rule.type === 'required_status_checks');
    assert.deepEqual(
      checks.parameters.required_status_checks.map((check) => check.context),
      ['PR policy', 'Install', 'Build', 'Angular tests', 'Lint', 'Security'],
    );
    const pull = ruleset.rules.find((rule) => rule.type === 'pull_request');
    assert.equal(pull.parameters.required_approving_review_count, 0);
    assert.equal(pull.parameters.required_review_thread_resolution, true);
    assert.ok(ruleset.rules.some((rule) => rule.type === 'non_fast_forward'));
    assert.ok(ruleset.rules.some((rule) => rule.type === 'deletion'));
  }
});
test('CI propaga falhas de build/teste sem filtros paths nem continue-on-error', () => {
  const ci = readFileSync(
    new URL('../../.github/workflows/angular-ci.yml', import.meta.url),
    'utf8',
  );
  assert.match(ci, /run: npm run build/);
  assert.match(ci, /run: npm run lint/);
  assert.doesNotMatch(ci, /scripts\?\.lint|Lint configurado/);
  assert.match(ci, /run: npm audit --omit=dev --audit-level=high/);
  assert.match(ci, /run: npm audit --audit-level=high/);
  const security = ci.split('  security:\n')[1];
  assert.doesNotMatch(security, /run: npm ci|needs: install/);
  assert.match(ci, /install:\n    name: Install\n    needs: security/);
  assert.match(ci, /run: npm run ng -- test --watch=false/);
  assert.doesNotMatch(ci, /continue-on-error|paths:|paths-ignore:|pull_request_target/);
  assert.doesNotMatch(workflow, /actions\/checkout|paths:|paths-ignore:|pull-requests: write/);
});
