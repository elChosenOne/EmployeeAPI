import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
const page = await context.newPage()
page.on('pageerror', (err) => console.log('[pageerror]', err.message))
const reqLog = []
page.on('request', (req) => {
  if (req.url().includes('/api/employee') && !req.url().includes('/departments')) reqLog.push(req.url())
})

await page.goto(BASE)
await page.locator('input').nth(0).fill('admin')
await page.locator('input').nth(1).fill('admin')
await page.locator('button[type=submit], button:has-text("Iniciar")').first().click()
await page.waitForSelector('text=Empleados', { timeout: 15000 })
await page.waitForTimeout(500)

console.log('--- requests en modo Calculado (default) ---')
console.log(reqLog)
const summaryComputed = await page.locator('text=/de \\d+ \\(página/').innerText()
console.log('Resumen (calculado):', summaryComputed)

// Open settings, switch pagination to API
reqLog.length = 0
await page.locator('button:has-text("Configuración")').click()
await page.waitForSelector('text=Paginación de empleados')
await page.locator('button[role="radio"]:has-text("API")').last().click()
await page.mouse.click(50, 400) // close via backdrop
await page.waitForTimeout(800)

console.log('--- requests en modo API ---')
console.log(reqLog)
const summaryApi = await page.locator('text=/de \\d+ \\(página/').innerText()
console.log('Resumen (API):', summaryApi)

// Change page size to 10
await page.locator('select').filter({ hasText: '' }).first()
const pageSizeSelect = page.locator('label:has-text("Por página") select')
await pageSizeSelect.selectOption('10')
await page.waitForTimeout(800)
console.log('--- requests tras pageSize=10 (API) ---')
console.log(reqLog.slice(-3))
const summaryApiPs10 = await page.locator('text=/de \\d+ \\(página/').innerText()
console.log('Resumen (API, pageSize 10):', summaryApiPs10)

// Go to next page
await page.locator('button:has-text("Siguiente")').click()
await page.waitForTimeout(800)
const summaryApiPage2 = await page.locator('text=/de \\d+ \\(página/').innerText()
console.log('Resumen (API, page 2):', summaryApiPage2)
console.log('--- requests tras Siguiente ---')
console.log(reqLog.slice(-3))

await page.screenshot({ path: 'pw-shots/employees-api-pagination.png' })

await browser.close()
console.log('DONE')
