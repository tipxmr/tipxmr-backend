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
    console.log(userDoc);
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
  }
}

// TODO Write an update function, to update settings
async function updateStreamer(updateInfo, doc) {
  console.log(doc);
  return db
    .upsert(doc._id, function (updateInfo) {
      if (doc.username != updateInfo) {
        doc.username = updateInfo;
        return doc;
      }
    })
    .then((res) => {});
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
  }
}

// SUGAR version
async function testDB() {
  try {
    const streamer1 = await addStreamer("r4nd0mS0ck371d", streamer);
  } catch (err) {
    console.log(err);
  }
}
testDB();

// module.exports = [addStreamer, getUserByUsername, updateStreamer, showAll];
