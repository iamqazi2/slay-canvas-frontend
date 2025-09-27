// assets.ts

const assets = {
  whiteLogo: "/WhiteLogo.svg",
  circle: "/circle.png",
  halfCircle: "/halfCircle.png",
  moodBoard: "/moodBoard.svg",
  elem: "/elem.png",
  email: "/email.png",
  arrowRight: "/arrowRight.svg",
  dashElem: "/dashElem.svg",
  groupElem: "/groupElem.svg",
  paint: "/paint.svg",
  book: "/book.svg",
  researchers: "/researchers.svg",
  team: "/team.svg",
  creators: "/creators.svg",
  dashboard: "/dashboard.svg",
  halfStar: "/halfStar.svg",
  linkedin: "/linkedin.png",
  logo: "/logo.svg",
  noteBook: "/noteBook.svg",
  chatbot: "/chatbot.svg",
  slayCanvas: "/Slay Canvas.png",
  star: "/star.svg",
  x: "/x.svg",
  user1: "/user1.png",
  user2: "/user2.png",
  user3: "/user3.png",
  user4: "/user4.png",
  play: "/play.svg",
  tick: "/tick.svg",
  eye: "/eye.svg",
  arrowUp: "/arrowUp.svg",
  msg: "/msg.svg",
  testimonialIcons: "/testimonialIcons.png",
  mindMapping: "/mindMapping.svg",
  AI: "/AI.svg",
  users: "/users.svg",
  google: "/google.svg",
  inputEye: "/inputEye.svg",
  lock: "/lock.png",
  arrowleft: "/arrowleft.svg",
  reviewElem: "/review-elem.svg",
  Sec5Img: "/section5Img.svg",
  planTick: "/planTick.svg",
  bluePlanTick: "bluePlanTick.svg",
};

export const users = [
  { id: 1, src: "/user1.png" },
  { id: 2, src: "/user2.png" },
  { id: 3, src: "/user3.png" },
  { id: 4, src: "/user4.png" },
];

export const cards = [
  {
    id: 1,
    img: "/arrowUp.svg",
    heading: "Collect Everything in One Place",
    para: "Upload images, documents, voice notes, and links into one organized board — no more switching between tools.",
  },
  {
    id: 2,
    img: "/msg.svg",
    heading: " AI That Thinks With You",
    para: "Summarize files, brainstorm ideas, and get instant, contextual answers with built-in AI.",
  },
  {
    id: 3,
    img: "/dashElem.svg",
    heading: "Visual Organization",
    para: "Create moodboards, build mind maps, and group resources for a clean, creative workflow.",
  },
  {
    id: 4,
    img: "/groupElem.svg",
    heading: "Collaborate in Real Time",
    para: "Share boards, edit together, and keep your team aligned anytime, anywhere.",
  },
];

export const dashboardCards = [
  {
    id: 1,
    img: assets.moodBoard,
    heading: "Moodboard View",
    para: "Visual organization at its finest",
  },
  {
    id: 2,
    img: assets.chatbot,
    heading: "AI Chat Interface",
    para: "Intelligent conversations about your content",
  },
  {
    id: 3,
    img: assets.mindMapping,
    heading: "Mind Mapping",
    para: "Connect ideas and see the bigger picture",
  },
];

export const videos = [
  {
    src: "/video1.mp4",
    name: "Julia Martin",
    title: "Content Creator",
  },
  {
    src: "/video2.mp4",
    name: "Peter Son",
    title: "Content Creator",
  },
  {
    src: "/video3.mp4",
    name: "Alex Costa",
    title: "Content Creator",
  },
  {
    src: "/video4.mp4",
    name: "Sam Parker",
    title: "Founder, CEO",
  },
];

