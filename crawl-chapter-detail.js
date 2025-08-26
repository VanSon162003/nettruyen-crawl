const puppeteer = require("puppeteer");
const { Chapter } = require("./models");
const getRandomUserAgent = require("./utils/getRandomUserAgent");
const downloadImage = require("./utils/downloadImage");

async function scrapeChapter(item, browser) {
    let page;
    try {
        page = await browser.newPage();
        await page.setUserAgent(getRandomUserAgent());

        // Set timeout và các options
        page.setDefaultTimeout(30000);
        page.setDefaultNavigationTimeout(30000);

        await page.goto(item.originalUrl, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        const data = await page.evaluate(() => {
            return [...document.querySelectorAll(".page-chapter > img")].map(
                (item) =>
                    item.src ||
                    item.dataset.src ||
                    item.dataset.sv1 ||
                    item.dataset.sv2
            );
        });

        return data;
    } catch (error) {
        console.error("Scrape error:", error.message);
        return null;
    } finally {
        if (page) await page.close();
    }
}

async function start() {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--ignore-certificate-errors",
            "--disable-gpu",
        ],
    });

    const chapters = await Chapter.findAll();

    for (const item of chapters) {
        try {
            const thumbnails = await scrapeChapter(item, browser);
            if (!thumbnails) continue;

            const content = [];

            for (const thumbnail of thumbnails) {
                const thumbPath = `/uploads/thumbnails/${thumbnail
                    .split("/")
                    .at(-3)}-${thumbnail.split("/").at(-2)}-${thumbnail
                    .split("/")
                    .at(-1)}`;

                await downloadImage(
                    thumbnail,
                    `.${thumbPath}`,
                    "https://nettruyenvia.com/"
                );

                content.push(thumbPath);
            }

            item.content = JSON.stringify(content);
            await item.save();
        } catch (error) {
            console.log("Process error:", error);
        }
    }

    await browser.close();
}

start();
