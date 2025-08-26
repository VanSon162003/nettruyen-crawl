const puppeteer = require("puppeteer");

const { Comic, Author, Genre, AuthorComic, GenreComic } = require("./models");
const getRandomUserAgent = require("./utils/getRandomUserAgent");
const { where } = require("sequelize");

async function scrapeComic(item) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.setUserAgent(getRandomUserAgent());
        await page.goto(item.originalUrl, { waitUntil: "networkidle0" });

        const data = await page.evaluate(() => {
            const author = document.querySelector(
                ".author > .name + p"
            ).innerText;

            const genres =
                document.querySelector(".kind > .name + p").innerText;

            const views =
                document.querySelector(
                    ".list-info li:nth-child(4) p:last-child"
                )?.innerText || 0;

            const ratings = document.querySelector(
                'span[itemprop="ratingValue"]'
            ).innerText;

            return { author, genres, views, ratings };
        });

        await browser.close();
        return data;
    } catch (error) {
        if (browser) {
            await browser.close();
        }
        console.error(error);
        return null;
    }
}

async function start() {
    const comics = await Comic.findAll();

    for (const item of comics) {
        const data = await scrapeComic(item);

        const genres = data?.genres?.split(" - ");

        item.views = data.views;
        item.ratings = data.ratings;

        await item.save();

        for (const genre of genres) {
            const trimmed = genre?.trim();
            if (!trimmed) continue;

            const [gen, create] = await Genre.findOrCreate({
                where: {
                    name: trimmed,
                },
            });

            GenreComic.create({
                genreId: gen.id,
                comicId: item.id,
            });
        }

        const [author, create] = await Author.findOrCreate({
            where: {
                name: data.author,
            },
        });

        AuthorComic.create({
            author_id: author.id,
            comic_id: item.id,
        });
    }
}

start();
