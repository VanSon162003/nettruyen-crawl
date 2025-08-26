const puppeteer = require("puppeteer");
const { Comic, Author, Genre, AuthorComic, GenreComic } = require("./models");
const getRandomUserAgent = require("./utils/getRandomUserAgent");

async function scrapeComic(item, browser) {
    const page = await browser.newPage();

    try {
        await page.setUserAgent(getRandomUserAgent());
        await page.goto(item.originalUrl, { waitUntil: "domcontentloaded" });

        const data = await page.evaluate(() => {
            const author =
                document.querySelector(".author > .name + p")?.innerText || "";
            const genres =
                document.querySelector(".kind > .name + p")?.innerText || "";
            const views =
                document.querySelector(".list-info li:last-child p:last-child")
                    ?.innerText || "";
            const ratings =
                document.querySelector('span[itemprop="ratingValue"]')
                    ?.innerText || "";

            return { author, genres, views, ratings };
        });

        await page.close();
        return data;
    } catch (error) {
        console.error(error);
        await page.close();
        return null;
    }
}

async function start() {
    const browser = await puppeteer.launch({
        headless: true, // chạy ẩn (tương tự show: false của nightmare)
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const comics = await Comic.findAll();

    for (const item of comics) {
        const data = await scrapeComic(item, browser);
        if (!data) continue;

        const genres = data.genres?.split(" - ");

        item.views = data.views;
        item.ratings = data.ratings;
        await item.save();

        // genres
        for (const genre of genres) {
            const trimmed = genre?.trim();
            if (!trimmed) continue;

            const [gen] = await Genre.findOrCreate({
                where: { name: trimmed },
            });

            await GenreComic.create({
                genreId: gen.id,
                comicId: item.id,
            });
        }

        // author
        const [author] = await Author.findOrCreate({
            where: { name: data.author },
        });

        await AuthorComic.create({
            author_id: author.id,
            comic_id: item.id,
        });
    }

    await browser.close();
}

start();
