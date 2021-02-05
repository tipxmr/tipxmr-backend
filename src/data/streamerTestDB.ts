/* 
Alex: fa80ac5814a6fddee2fa29a1e62f5de4e3a233f07a51e886a3a1e7a8bce5abf7
Grischa: b8185a25bbe3b4206e490558ab50b0567deca446d15282e92c5c66fde6693399
Pronas: 
*/
import {StreamerInterface as Streamer} from "./streamerInterface";
const alex: Streamer = {
  _id:
    "fa80ac5814a6fddee2fa29a1e62f5de4e3a233f07a51e886a3a1e7a8bce5abf7",
  creationDate: new Date("2020-09-01"),
  displayName: "AlexAnarcho",
  isOnline: false,
  restoreHeight: 674675,
  streamerSocketId: "",
  userName: "alexanarcho",
  profilePicture:
    "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", // allow the user to upload a user avatar
  isPremium: false,
  stream: {
    category: "politics",
    description: "I am a great streamer.",
    language: "🇩🇪",
    platform: "twitch",
    url: "https://www.twitch.tv/n00bprogrammer",
  },
  animationSettings: {
    bgImg: "",
    charLimit: 99,
    charPrice: 0.0004,
    fontColor: "#FFFFFF",
    fontShadow: true,
    fontSize: "text-4xl",
    gifs: true,
    gifsMinAmount: 0,
    goal: 100,
    goalProgress: 0,
    goalReached: false,
    minAmount: 0,
    secondPrice: 0.00042,
    showGoal: true,
    sound: "",
  },
  donationStats: {
    allDonations: [],
    largestDonation: 0,
    totalDonations: 0,
  },
};

const grischa: Streamer = {
  _id:
    "b8185a25bbe3b4206e490558ab50b0567deca446d15282e92c5c66fde6693399",
  creationDate: new Date("2020-09-01"),
  displayName: "hundehausen",
  isOnline: false,
  isPremium: false,
  profilePicture: "",
  restoreHeight: 667580,
  streamerSocketId: "",
  userName: "hundehausen",
  stream: {
    category: "XXX",
    description: "I am a greater streamer.",
    language: "🇩🇪",
    platform: "Chaturbate",
    url: "chaturbate.com",
  },
  animationSettings: {
    bgImg: "",
    charLimit: 100,
    charPrice: 0.0004,
    fontColor: "#F23456",
    fontShadow: false,
    fontSize: "xl",
    gifs: true,
    gifsMinAmount: 0,
    goal: 0,
    goalProgress: 0,
    goalReached: false,
    minAmount: 0,
    secondPrice: 0.0042,
    showGoal: false,
    sound: "",
  },
  donationStats: {
    allDonations: [],
    largestDonation: 0,
    totalDonations: 0,
  },
};

const pronas: Streamer = {
  _id: "",
  animationSettings: {
    bgImg: "",
    charLimit: 1000,
    charPrice: 0.0004,
    fontColor: "#F23456",
    fontShadow: false,
    fontSize: "xl",
    gifs: true,
    gifsMinAmount: 0,
    goal: 0,
    goalProgress: 0,
    goalReached: false,
    minAmount: 0,
    secondPrice: 0,
    showGoal: false,
    sound: "",
  },
  creationDate: new Date("2020-09-15"),
  displayName: "Pronas",
  isOnline: false, 
  isPremium: true,
  profilePicture: "",
  restoreHeight: 667580,
  streamerSocketId: "",
  userName: "pronas",
  stream: {
    category: "technology",
    description: "I am the greatest streamer.",
    language: "🇩🇪",
    platform: "youtube",
    url: "youtube.com",
  },
  donationStats: {
    allDonations: [],
    largestDonation: 0,
    totalDonations: 0,
  },
};

exports.alex = alex;
exports.grischa = grischa;
exports.pronas = pronas;

module.exports = [alex, grischa, pronas];
