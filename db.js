// setting up the db
let PouchDB = require("pouchdb");
PouchDB.plugin(require("pouchdb-upsert"));
PouchDB.plugin(require("pouchdb-find"));
PouchDB.plugin(require("pouchdb-adapter-memory"));

let db = new PouchDB("streamers", { adapter: "memory" });

// consts for testing
let hashedSeed =
  "lkjadslkfjasdlkfjlksjfdalsdkjf;asdlkfjasdlfjasdlkjfasl;kdfalksfj";
let streamerName = "SupMan";

let streamer = {
  _id: hashedSeed,
  username: streamerName.toLowerCase(),
  displayName: streamerName,
  account: {
    basic: true,
    advanced: true,
    premium: true,
  },
  stream: {
    secondprice: 0.00043,
    fontcolor: "#F23456",
    minamount: 0.00043,
    gifs: true,
    goal: 1,
    goalprogress: 0,
    goalreached: false,
    charlimit: 1000,
    sound: "/src/sounds/crocodile.mp3",
  },
};
let streamer2 = {
  _id: hashedSeed,
  username: streamerName.toLowerCase(),
  displayName: streamerName,
  account: {
    basic: false,
    advanced: false,
    premium: false,
  },
  stream: {
    secondprice: 0.00043,
    fontcolor: "#F23456",
    minamount: 0.00043,
    gifs: true,
    goal: 1,
    goalprogress: 0,
    goalreached: false,
    charlimit: 1000,
    sound: "/src/sounds/crocodile.mp3",
  },
};

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
// Donator Namespace
// ===============================================================

// add a new streamer (register process), username needs to be unique
// SUGAR version
async function addStreamer(socketId, doc) {
  try {
    // step 1: try to get the user with the username
    const userDoc = await getUserByUsername(doc.username);
    // console.log(userDoc);
    if (userDoc.docs.length > 0) {
      console.log(doc.username + " is taken");
      return return_error("username_taken");
    } else {
      // step 2: if there is nobody with that username, create the object in the db
      doc.streamerSocketId = socketId;
      const newStreamer = await db.putIfNotExists(doc);
      console.log(doc.username + " successfully created");
      return return_success("new_user_created", newStreamer); // keep in mind the userDoc is in 'data'
    }
  } catch (err) {
    console.log(err);
    return return_error("Something went wrong with addStreamer", err);
  }
}

// given a username, return the doc object of said user
async function getUserByUsername(username) {
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

async function getUserById(id) {
  try {
    const userDoc = await db.get(id);
    return userDoc;
  } catch (err) {
    console.log(err);
    return return_error("Something went wrong with getUserById", err);
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

// SUGAR version
async function testDB() {
  try {
    // creating a new dummy user
    const streamer1 = await addStreamer("r4nd0mS0ck371d", streamer);
    // grab the streamer doc
    const strdoc = await getUserById(streamer1.data.id);
    // update the streamer doc
    const updatedStreamer = await updateStreamer(streamer3);
    console.log(updatedStreamer);
    const strmr = await getUserById(updatedStreamer.id);
    console.log(strmr);
  } catch (err) {
    console.log(err);
    return return_error("Something went wrong with testDB", err);
  }
}
testDB();

// module.exports = [addStreamer, getUserByUsername, updateStreamer, showAll];
