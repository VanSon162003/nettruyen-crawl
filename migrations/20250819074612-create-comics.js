"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("comics", {
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
            thumbnail: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            status: {
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
            views: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                defaultValue: 0,
            },
            ratings: {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 0.0,
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

        await queryInterface.addIndex("comics", ["slug"]);
        await queryInterface.addIndex("comics", ["crawlStatus"]);
        await queryInterface.addIndex("comics", ["views"]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("comics");
    },
};
