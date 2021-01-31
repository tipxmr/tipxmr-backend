export interface streamerInterface {
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
  creationDate: string;
  displayName: string;
  donationStats: {
    allDonations: any[];
    largestDonation: number;
    totalDonations: number;
  };
  hashedSeed: string;
  isOnline: boolean;
  isPremium: false;
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
}
