import assert from 'node:assert/strict'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'

const playwrightPath = process.env.PLAYWRIGHT_MODULE
const { chromium } = playwrightPath ? await import(pathToFileURL(playwrightPath).href) : await import('playwright')
const root = 'docs/.vitepress/theme/components/memory10/'
const manifest = JSON.parse(readFileSync(root + 'source-manifest.json', 'utf8'))
const output = process.env.REPORT_DIR || 'lesson10-verification'
const target = process.env.LESSON10_URL || 'http://127.0.0.1:4173/vitePress-blob/guide/ai/chatbot-course/10-memory-system'
mkdirSync(output, { recursive: true })
const sha = value => createHash('sha256').update(value).digest('hex')
const source = [1, 2, 3].map(i => readFileSync(root + `source-${i}.html`, 'utf8')).join('')
assert(!/<script|<iframe|data-theme-account-id|data-theme-user-id|blob:https:\/\/chatgpt|chatgpt\.com\/c\//i.test(source), 'Private export chrome or executable content must not be published')

// On a post-merge live check, allow Pages to finish publishing the same source.
if (process.env.WAIT_FOR_PAGES === 'true') {
  let ready = false
  for (let i = 0; i < 48; i++) {
    const response = await fetch(target + '?fidelity=' + Date.now()).catch(() => null)
    const html = response?.ok ? await response.text() : ''
    if (html.includes('data-source-block="123"') && html.includes('memory-lesson-restored')) { ready = true; break }
    await new Promise(resolve => setTimeout(resolve, 5000))
  }
  assert(ready, 'Pages did not publish the restored lesson within four minutes')
}
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1280, height: 960 }, locale: 'zh-CN', permissions: ['clipboard-read', 'clipboard-write'] })
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
const report = { target, source: manifest.source, checks: [], screenshots: [] }
try {
  await page.addInitScript(() => localStorage.setItem('vitepress-theme-appearance', 'light'))
  const response = await page.goto(target, { waitUntil: 'networkidle', timeout: 60000 })
  assert(response?.ok(), 'Lesson HTTP response must succeed')
  await page.locator('.lesson10-original [data-source-block="123"]').waitFor()
  const rendered = await page.locator('.lesson10-original').evaluate(element => ({
    blocks: Array.from(element.children).map(node => ({ id: node.getAttribute('data-source-block'), text: (node.textContent || '').replace(/\s+/g, ' ').trim() })),
    code: Array.from(element.querySelectorAll('pre code')).map(node => node.textContent),
    tables: Array.from(element.querySelectorAll('table')).map(table => Array.from(table.rows).map(row => Array.from(row.cells).map(cell => cell.textContent))),
    headings: element.querySelectorAll('h1,h2,h3').length
  }))
  assert.equal(rendered.blocks.length, manifest.blocks)
  assert.deepEqual(rendered.blocks.map(x => x.id), Array.from({ length: manifest.blocks }, (_, i) => String(i)))
  assert.equal(sha(rendered.blocks.map(x => x.text).join('\n')), manifest.textSha256, 'Source text must remain complete and in the original order')
  assert.equal(rendered.code.length, manifest.codeBlocks)
  assert.deepEqual(rendered.code.map(sha), manifest.codeSha256, 'Every code block must preserve exact text, indentation and blank lines')
  assert.equal(rendered.tables.length, manifest.tables)
  assert.equal(sha(JSON.stringify(rendered.tables)), manifest.tableSha256)
  assert.equal(rendered.headings, manifest.headingCount)
  report.checks.push('124 ordered source blocks: exact normalized-text hash', '9 code/flow blocks: exact byte hashes', '4 tables: every cell matches', '16 original headings retained')
  await page.screenshot({ path: `${output}/desktop.png`, fullPage: true })
  report.screenshots.push('desktop.png')
  await page.locator('.lesson10-original [data-action="copy"]').first().click()
  await page.locator('.copy-status').filter({ hasText: '代码已完整复制' }).waitFor()
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), rendered.code[0])
  const wrap = page.locator('.lesson10-original [data-action="wrap"]').first()
  await wrap.click(); assert.equal(await wrap.getAttribute('aria-pressed'), 'true')
  await wrap.click(); assert.equal(await wrap.getAttribute('aria-pressed'), 'false')
  report.checks.push('Code copying and wrapping work')
  await page.locator('.lesson10-extras > summary').click()
  assert(await page.getByRole('button', { name: '提交评分', exact: true }).isDisabled())
  for (let i = 0; i < 4; i++) await page.locator(`[name="q10-${i}"]`).nth(1).check()
  await page.getByRole('button', { name: '提交评分', exact: true }).click()
  assert.match(await page.locator('.quiz-score').innerText(), /4 \/ 4/)
  assert.equal(await page.locator('.quiz-feedback').count(), 4)
  await page.getByRole('button', { name: '重新作答', exact: true }).click()
  assert.equal(await page.locator('.quiz-question input:checked').count(), 0)
  await page.locator('[name="l10-budget"]').evaluate(element => {
    element.value = '4000'
    element.dispatchEvent(new Event('input', { bubbles: true }))
  })
  assert.match(await page.locator('.budget-feedback').innerText(), /超出预算/)
  report.checks.push('Four quiz questions: scoring, explanations and reset', 'Five budget controls: reactive total and overflow feedback')
  await page.locator('.lesson10-extras').screenshot({ path: `${output}/interactions.png` })
  report.screenshots.push('interactions.png')
  await page.locator('.lesson10-extras > summary').click()
  await page.setViewportSize({ width: 390, height: 844 })
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Mobile layout must not overflow horizontally')
  const hidden = await page.locator('.lesson10-original [data-source-block]').evaluateAll(nodes => nodes.filter(n => getComputedStyle(n).display === 'none').length)
  assert.equal(hidden, 0)
  await page.screenshot({ path: `${output}/mobile.png`, fullPage: true })
  report.screenshots.push('mobile.png')
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.screenshot({ path: `${output}/mobile-dark.png`, fullPage: true })
  report.screenshots.push('mobile-dark.png')
  report.checks.push('390px mobile: no missing blocks or page overflow', 'Light and dark screenshots produced')
  assert.equal(errors.length, 0, 'No browser runtime errors')
  report.status = 'passed'
  console.log(JSON.stringify(report, null, 2))
} catch (error) {
  report.status = 'failed'; report.error = String(error)
  await page.screenshot({ path: `${output}/failure.png`, fullPage: true }).catch(() => {})
  throw error
} finally {
  report.browserErrors = errors
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2))
  await browser.close()
}
