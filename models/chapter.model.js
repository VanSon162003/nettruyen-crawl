const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Chapter = sequelize.define(
        "Chapter",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            comic_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(255),
            },
            content: {
                type: DataTypes.TEXT,
            },
            originalUrl: {
                type: DataTypes.STRING(255),
            },
            crawlStatus: {
                type: DataTypes.STRING(255),
                defaultValue: "pending",
            },
        },
        {
            tableName: "chapters",
            timestamps: true,
        }
    );

    // Junction Models
    const AuthorComic = sequelize.define(
        "AuthorComic",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            author_id: DataTypes.INTEGER,
            comic_id: DataTypes.INTEGER,
        },
        {
            tableName: "author_comic",
            timestamps: true,
        }
    );

    const GenreComic = sequelize.define(
        "GenreComic",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            genreId: DataTypes.INTEGER,
            comicId: DataTypes.INTEGER,
        },
        {
            tableName: "genre_comic",
            timestamps: true,
        }
    );

    Chapter.associate = (models) => {
        Chapter.belongsTo(models.Comic, {
            foreignKey: "comic_id",
            as: "comic",
        });
    };

    return Chapter;
};
