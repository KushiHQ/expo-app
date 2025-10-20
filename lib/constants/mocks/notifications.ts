import { faker } from "@faker-js/faker";

export const NOTIFICATION_CATEGORY = ["System", "Guest Alert"] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORY)[number];

export interface Notification {
	id: string;
	category: NotificationCategory;
	title: string;
	message: string;
	date: Date;
	read: boolean;
	hasAction: boolean;
}

const systemNotificationTemplates = [
	{
		title: "Security Update",
		message:
			"We've added new two-factor authentication options to enhance your account security.",
		hasAction: true,
	},
	{
		title: "App Update Available",
		message:
			"A new version of Kushi is available with performance improvements.",
		hasAction: true,
	},
	{
		title: "KYC Verified",
		message:
			"Your identity has been successfully verified. You can now access all features.",
		hasAction: false,
	},
	{
		title: "New Feature: Instant Booking",
		message:
			"Now book verified homes instantly without back-and-forth messaging.",
		hasAction: false,
	},
];

const guestAlertTemplates = [
	{
		title: "Booking Confirmed",
		message:
			'Your booking for "Luxury 3 Bedroom Penthouse" has been confirmed. View receipt for details.',
		hasAction: true,
	},
	{
		title: "Payment Successful",
		message: "We have successfully processed your payment of ₦3,000,000.",
		hasAction: false,
	},
	{
		title: "Upcoming Stay Reminder",
		message:
			'Your stay at "4 Duplex Apartment" in Maitama, Abuja begins in 3 days.',
		hasAction: true,
	},
	{
		title: "Host Message Received",
		message:
			"You have a new message from your host regarding your upcoming stay.",
		hasAction: true,
	},
];

/**
 * Generates a list of mock notifications.
 * @param count The number of notifications to generate.
 * @returns An array of mock Notification objects.
 */
export function generateMockNotifications(count: number = 10): Notification[] {
	const notifications: Notification[] = [];

	for (let i = 0; i < count; i++) {
		const category: NotificationCategory = faker.helpers.arrayElement([
			"System",
			"Guest Alert",
		]);

		let template;
		if (category === "System") {
			template = faker.helpers.arrayElement(systemNotificationTemplates);
		} else {
			template = faker.helpers.arrayElement(guestAlertTemplates);
		}

		const notification: Notification = {
			id: faker.string.uuid(),
			category: category,
			title: template.title,
			message: template.message,
			date: faker.date.recent({ days: 5 }),
			read: faker.datatype.boolean(0.3),
			hasAction: template.hasAction,
		};

		notifications.push(notification);
	}

	return notifications.sort((a, b) => b.date.getTime() - a.date.getTime());
}
