import { faker } from "@faker-js/faker";

export type Hosting = {
	id: string;
	state: string;
	title: string;
	city: string;
	createdBy: string;
	creatorYears: number;
	country: string;
	address: string;
	description: string;
	pricing: "nightly" | "weekly" | "monthly" | "anually";
	dateAdded: string;
	averageRating: number;
	ratingCount: number;
	price: number;
	images: string[];
};

export type ReviewMetrics = {
	cleanliness: number;
	accuracy: number;
	communication: number;
	location: number;
	checkIn: number;
	value: number;
};

export type Review = {
	id: string;
	user: {
		name: string;
		avatar: string;
	};
	date: string;
	rating: number;
	comment: string;
	metrics: ReviewMetrics;
};

const getPexelsImage = async (query: string, page: number = 1) => {
	const response = await fetch(
		`https://api.pexels.com/v1/search?query=${query}&per_page=1&page=${page}`,
		{
			headers: {
				Authorization: process.env.EXPO_PUBLIC_PEXELS_APIK_KEY ?? "",
			},
		},
	);
	const data = await response.json();
	return data.photos?.at(0)?.src?.large || "";
};

const generateMockHosting = async (): Promise<Hosting> => {
	const pricingOptions: Hosting["pricing"][] = [
		"nightly",
		"weekly",
		"monthly",
		"anually",
	];
	const ratingCount = faker.number.int({ min: 10, max: 200 });
	const averageRating = faker.number.float({
		min: 3.5,
		max: 5,
	});

	const roomTypes = ["bedroom", "living room", "kitchen", "bathroom"];
	const numberOfRoomImages = faker.number.int({ min: 2, max: 4 });

	const houseImage = await getPexelsImage(
		"house exterior",
		faker.number.int({ min: 1, max: 100 }),
	);

	const roomImages = await Promise.all(
		Array.from({ length: numberOfRoomImages }, async () => {
			const roomType = faker.helpers.arrayElement(roomTypes);
			return await getPexelsImage(
				roomType,
				faker.number.int({ min: 1, max: 100 }),
			);
		}),
	);

	return {
		id: faker.string.uuid(),
		title: faker.company.catchPhrase(),
		state: faker.location.state(),
		createdBy: faker.person.fullName(),
		city: faker.location.city(),
		country: faker.location.country(),
		creatorYears: faker.number.int({ min: 1, max: 100 }),
		address: faker.location.streetAddress(),
		pricing: faker.helpers.arrayElement(pricingOptions),
		description: faker.lorem.paragraph({ min: 3, max: 5 }),
		dateAdded: faker.date.recent().toISOString().split("T")[0],
		averageRating: parseFloat(averageRating.toFixed(1)),
		ratingCount: ratingCount,
		price: faker.number.int({ min: 50, max: 2000 }) * 1000,
		images: [houseImage, ...roomImages],
	};
};

export const generateMockHostings = async (
	count: number = 10,
): Promise<Hosting[]> => {
	return await Promise.all(
		Array.from({ length: count }, () => generateMockHosting()),
	);
};

const reviewComments = [
	"We had a delightful stay! We loved soaking in the tub, hiking in the area, and wine tasting in Truckee.",
	"The space was perfect for our weekend getaway. The host was very responsive and the location was fantastic.",
	"Highly recommend this place! It was clean, comfortable, and the decor was lovely.",
	"A truly wonderful experience. The host went above and beyond to make us feel at home.",
	"Great location and amazing amenities. We will definitely be coming back.",
	"The apartment was exactly as described. The check-in process was seamless and easy.",
];

/**
 * Calculates the average rating from a metrics object.
 * @param {ReviewMetrics} metrics The object containing the individual ratings.
 * @returns {number} The average rating.
 */
const calculateAverageRating = (metrics: ReviewMetrics): number => {
	const values = Object.values(metrics);
	const sum = values.reduce((acc, curr) => acc + curr, 0);
	const average = sum / values.length;
	return parseFloat(average.toFixed(1)); // Return with one decimal place
};

/**
 * Generates a single mock review object with individual metric ratings.
 * @returns {Review} A mock review object.
 */
const generateMockReview = (): Review => {
	const metrics: ReviewMetrics = {
		cleanliness: faker.number.float({ min: 3.5, max: 5 }),
		accuracy: faker.number.float({ min: 3.5, max: 5 }),
		communication: faker.number.float({ min: 3.5, max: 5 }),
		location: faker.number.float({ min: 3.5, max: 5 }),
		checkIn: faker.number.float({ min: 3.5, max: 5 }),
		value: faker.number.float({ min: 3.5, max: 5 }),
	};

	const overallRating = calculateAverageRating(metrics);

	return {
		id: faker.string.uuid(),
		user: {
			name: faker.person.firstName(),
			avatar: faker.image.avatar(),
		},
		date: faker.date.recent().toISOString(),
		rating: overallRating,
		comment: faker.helpers.arrayElement(reviewComments),
		metrics: metrics,
	};
};

/**
 * Generates a specified number of mock review objects.
 * @param {number} count The number of reviews to generate.
 * @returns {Review[]} An array of mock review objects.
 */
export const generateMockReviews = (count: number): Review[] => {
	return Array.from({ length: count }, generateMockReview);
};
