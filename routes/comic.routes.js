const express = require("express");
const { body } = require("express-validator");
const comicController = require("../controllers/comicController");

const router = express.Router();

const comicValidation = [
    body("name")
        .notEmpty()
        .withMessage("Comic name is required")
        .isLength({ max: 255 })
        .withMessage("Comic name must not exceed 255 characters"),
    body("slug")
        .optional()
        .isLength({ max: 255 })
        .withMessage("Slug must not exceed 255 characters"),
    body("status")
        .optional()
        .isIn(["ongoing", "completed", "hiatus", "cancelled"])
        .withMessage("Invalid status"),
    body("authorIds")
        .optional()
        .isArray()
        .withMessage("Author IDs must be an array"),
    body("genreIds")
        .optional()
        .isArray()
        .withMessage("Genre IDs must be an array"),
];

router.get("/popular", comicController.getPopular);
router.get("/", comicController.getAll);
router.get("/:slug", comicController.getBySlug);
router.post("/", comicValidation, comicController.create);
router.put("/:id", comicController.update);
router.delete("/:id", comicController.delete);

module.exports = router;
