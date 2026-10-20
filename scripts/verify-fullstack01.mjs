import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Run after `node scripts/build-fullstack01.mjs`, the site build, and a local preview.
// PLAYWRIGHT_MODULE may point to an isolated Playwright installation; no app dependency is required.
// FULLSTACK01_URL can also target the deployed Pages URL for the same fidelity checks.
const root = 'docs/.vitepress/theme/components/fullstack01/'
const manifest = JSON.parse(readFileSync(root + 'manifest.json', 'utf8'))
const source = readFileSync(root + 'source.md', 'utf8')
const fragment = readFileSync(root + 'article.html', 'utf8')
const target = process.env.FULLSTACK01_URL || 'http://127.0.0.1:4173/vitePress-blob/guide/fullstack-course/01-from-bff-to-business-backend'
const output = process.env.REPORT_DIR || '/tmp/fullstack01-verification'
const citationUrls = [
  'https://docs.spring.io/spring-boot/system-requirements.html',
  'https://nodejs.org/en/about/previous-releases',
  'https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends',
  'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html',
  'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html',
  'https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html',
  'https://www.postgresql.org/docs/current/ddl-constraints.html',
  'https://www.postgresql.org/docs/current/transaction-iso.html',
  'https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html',
  'https://www.rfc-editor.org/rfc/rfc9110.html'
]
const sha = text => createHash('sha256').update(text).digest('hex')
const normalized = text => text.replace(/\s+/gu, ' ').trim()
const playwrightPath = process.env.PLAYWRIGHT_MODULE
const { chromium } = playwrightPath ? await import(pathToFileURL(playwrightPath).href) : await import('playwright')

assert.equal(sha(source), 'd40f721d32711ef58aa7f3e6d6b8bf6cff9710fdbfcc867401dfe482d1668e91', 'The complete final-answer publication baseline must remain unchanged')
assert.equal(sha(source), manifest.source.sha256)
assert(!/<script|<iframe|<style|blob:https:\/\/chatgpt|chatgpt\.com\/c\//i.test(fragment), 'Publish the article content without executable exports or private conversation chrome')
assert.equal(manifest.codeBlocks.length, 8)
assert.equal(manifest.tables.length, 9)
assert.equal(manifest.questions.length, 6)
assert.deepEqual(manifest.questions.map(q => q.correct), ['B', 'C', 'A', 'C', 'B', 'C'])
mkdirSync(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1365, height: 960 }, locale: 'zh-CN' })
const page = await context.newPage()
const errors = []
function observeRuntime(currentPage) {
  currentPage.on('pageerror', error => errors.push(error.message))
  currentPage.on('response', response => {
    if (response.status() >= 400 && ['script', 'stylesheet'].includes(response.request().resourceType())) {
      errors.push('Required asset returned HTTP ' + response.status() + ': ' + response.url())
    }
  })
}
observeRuntime(page)
const report = { target, sourceSha256: sha(source), counts: manifest.counts, checks: [], screenshots: [] }

