const genreService = require("../services/genre.service");

const genreController = {
    getAll: async (req, res) => {
        try {
            const options = {
                includeCount: req.query.includeCount === "true",
            };

            const genres = await genreService.getAllGenres(options);

            res.json({
                success: true,
                data: genres,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching genres",
                error: error.message,
            });
        }
    },

    getById: async (req, res) => {
        try {
            const genre = await genreService.getGenreById(req.params.id);

            res.json({
                success: true,
                data: genre,
            });
        } catch (error) {
            const status = error.message === "Genre not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const genre = await genreService.createGenre(req.body);

            res.status(201).json({
                success: true,
                data: genre,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating genre",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            const genre = await genreService.updateGenre(
                req.params.id,
                req.body
            );

            res.json({
                success: true,
                data: genre,
            });
        } catch (error) {
            const status = error.message === "Genre not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const result = await genreService.deleteGenre(req.params.id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            const status = error.message === "Genre not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },
};

module.exports = genreController;
