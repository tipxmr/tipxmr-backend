// setting up the db
let PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-upsert"));
PouchDB.plugin(require("pouchdb-find"));
PouchDB.plugin(require("pouchdb-adapter-memory"));

let db = new PouchDB("streamers", { adapter: "memory" });

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

// add a new streamer (register process), username needs to be unique
// SUGAR version
async function addStreamer(socketId, doc) {
  try {
    // step 1: try to get the user with the username
    const userDoc = await getStreamerByUsername(doc.userName);
    // console.log(userDoc);
    if (userDoc.docs.length > 0) {
      console.log(doc.userName + " is taken");
      return return_error("username_taken");
    } else {
      // step 2: if there is nobody with that username, create the object in the db
      doc.streamerSocketId = socketId;
      doc.online = true;
      const newStreamer = await db.putIfNotExists(doc);
      console.log(doc.userName + " successfully created");
      return return_success("new_user_created", newStreamer); // keep in mind the userDoc is in 'data'
    }
  } catch (err) {
    console.log(err);
    return return_error("Something went wrong with addStreamer", err);
  }
}

// given a username, return the doc object of said user
async function getStreamerByUsername(username) {
  try {
    const userDoc = await db.find({
      selector: {
        username: { $eq: username.toLowerCase() }, // make sure the username is lowercase
      },
    });
    return userDoc;
  } catch (err) {
    console.log(err);
    return return_error("Something went wrong with getUserByUsername", err);
  }
}

async function getStreamerById(id) {
  try {
    const userDoc = await db.get(id);
    return userDoc;
  } catch (err) {
    console.log(err);
    return null;
  }
}

// given a socketId, return the doc object of said user
async function getStreamerBySocketId(socketId) {
  try {
    const userDoc = await db.find({
      selector: {
        socketId: { $eq: socketId }, // make sure the username is lowercase
      },
    });
    return userDoc;
  } catch (err) {
    console.log(err);
    return return_error("Something went wrong with getStreamerBySocketId", err);
  }
}

// TODO Write an update function, to update settings
// currently just overwriting existing doc
async function updateStreamer(updateObj) {
  // can only update existing entries
  try {
    let userDoc = await db.get(updateObj._id);
    console.log(userDoc);
    return db.upsert(userDoc._id, function () {
      console.log(userDoc);
      return updateObj;
    });
  } catch (err) {
    console.log(err);
    return return_error("Error in updateStreamer", err);
  }
}

// update online status of streamer
async function updateOnlineStatusOfStreamer(updateObj, onlineStatus) {
  // can only update existing entries
  try {
    let userDoc = await db.get(updateObj._id);
    console.log(userDoc);
    userDoc.online = onlineStatus;
    return db.upsert(userDoc._id, function () {
      console.log(userDoc);
      return updateObj;
    });
  } catch (err) {
    console.log(err);
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
    console.log(err);
    return return_error("Something went wrong with showAll", err);
  }
}

module.exports = [
  addStreamer,
  getStreamerById,
  getStreamerByUsername,
  getStreamerBySocketId,
  updateStreamer,
  updateOnlineStatusOfStreamer,
  showAll,
];