async function snapshot(currentPage) {
  return currentPage.locator('#fullstack-article').evaluate(article => {
    const norm = text => (text || '').replace(/\s+/gu, ' ').trim()
    return {
      blocks: Array.from(article.querySelectorAll('[data-source-block]')).map(node => ({ index: Number(node.dataset.sourceBlock), text: norm(node.textContent) })),
      code: Array.from(article.querySelectorAll('[data-source-block] pre code')).map(node => node.textContent),
      tables: Array.from(article.querySelectorAll('[data-source-block] table')).map(table => Array.from(table.rows).map(row => Array.from(row.cells).map(cell => norm(cell.textContent)))),
      headings: Array.from(article.querySelectorAll('[data-source-block] h1,[data-source-block] h2,[data-source-block] h3,[data-source-block] h4')).map(node => ({ level: Number(node.tagName.slice(1)), id: node.id, text: norm(node.textContent) }))
    }
  })
}
function compareRendered(actual, label) {
  assert.deepEqual(actual.blocks.map(b => b.index), manifest.blocks.map(b => b.index), label + ': ordered source blocks')
  for (const expected of manifest.blocks) {
    const actualBlock = actual.blocks.find(block => block.index === expected.index)
    assert.equal(actualBlock?.text, expected.text, label + ': complete text for source block ' + expected.index)
    assert.equal(sha(actualBlock.text), expected.sha256, label + ': source block hash ' + expected.index)
  }
  assert.deepEqual(actual.code, manifest.codeBlocks.map(block => block.text), label + ': exact code, indentation and blank lines')
  assert.deepEqual(actual.code.map(sha), manifest.codeBlocks.map(block => block.sha256), label + ': exact code hashes')
  assert.deepEqual(actual.tables, manifest.tables.map(table => table.rows), label + ': every table cell')
  assert.deepEqual(actual.headings, manifest.headings.map(({ level, id, text }) => ({ level, id, text })), label + ': original headings and hierarchy')
  const courseTable = actual.tables.find(rows => rows[0]?.[0] === '篇' && rows[0]?.[1] === '主题')
  assert.equal(courseTable?.length, 25, label + ': all 24 curriculum entries')
}
async function testQuiz(currentPage) {
  const button = currentPage.locator('#course-quiz button[type="submit"]')
  await button.click()
  assert.match(await currentPage.locator('#quiz-score').innerText(), /0\s*\/\s*6.*0\s*\/\s*6/u)
  for (const question of manifest.questions) {
    assert.equal(await currentPage.locator('#feedback-' + question.id + ' .quiz-verdict').innerText(), '未作答')
  }
  for (const question of manifest.questions) {
    await currentPage.locator('input[name="q' + question.id + '"][value="' + question.correct + '"]').check()
  }
  await button.click()
  assert.match(await currentPage.locator('#quiz-score').innerText(), /6\s*\/\s*6.*6\s*\/\s*6/u)
  for (const question of manifest.questions) assert.equal(await currentPage.locator('#feedback-' + question.id + ' .quiz-verdict').innerText(), '回答正确')
  await currentPage.locator('input[name="q1"][value="A"]').check()
  assert.match(await currentPage.locator('#quiz-score').innerText(), /答案已修改/u)
  await button.click()
  assert.match(await currentPage.locator('#quiz-score').innerText(), /5\s*\/\s*6.*6\s*\/\s*6/u)
  assert.equal(await currentPage.locator('#feedback-1 .quiz-verdict').innerText(), '本题需要回看')
}
async function screenshot(name, locator = page) {
  await locator.screenshot({ path: resolve(output, name), ...(locator === page ? { fullPage: true } : {}) })
  report.screenshots.push(name)
}

