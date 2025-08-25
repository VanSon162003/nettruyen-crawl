const express = require("express");
const comicRoutes = require("./comic.routes");
const chapterRoutes = require("./chapter.routes");
const authorRoutes = require("./author.routes");
const genreRoutes = require("./genre.routes");
const searchRoutes = require("./search.routes");

const router = express.Router();

router.use("/comics", comicRoutes);

router.use("/chapters", chapterRoutes);

router.use("/authors", authorRoutes);

router.use("/genres", genreRoutes);

router.use("/search", searchRoutes);

module.exports = router;
