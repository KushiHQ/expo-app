import { faker } from "@faker-js/faker";

export type Message = {
  id: string;
  text: string;
  date: string;
  isSender: boolean;
};

export type Chat = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  lastMessage: string;
  unreadCount: number;
  date: string;
  messages: Message[];
};

const genericInquiries = [
  "Hi, good day {name} 👋",
  "I want to ask about the enquiry of the house you posted.",
  "Hello, good day {name} 😊",
  "Is this property still available for rent next month?",
  "Could you please send me more pictures of the interior?",
  "When is the earliest time I can come for a viewing?",
  "That sounds great, I'm confirming the meeting time.",
  "Do you offer any discounts for long-term rentals?",
];

/**
 * Generates an array of mock messages for a chat history.
 * @param {number} count The number of messages to generate.
 * @returns {Message[]} An array of mock message objects.
 */
export const generateMockMessages = (count: number): Message[] => {
  const messages: Message[] = [];
  const now = new Date();
  const startTime = faker.date.recent({ days: 1, refDate: now }).getTime();

  let currentSender = faker.datatype.boolean();

  for (let i = 0; i < count; i++) {
    const messageTime = new Date(
      startTime + i * faker.number.int({ min: 1, max: 15 }) * 60000,
    );

    const messageText = faker.helpers
      .arrayElement(genericInquiries)
      .replace("{name}", faker.person.firstName());

    messages.push({
      id: faker.string.uuid(),
      text: messageText,
      date: messageTime.toISOString(),
      isSender: currentSender,
    });

    currentSender = !currentSender;
  }
  return messages;
};

/**
 * Generates a specified number of mock chat objects with full message history.
 */
export const generateMockChatsWithHistory = (count: number): Chat[] => {
  return Array.from({ length: count }, () => {
    const messages = generateMockMessages(
      faker.number.int({ min: 5, max: 15 }),
    );
    const lastMessage = messages[messages.length - 1];

    return {
      id: faker.string.uuid(),
      user: {
        name: faker.person.fullName(),
        avatar: faker.image.avatar(),
      },
      lastMessage: lastMessage.text,
      unreadCount: faker.number.int({ min: 0, max: 9 }),
      date: lastMessage.date,
      messages: messages,
    };
  });
};