export const testimonials = [
  {
    id: 1,
    name: "Ava Thompson",
    img: "/client1.png",
    review:
      "This product has simplified my workflow. I finish tasks faster and finally have time to focus on more important things.",
  },
  {
    id: 2,
    name: "Liam Patel",
    img: "/client2.png",
    review:
      "I didn’t expect it to be this good. The speed and accuracy really surprised me, and I use it every single day now.",
  },
  {
    id: 3,
    name: "Emily Carter",
    img: "/client3.png",
    review:
      "The design is clean and easy to use. Even without much tech knowledge, I had no trouble getting started quickly.",
  },
  {
    id: 4,
    name: "James Rodriguez",
    img: "/client4.jpg",
    review:
      "Running my business is easier with this tool. It saves time, reduces stress, and even my team enjoys working with it.",
  },
  {
    id: 5,
    name: "Sophia Patel",
    img: "/client5.jpg",
    review:
      "Customer support is excellent. Every time I reached out with questions, they responded quickly and solved my issues.",
  },
  {
    id: 6,
    name: "David Kim",
    img: "/client6.jpg",
    review:
      "I rely on this daily for my projects. It boosts productivity and makes complex work feel a lot more manageable.",
  },
  {
    id: 7,
    name: "Olivia Brown",
    img: "/client7.jpg",
    review:
      "The results are consistently great. It feels like having an assistant who never gets tired and always delivers quality.",
  },
  {
    id: 8,
    name: "Daniel Wilson",
    img: "/client8.jpg",
    review:
      "I’ve tested other tools before, but nothing matches this. It’s reliable, efficient, and keeps improving over time.",
  },
  {
    id: 9,
    name: "Ava Martinez",
    img: "/client9.jpg",
    review:
      "It blended perfectly into my existing workflow. I didn’t need to change much, and that made adopting it really smooth.",
  },
  {
    id: 10,
    name: "Liam Patel",
    img: "/client2.png",
    review:
      "It exceeded my expectations. Flexible, simple, and perfect for my needs. I can’t imagine going back to old methods.",
  },
];

export const plans = [
  {
    id: 1,
    name: "Starter",
    description: "Individuals just getting started",
    monthlyPrice: "Free",
    annualPrice: "Free",
    features: [
      "1 Board",
      "Up to 10 uploads (images, docs, or links)",
      "Basic AI Chat (limited queries)",
      "Visual moodboards",
      "Community support",
    ],
    buttonText: "Try for Free",
  },
  {
    id: 2,
    name: "Pro",
    description: "Freelancers & small teams.",
    monthlyPrice: "$19 /per month",
    annualPrice: "$190 /per year", // annual discounted price
    features: [
      "All starter features +",
      "Unlimited Boards",
      "Unlimited uploads (images, docs, links, videos)",
      "Advanced AI Chat (summaries, Q&A)",
      "Mind maps & visual organization",
      "Real-time collaboration",
    ],
    buttonText: "Select Plan",
    popular: true,
  },
  {
    id: 3,
    name: "Team",
    description: "Teams & agencies.",
    monthlyPrice: "$49 /per month",
    annualPrice: "$490 /per year",
    features: [
      "Everything in Pro +",
      "Up to 10 team members",
      "Shared workspaces",
      "Role-based permissions",
      "Premium support (chat + email)",
      "Custom integration support",
      "Early access to new features",
    ],
    buttonText: "Select Plan",
  },
];

export const faqData = [
  {
    question: "What is SlayCanvas and who is it for?",
    answer:
      "SlayCanvas is an AI-powered creative workspace that combines moodboards, research notebooks, and AI chat into one platform. It’s designed for creators, researchers, and teams who want to collect resources, brainstorm ideas, and organize everything visually in one place.",
  },
  {
    question: "Do I need design experience to use SlayCanvas?",
    answer:
      "No, you don’t need design experience. SlayCanvas is designed to be simple and intuitive so anyone can use it to organize ideas visually.",
  },
  {
    question: "Can I collaborate with my team on SlayCanvas?",
    answer:
      "Yes, SlayCanvas supports collaboration so you and your team can work together in one shared workspace.",
  },
];

export default assets;
