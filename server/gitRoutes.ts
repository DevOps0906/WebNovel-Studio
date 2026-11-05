import type { Express } from 'express';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

const execFileAsync = promisify(execFile);

// Git 작업 대상 디렉터리. 기본은 서버 실행 디렉터리이며 GIT_REPO_DIR 로 분리할 수 있다.
const REPO_DIR = path.resolve(process.env.GIT_REPO_DIR || process.cwd());

const AUTHOR_NAME = process.env.GIT_AUTHOR_NAME || 'WebNovel Studio';
const AUTHOR_EMAIL = process.env.GIT_AUTHOR_EMAIL || 'studio@localhost';

const MAX_COMMIT_MESSAGE = 200;
const BRANCH_RE = /^[A-Za-z0-9._/-]{1,100}$/;
const GITHUB_URL_RE = /^(?:https:\/\/(?:[^@/\s]+@)?github\.com\/|git@github\.com:)([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/;

class ValidationError extends Error {}

export const validateBranch = (branch: unknown): string => {
  if (typeof branch !== 'string') throw new ValidationError('브랜치명이 올바르지 않습니다.');
  const b = branch.trim();
  if (
    !BRANCH_RE.test(b) ||
    b.startsWith('-') ||
    b.startsWith('/') ||
    b.endsWith('/') ||
    b.endsWith('.') ||
    b.endsWith('.lock') ||
    b.includes('..') ||
    b.includes('//') ||
    b.includes('@{')
  ) {
    throw new ValidationError('브랜치명에 허용되지 않는 문자나 형식이 있습니다.');
  }
  return b;
};

export const parseGithubRepo = (url: unknown): { owner: string; repo: string; httpsUrl: string } => {
  if (typeof url !== 'string' || !url.trim()) {
    throw new ValidationError('GitHub 저장소 URL을 입력해주세요.');
  }
  const m = url.trim().match(GITHUB_URL_RE);
  if (!m) throw new ValidationError('github.com 저장소 URL 형식이 아닙니다. (예: https://github.com/owner/repo.git)');
  const [, owner, repo] = m;
  if (owner.startsWith('.') || repo.startsWith('.') || repo === '.' || repo === '..') {
    throw new ValidationError('저장소 경로가 올바르지 않습니다.');
  }
  return { owner, repo, httpsUrl: `https://github.com/${owner}/${repo}.git` };
};

export const sanitizeCommitMessage = (message: unknown): string => {
  const fallback = 'chore: update webnovel project data';
  if (message === undefined || message === null || message === '') return fallback;
  if (typeof message !== 'string') throw new ValidationError('커밋 메시지가 올바르지 않습니다.');
  // eslint-disable-next-line no-control-regex
  const cleaned = message.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
  if (!cleaned) return fallback;
  if (cleaned.length > MAX_COMMIT_MESSAGE) {
    throw new ValidationError(`커밋 메시지는 ${MAX_COMMIT_MESSAGE}자 이하여야 합니다.`);
  }
  return cleaned;
};

const maskSecrets = (text: string, secrets: string[]): string => {
  let out = text || '';
  for (const s of secrets) {
    if (s) out = out.split(s).join('***');
  }
  // URL 내 자격 증명 제거
  return out.replace(/(https?:\/\/)[^@\s/]+@/gi, '$1***@');
};

const git = async (args: string[], opts: { env?: NodeJS.ProcessEnv; timeoutMs?: number } = {}) => {
  return execFileAsync('git', args, {
    cwd: REPO_DIR,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', ...(opts.env || {}) },
    timeout: opts.timeoutMs ?? 60000,
    maxBuffer: 10 * 1024 * 1024,
    windowsHide: true,
  });
};

const isRepo = async () => {
  try {
    const r = await git(['rev-parse', '--is-inside-work-tree']);
    return r.stdout.trim() === 'true';
  } catch {
    return false;
  }
};

// 토큰은 인자(argv)가 아니라 환경변수 기반 git config 로 전달한다.
const authEnv = (token: string): NodeJS.ProcessEnv => {
  const basic = Buffer.from(`x-access-token:${token}`).toString('base64');
  return {
    GIT_CONFIG_COUNT: '1',
    GIT_CONFIG_KEY_0: 'http.https://github.com/.extraheader',
    GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${basic}`,
  };
};

const sendError = (res: any, error: any, secrets: string[] = []) => {
  if (error instanceof ValidationError) {
    return res.status(400).json({ success: false, error: error.message });
  }
  console.error('Git route error:', maskSecrets(String(error?.message || error), secrets));
  const raw = maskSecrets(String(error?.stderr || error?.message || '작업 중 오류가 발생했습니다.'), secrets);
  let msg = raw;
  if (raw.includes('Repository not found') || raw.includes('404')) {
    msg = 'GitHub에서 지정된 저장소를 찾을 수 없습니다. 저장소를 먼저 생성하거나 URL을 확인해주세요.';
  } else if (raw.includes('Authentication failed') || raw.includes('403') || raw.includes('401')) {
    msg = 'GitHub 인증에 실패했습니다. 토큰의 유효 기간과 repo 권한을 확인해주세요.';
  } else if (raw.includes('fetch first') || raw.includes('non-fast-forward') || raw.includes('rejected')) {
    msg = '원격 저장소와 충돌이 발생했습니다. 강제 푸시 옵션을 확인한 뒤 다시 시도하세요.';
  }
  return res.status(500).json({ success: false, error: msg });
};

export const registerGitRoutes = (app: Express) => {
  // 읽기 전용 상태 조회. 저장소 초기화·커밋 같은 부작용은 없다.
  app.get('/api/git/status', async (_req, res) => {
    try {
      if (!(await isRepo())) {
        return res.json({
          success: true,
          initialized: false,
          repoUrl: '',
          remoteUrl: '',
          branch: '',
          lastCommit: '',
          clean: true,
          modifiedFiles: [],
        });
      }

      let branch = '';
      let remote = '';
      let lastCommit = '';
      let statusText = '';

      try {
        branch = (await git(['branch', '--show-current'])).stdout.trim();
      } catch {}
      try {
        remote = maskSecrets((await git(['remote', 'get-url', 'origin'])).stdout.trim(), []);
      } catch {}
      try {
        lastCommit = (await git(['log', '-n', '1', '--pretty=format:%h - %s (%cr)'])).stdout.trim();
      } catch {}
      try {
        statusText = (await git(['status', '-s'])).stdout.trim();
      } catch {}

      let repoUrl = '';
      try {
        if (remote) repoUrl = parseGithubRepo(remote).httpsUrl.replace(/\.git$/, '');
      } catch {}

      res.json({
        success: true,
        initialized: true,
        repoUrl,
        remoteUrl: remote,
        branch,
        lastCommit,
        clean: statusText.length === 0,
        modifiedFiles: statusText ? statusText.split('\n') : [],
      });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post('/api/git/commit', async (req, res) => {
    try {
      if (!(await isRepo())) {
        throw new ValidationError('Git 저장소가 초기화되어 있지 않습니다. 서버 디렉터리에서 먼저 git init 을 실행하세요.');
      }
      const message = sanitizeCommitMessage(req.body?.message);

      await git(['add', '-A']);
      try {
        const out = await git([
          '-c', `user.name=${AUTHOR_NAME}`,
          '-c', `user.email=${AUTHOR_EMAIL}`,
          'commit', '-m', message,
        ]);
        res.json({ success: true, message: '커밋이 성공적으로 완료되었습니다.', output: out.stdout.trim() });
      } catch (err: any) {
        const combined = `${err?.stdout || ''}${err?.stderr || ''}`;
        if (combined.includes('nothing to commit')) {
          return res.json({ success: true, message: '커밋할 변경 사항이 없습니다 (워킹 트리가 깨끗합니다).' });
        }
        throw err;
      }
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post('/api/git/push', async (req, res) => {
    const secrets: string[] = [];
    try {
      const { token, branch, targetRepoUrl, force = false } = req.body || {};
      if (typeof token !== 'string' || !token.trim()) {
        throw new ValidationError('GitHub Personal Access Token(PAT)을 입력해주세요. (repo 권한 필요)');
      }
      const cleanToken = token.trim();
      if (/[\s\u0000-\u001f]/.test(cleanToken) || cleanToken.length > 400) {
        throw new ValidationError('토큰 형식이 올바르지 않습니다.');
      }
      secrets.push(cleanToken, Buffer.from(`x-access-token:${cleanToken}`).toString('base64'));

      const safeBranch = validateBranch(branch || 'main');
      const { owner, repo, httpsUrl } = parseGithubRepo(targetRepoUrl);

      if (!(await isRepo())) {
        throw new ValidationError('Git 저장소가 초기화되어 있지 않습니다. 서버 디렉터리에서 먼저 git init 을 실행하세요.');
      }

      const args = ['push'];
      if (force === true) args.push('--force');
      // '--' 로 옵션 해석을 끊고, URL 과 refspec 은 검증된 값만 전달한다.
      args.push('--', httpsUrl, `HEAD:refs/heads/${safeBranch}`);

      const result = await git(args, { env: authEnv(cleanToken), timeoutMs: 120000 });

      res.json({
        success: true,
        message: `GitHub 저장소(${owner}/${repo})에 푸시되었습니다.`,
        stdout: maskSecrets(result.stdout, secrets),
        stderr: maskSecrets(result.stderr, secrets),
      });
    } catch (error) {
      sendError(res, error, secrets);
    }
  });

  app.get('/api/git/download-archive', async (req, res) => {
    const format = req.query.format === 'tar' ? 'tar.gz' : 'zip';
    const filename = format === 'zip' ? 'WebNovel-Studio-source.zip' : 'WebNovel-Studio-source.tar.gz';
    const archivePath = path.join(os.tmpdir(), `wns-${crypto.randomUUID()}.${format}`);
    const cleanup = () => fs.promises.rm(archivePath, { force: true }).catch(() => {});

    try {
      if (!(await isRepo())) {
        throw new ValidationError('Git 저장소가 초기화되어 있지 않습니다.');
      }
      await git(['archive', `--format=${format}`, '-o', archivePath, 'HEAD']);
      res.download(archivePath, filename, (err) => {
        if (err) console.error('Archive download error:', err.message);
        cleanup();
      });
    } catch (error) {
      await cleanup();
      sendError(res, error);
    }
  });
};
