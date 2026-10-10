const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Auth = require('../models/auth.model').authSchema;

const authenticateUser = async (req, res, next) => {
    // try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne
      ({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    // }

    // catch (error) {
    //     res.status(401).json({ status: 'error', message: 'Please authenticate.' });
    // }

}

module.exports = { authenticateUser };

