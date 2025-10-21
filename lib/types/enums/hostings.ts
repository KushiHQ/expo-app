import { cast } from "../utils";

export enum HostingVariant {
	Residential = "Residential",
	CommercialRetail = "Commercial Retail",
	Office = "Office",
	Storage = "Storage",
	EventVenue = "Event Venue",
	Industrial = "Industrial",
	CreativeStudio = "Creative Studio",
	Hospitality = "Hospitality",
	LandPlots = "Land Plots",
	Parking = "Parking",
	Agricultural = "Agricultural",
	Medical = "Medical",
	Educational = "Educational",
	Religious = "Religious",
	Custom = "Custom",
}

export enum Facility {
	Internet = "Internet",
	Parking = "Parking",
	Restrooms = "Restrooms",
	Kitchen = "Kitchen",
	Heating = "Heating",
	AirConditioning = "Air Conditioning",
	Elevator = "Elevator",
	Accessibility = "Accessibility",
	LaundryRoom = "Laundry Room",
	Balcony = "Balcony",
	SwimmingPool = "Swimming Pool",
	Gym = "Gym",
	Playground = "Playground",
	PetFriendly = "Pet Friendly",
	SecuritySystem = "Security System",
	ConferenceRoom = "Conference Room",
	ReceptionArea = "Reception Area",
	BreakRoom = "Break Room",
	ITInfrastructure = "IT Infrastructure",
	Mailroom = "Mailroom",
	RetailSpace = "Retail Space",
	LoadingDock = "Loading Dock",
	WarehouseSpace = "Warehouse Space",
	WorkshopArea = "Workshop Area",
	HighCeilings = "High Ceilings",
	FreightElevator = "Freight Elevator",
	StorageUnits = "Storage Units",
	Stage = "Stage",
	SoundSystem = "Sound System",
	LightingSystem = "Lighting System",
	GreenRoom = "Green Room",
	NaturalLight = "Natural Light",
	EquipmentRental = "Equipment Rental",
	ExamRooms = "Exam Rooms",
	Laboratory = "Laboratory",
	Classroom = "Classroom",
	Library = "Library",
	Auditorium = "Auditorium",
	IrrigationSystem = "Irrigation System",
	Barn = "Barn",
	Greenhouse = "Greenhouse",
	Fencing = "Fencing",
	Utilities = "Utilities",
}

export const Room = {
	Exterior: "Exterior",
	LivingRoom: "Living Room",
	Bedroom: "Bedroom",
	Bathroom: "Bathroom",
	Kitchen: "Kitchen",
	DiningRoom: "Dining Room",
	Corridor: "Corridor",
	Balcony: "Balcony",
	OfficeSpace: "Office Space",
	MeetingRoom: "Meeting Room",
	WaitingRoom: "Waiting Room",
	RetailArea: "Retail Area",
	StockRoom: "Stock Room",
	MainHall: "Main Hall",
	GuestRoom: "Guest Room",
	PatientRoom: "Patient Room",
	StudioSpace: "Studio Space",
	WorkshopArea: "Workshop Area",
	StorageArea: "Storage Area",
	Others: "Others",
} as const;

export const HOSTING_VARIANTS = Object.values(HostingVariant);
export const ROOM_KEYS = cast<(keyof typeof Room)[]>(Object.keys(Room));

export interface FacilityHostingMapping {
	facility: Facility;
	hostingVariants: HostingVariant[];
}

