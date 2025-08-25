const Nightmare = require("nightmare");
const nightmare = Nightmare({ show: false });

const { Chapter } = require("./models");
const getRandomUserAgent = require("./utils/getRandomUserAgent");
const { where } = require("sequelize");
const downloadImage = require("./utils/downloadImage");

async function scrapeChapter(item) {
    try {
        const data = await nightmare
            .useragent(getRandomUserAgent())
            .goto(item.originalUrl)
            .wait("body")
            .evaluate(() => {
                const thumbnails = [
                    ...document.querySelectorAll(".page-chapter > img"),
                ].map((item) => {
                    return (
                        item.src ||
                        item.dataset.src ||
                        item.dataset.sv1 ||
                        item.dataset.sv2
                    );
                });

                return thumbnails;
            });

        return data;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function start() {
    const chapters = await Chapter.findAll();

    for (const item of chapters) {
        try {
            const thumbnails = await scrapeChapter(item);
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
            console.log(error);
        }
    }
}

start();
