// CI web preview: open each route of the exported web build at phone size and
// screenshot it. Config: scripts/preview/routes.json
//   { "public": ["/..."], "signedIn": ["/..."] }
// Signed-in routes log in first via the sign-in screen (testIDs email/password/sign-in)
// using PREVIEW_EMAIL / PREVIEW_PASSWORD.
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:8081';
const OUT = 'preview-shots';
mkdirSync(OUT, { recursive: true });
const cfg = JSON.parse(readFileSync('scripts/preview/routes.json', 'utf8'));
const report = [];

const browser = await chromium.launch();
const ctx = await browser.newContext({
	viewport: { width: 390, height: 844 },
	deviceScaleFactor: 2,
	isMobile: true,
	hasTouch: true,
	colorScheme: 'dark'
});

async function shoot(page, path, name) {
	const errors = [];
	const onErr = (e) => errors.push(String(e.message ?? e).slice(0, 300));
	const onConsole = (m) => m.type() === 'error' && errors.push('console: ' + m.text().slice(0, 300));
	page.on('pageerror', onErr);
	page.on('console', onConsole);
	try {
		await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 });
	} catch (e) {
		errors.push('goto: ' + e.message.slice(0, 200));
	}
	await page.waitForTimeout(+(process.env.WAIT ?? 2500));
	const file = `${OUT}/${name}.png`;
	await page.screenshot({ path: file, fullPage: false });
	// Also a tall capture of scrollable content.
	await page.screenshot({ path: `${OUT}/${name}--full.png`, fullPage: true }).catch(() => {});
	report.push({ path, name, url: page.url(), errors: [...new Set(errors)].slice(0, 8) });
	page.off('pageerror', onErr);
	page.off('console', onConsole);
}

const slug = (p) => p.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root';
const page = await ctx.newPage();
for (const p of cfg.public ?? []) await shoot(page, p, 'pub-' + slug(p));

if ((cfg.signedIn ?? []).length && process.env.PREVIEW_EMAIL) {
	await page.goto(BASE + '/auth/sign-in', { waitUntil: 'networkidle', timeout: 60000 });
	await page.waitForTimeout(1500);
	try {
		await page.fill('[data-testid="email"]', process.env.PREVIEW_EMAIL);
		await page.fill('[data-testid="password"]', process.env.PREVIEW_PASSWORD ?? '');
		await page.click('[data-testid="sign-in"]');
		await page.waitForTimeout(6000);
		report.push({ name: 'login', url: page.url() });
	} catch (e) {
		report.push({ name: 'login', error: e.message.slice(0, 300) });
	}
	for (const p of cfg.signedIn) await shoot(page, p, 'in-' + slug(p));
}

writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