export const FACILITIES_BY_VARIANT: FacilityHostingMapping[] = [
	{
		facility: Facility.Internet,
		hostingVariants: [
			HostingVariant.Residential,
			HostingVariant.CommercialRetail,
			HostingVariant.Office,
			HostingVariant.Storage,
			HostingVariant.EventVenue,
			HostingVariant.Industrial,
			HostingVariant.CreativeStudio,
			HostingVariant.Hospitality,
			HostingVariant.Medical,
			HostingVariant.Educational,
		],
	},
	{
		facility: Facility.Parking,
		hostingVariants: [
			HostingVariant.Residential,
			HostingVariant.CommercialRetail,
			HostingVariant.Office,
			HostingVariant.EventVenue,
			HostingVariant.Industrial,
			HostingVariant.CreativeStudio,
			HostingVariant.Hospitality,
			HostingVariant.Medical,
			HostingVariant.Educational,
			HostingVariant.Religious,
			HostingVariant.Parking,
		],
	},
	{
		facility: Facility.Restrooms,
		hostingVariants: [
			HostingVariant.CommercialRetail,
			HostingVariant.Office,
			HostingVariant.EventVenue,
			HostingVariant.Industrial,
			HostingVariant.CreativeStudio,
			HostingVariant.Hospitality,
			HostingVariant.Medical,
			HostingVariant.Educational,
			HostingVariant.Religious,
		],
	},
	{
		facility: Facility.Kitchen,
		hostingVariants: [
			HostingVariant.Residential,
			HostingVariant.Office,
			HostingVariant.EventVenue,
			HostingVariant.Hospitality,
		],
	},
	{
		facility: Facility.Heating,
		hostingVariants: [
			HostingVariant.Residential,
			HostingVariant.CommercialRetail,
			HostingVariant.Office,
			HostingVariant.EventVenue,
			HostingVariant.Hospitality,
			HostingVariant.Medical,
			HostingVariant.Educational,
		],
	},
	{
		facility: Facility.AirConditioning,
		hostingVariants: [
			HostingVariant.Residential,
			HostingVariant.CommercialRetail,
			HostingVariant.Office,
			HostingVariant.EventVenue,
			HostingVariant.Hospitality,
			HostingVariant.Medical,
			HostingVariant.Educational,
		],
	},
	{
		facility: Facility.Elevator,
		hostingVariants: [
			HostingVariant.Office,
			HostingVariant.Medical,
			HostingVariant.Hospitality,
			HostingVariant.Residential,
		],
	},
	{
		facility: Facility.Accessibility,
		hostingVariants: [
			HostingVariant.CommercialRetail,
			HostingVariant.Office,
			HostingVariant.EventVenue,
			HostingVariant.Medical,
			HostingVariant.Educational,
			HostingVariant.Religious,
			HostingVariant.Parking,
		],
	},
	{
		facility: Facility.SecuritySystem,
		hostingVariants: [
			HostingVariant.Residential,
			HostingVariant.CommercialRetail,
			HostingVariant.Storage,
			HostingVariant.Office,
			HostingVariant.Industrial,
			HostingVariant.Hospitality,
			HostingVariant.Parking,
		],
	},
	{
		facility: Facility.LaundryRoom,
		hostingVariants: [HostingVariant.Residential, HostingVariant.Hospitality],
	},
	{
		facility: Facility.Balcony,
		hostingVariants: [HostingVariant.Residential, HostingVariant.Hospitality],
	},
	{
		facility: Facility.SwimmingPool,
		hostingVariants: [HostingVariant.Residential, HostingVariant.Hospitality],
	},
	{
		facility: Facility.Gym,
		hostingVariants: [HostingVariant.Residential, HostingVariant.Hospitality],
	},
	{
		facility: Facility.Playground,
		hostingVariants: [HostingVariant.Residential],
	},
	{
		facility: Facility.PetFriendly,
		hostingVariants: [HostingVariant.Residential],
	},
	{
		facility: Facility.ConferenceRoom,
		hostingVariants: [HostingVariant.Office],
	},
	{
		facility: Facility.ReceptionArea,
		hostingVariants: [HostingVariant.CommercialRetail, HostingVariant.Office],
	},
	{
		facility: Facility.BreakRoom,
		hostingVariants: [HostingVariant.Office],
	},
	{
		facility: Facility.ITInfrastructure,
		hostingVariants: [HostingVariant.Office],
	},
	{
		facility: Facility.Mailroom,
		hostingVariants: [HostingVariant.Office],
	},
	{
		facility: Facility.RetailSpace,
		hostingVariants: [HostingVariant.CommercialRetail],
	},
	{
		facility: Facility.LoadingDock,
		hostingVariants: [HostingVariant.Storage, HostingVariant.Industrial],
	},
	{
		facility: Facility.WarehouseSpace,
		hostingVariants: [HostingVariant.Storage, HostingVariant.Industrial],
	},
	{
		facility: Facility.WorkshopArea,
		hostingVariants: [HostingVariant.Industrial],
	},
	{
		facility: Facility.HighCeilings,
		hostingVariants: [
			HostingVariant.Storage,
			HostingVariant.Industrial,
			HostingVariant.EventVenue,
		],
	},
	{
		facility: Facility.FreightElevator,
		hostingVariants: [HostingVariant.Industrial, HostingVariant.Storage],
	},
	{
		facility: Facility.StorageUnits,
		hostingVariants: [HostingVariant.Storage],
	},
	{
		facility: Facility.Stage,
		hostingVariants: [HostingVariant.EventVenue],
	},
	{
		facility: Facility.SoundSystem,
		hostingVariants: [HostingVariant.EventVenue],
	},
	{
		facility: Facility.LightingSystem,
		hostingVariants: [HostingVariant.EventVenue],
	},
	{
		facility: Facility.GreenRoom,
		hostingVariants: [HostingVariant.EventVenue],
	},
	{
		facility: Facility.NaturalLight,
		hostingVariants: [HostingVariant.CreativeStudio],
	},
	{
		facility: Facility.EquipmentRental,
		hostingVariants: [HostingVariant.CreativeStudio, HostingVariant.EventVenue],
	},
	{
		facility: Facility.ExamRooms,
		hostingVariants: [HostingVariant.Medical],
	},
	{
		facility: Facility.Laboratory,
		hostingVariants: [HostingVariant.Medical],
	},
	{
		facility: Facility.Classroom,
		hostingVariants: [HostingVariant.Educational],
	},
	{
		facility: Facility.Library,
		hostingVariants: [HostingVariant.Educational],
	},
	{
		facility: Facility.Auditorium,
		hostingVariants: [
			HostingVariant.Educational,
			HostingVariant.Religious,
			HostingVariant.EventVenue,
		],
	},
	{
		facility: Facility.IrrigationSystem,
		hostingVariants: [HostingVariant.Agricultural, HostingVariant.LandPlots],
	},
	{
		facility: Facility.Barn,
		hostingVariants: [HostingVariant.Agricultural],
	},
	{
		facility: Facility.Greenhouse,
		hostingVariants: [HostingVariant.Agricultural],
	},
	{
		facility: Facility.Fencing,
		hostingVariants: [
			HostingVariant.LandPlots,
			HostingVariant.Agricultural,
			HostingVariant.Residential,
		],
	},
	{
		facility: Facility.Utilities,
		hostingVariants: [HostingVariant.LandPlots],
	},
];

