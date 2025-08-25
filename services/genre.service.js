const genreService = (() => {
    const { Genre, Comic } = require("../models");

    const getAllGenres = async (options = {}) => {
        const { includeCount = false } = options;

        let includeClause = [];
        if (includeCount) {
            includeClause.push({
                model: Comic,
                as: "comics",
                attributes: ["id"],
                required: false,
            });
        }

        const genres = await Genre.findAll({
            include: includeClause,
            order: [["name", "ASC"]],
        });

        if (includeCount) {
            return genres.map((genre) => ({
                ...genre.toJSON(),
                comicCount: genre.comics ? genre.comics.length : 0,
                comics: undefined,
            }));
        }

        return genres;
    };

    const getGenreById = async (id) => {
        const genre = await Genre.findByPk(id, {
            include: [
                {
                    model: Comic,
                    as: "comics",
                    attributes: ["id", "name", "slug", "thumbnail", "status"],
                },
            ],
        });

        if (!genre) {
            throw new Error("Genre not found");
        }

        return genre;
    };

    const createGenre = async (genreData) => {
        return await Genre.create(genreData);
    };

    const updateGenre = async (id, updateData) => {
        const genre = await Genre.findByPk(id);
        if (!genre) {
            throw new Error("Genre not found");
        }

        await genre.update(updateData);
        return genre;
    };

    const deleteGenre = async (id) => {
        const genre = await Genre.findByPk(id);
        if (!genre) {
            throw new Error("Genre not found");
        }

        await genre.destroy();
        return { message: "Genre deleted successfully" };
    };

    return {
        getAllGenres,
        getGenreById,
        createGenre,
        updateGenre,
        deleteGenre,
    };
})();

module.exports = genreService;
