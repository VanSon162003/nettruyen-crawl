module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("genre_comic", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER.UNSIGNED,
            },
            genreId: {
                type: Sequelize.INTEGER.UNSIGNED, // Sửa thành INTEGER.UNSIGNED
                allowNull: true,
                references: {
                    model: "genres",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            comicId: {
                type: Sequelize.INTEGER.UNSIGNED, // Sửa thành INTEGER.UNSIGNED
                allowNull: true,
                references: {
                    model: "comics",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            createdAt: {
                allowNull: true,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: true,
                type: Sequelize.DATE,
            },
        });

        await queryInterface.addIndex("genre_comic", ["genreId"]);
        await queryInterface.addIndex("genre_comic", ["comicId"]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("genre_comic");
    },
};
