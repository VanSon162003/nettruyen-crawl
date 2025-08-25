const puppeteer = require("puppeteer");
const { Comic } = require("./models");

const downloadImage = require("./utils/downloadImage");
const getRandomUserAgent = require("./utils/getRandomUserAgent");

let pageNumber = 1;
let browser;
let page;

async function start() {
    if (pageNumber === 50) {
        await browser.close();
        return;
    }

    try {
        await page.setUserAgent(getRandomUserAgent());
        await page.goto(
            `https://nettruyenvia.com/tim-truyen?page=${pageNumber}`,
            {
                waitUntil: "domcontentloaded",
                timeout: 0,
            }
        );

        await page.waitForSelector(".items .item");

        const comics = await page.evaluate(() => {
            return [...document.querySelectorAll(".items .item")].map(
                (item) => {
                    const slugs = item
                        .querySelector(".image > a")
                        .href.split("/");
                    return {
                        name: item.querySelector("h3").innerText,
                        slug: slugs[slugs.length - 1],
                        thumbnail: item
                            .querySelector(".image > a img")
                            .getAttribute("data-original"),
                        originalUrl: item.querySelector(".image > a").href,
                    };
                }
            );
        });

        for (let comic of comics) {
            const thumbPath = `/uploads/thumbnails/${comic.thumbnail
                .split("/")
                .at(-1)}`;

            await downloadImage(
                comic.thumbnail,
                `.${thumbPath}`,
                "https://nettruyenvia.com/"
            );

            const existComic = await Comic.findOne({
                where: { slug: comic.slug },
            });

            const data = {
                ...comic,
                thumbnail: thumbPath,
            };

            if (existComic) {
                await existComic.update(data);
            } else {
                await Comic.create(data);
            }
        }
    } catch (error) {
        console.error("Search failed:", error);
    } finally {
        pageNumber++;
        await start();
    }
}

(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await start();
})();
