import { MongoClient, Collection } from "mongodb";

export interface LinkDoc {
  code: string;
  url: string;
  clicks: number;
  createdAt: Date;
  lastClickedAt?: Date;
}

declare global {
  // Cache di global supaya koneksi dipakai ulang antar invocation (warm start)
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _linksIndexReady: Promise<unknown> | undefined;
}

function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Environment variable MONGODB_URI belum diset");
  }

  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri)
      .connect()
      .catch((err) => {
        global._mongoClientPromise = undefined; // coba lagi di request berikutnya
        throw err;
      });
  }
  return global._mongoClientPromise;
}

export async function getLinks(): Promise<Collection<LinkDoc>> {
  const client = await getClient();
  const links = client
    .db(process.env.MONGODB_DB || "shortener")
    .collection<LinkDoc>("links");

  if (!global._linksIndexReady) {
    global._linksIndexReady = links.createIndex({ code: 1 }, { unique: true });
  }
  await global._linksIndexReady;

  return links;
}
