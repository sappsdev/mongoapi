import { Hono } from "hono";
import { clientDb } from "../database/mongo";
import { isAdmin } from "../middlewares/middleware";
import { ObjectId } from "mongodb";
import { clientRedis } from "../database/redis";

export const dashRoutes = new Hono().basePath('/dash')

dashRoutes.post('/databases', isAdmin(), async (c) => {
    const { name } = await c.req.json()
    const data = await clientDb('dash').collection('databases').insertOne({
        name,
        createdAt: new Date(),
    })
    return c.json({ success: true, data })
})

dashRoutes.get('/databases', isAdmin(), async (c) => {
    const data = await clientDb('dash').collection('databases').find().toArray()
    return c.json({ success: true, data })
})

dashRoutes.post('/tokens', isAdmin(), async (c) => {
    const { database } = await c.req.json()
    const isDatabase = await clientDb('dash').collection('databases').findOne({ _id: ObjectId.createFromHexString(database) })
    if (!isDatabase?._id) {
        return c.json({ success: false, message: 'Database not found' })
    }
    const token = crypto.randomUUID()
    await clientDb('dash').collection('tokens').insertOne({
        token,
        database: isDatabase._id.toString(),
    })
    await clientRedis.set(`token:${token}`, isDatabase._id.toString())
    return c.json({ success: true, data: token })
})

dashRoutes.delete('/tokens/:database/:token', isAdmin(), async (c) => {
    const token = c.req.param('token')
    const database = c.req.param('database')
    await clientDb('dash').collection('tokens').findOneAndDelete({ token, database })
    await clientRedis.del(`token:${token}`)
    return c.json({ success: true })
})
