import passport from 'passport';

import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import bcrypt from 'bcrypt';

export const JWT_SECRET = 'secret';
passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await prisma.user.findUnique({
      where: { username: username },
    });

    if (!user) return done(null, false, { message: 'Incorrect username.' });

    if (await bcrypt.compare(password, user.password))
      return done(null, { ...user, password: undefined });

    return done(null, false, { message: 'Incorrect password.' });
  })
);

passport.use(
  new JwtStrategy(
    {
      secretOrKey: JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      const user = await prisma.user.findUnique({
        where: { username: token.sub },
      });
      if (!user) return done(null, false);
      return done(null, { ...user, password: undefined });
    }
  )
);
