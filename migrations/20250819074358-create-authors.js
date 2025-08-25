module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("authors", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER.UNSIGNED,
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            slug: {
                type: Sequelize.STRING(255),
                allowNull: true,
                unique: true,
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

        await queryInterface.addIndex("authors", ["slug"]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("authors");
    },
};
