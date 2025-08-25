const authorService = (() => {
    const { Author, Comic } = require("../models");

    const getAllAuthors = async (options = {}) => {
        const { includeComics = false, limit } = options;

        const includeClause = [];
        if (includeComics) {
            includeClause.push({
                model: Comic,
                as: "comics",
                attributes: ["id", "name", "slug", "thumbnail"],
                limit: limit || 5,
            });
        }

        return await Author.findAll({
            include: includeClause,
            order: [["name", "ASC"]],
        });
    };

    const getAuthorById = async (id) => {
        const author = await Author.findByPk(id, {
            include: [
                {
                    model: Comic,
                    as: "comics",
                    attributes: ["id", "name", "slug", "thumbnail", "status"],
                },
            ],
        });

        if (!author) {
            throw new Error("Author not found");
        }

        return author;
    };

    const createAuthor = async (authorData) => {
        return await Author.create(authorData);
    };

    const updateAuthor = async (id, updateData) => {
        const author = await Author.findByPk(id);
        if (!author) {
            throw new Error("Author not found");
        }

        await author.update(updateData);
        return author;
    };

    const deleteAuthor = async (id) => {
        const author = await Author.findByPk(id);
        if (!author) {
            throw new Error("Author not found");
        }

        await author.destroy();
        return { message: "Author deleted successfully" };
    };

    return {
        getAllAuthors,
        getAuthorById,
        createAuthor,
        updateAuthor,
        deleteAuthor,
    };
})();

module.exports = authorService;
