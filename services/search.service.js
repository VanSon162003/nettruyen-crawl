const searchService = (() => {
    const { Comic, Author, Genre } = require("../models");
    const { Op } = require("sequelize");

    const search = async (query, type = "all", limit = 10) => {
        if (!query) {
            throw new Error("Search query is required");
        }

        const results = [];

        if (type === "comics" || type === "all") {
            const comics = await Comic.findAll({
                where: {
                    name: { [Op.like]: `%${query}%` },
                },
                include: [
                    {
                        model: Author,
                        as: "authors",
                        attributes: ["name"],
                    },
                    {
                        model: Genre,
                        as: "genres",
                        attributes: ["name"],
                    },
                ],
                limit,
                attributes: ["id", "name", "slug", "thumbnail", "status"],
            });

            results.push({
                type: "comics",
                data: comics,
            });
        }

        if (type === "authors" || type === "all") {
            const authors = await Author.findAll({
                where: {
                    name: { [Op.like]: `%${query}%` },
                },
                limit: Math.floor(limit / 2),
                attributes: ["id", "name", "slug"],
            });

            results.push({
                type: "authors",
                data: authors,
            });
        }

        if (type === "genres" || type === "all") {
            const genres = await Genre.findAll({
                where: {
                    name: { [Op.like]: `%${query}%` },
                },
                limit: Math.floor(limit / 2),
                attributes: ["id", "name"],
            });

            results.push({
                type: "genres",
                data: genres,
            });
        }

        return {
            query,
            results: results.filter((result) => result.data.length > 0),
        };
    };

    return { search };
})();

module.exports = searchService;
