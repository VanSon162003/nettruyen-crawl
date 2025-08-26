const puppeteer = require("puppeteer");
const { Comic, Chapter } = require("./models");
const getRandomUserAgent = require("./utils/getRandomUserAgent");

async function scrapeComic(item, browser) {
    let page;
    try {
        page = await browser.newPage();
        await page.setUserAgent(getRandomUserAgent());

        await page.goto(item.originalUrl, { waitUntil: "domcontentloaded" });

        const data = await page.evaluate(() => {
            const chapters = [
                ...document.querySelectorAll("#chapter_list .row .chapter a"),
            ].map((el) => el.href);

            const slugs = chapters.map((url) => url.split("/").pop());

            return { chapters, slugs };
        });

        return data;
    } catch (error) {
        console.error(error);
        return null;
    } finally {
        if (page) await page.close();
    }
}

async function start() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const comics = await Comic.findAll();

    for (const item of comics) {
        try {
            const data = await scrapeComic(item, browser);
            if (!data) continue;

            for (let i = 0; i < data.chapters.length; ++i) {
                // Kiểm tra xem chapter đã tồn tại chưa để tránh duplicate
                const existingChapter = await Chapter.findOne({
                    where: {
                        comic_id: item.id,
                        slug: data.slugs[i],
                    },
                });

                if (!existingChapter) {
                    await Chapter.create({
                        comic_id: item.id,
                        name: data.slugs[i],
                        slug: data.slugs[i],
                        originalUrl: data.chapters[i],
                    });
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    await browser.close();
}

start();
