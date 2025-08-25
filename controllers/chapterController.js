const chapterService = require("../services/chapter.service");

const chapterController = {
    getByComicSlug: async (req, res) => {
        try {
            const options = {
                page: req.query.page,
                limit: req.query.limit,
            };

            const result = await chapterService.getChaptersByComicSlug(
                req.params.comicSlug,
                options
            );

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

    getById: async (req, res) => {
        try {
            const result = await chapterService.getChapterById(req.params.id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            const status = error.message === "Chapter not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const chapter = await chapterService.createChapter(
                req.params.comicId,
                req.body
            );

            res.status(201).json({
                success: true,
                data: chapter,
            });
        } catch (error) {
            const status = error.message === "Comic not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            const chapter = await chapterService.updateChapter(
                req.params.id,
                req.body
            );

            res.json({
                success: true,
                data: chapter,
            });
        } catch (error) {
            const status = error.message === "Chapter not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const result = await chapterService.deleteChapter(req.params.id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            const status = error.message === "Chapter not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },
};

module.exports = chapterController;
