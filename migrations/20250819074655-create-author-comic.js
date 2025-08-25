module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("author_comic", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER.UNSIGNED,
            },
            author_id: {
                type: Sequelize.INTEGER.UNSIGNED, // Sửa thành INTEGER.UNSIGNED
                allowNull: true,
                references: {
                    model: "authors",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            comic_id: {
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

        await queryInterface.addIndex("author_comic", ["author_id"]);
        await queryInterface.addIndex("author_comic", ["comic_id"]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("author_comic");
    },
};
