import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { User } from "./Models/UserSchema.js";

passport.use(
  new GoogleStrategy(
    {
      clientID:"415266618735-l84n5nt539arr26bqsvp5atedlmom7nm.apps.googleusercontent.com",
      clientSecret:"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",
      callbackURL: "/api/v1/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            Firstname: profile.name.givenName,
            Lastname: profile.name.familyName,
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: "1114875136782802",
      clientSecret: "753f37463240d84c16d562f7021b0519",
      callbackURL: "/api/v1/facebook/callback",
      profileFields: ["id", "emails", "name"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });
        if (!user) {
          user = await User.create({
            facebookId: profile.id,
            email: profile.emails[0].value,
            Firstname: profile.name.givenName,
            Lastname: profile.name.familyName,
          });
        }
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);    
  }
});
