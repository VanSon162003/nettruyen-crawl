const Nightmare = require("nightmare");
const { Comic } = require("./models");

const downloadImage = require("./utils/downloadImage");
const getRandomUserAgent = require("./utils/getRandomUserAgent");

let page = 1;

async function start() {
    const nightmare = Nightmare({ show: false });

    try {
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
        console.error("Search failed:", err);
    } finally {
        await nightmare.end(); // 💡 giải phóng instance
        page++;
        setTimeout(start, 5000); // đợi 5s rồi mới crawl tiếp (tránh spam)
    }
}

start();
