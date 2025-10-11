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

export const HOSTING_VARIANTS = Object.values(HostingVariant);

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
