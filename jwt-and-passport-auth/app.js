const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require("cors");
const app = express();
const router = express.Router();

const UserModel = require('./app/models/model');

app.use(require('express-session')({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// mongoose.connect('mongodb://127.0.0.1:27017/passport-jwt', { useMongoClient: true });
mongoose.connect("mongodb://127.0.0.1:27017/passport-jwt", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);
mongoose.connection.on('error', error => console.log(error) );
mongoose.Promise = global.Promise;

require('./app/auth/auth');

const routes = require('./app/routes/routes');
const secureRoute = require('./app/routes/secure-routes');

const socialRoute = require('./app/routes/social-routes')



app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

const corsOptions = {
    origin: "http://localhost:4200",

};

app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(passport.session());



app.use('/', routes);

// Plug in the JWT strategy as a middleware so only verified users can access this route.
app.use('/user', passport.authenticate('jwt', { session: false }), secureRoute);

// yêu cầu xác thực bằng facebook
app.get('/auth/facebook', passport.authenticate('facebook-token', {scope: ['email']}));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook-token', { failureRedirect: '/auth/fail' }),
    function(req, res) {
        let responseHTML = '<html><head><title>Main</title></head><body></body><script>res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>'
        responseHTML = responseHTML.replace('%value%', JSON.stringify({
            user: req.user
        }));
        res.status(200).send(responseHTML);
    });



app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
// the callback after google has authenticated the user


app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/fail' }),
    function(req, res) {
        let responseHTML = '<html><head><title>Main</title></head><body></body><script>res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>'
        responseHTML = responseHTML.replace('%value%', JSON.stringify({
            user: req.user
        }));
        res.status(200).send(responseHTML);
    });


// Handle errors.
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({ error: err });
});


const host = 'localhost';
const port = 8080;
app.listen(port, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
