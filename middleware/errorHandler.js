const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.name === "SequelizeValidationError") {
        const errors = err.errors.map((error) => ({
            field: error.path,
            message: error.message,
        }));

        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors,
        });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
        const field = err.errors[0].path;
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
        });
    }

    if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
            success: false,
            message: "Referenced record does not exist",
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

module.exports = errorHandler;
