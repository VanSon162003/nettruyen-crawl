const puppeteer = require("puppeteer");
const { Comic } = require("./models");
const getRandomUserAgent = require("./utils/getRandomUserAgent");

async function scrapeComic(item) {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true }); // headless để không hiện browser
        const page = await browser.newPage();

        // random user-agent
        await page.setUserAgent(getRandomUserAgent());

        // load trang
        await page.goto(item.originalUrl, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
        });

        // lấy nội dung
        const content = await page.evaluate(() => {
            const el = document.querySelector(
                ".detail-content > h2 + div > h2 ~ div + div + div"
            );
            return el ? el.innerText.trim() : null;
        });

        return content;
    } catch (error) {
        console.error(`❌ Error scraping ${item.originalUrl}:`, error);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}

async function start() {
    const comics = await Comic.findAll();

    for (const item of comics) {
        const content = await scrapeComic(item);
        if (content) {
            item.content = content;
            await item.save();
            console.log(`✅ Saved comic ${item.id}`);
        } else {
            console.log(`⚠️ Không lấy được content cho comic ${item.id}`);
        }
    }
}

start();
