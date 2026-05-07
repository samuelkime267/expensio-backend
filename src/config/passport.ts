import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "@/models/user.model";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "./env";
import { CustomError } from "@/types";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/auth/google/callback",
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        const profilePicture = profile.photos?.[0].value;

        if (!email) {
          const error = new Error("No email from Google") as CustomError;
          error.statusCode = 400;
          return done(error, undefined);
        }

        const existingUser = await User.findOne({ email });

        if (existingUser && existingUser.authProvider !== "google") {
          const error = new Error(
            "User already exists with a different provider",
          ) as CustomError;
          error.statusCode = 400;
          return done(error, undefined);
        }

        let user = await User.findOne({
          authProvider: "google",
          providerId: profile.id,
        });

        if (!user) {
          user = await User.create({
            email,
            name: profile.displayName,
            authProvider: "google",
            providerId: profile.id,
            profilePicture,
            isEmailVerified: true,
          });
        }

        done(null, user);
      } catch (err) {
        done(err, undefined);
      }
    },
  ),
);
