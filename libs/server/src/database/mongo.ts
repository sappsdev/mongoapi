import { Db, MongoClient } from "mongodb";

export const clientMongo = new MongoClient(process.env.MONGODB_URI!);

export const mongoInit = async () => {
    await clientMongo.connect();
    console.log("Connected successfully to database");
};

export const clientDb = (database: string): Db => clientMongo.db(database);