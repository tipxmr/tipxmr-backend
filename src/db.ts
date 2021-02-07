import { v4 as generateUUID } from "uuid";
// @ts-ignore
import { connectToDaemonRpc } from "monero-javascript";
import PouchDB from "pouchdb";
import pouchdbUpsert from "pouchdb-upsert";
import pouchdbFind from "pouchdb-find";
import pouchdbAdapterMemory from "pouchdb-adapter-memory";
PouchDB.plugin(pouchdbUpsert);
PouchDB.plugin(pouchdbFind);
PouchDB.plugin(pouchdbAdapterMemory);

const db = new PouchDB<Streamer>("streamers", { adapter: "memory" });

const daemon = connectToDaemonRpc(
  "http://node.cryptocano.de:38081",
  "superuser",
  "abctesting123"
);

import { defaultStreamerConfig } from "./data/defaultStreamerConfig";
import { testStreamers } from "./data/streamerTestDB";
import { Streamer } from "./data/Streamer";
import { success, failure, Result } from "./results";

// ===============================================================
// DB operations
// ===============================================================

export async function getStreamer(
  selector: Partial<Streamer>
): Promise<Result<Streamer, Error>> {
  if (selector._id) {
    try {
      const streamer = await db.get(selector._id);
      console.log("Found streamer:", streamer.userName);
      return success(streamer);
    } catch (err) {
      console.log(err);
      return failure(err);
    }
  } else {
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
      return failure(err);
    }
  }
}

export async function loginStreamer(
  socketId: string,
  _id: string,
  userName: string | null
): Promise<Result<Streamer, Error>> {
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
}

// add a new streamer (register process), username needs to be unique
export async function createStreamer(
  socketId: string,
  _id: string,
  userName: string
): Promise<Result<Streamer, Error>> {
  try {
    // step 1: check if username ist taken
    const result = await getStreamer({ userName });
    if (result.isSuccess()) {
      const streamer = result.unwrap();
      console.log(streamer.userName + " is taken");
      return failure(new Error(`userName ${streamer.userName} is taken`));
    } else {
      // step 2: if there is nobody with that username, create the object in the db
      const newStreamer = defaultStreamerConfig;
      newStreamer._id = _id;
      newStreamer.streamerSocketId = socketId;
      newStreamer.userName = userName;
      newStreamer.restoreHeight = await daemon.getHeight();
      newStreamer.creationDate = new Date();
      db.putIfNotExists(newStreamer);
      console.log(newStreamer.userName + " successfully created");
      return success(newStreamer);
    }
  } catch (err) {
    console.log("Something went wrong with createStreamer", err);
    return failure(err);
  }
}

export async function updateStreamer(
  newStreamerConfig: Streamer
): Promise<Result<boolean, Error>> {
  try {
    console.log("Updated streamer: " + newStreamerConfig.displayName);
    const result = await db.upsert(newStreamerConfig._id, () => {
      return newStreamerConfig;
    });
    return success(result.updated);
  } catch (err) {
    return failure(err);
  }
}

// update online status of streamer
export async function updateOnlineStatusOfStreamer(
  _id: string,
  newOnlineStatus: boolean
): Promise<Result<boolean, Error>> {
  // can only update existing entries
  try {
    const streamer = await db.get(_id);
    streamer.isOnline = newOnlineStatus;
    const result = await db.upsert(streamer._id, function () {
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
    return failure(err);
  }
}

const generateAnimationId = () => generateUUID().split("-").join("");

export async function populateTestStreamers(): Promise<void> {
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
    .then(() => console.log("success"))
    .catch(() => console.error("failed"));
}

export async function getAllOnlineStreamers(): Promise<
  Result<Streamer[], Error>
> {
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
    return failure(err);
  }
}
