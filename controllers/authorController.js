const authorService = require("../services/author.service");

const authorController = {
    getAll: async (req, res) => {
        try {
            const options = {
                includeComics: req.query.includeComics === "true",
                limit: req.query.limit,
            };

            const authors = await authorService.getAllAuthors(options);

            res.json({
                success: true,
                data: authors,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error fetching authors",
                error: error.message,
            });
        }
    },

    getById: async (req, res) => {
        try {
            const author = await authorService.getAuthorById(req.params.id);

            res.json({
                success: true,
                data: author,
            });
        } catch (error) {
            const status = error.message === "Author not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    create: async (req, res) => {
        try {
            const author = await authorService.createAuthor(req.body);

            res.status(201).json({
                success: true,
                data: author,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Error creating author",
                error: error.message,
            });
        }
    },

    update: async (req, res) => {
        try {
            const author = await authorService.updateAuthor(
                req.params.id,
                req.body
            );

            res.json({
                success: true,
                data: author,
            });
        } catch (error) {
            const status = error.message === "Author not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },

    delete: async (req, res) => {
        try {
            const result = await authorService.deleteAuthor(req.params.id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            const status = error.message === "Author not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },
};

module.exports = authorController;
