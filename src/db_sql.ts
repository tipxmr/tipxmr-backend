import { v4 as generateUUID } from "uuid";
// @ts-ignore
import { connectToDaemonRpc } from "monero-javascript";
import { defaultStreamerConfig } from "./data/defaultStreamerConfig";
import { testStreamers } from "./data/streamerTestDB";
import { Streamer } from "./data/Streamer";
import { success, failure, Result } from "./results";
import * as pg from "pg";
import fs from "fs";

const { Client } = pg;
const client = new Client({
  user: "tipxmr",
  host: "postgres",
  database: "tipxmr",
  password: "tipxmr",
  port: 5432,
});
client.connect();

const initDatabaseQueries = fs
  .readFileSync("./sql/init.sql")
  .toString()
  .replace(/(\r\n|\n|\r)/gm, " ") // remove newlines
  .replace(/\s+/g, " ") // excess white space
  .split(";") // split into all statements
  .map(Function.prototype.call, String.prototype.trim)
  .filter((el) => el.length !== 0); // remove any empty ones;

initDatabaseQueries.forEach((query: pg.Query) => {
  client.query(query);
});
client.end;

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
