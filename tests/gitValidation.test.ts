import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBranch, parseGithubRepo, sanitizeCommitMessage } from '../server/gitRoutes';

test('validateBranch: 정상 브랜치명 허용', () => {
  assert.equal(validateBranch('main'), 'main');
  assert.equal(validateBranch('feat/S-04-history'), 'feat/S-04-history');
  assert.equal(validateBranch(' release-1.2 '), 'release-1.2');
});

test('validateBranch: 셸 메타문자와 옵션 주입 거부', () => {
  for (const bad of ['main; calc', 'a b', '$(id)', '`id`', '-f', '--force', 'a..b', '/abs', 'x/', 'x.lock', 'a@{1}', 'a//b', '', 'x|y', 'x&y']) {
    assert.throws(() => validateBranch(bad), Error, `거부되어야 함: ${bad}`);
  }
  assert.throws(() => validateBranch(undefined as any));
  assert.throws(() => validateBranch('a'.repeat(101)));
});

test('parseGithubRepo: github.com 만 허용하고 정규화', () => {
  assert.deepEqual(parseGithubRepo('https://github.com/owner/repo.git'), {
    owner: 'owner',
    repo: 'repo',
    httpsUrl: 'https://github.com/owner/repo.git',
  });
  assert.equal(parseGithubRepo('https://github.com/owner/repo').httpsUrl, 'https://github.com/owner/repo.git');
  assert.equal(parseGithubRepo('git@github.com:owner/repo.git').httpsUrl, 'https://github.com/owner/repo.git');
  // 자격 증명이 섞여 들어와도 정규화된 URL 에는 남지 않는다
  assert.equal(parseGithubRepo('https://token@github.com/owner/repo.git').httpsUrl, 'https://github.com/owner/repo.git');
});

test('parseGithubRepo: 다른 호스트, 비정상 경로 거부', () => {
  for (const bad of [
    'https://evil.com/a/b.git',
    'https://github.com.evil.com/a/b',
    'http://github.com/a/b',
    'https://github.com/a',
    'https://github.com/a/b/c',
    'https://github.com/a/b;rm -rf',
    'file:///etc/passwd',
    '',
  ]) {
    assert.throws(() => parseGithubRepo(bad), Error, `거부되어야 함: ${bad}`);
  }
  assert.throws(() => parseGithubRepo(null));
});

test('sanitizeCommitMessage: 기본값, 제어문자 제거, 길이 제한', () => {
  assert.equal(sanitizeCommitMessage(undefined), 'chore: update webnovel project data');
  assert.equal(sanitizeCommitMessage('  feat: x  '), 'feat: x');
  assert.equal(sanitizeCommitMessage('a\u0000b\u0007c'), 'abc');
  assert.equal(sanitizeCommitMessage('줄1\n줄2'), '줄1\n줄2');
  assert.throws(() => sanitizeCommitMessage('a'.repeat(201)));
  assert.throws(() => sanitizeCommitMessage(123 as any));
});
