const puppeteer = require("puppeteer");
const { Comic } = require("./models");

const downloadImage = require("./utils/downloadImage");
const getRandomUserAgent = require("./utils/getRandomUserAgent");

let pageNum = 1;

async function start() {
    if (pageNum > 50) {
        console.log("✅ Crawl xong 50 trang");
        return;
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true, // chạy headless
            args: ["--no-sandbox", "--disable-setuid-sandbox"], // cần cho môi trường server
        });

        const page = await browser.newPage();
        await page.setUserAgent(getRandomUserAgent());

        await page.goto(`https://nettruyenvia.com/tim-truyen?page=${pageNum}`, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        // Lấy danh sách comics
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

        console.log(`📄 Trang ${pageNum}: tìm thấy ${comics.length} truyện`);

        // Xử lý lưu vào DB
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
            const data = { ...comic, thumbnail: thumbPath };

            if (existComic) {
                await existComic.update(data);
            } else {
                await Comic.create(data);
            }
        }
    } catch (err) {
        console.error(`❌ Lỗi tại trang ${pageNum}:`, err);
    } finally {
        if (browser) await browser.close();
        pageNum++;
        setTimeout(start, 3000); // nghỉ 3s rồi crawl tiếp (tránh spam server)
    }
}

start();
