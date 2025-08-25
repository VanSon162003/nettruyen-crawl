const express = require("express");
const { body } = require("express-validator");
const genreController = require("../controllers/genreController");

const router = express.Router();

// Validation middleware
const genreValidation = [
    body("name")
        .notEmpty()
        .withMessage("Genre name is required")
        .isLength({ max: 100 })
        .withMessage("Genre name must not exceed 100 characters"),
];

// Routes
router.get("/", genreController.getAll);
router.get("/:id", genreController.getById);
router.post("/", genreValidation, genreController.create);
router.put("/:id", genreValidation, genreController.update);
router.delete("/:id", genreController.delete);

module.exports = router;
