import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import diariesRouter from './routes/diaries.js';
import quickOptionsRouter from './routes/quickOptions.js';
import authRouter from './routes/auth.js';

const app = new Koa();

// 中间件
app.use(cors());
app.use(bodyParser());

// 路由
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(diariesRouter.routes());
app.use(diariesRouter.allowedMethods());
app.use(quickOptionsRouter.routes());
app.use(quickOptionsRouter.allowedMethods());

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
