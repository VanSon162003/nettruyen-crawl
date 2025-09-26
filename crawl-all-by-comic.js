async function start() {
    const comics = await Comic.findAll();

    for (const item of comics) {
        const data = await scrapeComic(item);
        if (!data) {
            console.log(`Skip comic ${item.id}, scrape failed`);
            continue;
        }

        const genres = data.genres ? data.genres.split(" - ") : [];

        item.views = data.views || 0;
        item.ratings = data.ratings || null;
        await item.save();

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
    }
}
