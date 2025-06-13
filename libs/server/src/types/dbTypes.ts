import { Document } from 'mongodb';

export interface BaseOperation {
    collection: string;
    method: string;
}

export interface InsertOneOperation extends BaseOperation {
    method: 'insertOne';
    document: Document;
}

export interface InsertManyOperation extends BaseOperation {
    method: 'insertMany';
    documents: Document[];
}

export interface UpdateOneOperation extends BaseOperation {
    method: 'updateOne';
    filter: Document;
    update: Document;
}

export interface UpdateManyOperation extends BaseOperation {
    method: 'updateMany';
    filter: Document;
    update: Document;
}

export interface DeleteOneOperation extends BaseOperation {
    method: 'deleteOne';
    filter: Document;
}

export interface DeleteManyOperation extends BaseOperation {
    method: 'deleteMany';
    filter: Document;
}

export interface FindOneOperation extends BaseOperation {
    method: 'findOne';
    query?: Document;
}

export interface FindOperation extends BaseOperation {
    method: 'find';
    query?: Document;
}

export interface CountOperation extends BaseOperation {
    method: 'countDocuments';
    filter?: Document;
}

export interface DistinctOperation extends BaseOperation {
    method: 'distinct';
    field: string;
    filter?: Document;
}

export interface AggregateOperation extends BaseOperation {
    method: 'aggregate';
    pipeline: Document[];
}

export type Operation =
    | InsertOneOperation
    | InsertManyOperation
    | UpdateOneOperation
    | UpdateManyOperation
    | DeleteOneOperation
    | DeleteManyOperation
    | FindOneOperation
    | FindOperation
    | CountOperation
    | DistinctOperation
    | AggregateOperation;

export interface TransactionRequest {
    db: string;
    operations: Operation[];
}