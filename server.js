const express = require("express");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const path = require("path");

require("dotenv").config();

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const { sequelize } = require("./models");

const app = express();
const port = process.env.PORT || 3000;

app.use(
    "/api/uploads/thumbnails",
    express.static(path.join(__dirname, "uploads/thumbnails"))
);

app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests, please try again later",
    },
});
app.use("/api/", limiter);

app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", routes);

app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API is running",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    try {
        await sequelize.authenticate();

        if (process.env.NODE_ENV !== "production") {
            await sequelize.sync({ alter: true });
        }
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

startServer();

app.listen(port, () => {
    console.log(port);
});
