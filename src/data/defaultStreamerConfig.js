exports.defaultStreamerConfig = {
  hashedSeed: "", // acts as password for login
  displayName: "", // name to show to donator
  userName: "", // lowercase displayName
  isOnline: false, // show if streamer is currently able to recieve payments
  streamerSocketId: "",
  creationDate: null, // track since when the user is registered
  restoreHeight: 0,
  profilePicture: "", // allow the user to upload a user avatar
  isPremium: false,
  stream: {
    url: "",
    platform: "",
    language: "",
    description: "",
    category: "",
  },
  animationSettings: {
    secondPrice: 0.00042, // XMR price of a second of display time
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
    charLimit: 99, // upperlimit for message length
    charPrice: 0.0004,
    sound: "", // custom mp3 sound, needs to be an attachement
    bgImg: "", // show background image in stream
  },
  donationStats: {
    totalDonations: 0, // increment with every donation
    largestDonation: 0, // show largest donation
    allDonations: [],
  },
};
