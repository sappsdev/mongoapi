import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { dbRoutes } from './router/dbRoutes'
import { mongoInit } from './database/mongo'
import { dashRoutes } from './router/dashRoutes'
import { redisInit } from './database/redis';

mongoInit()
redisInit()

const app = new Hono()
app.use('*', cors())
app.route('/', dbRoutes)
app.route('/', dashRoutes)
export default app
