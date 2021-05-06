const express = require('express');
const routerSocial = express.Router();

routerSocial.get(
    '/callback',
    (req, res, next) => {
        res.json({
            message: 'Hello world',
        })
    }
);

module.exports = routerSocial;
