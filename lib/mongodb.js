import { MongoClient } from 'mongodb';


const MONGODB_URI = "mongodb+srv://cosminstefan189:3kBnvRGgeeyfdlQg@cluster0.k97li.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const MONGODB_DB = "Cluster0";
console.log(MONGODB_DB,MONGODB_URI )
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();

  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
