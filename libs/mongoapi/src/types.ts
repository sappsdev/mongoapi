import type { ObjectId, Document, InsertOneResult as MongoInsertOneResult, InsertManyResult as MongoInsertManyResult, UpdateResult as MongoUpdateResult, DeleteResult as MongoDeleteResult, ModifyResult, Filter, UpdateFilter, OptionalUnlessRequiredId } from "mongodb";

export interface MongoApiOptions {
    url: string;
    database: string;
    token: string;
}

export interface InsertOneResult {
    acknowledged: boolean;
    insertedId: string;
}

export interface InsertManyResult {
    acknowledged: boolean;
    insertedCount: number;
    insertedIds: { [key: number]: string };
}

export interface UpdateResult extends Omit<MongoUpdateResult<Document>, 'upsertedId'> {
    acknowledged: boolean;
    matchedCount: number;
    modifiedCount: number;
    upsertedCount: number;
    upsertedId?: ObjectId;
}

export interface DeleteResult extends MongoDeleteResult {
    acknowledged: boolean;
    deletedCount: number;
}

export interface FindOneAndUpdateResult<T extends Document = Document> extends Omit<ModifyResult<T>, 'value' | 'ok'> {
    value: T | null;
    ok: number;
}

export interface FindOneAndDeleteResult<T extends Document = Document> extends Omit<ModifyResult<T>, 'value' | 'ok'> {
    value: T | null;
    ok: number;
}

export interface TransactionOperation<T extends Document = Document> {
    collection: string;
    method: string;
    document?: OptionalUnlessRequiredId<T>;
    documents?: OptionalUnlessRequiredId<T>[];
    filter?: Filter<T>;
    update?: UpdateFilter<T>;
    query?: Filter<T>;
    field?: string;
    pipeline?: Document[];
}

export interface TransactionRequest<T extends Document = Document> {
    operations: TransactionOperation<T>[];
}

export interface TransactionResult {
    success: boolean;
    results?: any[];
    error?: string;
}