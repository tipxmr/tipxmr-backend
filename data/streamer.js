const streamerOne = {
  hashedSeed: "", // acts as password for login
  displayName: "AlexAnarcho", // name to show to donator
  userName: "alexanarcho", // lowercase displayName
  isOnline: false, // show if streamer is currently able to recieve payments
  streamerSocketId: "",
  creationDate: "", // track since when the user is registered
  restoreHeight: 661800,
  profilePicture: "", // allow the user to upload a user avatar
  accountTier: {
    basic: true, // only basic functions available for customizations
    advanced: true, // more customisations
    premium: true, // all customisations available
  },
  streamURLS: {
    // stream urls to display on the streamers donation site
    // only 4 examples, more options can be added later on
    twitch: "mydirtyhobby.com",
    youtube: "",
    chaturbate: "",
    dLive: "",
  },
  animationSettings: {
    secondPrice: 0.00043, // XMR price of a second of display time
    fontColor: "#F23456", // fontColor of the animation text
    fontSize: "xl", // size of animation text
    fontShadow: false, // enable a shadow around text
    minAmount: 0.00043, // donations must be equal to or greater than minAmount
    gifs: true, // allow users to include gifs as message
    gifsMinAmount: 0, // min amount to let user send a gif
    showGoal: false, // let the streamer decide whether to show a goal or not
    goal: 1, // goal amount in XMR
    goalProgress: 0, // how many XMR already paid towards goal
    goalReached: false, // maybe unnecessary, if true, reset the goal
    charLimit: 1000, // upperlimit for message length
    sound: "/src/sounds/crocodile.mp3", // custom mp3 sound, needs to be an attachement
    bgImg: "", // show background image in stream
  },
  donationStats: {
    totalDonations: 0, // increment with every donation
    largestDonation: 0, // show largest donation
    allDonations: [
      // objects of all transactions, basically array of donorInfo
      {
        1: {
          donor: "Grischa",
          message: "Hello",
          amount: 123, // amount in XMR
          date: "", // datetime object to track a timeline
        },
      },
    ],
  },
};

const streamerTwo = {};

const streamerThree = {};

exports.streamerOne = streamerOne;
exports.streamerTwo = streamerTwo;
exports.streamerThree = streamerThree;

module.exports = [streamerOne, streamerTwo, streamerThree];
