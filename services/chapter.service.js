const { Op } = require("sequelize");

const chapterService = (() => {
    const { Chapter, Comic, Author, Genre } = require("../models");

    const getChaptersByComicSlug = async (comicSlug, options = {}) => {
        const { page = 1, limit = 20 } = options;
        const offset = (page - 1) * limit;

        const comic = await Comic.findOne({
            where: { slug: comicSlug },
            attributes: ["id", "name", "slug"],
        });

        if (!comic) {
            throw new Error("Comic not found");
        }

        const { count, rows } = await Chapter.findAndCountAll({
            where: { comic_id: comic.id },
            include: [
                {
                    model: Comic,
                    as: "comic",
                    attributes: ["id", "name", "slug"],
                },
            ],
            limit: parseInt(limit),
            offset,
            order: [["createdAt", "ASC"]],
        });

        return {
            comic,
            chapters: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit),
            },
        };
    };

    const getChapterById = async (id) => {
        const chapter = await Chapter.findByPk(id, {
            include: [
                {
                    model: Comic,
                    as: "comic",
                    attributes: ["id", "name", "slug"],
                    include: [
                        {
                            model: Author,
                            as: "authors",
                            attributes: ["id", "name"],
                        },
                        {
                            model: Genre,
                            as: "genres",
                            attributes: ["id", "name"],
                        },
                    ],
                },
            ],
        });

        if (!chapter) {
            throw new Error("Chapter not found");
        }

        // Get navigation chapters
        const [prevChapter, nextChapter] = await Promise.all([
            Chapter.findOne({
                where: {
                    comic_id: chapter.comic_id,
                    id: { [Op.lt]: chapter.id },
                },
                attributes: ["id", "name", "slug"],
                order: [["id", "DESC"]],
            }),
            Chapter.findOne({
                where: {
                    comic_id: chapter.comic_id,
                    id: { [Op.gt]: chapter.id },
                },
                attributes: ["id", "name", "slug"],
                order: [["id", "ASC"]],
            }),
        ]);

        return {
            chapter,
            navigation: {
                prev: prevChapter,
                next: nextChapter,
            },
        };
    };

    const createChapter = async (comicId, chapterData) => {
        // Verify comic exists
        const comic = await Comic.findByPk(comicId);
        if (!comic) {
            throw new Error("Comic not found");
        }

        const chapter = await Chapter.create({
            comic_id: comicId,
            ...chapterData,
        });

        return chapter;
    };

    const updateChapter = async (id, updateData) => {
        const chapter = await Chapter.findByPk(id);
        if (!chapter) {
            throw new Error("Chapter not found");
        }

        await chapter.update(updateData);
        return chapter;
    };

    const deleteChapter = async (id) => {
        const chapter = await Chapter.findByPk(id);
        if (!chapter) {
            throw new Error("Chapter not found");
        }

        await chapter.destroy();
        return { message: "Chapter deleted successfully" };
    };

    return {
        getChaptersByComicSlug,
        getChapterById,
        createChapter,
        updateChapter,
        deleteChapter,
    };
})();

module.exports = chapterService;
