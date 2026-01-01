import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import prisma from './database.js';

export function configurePassport() {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email found in Google profile'));
            }

            // Check if OAuth provider already exists
            let oauthProvider = await prisma.oAuthProvider.findUnique({
              where: {
                provider_providerId: {
                  provider: 'google',
                  providerId: profile.id,
                },
              },
              include: { user: true },
            });

            if (oauthProvider) {
              return done(null, oauthProvider.user);
            }

            // Check if user with email exists
            let user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user) {
              // Create new user
              user = await prisma.user.create({
                data: {
                  email,
                  firstName: profile.name?.givenName || '',
                  lastName: profile.name?.familyName || '',
                  avatar: profile.photos?.[0]?.value,
                  emailVerified: true,
                },
              });
            }

            // Link OAuth provider
            await prisma.oAuthProvider.create({
              data: {
                provider: 'google',
                providerId: profile.id,
                userId: user.id,
              },
            });

            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  // Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
          profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email found in Facebook profile'));
            }

            // Check if OAuth provider already exists
            let oauthProvider = await prisma.oAuthProvider.findUnique({
              where: {
                provider_providerId: {
                  provider: 'facebook',
                  providerId: profile.id,
                },
              },
              include: { user: true },
            });

            if (oauthProvider) {
              return done(null, oauthProvider.user);
            }

            // Check if user with email exists
            let user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user) {
              // Create new user
              user = await prisma.user.create({
                data: {
                  email,
                  firstName: profile.name?.givenName || '',
                  lastName: profile.name?.familyName || '',
                  avatar: profile.photos?.[0]?.value,
                  emailVerified: true,
                },
              });
            }

            // Link OAuth provider
            await prisma.oAuthProvider.create({
              data: {
                provider: 'facebook',
                providerId: profile.id,
                userId: user.id,
              },
            });

            return done(null, user);
          } catch (error) {
            return done(error as Error);
          }
        }
      )
    );
  }

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}
