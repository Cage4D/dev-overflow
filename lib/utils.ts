import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { techMap } from "@/constants/techMap"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDeviconClassName(techName: string) {
  const normalizedTechName = techName.replace(/[.]/g, "").toLowerCase();

  return techMap[normalizedTechName]
    ? `${techMap[normalizedTechName]} colored`
    : "devicon-devicon-plain";
}

export const techDescriptionMap: { [key: string]: string } = {
  // JavaScript variations
  javascript:
    "JavaScript is a powerful language for building dynamic, interactive, and modern web applications.",
  js:
    "JavaScript is a powerful language for building dynamic, interactive, and modern web applications.",

  // TypeScript variations
  typescript:
    "TypeScript adds strong typing to JavaScript, making it great for scalable and maintainable applications.",
  ts:
    "TypeScript adds strong typing to JavaScript, making it great for scalable and maintainable applications.",

  // React variations
  react:
    "React is a popular JavaScript library for building fast, component-based user interfaces.",
  reactjs:
    "React is a popular JavaScript library for building fast, component-based user interfaces.",

  // Next.js variations
  nextjs:
    "Next.js is a React framework that enables server-side rendering and static site generation for production-ready apps.",
  next:
    "Next.js is a React framework that enables server-side rendering and static site generation for production-ready apps.",

  // Node.js variations
  nodejs:
    "Node.js is a JavaScript runtime built on Chrome's V8 engine, widely used for building scalable server-side applications.",
  node:
    "Node.js is a JavaScript runtime built on Chrome's V8 engine, widely used for building scalable server-side applications.",

  // Python variations
  python:
    "Python is a versatile, readable programming language popular in web development, data science, and automation.",

  // Java variations
  java:
    "Java is a robust, object-oriented programming language widely used in enterprise and Android application development.",

  // C++ variations
  "c++":
    "C++ is a high-performance language commonly used in systems programming, game development, and competitive programming.",
  cpp:
    "C++ is a high-performance language commonly used in systems programming, game development, and competitive programming.",

  // C# variations
  "c#":
    "C# is a modern, object-oriented language developed by Microsoft, widely used for building Windows apps, games, and enterprise software.",
  csharp:
    "C# is a modern, object-oriented language developed by Microsoft, widely used for building Windows apps, games, and enterprise software.",

  // PHP variations
  php:
    "PHP is a widely-used server-side scripting language especially suited for web development and content management systems.",

  // HTML variations
  html:
    "HTML is the standard markup language used to structure content on the web.",
  html5:
    "HTML is the standard markup language used to structure content on the web.",

  // CSS variations
  css:
    "CSS is the styling language used to control the visual presentation of web pages.",
  css3:
    "CSS is the styling language used to control the visual presentation of web pages.",

  // Git variations
  git:
    "Git is a distributed version control system used to track changes in source code during software development.",

  // Docker variations
  docker:
    "Docker is a platform for building, shipping, and running applications inside lightweight, portable containers.",

  // MongoDB variations
  mongodb:
    "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents, popular for modern web applications.",
  mongo:
    "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents, popular for modern web applications.",

  // MySQL variations
  mysql:
    "MySQL is a widely-used open-source relational database management system known for reliability and performance.",

  // PostgreSQL variations
  postgresql:
    "PostgreSQL is a powerful, open-source relational database known for its reliability, extensibility, and SQL compliance.",
  postgres:
    "PostgreSQL is a powerful, open-source relational database known for its reliability, extensibility, and SQL compliance.",

  // AWS variations
  aws:
    "AWS (Amazon Web Services) is a comprehensive cloud computing platform offering scalable infrastructure and services.",
  "amazon web services":
    "AWS (Amazon Web Services) is a comprehensive cloud computing platform offering scalable infrastructure and services.",

  // Kafka
  kafka:
    "Apache Kafka is a distributed event streaming platform used for building real-time data pipelines and streaming applications.",

  // Tailwind CSS variations
  tailwind:
    "Tailwind CSS is a utility-first CSS framework that enables rapid, custom UI development without leaving your markup.",
  tailwindcss:
    "Tailwind CSS is a utility-first CSS framework that enables rapid, custom UI development without leaving your markup.",
};

export function getTechDescription(techName: string) {
  const normalizedTechName = techName.replace(/[.]/g, "").toLowerCase();

  return (
    techDescriptionMap[normalizedTechName] ||
    `${techName} is a technology or tool widely used in web development, providing valuable features and capabilities.`
  );
}

export const getTimeStamp = (createdAt: Date): string => {
  const date = new Date(createdAt)
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { label: string; seconds: number }[] = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(secondsAgo / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count === 1 ? "" : "s"} ago`;
    }
  }

  return secondsAgo < 5 ? "just now" : `${secondsAgo} seconds ago`;
};

export const formatNumber = (number: number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M"
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + "K"
  } else {
    return number.toString()
  }
}