const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const GenreComic = sequelize.define(
        "GenreComic",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            genreId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "genres",
                    key: "id",
                },
            },
            comicId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "comics",
                    key: "id",
                },
            },
        },
        {
            tableName: "genre_comic",
            timestamps: true,
            charset: "utf8mb4",
            collate: "utf8mb4_general_ci",
        }
    );

    return GenreComic;
};
