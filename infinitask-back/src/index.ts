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

router.post(
  '/boards',
  passport.authenticate('jwt', { session: false }),
  async (ctx) => {
    const { title } = ctx.request.body;
    const { id: authorId } = ctx.state.user;
    const board = await prisma.board.create({
      data: {
        title,
        authorId,
      },
    });
    ctx.body = board;
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
router.get(
  '/boards/:id',
  passport.authenticate('jwt', { session: false }),
  async (ctx) => {
    const board = await prisma.board.findUnique({
      where: { id: Number(ctx.params.id) },
    });
    ctx.body = board;
  }
);

router.put(
  '/boards/:id',
  passport.authenticate('jwt', { session: false }),
  async (ctx) => {
    const { id } = ctx.params;
    const { title } = ctx.request.body;

    const board = await prisma.board.update({
      data: {
        title,
      },
      where: { id: Number(id) },
    });
    ctx.body = board;
  }
);

router.delete(
  '/boards/:id',
  passport.authenticate('jwt', { session: false }),
  async (ctx) => {
    const { id } = ctx.params;
    await prisma.board.delete({ where: { id: Number(id) } });
    ctx.status = 200;
  }
);

router.get(
  '/tasks',
  passport.authenticate('jwt', { session: false }),
  async (ctx) => {
    const tasks = await prisma.task.findMany({
      where: { boardId: Number(ctx.query.boardId) },
    });
    ctx.body = [...tasks];
  }
);

router.post(
  '/tasks',
  passport.authenticate('jwt', { session: false }),
  async (ctx) => {
    const { title, boardId, parentId } = ctx.request.body;
    const task = await prisma.task.create({
      data: {
        title,
        boardId,
        content: '',
        completed: false,
        parentId,
        authorId: ctx.state.user.id,
      },
    });
    ctx.body = task;
  }
);

router.put(
  '/tasks/:id',
  passport.authenticate('jwt', { session: false }),
  async (ctx) => {
    const { id } = ctx.params;
    const { title, parentId, completed } = ctx.request.body;

    const task = await prisma.task.update({
      data: {
        title,
        parentId,
        completed,
      },
      where: { id: Number(id) },
    });
    ctx.body = task;
  }
);

router.delete(
  '/tasks/:id',
  passport.authenticate('jwt', { session: false }),
  async (ctx) => {
    const { id } = ctx.params;
    await prisma.task.delete({ where: { id: Number(id) } });
    ctx.status = 200;
  }
);

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/ts/rest-koa#3-using-the-rest-api`)
);
