import { Db, MongoClient, type MongoClientOptions } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function cleanUri(value: string | undefined) {
  if (!value) return "";
  return value.trim().replace(/^["']|["']$/g, "");
}

function getUri() {
  return cleanUri(process.env.MONGODB_URI);
}

/** Keep options minimal — forcing family/tls breaks TLS on some Windows + Atlas setups. */
const clientOptions: MongoClientOptions = {
  serverSelectionTimeoutMS: 20000,
  connectTimeoutMS: 20000,
};

function createClientPromise() {
  const uri = getUri();
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }

  const client = new MongoClient(uri, clientOptions);
  return client.connect().catch((err: unknown) => {
    global._mongoClientPromise = undefined;
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `MongoDB connection failed: ${message}. Check MONGODB_URI, Atlas Network Access (0.0.0.0/0), and DB user password.`
    );
  });
}

function getClientPromise() {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise();
    }
    return global._mongoClientPromise;
  }

  return createClientPromise();
}

export async function getMongoClient() {
  return getClientPromise();
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(cleanUri(process.env.MONGODB_DB) || "yasin_rms");
}

export const COLLECTIONS = {
  users: "users",
  tenants: "tenants",
  rentPayments: "rent_payments",
  utilityBills: "utility_bills",
  reminders: "reminders",
  dailyExpenses: "daily_expenses",
} as const;
