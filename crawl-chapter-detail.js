const Nightmare = require("nightmare");
const { Chapter } = require("./models");
const getRandomUserAgent = require("./utils/getRandomUserAgent");
const downloadImage = require("./utils/downloadImage");

async function scrapeChapter(item) {
    // tạo instance mới cho mỗi lần scrape để tránh treo session
    const nightmare = Nightmare({
        show: false,
        waitTimeout: 30000, // timeout 30s
        switches: {
            "ignore-certificate-errors": true,
            "disable-gpu": true,
            "no-sandbox": true,
        },
    });

    try {
        const data = await nightmare
            .useragent(getRandomUserAgent())
            .goto(item.originalUrl)
            .wait("body")
            .evaluate(() => {
                return [
                    ...document.querySelectorAll(".page-chapter > img"),
                ].map(
                    (item) =>
                        item.src ||
                        item.dataset.src ||
                        item.dataset.sv1 ||
                        item.dataset.sv2
                );
            });

        await nightmare.end(); // giải phóng instance
        return data;
    } catch (error) {
        console.error("Scrape error:", error.message);
        await nightmare.end().catch(() => {});
        return null;
    }
}

async function start() {
    const chapters = await Chapter.findAll();

    for (const item of chapters) {
        try {
            const thumbnails = await scrapeChapter(item);
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
}

start();
