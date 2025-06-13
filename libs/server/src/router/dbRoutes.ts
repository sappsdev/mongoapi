
import { Hono } from "hono"
import { clientDb, clientMongo } from "../database/mongo"
import { ClientSession, Collection, Document, ObjectId } from 'mongodb';
import { Operation, TransactionRequest } from "../types/dbTypes";
import { parseMongo } from "../utils/parseMongo";

export const dbRoutes = new Hono().basePath('/db')

dbRoutes.post('/findone/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, query } = await c.req.json()
    try {
        console.log(parseMongo(query))
        const res = await clientDb(db).collection(collection).findOne(parseMongo(query))
        return c.json(res)
    } catch (error) {
        console.error(error)
    }
})

dbRoutes.post('/findoneandupdate/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, query, update } = await c.req.json()
    const res = await clientDb(db).collection(collection).findOneAndUpdate(parseMongo(query), parseMongo(update))
    return c.json(res)
})

dbRoutes.post('/findoneanddelete/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, query } = await c.req.json()
    const res = await clientDb(db).collection(collection).findOneAndDelete(parseMongo(query))
    return c.json(res)
})

dbRoutes.post('/find/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, query } = await c.req.json()
    const res = await clientDb(db).collection(collection).find(parseMongo(query)).toArray()
    return c.json(res)
})

dbRoutes.post('/insertone/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, document } = await c.req.json()
    const res = await clientDb(db).collection(collection).insertOne(document)
    return c.json(res)
})

dbRoutes.post('/insertmany/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, documents } = await c.req.json()
    const res = await clientDb(db).collection(collection).insertMany(documents)
    return c.json(res)
})

dbRoutes.post('/updateone/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, filter, update } = await c.req.json()
    const res = await clientDb(db).collection(collection).updateOne(parseMongo(filter), parseMongo(update))
    return c.json(res)
})

dbRoutes.post('/updatemany/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, filter, update } = await c.req.json()
    const res = await clientDb(db).collection(collection).updateMany(parseMongo(filter), parseMongo(update))
    return c.json(res)
})

dbRoutes.post('/deleteone/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, filter } = await c.req.json()
    const res = await clientDb(db).collection(collection).deleteOne(parseMongo(filter))
    return c.json(res)
})

dbRoutes.post('/deletemany/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, filter } = await c.req.json()
    const res = await clientDb(db).collection(collection).deleteMany(parseMongo(filter))
    return c.json(res)
})

dbRoutes.post('/count/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, filter } = await c.req.json()
    const res = await clientDb(db).collection(collection).countDocuments(parseMongo(filter))
    return c.json(res)
})

dbRoutes.post('/distinct/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, field, filter } = await c.req.json()
    const res = await clientDb(db).collection(collection).distinct(field, parseMongo(filter))
    return c.json(res)
})
dbRoutes.post('/aggregate/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, pipeline } = await c.req.json()
    const res = await clientDb(db).collection(collection).aggregate(parseMongo(pipeline)).toArray()
    return c.json(res)
})

dbRoutes.post('/paginate/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, query, page, limit } = await c.req.json()
    const res = await clientDb(db).collection(collection).find(parseMongo(query)).skip((page - 1) * limit).limit(limit).toArray()
    return c.json(res)
})

dbRoutes.post('/createindex/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, index } = await c.req.json()
    const res = await clientDb(db).collection(collection).createIndex(index)
    return c.json(res)
})

dbRoutes.post('/createindexes/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, indexes } = await c.req.json()
    const res = await clientDb(db).collection(collection).createIndexes(indexes)
    return c.json(res)
})

dbRoutes.post('/dropindex/:database', async (c) => {
    const db = c.req.param("database")
    const { collection, index } = await c.req.json()
    const res = await clientDb(db).collection(collection).dropIndex(index)
    return c.json(res)
})

dbRoutes.post('/listcollections/:database', async (c) => {
    const db = c.req.param("database")
    const res = await clientDb(db).listCollections().toArray()
    return c.json(res)
})

dbRoutes.post('/transaction/:database', async (c) => {
    try {
        const db = c.req.param("database")
        const { operations }: TransactionRequest = await c.req.json();

        const session: ClientSession = clientMongo.startSession();

        try {
            const results: any[] = await session.withTransaction(async () => {
                const transactionResults: any[] = [];

                for (const operation of operations) {
                    const { collection: collectionName } = operation;
                    const mongoCollection = clientDb(db).collection(collectionName);

                    const result = await executeOperation(mongoCollection, operation, session);
                    transactionResults.push(result);
                }

                return transactionResults;
            });

            return c.json({
                success: true,
                results: results
            });

        } finally {
            await session.endSession();
        }

    } catch (error) {
        console.error('Error en transacción:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, 500);
    }
})

dbRoutes.post('/transaction-bulk/:database', async (c) => {
    try {
        const db = c.req.param("database")
        const { operations }: TransactionRequest = await c.req.json();
        const session: ClientSession = clientMongo.startSession();
        session.startTransaction();
        try {
            const results: any[] = [];
            for (const operation of operations) {
                const { collection: collectionName } = operation;
                const mongoCollection = clientDb(db).collection(collectionName);

                const result = await executeOperation(mongoCollection, operation, session);
                results.push(result);
            }
            await session.commitTransaction();
            return c.json({
                success: true,
                results: results
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    } catch (error) {
        console.error('Error en transacción bulk:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, 500);
    }
})

async function executeOperation(
    collection: Collection<Document>,
    operation: Operation,
    session: ClientSession
): Promise<any> {
    const { method } = operation;

    switch (method) {
        case 'insertOne':
            if (!operation.document) {
                throw new Error('insertOne requiere el parámetro "document"');
            }
            return await collection.insertOne(operation.document, { session });
        case 'insertMany':
            if (!operation.documents || !Array.isArray(operation.documents)) {
                throw new Error('insertMany requiere el parámetro "documents" como array');
            }
            return await collection.insertMany(operation.documents, { session });
        case 'updateOne':
            if (!operation.filter || !operation.update) {
                throw new Error('updateOne requiere los parámetros "filter" y "update"');
            }
            return await collection.updateOne(parseMongo(operation.filter), parseMongo(operation.update), { session });
        case 'updateMany':
            if (!operation.filter || !operation.update) {
                throw new Error('updateMany requiere los parámetros "filter" y "update"');
            }
            return await collection.updateMany(parseMongo(operation.filter), parseMongo(operation.update), { session });
        case 'deleteOne':
            if (!operation.filter) {
                throw new Error('deleteOne requiere el parámetro "filter"');
            }
            return await collection.deleteOne(parseMongo(operation.filter), { session });
        case 'deleteMany':
            if (parseMongo(!operation.filter)) {
                throw new Error('deleteMany requiere el parámetro "filter"');
            }
            return await collection.deleteMany(parseMongo(operation.filter), { session });
        case 'findOne':
            return await collection.findOne(parseMongo(operation.query) || {}, { session });
        case 'find':
            return await collection.find(parseMongo(operation.query) || {}, { session }).toArray();
        case 'countDocuments':
            return await collection.countDocuments(operation.filter || {}, { session });
        case 'distinct':
            if (!operation.field) {
                throw new Error('distinct requiere el parámetro "field"');
            }
            return await collection.distinct(operation.field, operation.filter || {}, { session });
        case 'aggregate':
            if (!operation.pipeline || !Array.isArray(operation.pipeline)) {
                throw new Error('aggregate requiere el parámetro "pipeline" como array');
            }
            return await collection.aggregate(parseMongo(operation.pipeline), { session }).toArray();
        default:
            throw new Error(`Método no soportado: ${method}`);
    }
}