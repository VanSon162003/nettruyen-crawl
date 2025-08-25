const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Comic = sequelize.define(
        "Comic",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            slug: {
                type: DataTypes.STRING(255),
                unique: true,
            },
            thumbnail: {
                type: DataTypes.STRING(255),
            },
            status: {
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
            views: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            ratings: {
                type: DataTypes.FLOAT,
                defaultValue: 0.0,
            },
        },
        {
            tableName: "comics",
            timestamps: true,
        }
    );

    Comic.associate = (models) => {
        Comic.belongsToMany(models.Author, {
            through: "author_comic",
            foreignKey: "comic_id",
            otherKey: "author_id",
            as: "authors",
        });
        Comic.belongsToMany(models.Genre, {
            through: "genre_comic",
            foreignKey: "comicId",
            otherKey: "genreId",
            as: "genres",
        });
        Comic.hasMany(models.Chapter, {
            foreignKey: "comic_id",
            as: "chapters",
        });
    };

    return Comic;
};
