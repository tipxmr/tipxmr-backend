import { v4 as generateUUID } from "uuid";
// @ts-ignore
import { connectToDaemonRpc } from "monero-javascript";
import { testStreamers } from "./data/streamerTestDB";
import { Streamer } from "./data/Streamer";
import pkg, { Prisma } from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const daemon = connectToDaemonRpc(
  process.env.MONERO_DAEMON_URL,
  process.env.MONERO_DAEMON_USER,
  process.env.MONERO_DAEMON_PASSWORD
);

// ===============================================================
// DB operations
// ===============================================================
const generateAnimationId = () => generateUUID().split("-").join("");

const findManyStreamers = async (
  selector: Prisma.StreamerScalarFieldEnum,
  searchTerm: any
) => {
  return prisma.streamer.findMany({
    where: { [selector]: searchTerm }
  });
};

const getStreamerById = async (id: Streamer["_id"]) => {
  return prisma.streamer.findUnique({
    where: { id: id },
  });
};

const insertStreamer = async (streamer: Streamer) => {
  return prisma.streamer.create({
    data: {
      id: streamer._id.slice(0, 11),
      name: streamer.userName,
      alias: streamer.displayName,
      socket: streamer.streamerSocketId || null,
    },
  });
};

const populateTables = async () => {
  const promises = testStreamers.map(insertStreamer)
  return Promise.all(promises);
};

if ((await prisma.streamer.count()) === 0) {
  await populateTables();
}