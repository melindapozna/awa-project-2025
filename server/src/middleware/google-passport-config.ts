import passport from "passport"
import { Strategy, Profile } from "passport-google-oauth20"

//Make sure to have Google client ID, secret and callback URL in your .env file
require('dotenv').config()

passport.use(
    new Strategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, { id: profile.id, displayName: profile.displayName })
      }
    )
  );
export default passport