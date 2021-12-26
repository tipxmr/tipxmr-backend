import { v4 as generateUUID } from "uuid";
// @ts-ignore
import { connectToDaemonRpc } from "monero-javascript";
import { defaultStreamerConfig } from "./data/defaultStreamerConfig";
import { testStreamers } from "./data/streamerTestDB";
import { Streamer } from "./data/Streamer";
import { success, failure, Result } from "./results";
import pg from "pg";
import fs from "fs";
import { types, tables } from "./sql/init.js";

const { Client } = pg;
const client = new Client({
  user: "tipxmr",
  host: "172.23.0.2",
  database: "tipxmr",
  password: "tipxmr",
  port: 5432,
});

try {
  await client.connect();
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

// client.end();

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
  const result = await client.query("SELECT * FROM streamer WHERE ${selector}"); // todo
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
    client.query("INSERT INTO streamer(_id) ");
  });

  console.log("Populating test steamer data...");
  return;
};
 */
