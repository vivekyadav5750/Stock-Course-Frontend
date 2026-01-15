
export const APP_NAME = "Master Invest";

export enum CourseLevel {
  BASIC = "Basic",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced"
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  imageUrl: string;
  topics: Topic[];
  price: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in minutes
}

// Mock data for initial development
export const MOCK_COURSES: Course[] = [
  {
    id: "1",
    title: "Stock Market Fundamentals",
    description: "Learn the essential concepts of stock trading, market mechanics, and basic investment strategies for beginners.",
    level: CourseLevel.BASIC,
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop",
    price: 499,
    topics: [
      {
        id: "1-1",
        title: "Understanding Stock Markets",
        description: "Learn what stock markets are and how they function in the global economy.",
        videoUrl: "https://example.com/video1.mp4",
        duration: 12
      },
      {
        id: "1-2",
        title: "Types of Investment Instruments",
        description: "Explore various investment instruments including stocks, bonds, ETFs, and mutual funds.",
        videoUrl: "https://example.com/video2.mp4",
        duration: 15
      },
      {
        id: "1-3",
        title: "Basic Market Analysis",
        description: "Introduction to fundamental and technical analysis for beginners.",
        videoUrl: "https://example.com/video3.mp4",
        duration: 18
      }
    ]
  },
  {
    id: "2",
    title: "Technical Analysis Strategies",
    description: "Dive deeper into chart patterns, indicators, and effective technical analysis methods for intermediate traders.",
    level: CourseLevel.INTERMEDIATE,
    imageUrl: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?q=80&w=800&auto=format&fit=crop",
    price: 999,
    topics: [
      {
        id: "2-1",
        title: "Chart Patterns",
        description: "Identify and interpret essential chart patterns that signal market movements.",
        videoUrl: "https://example.com/video4.mp4",
        duration: 22
      },
      {
        id: "2-2",
        title: "Technical Indicators",
        description: "Master key technical indicators like RSI, MACD, and Moving Averages.",
        videoUrl: "https://example.com/video5.mp4",
        duration: 25
      }
    ]
  },
  {
    id: "3",
    title: "Advanced Trading Strategies",
    description: "Master complex trading strategies, options, derivatives, and risk management techniques for experienced investors.",
    level: CourseLevel.ADVANCED,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    price: 1499,
    topics: [
      {
        id: "3-1",
        title: "Options Trading",
        description: "Advanced concepts in options trading, including complex strategies.",
        videoUrl: "https://example.com/video6.mp4",
        duration: 30
      },
      {
        id: "3-2",
        title: "Risk Management",
        description: "Sophisticated risk management techniques for professional traders.",
        videoUrl: "https://example.com/video7.mp4",
        duration: 28
      }
    ]
  }
];
