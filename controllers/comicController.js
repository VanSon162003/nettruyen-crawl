const comicService = require("../services/Comic.service");
const { validationResult } = require("express-validator");

const comicController = {
    getAll: async (req, res) => {
        try {
            const options = {
                page: req.query.page,
                limit: req.query.limit,
                search: req.query.search,
                status: req.query.status,
                genreId: req.query.genreId,
                authorId: req.query.authorId,
            };

            const result = await comicService.getAllComics(options);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching comics",
                error: error.message,
            });
        }
    },

    getBySlug: async (req, res) => {
        try {
            const comic = await comicService.getComicBySlug(req.params.slug);

            res.json({
                success: true,
                data: comic,
            });
        } catch (error) {
            const status = error.message === "Comic not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation errors",
                    errors: errors.array(),
                });
            }

            const comic = await comicService.createComic(req.body);

            res.status(201).json({
                success: true,
                data: comic,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating comic",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            const comic = await comicService.updateComic(
                req.params.id,
                req.body
            );

            res.json({
                success: true,
                data: comic,
            });
        } catch (error) {
            const status = error.message === "Comic not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const result = await comicService.deleteComic(req.params.id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            const status = error.message === "Comic not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    getPopular: async (req, res) => {
        try {
            const limit = req.query.limit || 10;
            const comics = await comicService.getPopularComics(limit);

            res.json({
                success: true,
                data: comics,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching popular comics",
                error: error.message,
            });
        }
    },
};

module.exports = comicController;
