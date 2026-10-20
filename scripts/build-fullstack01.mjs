import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createMarkdownRenderer } from 'vitepress';

// VitePress 1.0.0-rc.13 bundles MarkdownIt instead of exposing a separate
// node_modules/markdown-it package. Reuse its constructor without the
// VitePress-specific rendering plugins so this article keeps the chat layout.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetDir = path.join(repoRoot, 'docs/.vitepress/theme/components/fullstack01');
const sourcePath = path.join(assetDir, 'source.md');
const outputDir = path.join(repoRoot, 'docs/public/fullstack-course');
const configuredMarkdown = await createMarkdownRenderer(path.join(repoRoot, 'docs'), {
  lineNumbers: false
});
const MarkdownIt = configuredMarkdown.constructor;
const md = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: false,
  breaks: false
});
const sha256 = value => crypto.createHash('sha256').update(value, 'utf8').digest('hex');
const normalizeHtml = html => html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&(?:#\d+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]+);/g,
      entity => md.utils.unescapeAll(entity))
    .replace(/\s+/gu, ' ').trim();
const escapeHtml = value => md.utils.escapeHtml(value);
const source = fs.readFileSync(sourcePath, 'utf8');
const references = {
  spring: ['Spring Boot 系统要求', 'https://docs.spring.io/spring-boot/system-requirements.html'],
  node: ['Node.js 发布与支持状态', 'https://nodejs.org/en/about/previous-releases'],
  bff: ['Microsoft BFF 架构模式', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends'],
  auth: ['OWASP 授权检查', 'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html'],
  'tx-proxy': ['Spring 声明式事务代理', 'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html'],
  'tx-rollback': ['Spring 事务回滚规则', 'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html'],
  constraints: ['PostgreSQL 数据约束', 'https://www.postgresql.org/docs/current/ddl-constraints.html'],
  isolation: ['PostgreSQL 事务隔离', 'https://www.postgresql.org/docs/current/transaction-iso.html'],
  outbox: ['Transactional Outbox', 'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html'],
  http: ['RFC 9110 HTTP 语义', 'https://www.rfc-editor.org/rfc/rfc9110.html']
};

// Snapshot of the original in-conversation illustration, with only its
// style and script blocks removed. Its five states are recorded below.
const boundaryHtml = `<section id="fs-boundaries" aria-label="创建工单：责任边界模拟">
  <h3>创建工单：责任边界模拟</h3>
  <div class="viz-controls">
    <label class="form-label" for="fs-scenario">请求场景
      <select id="fs-scenario" class="form-select">
        <option value="normal">正常创建</option>
        <option value="invalid">绕过前端提交空标题</option>
        <option value="tenant">访问其他租户项目</option>
        <option value="duplicate">同业务编号并发创建</option>
        <option value="email">提交后邮件失败</option>
      </select>
    </label>
  </div>
  <ol class="fs-steps" aria-label="业务操作经过的四个环节">
    <li data-layer="frontend">
      <span class="fs-mark" aria-hidden="true"></span>
      <div class="fs-layer"><span>前端</span><span class="text-small text-muted">输入与反馈</span></div>
      <span class="fs-result">已提交</span>
    </li>
    <li data-layer="service">
      <span class="fs-mark" aria-hidden="true"></span>
      <div class="fs-layer"><span>业务服务</span><span class="text-small text-muted">身份、权限、规则</span></div>
      <span class="fs-result">校验通过</span>
    </li>
    <li data-layer="database" class="fs-focus">
      <span class="fs-mark" aria-hidden="true"></span>
      <div class="fs-layer"><span>数据库</span><span class="text-small text-muted">约束与事务</span></div>
      <span class="fs-result">工单与审计已提交</span>
    </li>
    <li data-layer="notification">
      <span class="fs-mark" aria-hidden="true"></span>
      <div class="fs-layer"><span>异步通知</span><span class="text-small text-muted">后续扩展能力</span></div>
      <span class="fs-result">本课尚未接入</span>
    </li>
  </ol>
  <div id="fs-detail" class="text-small" aria-live="polite">模拟结果：数据库提交后创建成立；通知属于后续工作。</div>
</section>`;

const scenarios = {
  normal: {
    results: ['已提交', '校验通过', '工单与审计已提交', '本课尚未接入'],
    focus: 'database',
    detail: '模拟结果：数据库提交后创建成立；通知属于后续工作。'
  },
  invalid: {
    results: ['被绕过', '拒绝：标题为空', '未写入', '未触发'],
    focus: 'service',
    detail: '模拟结果：服务端拦截无效输入；前端校验可被绕过。'
  },
  tenant: {
    results: ['提交了越权请求', '拒绝：无目标项目权限', '未写入', '未触发'],
    focus: 'service',
    detail: '模拟结果：身份有效仍须验证目标租户与项目的操作权限。'
  },
  duplicate: {
    results: ['两个请求同时到达', '均通过格式与权限检查', '1 次成功 · 1 次唯一冲突', '后续仅成功项触发'],
    focus: 'database',
    detail: '模拟结果：唯一约束守住业务编号；重试复用结果仍需幂等协议。'
  },
  email: {
    results: ['收到创建成功', '业务操作已完成', '工单与审计已提交', '发送失败 · 待重试'],
    focus: 'notification',
    detail: '后续方案模拟：邮件失败不撤销已提交工单；可靠重试需 Outbox 等机制。'
  }
};

const questionMatches = Array.from(source.matchAll(
  /^### 第 (\d+) 题：([^\n]+)\n([\s\S]*?)(?=^### 第 \d+ 题：|^---\s*$|^## 如何判断|$(?![\s\S]))/gm
));
const questions = questionMatches.map(match => {
  const options = Array.from(match[3].matchAll(/^([ABC])\. (.+)$/gm))
    .map(option => ({ key: option[1], text: option[2].trim() }));
  const answer = match[3].match(/\*\*答案：([ABC])。\*\*\s*\n\s*\n([^\n]+)/);
  if (options.length !== 3 || !answer) {
    throw new Error('Incomplete source question: ' + match[1]);
  }
  return {
    id: Number(match[1]),
    title: normalizeHtml(md.renderInline(match[2])),
    options,
    correct: answer[1],
    explanation: answer[2].trim()
  };
});
if (questions.length !== 6) throw new Error('The complete source must contain six questions.');

let preparedSource = source;
let referenceIndex = 0;
for (const [key, [title, url]] of Object.entries(references)) {
  referenceIndex++;
  const marker = '[[' + key + ']]';
  if (source.split(marker).length !== 2) throw new Error('Expected one reference: ' + key);
  preparedSource = preparedSource.replaceAll(marker,
    '<sup class="citation"><a href="' + url + '" title="' + escapeHtml(title) +
    '" target="_blank" rel="noopener noreferrer">[' + referenceIndex + ']</a></sup>');
}
preparedSource = preparedSource.replace(
  '[fullstack-series-01.html](01-business-ownership.html?download=1)',
  '<a href="/vitePress-blob/fullstack-course/fullstack-series-01.html" download>fullstack-series-01.html</a>'
);

const tokens = md.parse(preparedSource, {});
const tokenBlocks = [];
for (let i = 0; i < tokens.length;) {
  let end = i + 1;
  if (tokens[i].nesting === 1) {
    let depth = 1;
    while (end < tokens.length && depth !== 0) {
      depth += tokens[end].nesting;
      end++;
    }
    if (depth !== 0) throw new Error('Unbalanced Markdown block at token ' + i);
  }
  tokenBlocks.push(tokens.slice(i, end));
  i = end;
}

const blocks = [];
const codeBlocks = [];
const tables = [];
const headings = [];
const articleParts = [];
let quizOpen = false;
let currentQuestion = null;
const feedback = id => '<div id="feedback-' + id +
  '" class="quiz-feedback" hidden aria-live="polite"><p class="quiz-verdict"></p></div>\n';
const controls = '<div class="quiz-actions"><button type="submit">提交并查看解析</button>' +
  '<output id="quiz-score" aria-live="polite">共 6 题，每题 1 分</output></div>\n';

function closeQuiz() {
  if (!quizOpen) return;
  if (currentQuestion !== null) articleParts.push(feedback(currentQuestion));
  articleParts.push(controls, '</form>\n');
  quizOpen = false;
  currentQuestion = null;
}

function markBlock(html, index) {
  return '<div class="fullstack-source-block" data-source-block="' + index +
    '">\n' + html + '</div>\n';
}

for (const block of tokenBlocks) {
  const first = block[0];
  const inline = block.find(token => token.type === 'inline');
  const inlineContent = inline?.content || '';
  if (inlineContent === '[[quiz-interactive]]') continue;

  const questionHeading = first.type === 'heading_open' && first.tag === 'h3'
    ? inlineContent.match(/^第 (\d+) 题：/)
    : null;
  if (questionHeading) {
    if (!quizOpen) {
      articleParts.push('<form id="course-quiz" aria-label="第01篇自测">\n');
      quizOpen = true;
    } else if (currentQuestion !== null) {
      articleParts.push(feedback(currentQuestion));
    }
    currentQuestion = Number(questionHeading[1]);
  } else if (quizOpen && (first.type === 'hr' ||
    (first.type === 'heading_open' && first.tag !== 'h3'))) {
    closeQuiz();
  }

  const index = blocks.length;
  if (first.type === 'heading_open' && /^h[123]$/.test(first.tag)) {
    const heading = {
      index: headings.length,
      sourceBlock: index,
      level: Number(first.tag[1]),
      id: 'fullstack-heading-' + String(headings.length + 1).padStart(2, '0'),
      text: normalizeHtml(md.renderInline(inlineContent))
    };
    first.attrSet('id', heading.id);
    headings.push(heading);
  }

  let html = md.renderer.render(block, md.options, {});
  let kind = first.type.replace(/_open$/, '');
  if (inlineContent === '[[boundary-interactive]]') {
    html = boundaryHtml.replace(/<h([123])>([\s\S]*?)<\/h\1>/g,
      (match, level, content) => {
        const heading = {
          index: headings.length,
          sourceBlock: index,
          level: Number(level),
          id: 'fullstack-heading-' + String(headings.length + 1).padStart(2, '0'),
          text: normalizeHtml(content)
        };
        headings.push(heading);
        return '<h' + level + ' id="' + heading.id + '">' + content + '</h' + level + '>';
      }) + '\n';
    kind = 'interactive';
  }
  const originalText = normalizeHtml(html);

  if (quizOpen && currentQuestion !== null && first.type === 'paragraph_open' &&
      /^A\. [\s\S]*\nB\. [\s\S]*\nC\. /.test(inlineContent)) {
    const question = questions.find(item => item.id === currentQuestion);
    html = '<div class="quiz-options" role="group" aria-label="第 ' +
      currentQuestion + ' 题选项">\n' + question.options.map(option =>
      '<label class="quiz-option"><input type="radio" name="q' + currentQuestion +
      '" value="' + option.key + '"><span>' +
      md.renderInline(option.key + '. ' + option.text) + '</span></label>\n'
    ).join('') + '</div>\n';
    if (normalizeHtml(html) !== originalText) {
      throw new Error('Radio conversion changed source text for question ' + currentQuestion);
    }
  }

  if (first.type === 'fence') {
    codeBlocks.push({
      index: codeBlocks.length,
      sourceBlock: index,
      language: first.info.trim().split(/\s+/)[0],
      text: first.content,
      sha256: sha256(first.content)
    });
  }
  if (first.type === 'table_open') {
    const rows = Array.from(html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g))
      .map(row => Array.from(row[1].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g))
        .map(cell => normalizeHtml(cell[1])));
    tables.push({ index: tables.length, sourceBlock: index, rows });
    html = '<div class="table-scroll">\n' + html + '</div>\n';
  }
  blocks.push({ index, kind, text: originalText, sha256: sha256(originalText) });
  articleParts.push(markBlock(html, index));
}
closeQuiz();
const articleHtml = articleParts.join('');
if (/<(?:script|style)\b/i.test(articleHtml)) throw new Error('Article fragment must not contain script or style.');
if (/\[\[[a-z-]+\]\]/.test(articleHtml)) throw new Error('Unresolved source marker.');
if (codeBlocks.length !== 8 || tables.length !== 9 ||
    (articleHtml.match(/name="q\d"/g) || []).length !== 18) {
  throw new Error('Incomplete article structure.');
}
const manifest = {
  schemaVersion: 1,
  source: {
    path: path.relative(repoRoot, sourcePath).replaceAll(path.sep, '/'),
    sha256: sha256(source)
  },
  normalization: 'Element textContent, HTML entities decoded, whitespace collapsed with /\\s+/gu, then trimmed; codeBlocks.text retains exact whitespace and trailing newline.',
  blocks,
  codeBlocks,
  tables,
  headings,
  questions,
  scenarios,
  references: Object.entries(references).map(([key, [title, url]], index) => ({
    index: index + 1, key, title, url
  })),
  counts: {
    blocks: blocks.length,
    codeBlocks: codeBlocks.length,
    tables: tables.length,
    headings: headings.length,
    questions: questions.length
  }
};
fs.mkdirSync(assetDir, { recursive: true });
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(assetDir, 'article.html'), articleHtml);
fs.writeFileSync(path.join(assetDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const cssPath = path.join(assetDir, 'article.css');
if (!fs.existsSync(cssPath)) {
  throw new Error('article.html and manifest.json are ready; article.css is required to finish the standalone file.');
}
const sharedCss = fs.readFileSync(cssPath, 'utf8');
const baseCss = `
:root {
  color-scheme: light dark;
  --vp-c-bg: light-dark(#ffffff, #1b1b1f);
  --vp-c-bg-soft: light-dark(#f6f6f7, #202127);
  --vp-c-bg-alt: light-dark(#f6f6f7, #161618);
  --vp-c-text-1: light-dark(#3c3c43, #dfdfe3);
  --vp-c-text-2: light-dark(#67676c, #a8a8b0);
  --vp-c-text-3: light-dark(#929295, #777780);
  --vp-c-divider: light-dark(#e2e2e3, #2e2e32);
  --vp-c-border: light-dark(#c2c2c4, #3c3f44);
  --vp-c-brand-1: light-dark(#3451b2, #a8b1ff);
  --vp-c-brand-2: light-dark(#3a5ccc, #5c73e7);
  --vp-c-brand-soft: light-dark(#646cff24, #646cff29);
  --vp-code-block-bg: var(--vp-c-bg-soft);
  --vp-button-brand-border: transparent;
  --vp-button-brand-bg: var(--vp-c-brand-1);
  --vp-button-brand-text: light-dark(#ffffff, #1b1b1f);
  --vp-button-brand-hover-bg: var(--vp-c-brand-2);
  --vp-button-brand-hover-border: transparent;
  --vp-button-brand-hover-text: var(--vp-button-brand-text);
  --vp-font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  --vp-font-family-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
  --background: var(--vp-c-bg);
  --foreground: var(--vp-c-text-1);
  --muted-foreground: var(--vp-c-text-2);
  --border: var(--vp-c-divider);
  --viz-series-1: var(--vp-c-brand-1);
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-family: var(--vp-font-family-base); }
#fullstack-article { max-width: 850px; margin: 0 auto; padding: 42px 30px 72px; }
@media (max-width: 640px) { #fullstack-article { padding: 26px 18px 48px; } }
`;
const scriptData = JSON.stringify({ scenarios, questions }).replaceAll('<', '\\u003c');
const standaloneScript = `
(() => {
  const { scenarios, questions } = ${scriptData};
  const root = document.getElementById('fullstack-article');
  const select = root.querySelector('#fs-scenario');
  const renderScenario = () => {
    const scenario = scenarios[select.value];
    root.querySelectorAll('#fs-boundaries [data-layer]').forEach((row, index) => {
      row.querySelector('.fs-result').textContent = scenario.results[index];
      row.classList.toggle('fs-focus', row.dataset.layer === scenario.focus);
    });
    root.querySelector('#fs-detail').textContent = scenario.detail;
  };
  select.addEventListener('change', renderScenario);
  renderScenario();
  const quiz = root.querySelector('#course-quiz');
  let hasSubmitted = false;
  quiz.addEventListener('change', event => {
    const target = event.target;
    if (!hasSubmitted || !(target instanceof HTMLInputElement) || target.type !== 'radio') return;
    root.querySelector('#quiz-score').textContent = '答案已修改，请重新提交评分';
    root.querySelectorAll('.quiz-verdict').forEach(verdict => { verdict.textContent = ''; });
    root.querySelectorAll('[data-quiz-result]').forEach(feedback => { delete feedback.dataset.quizResult; });
    hasSubmitted = false;
  });
  quiz.addEventListener('submit', event => {
    event.preventDefault();
    let correct = 0;
    let answered = 0;
    for (const question of questions) {
      const selected = root.querySelector('input[name="q' + question.id + '"]:checked');
      if (selected) answered++;
      const isCorrect = Boolean(selected && selected.value === question.correct);
      if (isCorrect) correct++;
      const feedback = root.querySelector('#feedback-' + question.id);
      feedback.hidden = false;
      feedback.dataset.quizResult = !selected ? 'unanswered' : isCorrect ? 'correct' : 'incorrect';
      feedback.querySelector('.quiz-verdict').textContent = !selected
        ? '未作答'
        : isCorrect ? '回答正确' : '本题需要回看';
    }
    root.querySelector('#quiz-score').textContent =
      '得分 ' + correct + ' / ' + questions.length +
      ' · 已作答 ' + answered + ' / ' + questions.length;
    hasSubmitted = true;
  });
})();
`;
const standaloneHtml = '<!doctype html>\n<html lang="zh-CN"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  '<title>前端转全栈：24 篇系列总纲与第 01 篇</title>' +
  '<style>' + baseCss + '\n' + sharedCss + '</style></head><body>' +
  '<article id="fullstack-article" class="vp-doc">' + articleHtml + '</article>' +
  '<script>' + standaloneScript + '</script></body></html>\n';
fs.writeFileSync(path.join(outputDir, 'fullstack-series-01.html'), standaloneHtml);
console.log(JSON.stringify({
  ...manifest.counts,
  articleBytes: Buffer.byteLength(articleHtml),
  standaloneBytes: Buffer.byteLength(standaloneHtml),
  sourceSha256: manifest.source.sha256,
  outputs: ['docs/.vitepress/theme/components/fullstack01/article.html',
    'docs/.vitepress/theme/components/fullstack01/manifest.json',
    'docs/public/fullstack-course/fullstack-series-01.html']
}, null, 2));
