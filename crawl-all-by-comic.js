const Nightmare = require("nightmare");
const nightmare = Nightmare({ show: false });

const { Comic, Author, Genre, AuthorComic, GenreComic } = require("./models");
const getRandomUserAgent = require("./utils/getRandomUserAgent");
const { where } = require("sequelize");

async function scrapeComic(item) {
    try {
        const data = await nightmare
            .useragent(getRandomUserAgent())
            .goto(item.originalUrl)
            .wait("body")

            .evaluate(() => {
                const author = document.querySelector(
                    ".author > .name + p"
                ).innerText;

                const genres =
                    document.querySelector(".kind > .name + p").innerText;

                const views = document.querySelector(
                    ".list-info li:last-child p:last-child"
                ).innerText;

                const ratings = document.querySelector(
                    'span[itemprop="ratingValue"]'
                ).innerText;

                return { author, genres, views, ratings };
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
