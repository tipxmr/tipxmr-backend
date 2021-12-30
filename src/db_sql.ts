import { v4 as generateUUID } from "uuid";
// @ts-ignore
import { connectToDaemonRpc } from "monero-javascript";
import { testStreamers } from "./data/streamerTestDB";
import { Streamer } from "./data/Streamer";
import pg from "pg";
import { types, tables } from "./sql/init";

const { Client } = pg;
const client = new Client({
  user: "tipxmr",
  host: process.env.DB_HOST,
  database: "tipxmr",
  password: "tipxmr",
  port: 5432,
});

const connectToDb = async () => {
  const startedAt = new Date().getTime();
  try {
    await client.connect();
    console.log(`Connected to DB`);
  } catch (error) {
    console.error(error);
    console.log("startedAt", startedAt);
    console.log("crashedAt", new Date().getTime());
    setTimeout(() => {
      connectToDb();
    }, 1000);
  }
};

await connectToDb();

const printCreatedType = (sql: String) => {
  const type = sql.split("CREATE TYPE ")[1].split(" ")[0];
  console.log(`Creating type [${type}]`);
};

const printCreatedTable = (sql: String) => {
  const table = sql.split("CREATE TABLE ")[1].split(" ")[0];
  console.log(`Creating table [${table}]`);
};

// DB Init

types.forEach((type) => {
  client
    .query(type)
    .then((res) => printCreatedType(type))
    .catch((e) => console.error(e.stack));
});

tables.forEach((table) => {
  client
    .query(table)
    .then((res) => printCreatedTable(table))
    .catch((e) => console.error(e.stack));
});

const daemon = connectToDaemonRpc(
  process.env.MONERO_DAEMON_URL,
  process.env.MONERO_DAEMON_USER,
  process.env.MONERO_DAEMON_PASSWORD
);

// ===============================================================
// DB operations
// ===============================================================
const generateAnimationId = () => generateUUID().split("-").join("");

export const getStreamer = async (selector: Partial<Streamer>) => {
  const result = await client.query(`SELECT * FROM streamer WHERE ${selector}`);
  return result;
};

const insertStreamer = async (streamer: Streamer) => {
    const query = {
      text: "INSERT INTO streamer(id, name, alias, socket) VALUES($1, $2, $3, $4)",
      values: [
        streamer._id.slice(0, 11),
        streamer.userName,
        streamer.displayName,
        streamer.streamerSocketId || null,
      ],
    };
    client
      .query(query)
      .then((res) => console.log("Inserted streamer", streamer.userName))
      .catch((err) => console.error(err));
};


const populateTables = async () => {
  testStreamers.map(async (streamer) => {
    await insertStreamer(streamer);
  })
} 

await populateTables();
