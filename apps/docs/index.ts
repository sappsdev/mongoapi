import { MongoApi } from "mongo-api-client";

const clientDb = new MongoApi({
    url: 'http://localhost:3000',
    database: '684b410d33fd62d7011c1df4',
    token: '4cafa057-a921-4a9d-a4e8-bc0430578f2a'
});
const inseted = await clientDb.collection("users").insertOne({
    name: 'Varb',
    email: 'varb@example.com'
})
const findOne = await clientDb.collection("users").findOne({
    _id: "684b5f08f700bd8df9465e6e"
})
console.log(inseted)
console.log(findOne)
console.log("Hello via Bun!");