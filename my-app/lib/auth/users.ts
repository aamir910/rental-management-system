import { COLLECTIONS, getDb } from "@/lib/mongo/client";
import type { AppUser, DummyBilling, UserPlan, UserRole } from "@/lib/auth/types";
import { ObjectId } from "mongodb";

type UserDoc = Omit<AppUser, "_id"> & { _id: ObjectId };

function mapUser(doc: UserDoc): AppUser {
  return {
    _id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    passwordHash: doc.passwordHash,
    role: doc.role,
    plan: doc.plan,
    googleId: doc.googleId,
    billing: doc.billing,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const db = await getDb();
  const doc = await db
    .collection<UserDoc>(COLLECTIONS.users)
    .findOne({ email: email.toLowerCase().trim() });
  return doc ? mapUser(doc) : null;
}

export async function findUserById(id: string): Promise<AppUser | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db
    .collection<UserDoc>(COLLECTIONS.users)
    .findOne({ _id: new ObjectId(id) });
  return doc ? mapUser(doc) : null;
}

export async function findUserByGoogleId(
  googleId: string
): Promise<AppUser | null> {
  const db = await getDb();
  const doc = await db
    .collection<UserDoc>(COLLECTIONS.users)
    .findOne({ googleId });
  return doc ? mapUser(doc) : null;
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash?: string | null;
  role?: UserRole;
  plan: UserPlan;
  googleId?: string | null;
  billing?: DummyBilling | null;
}): Promise<AppUser> {
  const db = await getDb();
  const now = new Date();
  const doc: UserDoc = {
    _id: new ObjectId(),
    email: input.email.toLowerCase().trim(),
    name: input.name.trim(),
    passwordHash: input.passwordHash ?? null,
    role: input.role ?? "owner",
    plan: input.plan,
    googleId: input.googleId ?? null,
    billing: input.billing ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.collection<UserDoc>(COLLECTIONS.users).insertOne(doc);
  return mapUser(doc);
}

export async function linkGoogleId(userId: string, googleId: string) {
  if (!ObjectId.isValid(userId)) return;
  const db = await getDb();
  await db.collection(COLLECTIONS.users).updateOne(
    { _id: new ObjectId(userId) },
    { $set: { googleId, updatedAt: new Date() } }
  );
}

export async function updateUserPlan(userId: string, plan: UserPlan) {
  if (!ObjectId.isValid(userId)) return;
  const db = await getDb();
  await db.collection(COLLECTIONS.users).updateOne(
    { _id: new ObjectId(userId) },
    { $set: { plan, updatedAt: new Date() } }
  );
}

export async function ensureIndexes() {
  const db = await getDb();
  await db
    .collection(COLLECTIONS.users)
    .createIndex({ email: 1 }, { unique: true });
  await db
    .collection(COLLECTIONS.users)
    .createIndex({ googleId: 1 }, { sparse: true });
}
