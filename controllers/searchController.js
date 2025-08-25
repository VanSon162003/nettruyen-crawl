const searchService = require("../services/search.service");

const searchController = {
    // GET /api/search
    search: async (req, res) => {
        try {
            const { q, type = "all", limit = 10 } = req.query;

            const results = await searchService.search(
                q,
                type,
                parseInt(limit)
            );

            res.json({
                success: true,
                data: results,
            });
        } catch (error) {
            const status =
                error.message === "Search query is required" ? 400 : 500;
            res.status(status).json({
                success: false,
                message: error.message,
            });
        }
    },
};

module.exports = searchController;
