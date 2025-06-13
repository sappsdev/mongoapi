import { createMiddleware } from 'hono/factory'
import { clientRedis } from '../database/redis'
import { clientDb } from '../database/mongo';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN

export const isApi = () => createMiddleware(async (c, next) => {
    const database = c.req.param('db');
    const token = c.req.header('Authorization');
    if (!database || !token) {
        return c.json({ success: false }, 401);
    }
    let storedDatabase = await clientRedis.get(`token:${token}`);
    if (!storedDatabase) {
        const storeOnDB = await clientDb('admin').collection('tokens').findOne({ token, database });
        if (!storeOnDB) {
            return c.json({ success: false }, 401);
        }
        await clientRedis.set(`token:${token}`, storeOnDB.database);
        storedDatabase = storeOnDB.database;
    }
    const isAuthorized = storedDatabase === database;
    if (!isAuthorized) {
        return c.json({ success: false }, 401);
    }
    return await next();
})

export const isAdmin = () => createMiddleware(async (c, next) => {
    const token = c.req.header("Authorization");
    const isAuthorized = token && token === ADMIN_TOKEN;
    if (!isAuthorized) {
        return c.json({ success: false }, 401);
    }
    return await next();
})