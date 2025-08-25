const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const AuthorComic = sequelize.define(
        "AuthorComic",
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
            },
            author_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                references: {
                    model: "authors",
                    key: "id",
                },
            },
            comic_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: true,
                references: {
                    model: "comics",
                    key: "id",
                },
            },
        },
        {
            tableName: "author_comic",
            timestamps: true,
            charset: "utf8mb4",
            collate: "utf8mb4_general_ci",
        }
    );

    return AuthorComic;
};
