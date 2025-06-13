# 📦 mongoapi

Una librería TypeScript ligera y fácil de usar para interactuar con una API REST que actúa como proxy de MongoDB. Esta librería permite trabajar con colecciones MongoDB usando una interfaz similar al driver oficial, pero mediante HTTP.

## 🚀 Instalación

```bash
npm install mongoapi
```

## 🧠 Requisitos

Tu servidor debe exponer un endpoint compatible con las rutas esperadas por esta librería, como:

```
POST /db/{endpoint}/{database}
```

Y aceptar un token JWT para autenticación.

## ⚙️ Uso básico

```ts
import { MongoApi } from "mongo-api-client";

const clientDb = new MongoApi({
  url: "http://localhost:3000", // URL de tu API Mongo REST
  database: "684b410d33fd62d7011c1df4", // ID o nombre de la base de datos
  token: "4cafa057-a921-4a9d-a4e8-bc0430578f2a", // Token de autenticación
});

// Insertar un documento
const inserted = await clientDb.collection("users").insertOne({
  name: "Varb",
  email: "varb@example.com",
});

// Buscar un documento
const user = await clientDb.collection("users").findOne({
  _id: "684b5f08f700bd8df9465e6e",
});
```

## 🧩 Métodos disponibles

### 🔍 Lectura

- `find(query)`
- `findOne(query)`
- `countDocuments(filter)`
- `distinct(field, filter?)`
- `aggregate(pipeline)`
- `paginate(query?, page?, limit?)`

### ✏️ Escritura

- `insertOne(document)`
- `insertMany(documents)`
- `updateOne(filter, update)`
- `updateMany(filter, update)`
- `deleteOne(filter)`
- `deleteMany(filter)`
- `findOneAndUpdate(query, update)`
- `findOneAndDelete(query)`

### ⚙️ Administración

- `createIndex(index)`
- `listCollections()`

### 💳 Transacciones

- `transaction(operations)`
- `transactionBulk(operations)`

## 💡 Tipado

Puedes definir el tipo de tus documentos para obtener autocompletado e inferencia:

```ts
interface User {
  name: string;
  email: string;
}

const users = clientDb.collection<User>("users");

const result = await users.insertOne({
  name: "Alice",
  email: "alice@example.com",
});
```

## 🧪 Ejemplo completo

```ts
interface Product {
  name: string;
  price: number;
  stock: number;
}

const db = new MongoApi({
  url: "http://localhost:3000",
  database: "mydb",
  token: "secure-token",
});

const products = db.collection<Product>("products");

await products.insertMany([
  { name: "Keyboard", price: 25, stock: 100 },
  { name: "Mouse", price: 15, stock: 150 },
]);

const cheapProducts = await products.find({ price: { $lt: 20 } });
```

## 🛡️ Seguridad

La conexión se realiza mediante token en el header:

```json
Authorization: Bearer <token>
```

Asegúrate de proteger tu endpoint y validar el token en tu backend.

## 🧱 Construido con

- TypeScript
- MongoDB (vía API REST personalizada)

## 📄 Licencia

MIT
