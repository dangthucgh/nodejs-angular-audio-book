const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const UserModel = require('../models/model');
const Book = require('../models/book')


const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const configAuth = require('../config/auth');
const Social = require('../models/social')

passport.use(
    new JWTstrategy(
        {
            secretOrKey: 'TOP_SECRET',
            jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
        },
        async (token, done) => {
            try {
                return done(null, token.user);
            } catch (error) {
                done(error);
            }
        }
    )
);

passport.use(
    'signup',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const user = await UserModel.create({email, password});

                return done(null, user);
            } catch (error) {
                done(error);
            }
        }
    )
);

passport.use(
    'login',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const user = await UserModel.findOne({email});

                if (!user) {
                    return done(null, false, {message: 'User not found'});
                }

                const validate = await user.isValidPassword(password);

                if (!validate) {
                    return done(null, false, {message: 'Wrong Password'});
                }

                return done(null, user, {message: 'Logged in Successfully'});
            } catch (error) {
                return done(error);
            }
        }
    )
);

// passport.use(new FacebookStrategy({
//     clientID: configAuth.facebookAuth.clientID,
//     clientSecret: configAuth.facebookAuth.clientSecret,
//     callbackURL: configAuth.facebookAuth.callbackURL,
//     profileFields: ['id', 'email']
// },
//     function (token, refreshToken, profile, done) {
//
//     }
// ))

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
// used to deserialize the user
passport.deserializeUser(function (id, done) {
    Social.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use('facebook-token', new FacebookStrategy({
        // ??i???n th??ng tin ????? x??c th???c v???i Facebook.
        // nh???ng th??ng tin n??y ???? ???????c ??i???n ??? file auth.js
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ['id', 'displayName', 'email', 'first_name', 'last_name', 'middle_name'],
    },
    // Facebook s??? g???i l???i chu???i token v?? th??ng tin profile c???a user
    function (token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {
            // t??m trong db xem c?? user n??o ???? s??? d???ng facebook id n??y ch??a
            Social.findOne({'facebook.id': profile.id}, function (err, social) {
                if (err)
                    return done(err);
                // N???u t??m th???y user, cho h??? ????ng nh???p
                if (social) {
                    return done(null, social); // user found, return that user
                } else {
                    // n???u ch??a c??, t???o m???i user
                    const newSocial = new Social();
                    // l??u c??c th??ng tin cho user
                    newSocial.facebook.id = profile.id;
                    newSocial.facebook.token = token;
                    newSocial.facebook.name = profile.name.givenName + ' ' + profile.name.familyName; // b???n c?? th??? log ?????i t?????ng profile ????? xem c???u tr??c
                    newSocial.facebook.email = profile.emails[0].value; // fb c?? th??? tr??? l???i nhi???u email, ch??ng ta l???y c??i ?????u ti???n
                    // l??u v??o db
                    newSocial.save(function (err) {
                        if (err)
                            throw err;
                        // n???u th??nh c??ng, tr??? l???i user
                        return done(null, newSocial);
                    });
                }
            });
        });
    }));

passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
    },
    function (token, refreshToken, profile, done) {
        process.nextTick(function () {
            // // t??m trong db xem c?? user n??o ???? s??? d???ng google id n??y ch??a
            Social.findOne({'google.id': profile.id}, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    const newSocial = new Social();
                    // set all of the relevant information
                    newSocial.google.id = profile.id;
                    newSocial.google.token = token;
                    newSocial.google.name = profile.displayName;
                    newSocial.google.email = profile.emails[0].value; // pull the first email
                    // save the user
                    newSocial.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newSocial);
                    });
                }
            });
        });
    })
);



