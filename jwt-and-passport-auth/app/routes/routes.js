const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

const Book = require('../models/book')

router.post(
    '/signup',
    passport.authenticate('signup', { session: false }),
    async (req, res, next) => {
        res.json({
            message: 'Signup successful',
            user: req.user
        });
    }
);

router.post(
    '/login',
    async (req, res, next) => {
        passport.authenticate(
            'login',
            async (err, user, info) => {
                try {
                    if (err || !user) {
                        const error = new Error('An error occurred.');

                        return next(error);
                    }

                    req.login(
                        user,
                        { session: false },
                        async (error) => {
                            if (error) return next(error);

                            const body = { _id: user._id, email: user.email };
                            const token = jwt.sign({ user: body }, 'TOP_SECRET');

                            return res.json({ token });
                        }
                    );
                } catch (error) {
                    return next(error);
                }
            }
        )(req, res, next);
    }
);

 // Add Book
router.post('/add-book', (req, res, next) => {
    Book.create(req.body, (error, data) => {
        if(error){
            return next(error)
        } else {
            res.json(data)
        }
    })
})

// Get All Book

router.get('/get-list', (req, res) => {
    Book.find((error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
})

// Get book
router.get('/get-book/:_id', (req, res) => {
    Book.findById(req.params._id, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
})

// Update book

router.put('/update-book/:id', (req, res, next) => {
    Book.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, (error, data) => {
        if (error) {
            return next(error);
            console.log(error)
        } else {
            res.json(data)
            console.log('Book updated successfully!')
        }
    })
})

// Delete book
router.delete('/delete-book/:id', (req, res, next) => {
    Book.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})







module.exports = router;
