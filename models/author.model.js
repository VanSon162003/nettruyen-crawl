const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Author = sequelize.define(
        "Author",
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
        },
        {
            tableName: "authors",
            timestamps: true,
        }
    );

    Author.associate = (models) => {
        Author.belongsToMany(models.Comic, {
            through: "author_comic",
            foreignKey: "author_id",
            otherKey: "comic_id",
            as: "comics",
        });
    };

    return Author;
};
