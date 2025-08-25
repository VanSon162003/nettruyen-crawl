require("dotenv").config({ path: "/custom/path/.env", debug: true }); // Load .env một lần duy nhất

const Nightmare = require("nightmare");
const { Comic } = require("./models");
const downloadImage = require("./utils/downloadImage");
const getRandomUserAgent = require("./utils/getRandomUserAgent");

let page = 1;

async function start() {
    if (page >= 50) {
        console.log("Hoàn thành crawl tại page", page);
        return;
    }

    const nightmare = Nightmare({ show: false }); // Tạo instance mới mỗi lần lặp
    try {
        console.log(`Đang crawl trang ${page}`);
        // Thêm độ trễ để tránh bị chặn
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const comics = await nightmare
            .useragent(getRandomUserAgent())
            .goto(`https://nettruyenvia.com/tim-truyen?page=${page}`)
            .wait(".items .item")
            .evaluate(() => {
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
            const thumbPath = `/Uploads/thumbnails/${comic.thumbnail
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
        console.error(`Lỗi khi crawl trang ${page}:`, error);
    } finally {
        await nightmare.end(); // Đóng instance Nightmare
        if (page < 50) {
            page++;
            await start(); // Chờ start hoàn thành
        }
    }
}

start().catch((error) => {
    console.error("Lỗi khởi động:", error);
    process.exit(1); // Thoát tiến trình nếu lỗi nghiêm trọng
});
