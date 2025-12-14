import {MongoClient } from "mongodb";

// Pull connection string from environment
const uri = process.env.MONGODB_URI || "";
const options = {
  //tls: true,
  //ssl:true // Use TLS for modern MongoDB drivers and servers
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Initialize connection lazily (only when actually needed, not at build time)
function getClientPromise(): Promise<MongoClient> {
  // Error if the connection string isn't configured properly
  if (!uri) {
    throw new Error("Please add your MongoDB URI to .env.local");
  }

  if (clientPromise) {
    return clientPromise;
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
  
  return clientPromise;
}
// Utility to connect to MongoDB
export async function connectToDatabase() {
  try {
    const clientInstance = await getClientPromise();
    const db = clientInstance.db(process.env.DB_NAME); // You can specify database name here if necessary
    return { client: clientInstance, db };
  } catch (error) {
    // console.error("MongoDB connection error:", error);
    throw error; // Re-throw for upstream debugging
  }
}
