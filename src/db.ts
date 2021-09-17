import { v4 as generateUUID } from "uuid";
// @ts-ignore
import { connectToDaemonRpc } from "monero-javascript";
import PouchDB from "pouchdb";
import pouchdbUpsert from "pouchdb-upsert";
import pouchdbFind from "pouchdb-find";
import pouchdbAdapterMemory from "pouchdb-adapter-memory";
import { defaultStreamerConfig } from "./data/defaultStreamerConfig";
import { testStreamers } from "./data/streamerTestDB";
import { Streamer } from "./data/Streamer";
import { success, failure, Result } from "./results";

PouchDB.plugin(pouchdbUpsert);
PouchDB.plugin(pouchdbFind);
PouchDB.plugin(pouchdbAdapterMemory);

const db = new PouchDB<Streamer>("streamers", { adapter: "memory" });

const daemon = connectToDaemonRpc(
  process.env.MONERO_DAEMON_URL,
  process.env.MONERO_DAEMON_USER,
  process.env.MONERO_DAEMON_PASSWORD
);

// ===============================================================
// DB operations
// ===============================================================
const generateAnimationId = () => generateUUID().split("-").join("");

export const getStreamer = async (
  selector: Partial<Streamer>
): Promise<Result<Streamer, Error>> => {
  try {
    const streamerFind = await db.find({
      selector,
    });
    if (streamerFind.docs.length) {
      const streamer = streamerFind.docs[0];
      return success(streamer);
    } else {
      return failure(new Error("streamer not found"));
    }
  } catch (err) {
    console.log(err);
    if (err instanceof Error) {
      return failure(err);
    }
    return failure(new Error());
  }
};

export const loginStreamer = async (
  socketId: string,
  _id: string,
  userName: string | null
): Promise<Result<Streamer, Error>> => {
  console.log(socketId, _id, userName);
  const result = await getStreamer({ _id });
  // When success, then streamer is already in DB
  if (result.isSuccess()) {
    return result;
  } else {
    // _id is not registered in DB, so create new User
    if (userName) {
      console.log("streamer not found in db, creating new user now");
      const result = await createStreamer(socketId, _id, userName);
      if (result.isSuccess()) {
        return result;
      } else {
        return failure(new Error("Username is already taken"));
      }
    } else {
      return failure(
        new Error("_id not found and no userName for userCreation was sent")
      );
    }
  }
};

// add a new streamer (register process), username needs to be unique
export const createStreamer = async (
  socketId: string,
  _id: string,
  userName: string
): Promise<Result<Streamer, Error>> => {
  try {
    // step 1: check if username ist taken
    const result = await getStreamer({ userName });
    if (result.isSuccess()) {
      const streamer = result.unwrap();
      console.log(streamer.userName + " is taken");
      return failure(new Error(`userName ${streamer.userName} is taken`));
    } else {
      // step 2: if there is nobody with that username, create the object in the db
      const newStreamer = {
        ...defaultStreamerConfig,
        _id,
        userName,
        streamerSocketId: socketId,
        restoreHeight: await daemon.getHeight(),
        creationDate: new Date(),
      };
      const result = await db.putIfNotExists(newStreamer);
      console.log(newStreamer.userName + " successfully created");
      return success(newStreamer);
    }
  } catch (err) {
    console.log("Something went wrong with createStreamer", err);
    if (err instanceof Error) {
      return failure(err);
    }
    return failure(new Error());
  }
};

export const updateStreamer = async (
  newStreamerConfig: Streamer
): Promise<Result<boolean, Error>> => {
  try {
    console.log("Updated streamer: " + newStreamerConfig.displayName);
    const result = await db.upsert(newStreamerConfig._id, () => {
      return newStreamerConfig;
    });
    return success(result.updated);
  } catch (err) {
    if (err instanceof Error) {
      return failure(err);
    }
    return failure(new Error());
  }
};

// update online status of streamer
export const updateOnlineStatusOfStreamer = async (
  _id: string,
  newOnlineStatus: boolean
): Promise<Result<boolean, Error>> => {
  // can only update existing entries
  try {
    const streamer = { ...(await db.get(_id)), isOnline: newOnlineStatus };
    const result = await db.upsert(streamer._id, () => {
      if (newOnlineStatus) {
        console.log(streamer.displayName + " went online");
      } else {
        console.log(streamer.displayName + " went offline");
      }
      return streamer;
    });
    return success(result.updated);
  } catch (err) {
    console.log("Error in updateOnlineStatusOfStreamer", err);
    if (err instanceof Error) {
      return failure(err);
    }
    return failure(new Error());
  }
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

  console.log("Populating test steamer data...");
  return db
    .bulkDocs(streamers)
    .then(() => console.log("Populating success"))
    .catch(() => console.error("Populating failed"));
};

export const getAllOnlineStreamers = async (): Promise<
  Result<Streamer[], Error>
> => {
  // index
  try {
    await db.createIndex({
      index: {
        fields: ["displayName", "isOnline"],
        ddoc: "name_index",
      },
    });

    const onlineStreamers = await db.find({
      selector: {
        displayName: { $exists: true },
        isOnline: { $eq: true },
      },
      use_index: "name_index",
      sort: ["displayName"],

      fields: [
        "_id",
        "displayName",
        "userName",
        "isOnline",
        "profilePicture",
        "stream.url",
        "stream.description",
        "stream.category",
        "stream.language",
        "stream.platform",
        "animationSettings.showGoal",
        "animationSettings.goal",
        "animationSettings.goalProgress",
      ],
    });
    return success(onlineStreamers.docs);
  } catch (err) {
    console.log("Something went wrong with getAllOnlineStreamers", err);
    if (err instanceof Error) {
      return failure(err);
    }
    return failure(new Error());
  }
};