export interface RoomHostingMapping {
	room: keyof typeof Room;
	hostingVariants: HostingVariant[];
}

export const ROOMS_BY_VARIANT: RoomHostingMapping[] = [
	{
		room: Room.Exterior,
		hostingVariants: [
			HostingVariant.Residential,
			HostingVariant.CommercialRetail,
			HostingVariant.Office,
			HostingVariant.EventVenue,
			HostingVariant.Industrial,
			HostingVariant.CreativeStudio,
			HostingVariant.Hospitality,
			HostingVariant.Medical,
			HostingVariant.Educational,
			HostingVariant.Religious,
			HostingVariant.Agricultural,
		],
	},
	{
		room: "LivingRoom",
		hostingVariants: [HostingVariant.Residential, HostingVariant.Hospitality],
	},
	{
		room: Room.Bedroom,
		hostingVariants: [HostingVariant.Residential, HostingVariant.Hospitality],
	},
	{
		room: Room.Bathroom,
		hostingVariants: [
			HostingVariant.Residential,
			HostingVariant.CommercialRetail,
			HostingVariant.Office,
			HostingVariant.EventVenue,
			HostingVariant.Industrial,
			HostingVariant.CreativeStudio,
			HostingVariant.Hospitality,
			HostingVariant.Medical,
			HostingVariant.Educational,
		],
	},
	{
		room: Room.Kitchen,
		hostingVariants: [
			HostingVariant.Residential,
			HostingVariant.Hospitality,
			HostingVariant.Office,
			HostingVariant.EventVenue,
		],
	},
	{
		room: "DiningRoom",
		hostingVariants: [HostingVariant.Residential, HostingVariant.Hospitality],
	},
	{
		room: Room.Corridor,
		hostingVariants: [
			HostingVariant.Residential,
			HostingVariant.CommercialRetail,
			HostingVariant.Office,
			HostingVariant.EventVenue,
			HostingVariant.Hospitality,
			HostingVariant.Medical,
			HostingVariant.Educational,
		],
	},
	{
		room: Room.Balcony,
		hostingVariants: [HostingVariant.Residential, HostingVariant.Hospitality],
	},

	{
		room: "OfficeSpace",
		hostingVariants: [HostingVariant.Office, HostingVariant.CommercialRetail],
	},
	{
		room: "MeetingRoom",
		hostingVariants: [HostingVariant.Office, HostingVariant.EventVenue],
	},
	{
		room: "WaitingRoom",
		hostingVariants: [
			HostingVariant.Office,
			HostingVariant.Medical,
			HostingVariant.EventVenue,
		],
	},
	{
		room: "RetailArea",
		hostingVariants: [HostingVariant.CommercialRetail],
	},
	{
		room: "StockRoom",
		hostingVariants: [
			HostingVariant.CommercialRetail,
			HostingVariant.Storage,
			HostingVariant.Industrial,
		],
	},
	{
		room: "MainHall",
		hostingVariants: [HostingVariant.EventVenue, HostingVariant.Religious],
	},
	{
		room: "GuestRoom",
		hostingVariants: [HostingVariant.Hospitality],
	},
	{
		room: "PatientRoom",
		hostingVariants: [HostingVariant.Medical],
	},
	{
		room: "StudioSpace",
		hostingVariants: [HostingVariant.CreativeStudio],
	},
	{
		room: "WorkshopArea",
		hostingVariants: [HostingVariant.Industrial, HostingVariant.CreativeStudio],
	},
	{
		room: "StorageArea",
		hostingVariants: [
			HostingVariant.Storage,
			HostingVariant.Industrial,
			HostingVariant.CommercialRetail,
		],
	},
	{
		room: Room.Others,
		hostingVariants: Object.values(HostingVariant),
	},
];
