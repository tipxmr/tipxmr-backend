/* 
Alex: fa80ac5814a6fddee2fa29a1e62f5de4e3a233f07a51e886a3a1e7a8bce5abf7
Grischa: b8185a25bbe3b4206e490558ab50b0567deca446d15282e92c5c66fde6693399
Jonas: 
*/

const alex = {
  hashedSeed:
    "fa80ac5814a6fddee2fa29a1e62f5de4e3a233f07a51e886a3a1e7a8bce5abf7", // acts as password for login
  displayName: "AlexAnarcho", // name to show to donator
  userName: "alexanarcho", // lowercase displayName
  isOnline: false, // show if streamer is currently able to recieve payments
  streamerSocketId: "",
  creationDate: null, // track since when the user is registered
  restoreHeight: 674675,
  profilePicture: "", // allow the user to upload a user avatar
  accountTier: {
    basic: true, // only basic functions available for customizations
    advanced: false, // more customisations
    premium: false, // all customisations available
  },
  stream: {
    url: "mydirtyhobby.com",
    platform: "twitch",
    language: "🇩🇪",
    description: "I am a great streamer.",
    category: "politics",
  },
  animationSettings: {
    secondPrice: 0, // XMR price of a second of display time
    fontColor: "#F23456", // fontColor of the animation text
    fontSize: "xl", // size of animation text
    fontShadow: false, // enable a shadow around text
    minAmount: 0, // donations must be equal to or greater than minAmount
    gifs: true, // allow users to include gifs as message
    gifsMinAmount: 0, // min amount to let user send a gif
    showGoal: false, // let the streamer decide whether to show a goal or not
    goal: 0, // goal amount in XMR
    goalProgress: 0, // how many XMR already paid towards goal
    goalReached: false, // maybe unnecessary, if true, reset the goal
    charLimit: 1000, // upperlimit for message length
    sound: "", // custom mp3 sound, needs to be an attachement
    bgImg: "", // show background image in stream
  },
  donationStats: {
    totalDonations: 0, // increment with every donation
    largestDonation: 0, // show largest donation
    allDonations: [],
  },
};

const grischa = {
  hashedSeed:
    "b8185a25bbe3b4206e490558ab50b0567deca446d15282e92c5c66fde6693399", // acts as password for login
  displayName: "hundehausen", // name to show to donator
  userName: "hundehausen", // lowercase displayName
  isOnline: false, // show if streamer is currently able to recieve payments
  streamerSocketId: "",
  creationDate: null, // track since when the user is registered
  restoreHeight: 667580,
  profilePicture: "", // allow the user to upload a user avatar
  accountTier: {
    basic: true, // only basic functions available for customizations
    advanced: false, // more customisations
    premium: false, // all customisations available
  },
  stream: {
    url: "chaturbate.com",
    platform: "Chaturbate",
    language: "🇩🇪",
    description: "I am a greater streamer.",
    category: "XXX",
  },
  animationSettings: {
    secondPrice: 0, // XMR price of a second of display time
    fontColor: "#F23456", // fontColor of the animation text
    fontSize: "xl", // size of animation text
    fontShadow: false, // enable a shadow around text
    minAmount: 0, // donations must be equal to or greater than minAmount
    gifs: true, // allow users to include gifs as message
    gifsMinAmount: 0, // min amount to let user send a gif
    showGoal: false, // let the streamer decide whether to show a goal or not
    goal: 0, // goal amount in XMR
    goalProgress: 0, // how many XMR already paid towards goal
    goalReached: false, // maybe unnecessary, if true, reset the goal
    charLimit: 1000, // upperlimit for message length
    sound: "", // custom mp3 sound, needs to be an attachement
    bgImg: "", // show background image in stream
  },
  donationStats: {
    totalDonations: 0, // increment with every donation
    largestDonation: 0, // show largest donation
    allDonations: [],
  },
};

const jonas = {
  hashedSeed: "", // acts as password for login
  displayName: "JonasInDaHauß", // name to show to donator
  userName: "jonasindahauß", // lowercase displayName
  isOnline: false, // show if streamer is currently able to recieve payments
  streamerSocketId: "",
  creationDate: null, // track since when the user is registered
  restoreHeight: 667580,
  profilePicture: "", // allow the user to upload a user avatar
  accountTier: {
    basic: true, // only basic functions available for customizations
    advanced: false, // more customisations
    premium: false, // all customisations available
  },
  stream: {
    url: "youtube.com",
    platform: "youtube",
    language: "🇩🇪",
    description: "I am the greatest streamer.",
    category: "technology",
  },
  animationSettings: {
    secondPrice: 0, // XMR price of a second of display time
    fontColor: "#F23456", // fontColor of the animation text
    fontSize: "xl", // size of animation text
    fontShadow: false, // enable a shadow around text
    minAmount: 0, // donations must be equal to or greater than minAmount
    gifs: true, // allow users to include gifs as message
    gifsMinAmount: 0, // min amount to let user send a gif
    showGoal: false, // let the streamer decide whether to show a goal or not
    goal: 0, // goal amount in XMR
    goalProgress: 0, // how many XMR already paid towards goal
    goalReached: false, // maybe unnecessary, if true, reset the goal
    charLimit: 1000, // upperlimit for message length
    sound: "", // custom mp3 sound, needs to be an attachement
    bgImg: "", // show background image in stream
  },
  donationStats: {
    totalDonations: 0, // increment with every donation
    largestDonation: 0, // show largest donation
    allDonations: [],
  },
};

exports.alex = alex;
exports.grischa = grischa;
exports.jonas = jonas;

module.exports = [alex, grischa, jonas];
