const Nightmare = require("nightmare");
const nightmare = Nightmare({ show: false });

const { Comic, Chapter } = require("./models");
const getRandomUserAgent = require("./utils/getRandomUserAgent");
const { where } = require("sequelize");

async function scrapeComic(item) {
    try {
        const data = await nightmare
            .useragent(getRandomUserAgent())
            .goto(item.originalUrl)
            .wait("body")
            .evaluate(() => {
                const chapters = [
                    ...document.querySelectorAll(
                        "#chapter_list .row .chapter "
                    ),
                ].map((item) => item.querySelector("a").href);

                const slugs = chapters.map((item) => item.split("/").pop());

                return { chapters, slugs };
            });

        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function start() {
    const comics = await Comic.findAll();

    for (const item of comics) {
        try {
            const data = await scrapeComic(item);

            for (let i = 0; i < data.chapters.length; ++i) {
                await Chapter.create({
                    comic_id: item.id,
                    name: data.slugs[i],
                    slug: data.slugs[i],
                    originalUrl: data.chapters[i],
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
}

start();
