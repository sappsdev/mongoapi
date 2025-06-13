import { ObjectId, Decimal128 } from 'mongodb';

function isPossiblyObjectIdKey(key: string): boolean {
    return key === '_id' || key.endsWith('Id') || key.endsWith('_id');
}

function isPossiblyDecimalKey(key: string): boolean {
    const decimalKeywords = ['amount', 'price', 'total', 'balance', 'value'];
    return decimalKeywords.some(k => key.toLowerCase().includes(k));
}

function convertToObjectIdIfValid(value: any): any {
    return (typeof value === 'string' && ObjectId.isValid(value))
        ? new ObjectId(value)
        : value;
}

function convertToDecimalIfValid(value: any): any {
    if (typeof value === 'string' || typeof value === 'number') {
        if (!isNaN(Number(value))) {
            return Decimal128.fromString(String(value));
        }
    }
    return value;
}

export function parseMongo(obj: any, parentKey = ''): any {
    if (Array.isArray(obj)) {
        return obj.map((item) => parseMongo(item, parentKey));
    }

    if (obj && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
            const value = obj[key];

            const isOperator = key.startsWith('$');
            if (isOperator) {
                newObj[key] = parseMongo(value, parentKey);
            } else {
                const nextParentKey = key;
                let parsedValue = parseMongo(value, nextParentKey);

                if (isPossiblyObjectIdKey(nextParentKey)) {
                    parsedValue = convertToObjectIdIfValid(parsedValue);
                } else if (isPossiblyDecimalKey(nextParentKey)) {
                    parsedValue = convertToDecimalIfValid(parsedValue);
                }

                newObj[key] = parsedValue;
            }
        }
        return newObj;
    }

    return obj;
}
