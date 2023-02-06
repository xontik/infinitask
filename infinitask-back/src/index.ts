import Koa from 'koa';
import Router from '@koa/router';

import { koaBody } from 'koa-body';
// import session from 'koa-session';

import './passport';
import passport from 'koa-passport';
import cors from '@koa/cors';

const app = new Koa();
const router = new Router();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

import jsonwebtoken from 'jsonwebtoken';
import { JWT_SECRET } from './passport';

app.use(koaBody());
// required for cookie signature generation
// app.keys = ['newest secret key'];
// app.use(session(app));
app.use(passport.initialize());
// app.use(passport.session());
app.use(cors({ origin: '*' }));
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    // will only respond with JSON
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: err.message,
    };
  }
});

router.post('/register', async (ctx) => {
  const { username, email, password } = ctx.request.body;
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: bcrypt.hashSync(password, 10),
    },
  });
  ctx.body = { user };
});

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  async (ctx) => {
    const token = jsonwebtoken.sign(
      { sub: ctx.state.user.username },
      JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );
    ctx.body = { token };
  }
);

router.get(
  '/boards',
  passport.authenticate('jwt', { session: false }),
  async (ctx) => {
    const boards = await prisma.board.findMany({
      where: { authorId: ctx.state.user.id },
    });
    ctx.body = [...boards];
  }
);

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-koa#3-using-the-rest-api`)
);
