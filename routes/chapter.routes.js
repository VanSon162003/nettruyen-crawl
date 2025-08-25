const express = require("express");
const { body } = require("express-validator");
const chapterController = require("../controllers/chapterController");

const router = express.Router();

const chapterValidation = [
    body("name")
        .notEmpty()
        .withMessage("Chapter name is required")
        .isLength({ max: 255 })
        .withMessage("Chapter name must not exceed 255 characters"),
    body("slug")
        .optional()
        .isLength({ max: 255 })
        .withMessage("Slug must not exceed 255 characters"),
];

router.get("/:id", chapterController.getById);
router.put("/:id", chapterValidation, chapterController.update);
router.delete("/:id", chapterController.delete);

module.exports = router;
