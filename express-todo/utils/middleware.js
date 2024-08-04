const unknownEndpoint = (req, res) => {
    res.status(404).json({ error: "unknown endpoint" });
};

const errorHandler = (err, req, res, next) => {
    console.error(err.message);
    if (err.name === "ValidationError") {
        // const errors = Object.values(err.errors).map((e) => e.message);
        // return res.status(400).json({ error: errors.join(", ") });
        return res.status(400).json({
            error: err.message,
        });
    }

    next(err);
};

module.exports = {
    unknownEndpoint,
    errorHandler,
};
