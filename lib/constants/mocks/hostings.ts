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
