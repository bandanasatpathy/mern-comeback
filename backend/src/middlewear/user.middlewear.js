const validateUser = (req, res, next) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }
    if (!['employee', 'admin'].includes(role)) {
        return res.status(400).json({ status: 'error', message: 'Invalid role value' });
    }
    next();
}

module.exports = { validateUser };