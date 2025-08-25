"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("chapters", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER.UNSIGNED,
            },
            comic_id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: "comics",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            slug: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            originalUrl: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            crawlStatus: {
                type: Sequelize.STRING(255),
                allowNull: true,
                defaultValue: "pending",
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

        await queryInterface.addIndex("chapters", ["slug"]);
        await queryInterface.addIndex("chapters", ["crawlStatus"]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("chapters");
    },
};
