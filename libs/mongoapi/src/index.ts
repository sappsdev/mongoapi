import { DeleteResult, Document, InsertManyResult, InsertOneResult, OptionalUnlessRequiredId, UpdateFilter, UpdateResult } from "mongodb";
import { FindOneAndDeleteResult, FindOneAndUpdateResult, MongoApiOptions, TransactionOperation, TransactionResult } from "./types";

class MongoApiCollection<T extends Document = Document> {
    constructor(
        private collectionName: string,
        private mongoApi: MongoApi
    ) { }

    async findOne(query: Document = {}): Promise<T | null> {
        return this.mongoApi.makeRequest<T | null>('findone', {
            collection: this.collectionName,
            query
        });
    }

    async find(query: Document = {}): Promise<T[]> {
        return this.mongoApi.makeRequest<T[]>('find', {
            collection: this.collectionName,
            query
        });
    }

    async insertOne(document: OptionalUnlessRequiredId<T>): Promise<InsertOneResult> {
        return this.mongoApi.makeRequest<InsertOneResult>('insertone', {
            collection: this.collectionName,
            document
        });
    }

    async insertMany(documents: OptionalUnlessRequiredId<T>[]): Promise<InsertManyResult> {
        return this.mongoApi.makeRequest<InsertManyResult>('insertmany', {
            collection: this.collectionName,
            documents
        });
    }

    async updateOne(filter: Document, update: UpdateFilter<T>): Promise<UpdateResult> {
        return this.mongoApi.makeRequest<UpdateResult>('updateone', {
            collection: this.collectionName,
            filter,
            update
        });
    }

    async updateMany(filter: Document, update: UpdateFilter<T>): Promise<UpdateResult> {
        return this.mongoApi.makeRequest<UpdateResult>('updatemany', {
            collection: this.collectionName,
            filter,
            update
        });
    }

    async deleteOne(filter: Document): Promise<DeleteResult> {
        return this.mongoApi.makeRequest<DeleteResult>('deleteone', {
            collection: this.collectionName,
            filter
        });
    }

    async deleteMany(filter: Document): Promise<DeleteResult> {
        return this.mongoApi.makeRequest<DeleteResult>('deletemany', {
            collection: this.collectionName,
            filter
        });
    }

    async findOneAndUpdate(query: Document, update: UpdateFilter<T>): Promise<FindOneAndUpdateResult<T>> {
        return this.mongoApi.makeRequest<FindOneAndUpdateResult<T>>('findoneandupdate', {
            collection: this.collectionName,
            query,
            update
        });
    }

    async findOneAndDelete(query: Document): Promise<FindOneAndDeleteResult<T>> {
        return this.mongoApi.makeRequest<FindOneAndDeleteResult<T>>('findoneanddelete', {
            collection: this.collectionName,
            query
        });
    }

    async countDocuments(filter: Document = {}): Promise<number> {
        return this.mongoApi.makeRequest<number>('count', {
            collection: this.collectionName,
            filter
        });
    }

    async distinct<K extends keyof T>(field: K, filter: Document = {}): Promise<T[K][]> {
        return this.mongoApi.makeRequest<T[K][]>('distinct', {
            collection: this.collectionName,
            field: field as string,
            filter
        });
    }

    async aggregate<U = T>(pipeline: Document[]): Promise<U[]> {
        return this.mongoApi.makeRequest<U[]>('aggregate', {
            collection: this.collectionName,
            pipeline
        });
    }

    async paginate(query: Document = {}, page: number = 1, limit: number = 10): Promise<T[]> {
        return this.mongoApi.makeRequest<T[]>('paginate', {
            collection: this.collectionName,
            query,
            page,
            limit
        });
    }

    async createIndex(index: Document): Promise<string> {
        return this.mongoApi.makeRequest<string>('createindex', {
            collection: this.collectionName,
            index
        });
    }

    async createIndexes(indexes: Document[]): Promise<string[]> {
        return this.mongoApi.makeRequest<string[]>('createindexes', {
            collection: this.collectionName,
            indexes
        });
    }

    async dropIndex(index: string): Promise<string> {
        return this.mongoApi.makeRequest<string>('dropindex', {
            collection: this.collectionName,
            index
        });
    }

}

export class MongoApi {
    constructor(private config: MongoApiOptions) { }

    collection<T extends Document = Document>(name: string): MongoApiCollection<T> {
        return new MongoApiCollection<T>(name, this);
    }

    async listCollections(): Promise<Document[]> {
        return this.makeRequest<Document[]>('listcollections', {});
    }

    async transaction<T extends Document = Document>(operations: TransactionOperation<T>[]): Promise<TransactionResult> {
        return this.makeRequest<TransactionResult>('transaction', {
            operations
        });
    }

    async transactionBulk<T extends Document = Document>(operations: TransactionOperation<T>[]): Promise<TransactionResult> {
        return this.makeRequest<TransactionResult>('transaction-bulk', {
            operations
        });
    }

    async makeRequest<T>(endpoint: string, body: any): Promise<T> {
        const url = `${this.config.url}/db/${endpoint}/${this.config.database}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return response.json() as Promise<T>;
    }
}