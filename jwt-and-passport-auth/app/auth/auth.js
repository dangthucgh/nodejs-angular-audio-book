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
        // điền thông tin để xác thực với Facebook.
        // những thông tin này đã được điền ở file auth.js
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ['id', 'displayName', 'email', 'first_name', 'last_name', 'middle_name'],
    },
    // Facebook sẽ gửi lại chuối token và thông tin profile của user
    function (token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function () {
            // tìm trong db xem có user nào đã sử dụng facebook id này chưa
            Social.findOne({'facebook.id': profile.id}, function (err, social) {
                if (err)
                    return done(err);
                // Nếu tìm thấy user, cho họ đăng nhập
                if (social) {
                    return done(null, social); // user found, return that user
                } else {
                    // nếu chưa có, tạo mới user
                    const newSocial = new Social();
                    // lưu các thông tin cho user
                    newSocial.facebook.id = profile.id;
                    newSocial.facebook.token = token;
                    newSocial.facebook.name = profile.name.givenName + ' ' + profile.name.familyName; // bạn có thể log đối tượng profile để xem cấu trúc
                    newSocial.facebook.email = profile.emails[0].value; // fb có thể trả lại nhiều email, chúng ta lấy cái đầu tiền
                    // lưu vào db
                    newSocial.save(function (err) {
                        if (err)
                            throw err;
                        // nếu thành công, trả lại user
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
            // // tìm trong db xem có user nào đã sử dụng google id này chưa
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



