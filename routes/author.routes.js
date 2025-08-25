const express = require("express");
const { body } = require("express-validator");
const authorController = require("../controllers/authorController");

const router = express.Router();

const authorValidation = [
    body("name")
        .notEmpty()
        .withMessage("Author name is required")
        .isLength({ max: 255 })
        .withMessage("Author name must not exceed 255 characters"),
    body("slug")
        .optional()
        .isLength({ max: 255 })
        .withMessage("Slug must not exceed 255 characters"),
];

router.get("/", authorController.getAll);
router.get("/:id", authorController.getById);
router.post("/", authorValidation, authorController.create);
router.put("/:id", authorValidation, authorController.update);
router.delete("/:id", authorController.delete);

module.exports = router;
