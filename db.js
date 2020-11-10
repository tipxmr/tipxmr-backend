// setting up the db
const { v4: generateUUID } = require("uuid");
const monerojs = require("monero-javascript");
let daemon = monerojs.connectToDaemonRpc(
  "http://node.cryptocano.de:38081",
  "superuser",
  "abctesting123"
);

let PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-debug"));
PouchDB.plugin(require("pouchdb-upsert"));
PouchDB.plugin(require("pouchdb-find"));
PouchDB.plugin(require("pouchdb-adapter-memory"));

PouchDB.debug.enable("pouchdb:find");
let db = new PouchDB("streamers", { adapter: "memory" });

const streamerModel = require("./data/defaultStreamerConfig");
const testStreamers = require("./data/streamerTestDB");

// return code masks
function return_success(message, data = {}) {
  return {
    type: "success",
    message,
    data,
  };
}

function return_error(message, error = {}) {
  return {
    type: "error",
    message,
    error,
  };
}

// ===============================================================
// DB operations
// ===============================================================

async function getStreamer(key, value) {
  if (key === "id") {
    try {
      const streamer = await db.get(value);
      console.log("Found streamer:", streamer.userName);
      return return_success(`Streamer (${streamer.userName}) found`, streamer);
    } catch (err) {
      console.log(err);
      return return_error("Streamer not found by hashedSeed", err);
    }
  } else {
    const selector = { [key]: value };
    try {
      const streamer = await db.find({
        selector: selector,
      });
      if (streamer.docs.length > 0) {
        return return_success(
          `Streamer (${streamer.userName}) found by ${key}`,
          streamer.docs[0]
        );
      } else {
        return return_error(`Streamer not found by ${key}`, "notFound");
      }
    } catch (err) {
      console.log(err);
      return return_error(`Streamer not found by ${key}`, err);
    }
  }
}

async function loginStreamer(socketId, hashedSeed, userName = null) {
  const response = await getStreamer("id", hashedSeed);
  // When success, then streamer is already in DB
  if (response.type === "success") {
    // then return object
    return response;
  } else {
    // hashedSeed is not registered in DB, so create new User
    if (userName) {
      console.log("streamer not found in db, creating new user now");
      const response = await createStreamer(socketId, hashedSeed, userName);
      if (response.type === "success") {
        return return_success("New StreamerConfig created", response.data);
      } else {
        return response;
      }
    } else {
      return return_error(
        "hashedSeed not found and no userName for userCreation was sent.",
        "noUserName"
      );
    }
  }
}

// add a new streamer (register process), username needs to be unique
async function createStreamer(socketId, hashedSeed, userName) {
  try {
    // step 1: check if username ist taken
    const response = await getStreamer("userName", userName);
    // console.log(userDoc);
    if (response.type === "success") {
      console.log(response.data.userName + " is taken");
      return return_error("userName is taken", "userNameTaken");
    } else {
      // step 2: if there is nobody with that username, create the object in the db
      let newStreamer = streamerModel.defaultStreamerConfig;
      newStreamer._id = hashedSeed;
      newStreamer.hashedSeed = hashedSeed;
      newStreamer.streamerSocketId = socketId;
      newStreamer.userName = userName;
      newStreamer.restoreHeight = await daemon.getHeight();
      newStreamer.creationDate = new Date();
      db.putIfNotExists(newStreamer);
      console.log(newStreamer.userName + " successfully created");
      return return_success("new_user_created", newStreamer);
    }
  } catch (err) {
    console.log("Something went wrong with createStreamer", err);
    return return_error("Something went wrong with createStreamer", err);
  }
}

async function updateStreamer(newStreamerConfig) {
  // can only update existing entries
  try {
    console.log("Updated streamer: " + newStreamerConfig.displayName);
    return db.upsert(newStreamerConfig._id, () => {
      return newStreamerConfig;
    });
  } catch (err) {
    console.log("Error in updateStreamer", err);
    return return_error("Error in updateStreamer", err);
  }
}

// update online status of streamer
async function updateOnlineStatusOfStreamer(hashedSeed, newOnlineStatus) {
  // can only update existing entries
  try {
    let streamer = await db.get(hashedSeed);
    streamer.isOnline = newOnlineStatus;
    return db.upsert(streamer._id, function () {
      if (newOnlineStatus) {
        console.log(streamer.displayName + " went online");
      } else {
        console.log(streamer.displayName + " went offline");
      }
      return streamer;
    });
  } catch (err) {
    console.log("Error in updateOnlineStatusOfStreamer", err);
    return return_error("Error in updateOnlineStatusOfStreamer", err);
  }
}

// display all information of all streamers
// SUGAR version
async function showAll() {
  try {
    const wholeDB = await db.allDocs({ include_docs: true });
    console.log("here is the entire DB");
    console.dir(wholeDB.rows, { depth: 4 });
  } catch (err) {
    console.log("Something went wrong with showAll", err);
    return return_error("Something went wrong with showAll", err);
  }
}

const where = (selector) => db.find({ selector });

const generateAnimationId = () => generateUUID().split("-").join("");

async function populateTestStreamers() {
  const streamers = testStreamers
    .filter((testStreamer) => Object.keys(testStreamer).length)
    .map((testStreamer) => {
      const animationId = generateAnimationId();
      console.log(animationId);
      return {
        ...testStreamer,
        animationId,
        _id: testStreamer.hashedSeed,
      };
    });

  console.log("Populating test steamer data...");
  return db
    .bulkDocs(streamers)
    .then(() => console.log("success"))
    .catch(() => console.error("failed"));
}

const hasStreamingSession = (id) =>
  where({ animationId: { $eq: id } }).then((result) =>
    Boolean(result.docs.length)
  );

async function getAllOnlineStreamers() {
  // index
  try {
    var result = await db.createIndex({
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
    return onlineStreamers.docs;
  } catch (err) {
    console.log("Something went wrong with getAllOnlineStreamers", err);
    return return_error("Something went wrong with getAllOnlineStreamers", err);
  }
}

/* async function createIndex() {
  try {
    var result = await db.createIndex({
      index: {
        fields: ["userName", "displayName", "hashedSeed", "_id"],
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function test() {
  const streamer = await getStreamer(
    "_id",
    "fa80ac5814a6fddee2fa29a1e62f5de4e3a233f07a51e886a3a1e7a8bce5abf7"
  );
  console.log("test", streamer);
}

populateTestStreamers().then(createIndex).then(test);
 */
module.exports = {
  loginStreamer,
  getStreamer,
  updateStreamer,
  updateOnlineStatusOfStreamer,
  showAll,
  populateTestStreamers,
  hasStreamingSession,
  getAllOnlineStreamers,
};
