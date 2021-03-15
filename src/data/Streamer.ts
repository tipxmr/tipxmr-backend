export type Streamer = {
  _id: string;
  animationSettings: {
    bgImg: string;
    charLimit: number;
    charPrice: number;
    fontColor: string;
    fontShadow: boolean;
    fontSize: string;
    gifs: boolean;
    gifsMinAmount: number;
    goal: number;
    goalProgress: number;
    goalReached: boolean;
    minAmount: number;
    secondPrice: number;
    showGoal: boolean;
    sound: string;
  };
  creationDate: Date;
  displayName: string;
  donationStats: {
    allDonations: unknown[];
    largestDonation: number;
    totalDonations: number;
  };
  isOnline: boolean;
  isPremium: boolean;
  profilePicture: string;
  restoreHeight: number;
  stream: {
    category: string;
    description: string;
    language: string;
    platform: string;
    url: string;
  };
  streamerSocketId: string;
  userName: string;
};
