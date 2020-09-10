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
    // sound: "/src/sounds/crocodile.mp3",
  },
};

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

async function addStreamer(socketId, doc) {
  return getUserByUsername(doc.username).then((res) => {
    if (res.length > 0) {
      console.log(doc.username + " is taken");
      return return_error("username_taken");
    } else {
      doc.streamerSocketId = socketId;
      console.log(doc.username + " successfully created");
      return db.putIfNotExists(doc);
    }
  });
}

async function getUserByUsername(username) {
  return db.find({
    selector: {
      username: { $eq: username },
    },
  });
}

async function printUser(username) {
  return getUser(username).then((res) => {
    console.log(res);
  });
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
async function showAll() {
  return db
    .allDocs({ include_docs: true })
    .then(function (e) {
      console.dir(e.rows, { depth: 4 });
    })
    .catch(function (_err) {
      console.log(_err);
    });
}

async function testDB() {
  return (
    addStreamer("r4nd0mS0ck371d", streamer)
      .then((res) => {
        return db.get(res.id);
      })
      .then((res) => {
        updateStreamer("test", streamer);
      })
      // .then((res) => {
      //   printUser(res.username);
      // })
      .catch(function (_err) {
        console.log(_err);
      })
  );
}
testDB();

module.exports = [addStreamer, getUserByUsername, updateStreamer, showAll];
