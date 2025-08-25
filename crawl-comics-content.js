const Nightmare = require("nightmare");
const nightmare = Nightmare({ show: false });

const { Comic } = require("./models");
const getRandomUserAgent = require("./utils/getRandomUserAgent");
const { where } = require("sequelize");

async function scrapeComic(item) {
    try {
        const data = await nightmare
            .useragent(getRandomUserAgent())
            .goto(item.originalUrl)
            .wait("body")

            .evaluate(() => {
                const content = document.querySelector(
                    ".detail-content > h2 + div > h2 ~ div + div + div"
                ).innerText;

                return content;
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
        const content = await scrapeComic(item);
        item.content = content;
        await item.save();
    }
}

start();
