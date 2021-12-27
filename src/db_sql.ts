import { v4 as generateUUID } from "uuid";
// @ts-ignore
import { connectToDaemonRpc } from "monero-javascript";
//import { testStreamers } from "./data/streamerTestDB";
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

try {
  await client.connect();
  console.log(`Connected to DB`);
} catch (error) {
  console.error(error);
}

// DB Init

types.forEach((type) => {
  client.query(type);
});

tables.forEach((table) => {
  client.query(table);
});

/* const daemon = connectToDaemonRpc(
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

export const populateTestStreamers = async (): Promise<void> => {
  const streamers = testStreamers
    .filter((testStreamer) => Object.keys(testStreamer).length)
    .map((testStreamer) => {
      const animationId = generateAnimationId();
      console.log(animationId);
      return {
        ...testStreamer,
        animationId,
        _id: testStreamer._id,
      };
    });
  streamers.map((streamer) => {
    client
      .query(
        `INSERT INTO streamer (id, name, alias, socket) VALUES (${streamer._id}, ${streamer.userName}, ${streamer.displayName}, ${streamer.streamerSocketId})`
      )
      .then(() => console.log("susccess"))
      .catch((err) => console.error(err));
  });
  return;
}; */

//await populateTestStreamers();
