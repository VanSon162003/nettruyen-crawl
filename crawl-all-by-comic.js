const puppeteer = require("puppeteer");
const { Comic, Author, Genre, AuthorComic, GenreComic } = require("./models");
const getRandomUserAgent = require("./utils/getRandomUserAgent");

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
            const author =
                document.querySelector(".author > .name + p")?.innerText ||
                null;
            const genres =
                document.querySelector(".kind > .name + p")?.innerText || "";
            const views =
                document.querySelector(
                    ".list-info li:nth-child(4) p:last-child"
                )?.innerText || "0";
            const ratings =
                document.querySelector('span[itemprop="ratingValue"]')
                    ?.innerText || null;

            return { author, genres, views, ratings };
        });

        await browser.close();
        return data;
    } catch (error) {
        if (browser) await browser.close();
        console.error(`❌ scrapeComic failed for ${item.id}:`, error.message);
        return null;
    }
}

async function start() {
    const comics = await Comic.findAll();
    console.log(`🔎 Found ${comics.length} comics to crawl`);

    for (const item of comics) {
        try {
            console.log(`📖 Crawling comic ${item.id} - ${item.title}`);
            const data = await scrapeComic(item);
            if (!data) {
                console.log(`⚠️ Skip comic ${item.id}, scrape failed`);
                continue;
            }

            // ✅ Parse genres
            const genres = data.genres ? data.genres.split(" - ") : [];

            // ✅ Convert numeric fields
            let views =
                parseInt((data.views || "0").replace(/\D/g, ""), 10) || 0;
            let ratings = data.ratings ? parseFloat(data.ratings) : null;

            // Update comic
            item.views = views;
            item.ratings = ratings;
            await item.save();

            // Update genres
            for (const genre of genres) {
                const trimmed = genre?.trim();
                if (!trimmed) continue;

                const [gen] = await Genre.findOrCreate({
                    where: { name: trimmed },
                    defaults: { name: trimmed },
                });

                await GenreComic.findOrCreate({
                    where: { genreId: gen.id, comicId: item.id },
                    defaults: { genreId: gen.id, comicId: item.id },
                });
            }

            // Update author
            if (data.author) {
                const [author] = await Author.findOrCreate({
                    where: { name: data.author },
                    defaults: { name: data.author },
                });

                await AuthorComic.findOrCreate({
                    where: { author_id: author.id, comic_id: item.id },
                    defaults: { author_id: author.id, comic_id: item.id },
                });
            }

            console.log(`✅ Done comic ${item.id}`);
        } catch (err) {
            console.error(`❌ Error processing comic ${item.id}:`, err.message);
        }
    }

    console.log("🎉 All comics crawled!");
}

// Run
start()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Fatal error:", err);
        process.exit(1);
    });
