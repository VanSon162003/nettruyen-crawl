const { Comic, Author, Genre, Chapter, sequelize } = require("../models");
const { Op } = require("sequelize");

class ComicService {
    async getAllComics(options = {}) {
        const {
            page = 1,
            limit = 10,
            search = "",
            status,
            genreId,
            authorId,
        } = options;

        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }
        if (status) {
            whereClause.status = status;
        }

        const includeClause = [
            {
                model: Author,
                as: "authors",
                attributes: ["id", "name", "slug"],
                ...(authorId && {
                    where: { id: authorId },
                }),
            },
            {
                model: Genre,
                as: "genres",
                attributes: ["id", "name"],
                ...(genreId && {
                    where: { id: genreId },
                }),
            },
            {
                model: Chapter,
                as: "chapters",
                attributes: ["id", "name"],
            },
        ];

        const { count, rows } = await Comic.findAndCountAll({
            where: whereClause,
            include: includeClause,
            limit: parseInt(limit),
            offset,
            order: [["createdAt", "DESC"]],
            distinct: true,
        });

        return {
            comics: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit),
            },
        };
    }

    async getComicBySlug(slug) {
        const comic = await Comic.findOne({
            where: { slug },
            include: [
                {
                    model: Author,
                    as: "authors",
                    attributes: ["id", "name", "slug"],
                },
                {
                    model: Genre,
                    as: "genres",
                    attributes: ["id", "name"],
                },

                {
                    model: Chapter,
                    as: "chapters",
                    attributes: ["id", "name", "updatedAt"],
                },
            ],
        });

        if (!comic) {
            throw new Error("Comic not found");
        }

        // Increment views
        await comic.increment("views");

        return comic;
    }

    async getComicById(id) {
        const comic = await Comic.findByPk(id, {
            include: [
                {
                    model: Author,
                    as: "authors",
                    attributes: ["id", "name", "slug"],
                },
                {
                    model: Genre,
                    as: "genres",
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!comic) {
            throw new Error("Comic not found");
        }

        return comic;
    }

    async createComic(comicData) {
        const transaction = await sequelize.transaction();

        try {
            const {
                name,
                slug,
                thumbnail,
                status,
                content,
                originalUrl,
                authorIds = [],
                genreIds = [],
            } = comicData;

            // Create comic
            const comic = await Comic.create(
                {
                    name,
                    slug,
                    thumbnail,
                    status,
                    content,
                    originalUrl,
                },
                { transaction }
            );

            // Associate with authors
            if (authorIds.length > 0) {
                const authors = await Author.findAll({
                    where: { id: authorIds },
                });
                await comic.setAuthors(authors, { transaction });
            }

            // Associate with genres
            if (genreIds.length > 0) {
                const genres = await Genre.findAll({
                    where: { id: genreIds },
                });
                await comic.setGenres(genres, { transaction });
            }

            await transaction.commit();

            // Fetch created comic with associations
            return await this.getComicById(comic.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updateComic(id, updateData) {
        const transaction = await sequelize.transaction();

        try {
            const comic = await Comic.findByPk(id);
            if (!comic) {
                throw new Error("Comic not found");
            }

            const {
                name,
                slug,
                thumbnail,
                status,
                content,
                originalUrl,
                authorIds,
                genreIds,
            } = updateData;

            // Update comic fields
            await comic.update(
                {
                    ...(name && { name }),
                    ...(slug && { slug }),
                    ...(thumbnail && { thumbnail }),
                    ...(status && { status }),
                    ...(content && { content }),
                    ...(originalUrl && { originalUrl }),
                },
                { transaction }
            );

            // Update authors if provided
            if (authorIds) {
                const authors = await Author.findAll({
                    where: { id: authorIds },
                });
                await comic.setAuthors(authors, { transaction });
            }

            // Update genres if provided
            if (genreIds) {
                const genres = await Genre.findAll({
                    where: { id: genreIds },
                });
                await comic.setGenres(genres, { transaction });
            }

            await transaction.commit();

            return await this.getComicById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async deleteComic(id) {
        const comic = await Comic.findByPk(id);
        if (!comic) {
            throw new Error("Comic not found");
        }

        await comic.destroy();
        return { message: "Comic deleted successfully" };
    }

    async getPopularComics(limit = 10) {
        return await Comic.findAll({
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
            order: [["views", "DESC"]],
            limit,
        });
    }
}

module.exports = new ComicService();