try {
  await page.addInitScript(() => localStorage.setItem('vitepress-theme-appearance', 'light'))
  const response = await page.goto(target, { waitUntil: 'networkidle', timeout: 60000 })
  assert(response?.ok(), 'The lesson must respond successfully')
  await page.locator('#fullstack-article [data-source-block]').first().waitFor()
  const rendered = await snapshot(page)
  compareRendered(rendered, 'Site')
  assert.deepEqual(await page.locator('#fullstack-article .citation a').evaluateAll(links => links.map(link => link.href)), citationUrls, 'All ten original citations link to the intended official sources')
  report.checks.push('All ten original citations preserve the intended official-source URLs')
  const hiddenSourceBlocks = async currentPage => currentPage.locator('#fullstack-article [data-source-block]').evaluateAll(nodes => nodes.filter(node => {
    const style = getComputedStyle(node)
    return style.display === 'none' || style.visibility === 'hidden' || node.getBoundingClientRect().height <= 0
  }).map(node => node.dataset.sourceBlock))
  assert.deepEqual(await hiddenSourceBlocks(page), [], 'All original blocks, including quiz answers, are visible without interaction')
  const originalAnswers = rendered.blocks.filter(block => /^答案：[A-D]。$/u.test(block.text)).length
  assert.equal(originalAnswers, 6, 'All six original answers are displayed')
  report.checks.push(`${manifest.blocks.length} ordered original blocks: every text and hash match`, '8 code blocks: exact bytes, indentation and line breaks', '9 tables: all cells match, including the 24-lesson plan', `${manifest.headings.length} original headings: text and hierarchy match`, 'All six answers and explanations remain visible')
  await screenshot('desktop.png')
  await page.screenshot({ path: resolve(output, 'desktop-top.png') })
  report.screenshots.push('desktop-top.png')

  assert.deepEqual(await page.locator('#fs-scenario option').evaluateAll(options => options.map(option => option.value)), Object.keys(manifest.scenarios))
  for (const [key, expected] of Object.entries(manifest.scenarios)) {
    await page.locator('#fs-scenario').selectOption(key)
    assert.deepEqual(await page.locator('#fs-boundaries [data-layer] .fs-result').allTextContents(), expected.results, 'Scenario results: ' + key)
    assert.equal(normalized(await page.locator('#fs-detail').innerText()), expected.detail, 'Scenario explanation: ' + key)
    assert.equal(await page.locator('#fs-boundaries .fs-focus').getAttribute('data-layer'), expected.focus)
  }
  await screenshot('scenario.png', page.locator('#fs-boundaries'))
  await page.locator('#fs-scenario').selectOption('normal')
  await testQuiz(page)
  report.checks.push('All five responsibility scenarios respond correctly', 'Quiz: unanswered, 6/6, changed answer and 5/6 scoring pass')
  compareRendered(await snapshot(page), 'After interactions')
  await screenshot('quiz.png', page.locator('#course-quiz'))

  await page.setViewportSize({ width: 390, height: 844 })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), '390px mobile page must not overflow horizontally')
  assert.deepEqual(await hiddenSourceBlocks(page), [], 'Mobile must preserve every original block')
  compareRendered(await snapshot(page), 'Mobile')
  await page.evaluate(() => scrollTo(0, 0))
  await screenshot('mobile.png')
  await page.screenshot({ path: resolve(output, 'mobile-top.png') })
  report.screenshots.push('mobile-top.png')
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await screenshot('mobile-dark.png')
  await page.screenshot({ path: resolve(output, 'mobile-dark-top.png') })
  report.screenshots.push('mobile-dark-top.png')
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Dark mobile page must not overflow horizontally')
  report.checks.push('390px mobile: all content retained, no page-level horizontal overflow', 'Desktop, mobile, light and dark screenshots produced')

  const downloadLink = page.locator('#fullstack-article a[download]').first()
  const downloadPath = await downloadLink.getAttribute('href')
  assert.equal(downloadPath, '/vitePress-blob/fullstack-course/fullstack-series-01.html', 'Original download link points to the published complete file')
  const offlineUrl = new URL(downloadPath, target).href
  const offline = await context.newPage()
  observeRuntime(offline)
  const offlineResponse = await offline.goto(offlineUrl, { waitUntil: 'networkidle', timeout: 60000 })
  assert(offlineResponse?.ok(), 'Standalone HTML download succeeds')
  compareRendered(await snapshot(offline), 'Standalone HTML')
  await testQuiz(offline)
  await offline.locator('#fs-scenario').selectOption('email')
  assert.equal(normalized(await offline.locator('#fs-detail').innerText()), manifest.scenarios.email.detail)
  report.checks.push('Downloadable standalone HTML: identical article, working quiz and scenario switch')
  await offline.close()

  const indexUrl = new URL('/vitePress-blob/guide/fullstack-course/', target).href
  const index = await context.newPage()
  observeRuntime(index)
  const indexResponse = await index.goto(indexUrl, { waitUntil: 'networkidle', timeout: 60000 })
  assert(indexResponse?.ok(), 'Course index responds successfully')
  assert.equal(await index.locator('.vp-doc table tbody tr').count(), 24, 'Course index includes 24 planned lessons')
  const chapterLink = index.locator('.vp-doc a[href$="/01-from-bff-to-business-backend"]').first()
  assert(await chapterLink.isVisible(), 'Index links to the published lesson')
  report.checks.push('Course index contains all 24 lessons and links to the preserved lesson URL')
  await index.close()
  assert.deepEqual(errors, [], 'No browser runtime errors')
  report.status = 'passed'
  console.log(JSON.stringify(report, null, 2))
} catch (error) {
  report.status = 'failed'
  report.error = String(error)
  await page.screenshot({ path: resolve(output, 'failure.png'), fullPage: true }).catch(() => {})
  throw error
} finally {
  report.browserErrors = errors
  writeFileSync(resolve(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
