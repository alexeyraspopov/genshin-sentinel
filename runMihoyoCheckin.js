let cookie = require('cookie');
let { chromium } = require('playwright-chromium');

let MIHOYO_COOKIE = process.env.MIHOYO_COOKIE;
let ACT_ID = 'e202102251931481';

if (!MIHOYO_COOKIE) {
  throw new Error('Mihoyo cookies required for check-ins');
}

let parsed = cookie.parse(MIHOYO_COOKIE);
let mihoyoDomainCookie = { domain: '.mihoyo.com', path: '/', sameSite: 'None', httpOnly: false };
let pairs = [
  { name: '_MHYUUID', value: parsed._MHYUUID, ...mihoyoDomainCookie },
  { name: 'account_id', value: parsed.account_id, ...mihoyoDomainCookie },
  { name: 'cookie_token', value: parsed.cookie_token, ...mihoyoDomainCookie },
  { name: 'ltoken', value: parsed.ltoken, ...mihoyoDomainCookie, secure: true },
  { name: 'ltuid', value: parsed.ltuid, ...mihoyoDomainCookie, secure: true },
];

(async () => {
  let browser = await chromium.launch({ headless: true });
  let context = await browser.newContext();
  context.addCookies(pairs);
  let page = await context.newPage();
  await page.goto(
    `https://webstatic-sea.mihoyo.com/ys/event/signin-sea/index.html?act_id=${ACT_ID}`,
  );
  await page.waitForTimeout(5000);
  let items = await page.$$('[class^="components-home-assets-__sign-content_---item---"]');
  let received = await page.$$('[class^="components-home-assets-__sign-content_---received---"]');
  console.log('Items already received', received.length);
  let nextItem = items[received.length];
  await nextItem.click();
  console.log('One more item clicked');
  await page.waitForTimeout(5000);
  await browser.close();
})();
