const validateTask = (req, res, next) => {

    const {
        title,
        description,
        assignedTo,
        dueDate
    } = req.body;

    if (!title || !description || !assignedTo || !dueDate) {
        return res.status(400).json({
            status: 'error',
            message: 'Title, description, assigned employee and due date are required.'
        });
    }

    next();
};

module.exports = { validateTask };