import { cast } from '../utils';

export enum PropertyType {
  Residential = 'Residential',
  CommercialRetail = 'Commercial Retail',
  Office = 'Office',
  Storage = 'Storage',
  EventVenue = 'Event Venue',
  Industrial = 'Industrial',
  CreativeStudio = 'Creative Studio',
  Hospitality = 'Hospitality',
  LandPlots = 'Land Plots',
  Parking = 'Parking',
  Agricultural = 'Agricultural',
  Medical = 'Medical',
  Educational = 'Educational',
  Religious = 'Religious',
  Custom = 'Custom',
}

export enum Facility {
  Internet = 'Internet',
  Parking = 'Parking',
  Restrooms = 'Restrooms',
  Kitchen = 'Kitchen',
  Heating = 'Heating',
  AirConditioning = 'Air Conditioning',
  Elevator = 'Elevator',
  Accessibility = 'Accessibility',
  LaundryRoom = 'Laundry Room',
  Balcony = 'Balcony',
  SwimmingPool = 'Swimming Pool',
  Gym = 'Gym',
  Playground = 'Playground',
  PetFriendly = 'Pet Friendly',
  SecuritySystem = 'Security System',
  ConferenceRoom = 'Conference Room',
  ReceptionArea = 'Reception Area',
  BreakRoom = 'Break Room',
  ITInfrastructure = 'IT Infrastructure',
  Mailroom = 'Mailroom',
  RetailSpace = 'Retail Space',
  LoadingDock = 'Loading Dock',
  WarehouseSpace = 'Warehouse Space',
  WorkshopArea = 'Workshop Area',
  HighCeilings = 'High Ceilings',
  FreightElevator = 'Freight Elevator',
  StorageUnits = 'Storage Units',
  Stage = 'Stage',
  SoundSystem = 'Sound System',
  LightingSystem = 'Lighting System',
  GreenRoom = 'Green Room',
  NaturalLight = 'Natural Light',
  EquipmentRental = 'Equipment Rental',
  ExamRooms = 'Exam Rooms',
  Laboratory = 'Laboratory',
  Classroom = 'Classroom',
  Library = 'Library',
  Auditorium = 'Auditorium',
  IrrigationSystem = 'Irrigation System',
  Barn = 'Barn',
  Greenhouse = 'Greenhouse',
  Fencing = 'Fencing',
  Utilities = 'Utilities',
}

export const Room = {
  Exterior: 'Exterior',
  LivingRoom: 'Living Room',
  Bedroom: 'Bedroom',
  Bathroom: 'Bathroom',
  Kitchen: 'Kitchen',
  DiningRoom: 'Dining Room',
  Corridor: 'Corridor',
  Balcony: 'Balcony',
  OfficeSpace: 'Office Space',
  MeetingRoom: 'Meeting Room',
  WaitingRoom: 'Waiting Room',
  RetailArea: 'Retail Area',
  StockRoom: 'Stock Room',
  MainHall: 'Main Hall',
  GuestRoom: 'Guest Room',
  PatientRoom: 'Patient Room',
  StudioSpace: 'Studio Space',
  WorkshopArea: 'Workshop Area',
  StorageArea: 'Storage Area',
  Others: 'Others',
} as const;

export const PROPERTY_TYPE = Object.values(PropertyType);
export const FACILITIES = Object.values(Facility);
export const ROOM_KEYS = cast<(keyof typeof Room)[]>(Object.keys(Room));

export interface FacilityHostingMapping {
  facility: Facility;
  hostingVariants: PropertyType[];
}

export const FACILITIES_BY_VARIANT: FacilityHostingMapping[] = [
  {
    facility: Facility.Internet,
    hostingVariants: [
      PropertyType.Residential,
      PropertyType.CommercialRetail,
      PropertyType.Office,
      PropertyType.Storage,
      PropertyType.EventVenue,
      PropertyType.Industrial,
      PropertyType.CreativeStudio,
      PropertyType.Hospitality,
      PropertyType.Medical,
      PropertyType.Educational,
    ],
  },
  {
    facility: Facility.Parking,
    hostingVariants: [
      PropertyType.Residential,
      PropertyType.CommercialRetail,
      PropertyType.Office,
      PropertyType.EventVenue,
      PropertyType.Industrial,
      PropertyType.CreativeStudio,
      PropertyType.Hospitality,
      PropertyType.Medical,
      PropertyType.Educational,
      PropertyType.Religious,
      PropertyType.Parking,
    ],
  },
  {
    facility: Facility.Restrooms,
    hostingVariants: [
      PropertyType.CommercialRetail,
      PropertyType.Office,
      PropertyType.EventVenue,
      PropertyType.Industrial,
      PropertyType.CreativeStudio,
      PropertyType.Hospitality,
      PropertyType.Medical,
      PropertyType.Educational,
      PropertyType.Religious,
    ],
  },
  {
    facility: Facility.Kitchen,
    hostingVariants: [
      PropertyType.Residential,
      PropertyType.Office,
      PropertyType.EventVenue,
      PropertyType.Hospitality,
    ],
  },
  {
    facility: Facility.Heating,
    hostingVariants: [
      PropertyType.Residential,
      PropertyType.CommercialRetail,
      PropertyType.Office,
      PropertyType.EventVenue,
      PropertyType.Hospitality,
      PropertyType.Medical,
      PropertyType.Educational,
    ],
  },
  {
    facility: Facility.AirConditioning,
    hostingVariants: [
      PropertyType.Residential,
      PropertyType.CommercialRetail,
      PropertyType.Office,
      PropertyType.EventVenue,
      PropertyType.Hospitality,
      PropertyType.Medical,
      PropertyType.Educational,
    ],
  },
  {
    facility: Facility.Elevator,
    hostingVariants: [
      PropertyType.Office,
      PropertyType.Medical,
      PropertyType.Hospitality,
      PropertyType.Residential,
    ],
  },
  {
    facility: Facility.Accessibility,
    hostingVariants: [
      PropertyType.CommercialRetail,
      PropertyType.Office,
      PropertyType.EventVenue,
      PropertyType.Medical,
      PropertyType.Educational,
      PropertyType.Religious,
      PropertyType.Parking,
    ],
  },
  {
    facility: Facility.SecuritySystem,
    hostingVariants: [
      PropertyType.Residential,
      PropertyType.CommercialRetail,
      PropertyType.Storage,
      PropertyType.Office,
      PropertyType.Industrial,
      PropertyType.Hospitality,
      PropertyType.Parking,
    ],
  },
  {
    facility: Facility.LaundryRoom,
    hostingVariants: [PropertyType.Residential, PropertyType.Hospitality],
  },
  {
    facility: Facility.Balcony,
    hostingVariants: [PropertyType.Residential, PropertyType.Hospitality],
  },
  {
    facility: Facility.SwimmingPool,
    hostingVariants: [PropertyType.Residential, PropertyType.Hospitality],
  },
  {
    facility: Facility.Gym,
    hostingVariants: [PropertyType.Residential, PropertyType.Hospitality],
  },
  {
    facility: Facility.Playground,
    hostingVariants: [PropertyType.Residential],
  },
  {
    facility: Facility.PetFriendly,
    hostingVariants: [PropertyType.Residential],
  },
  {
    facility: Facility.ConferenceRoom,
    hostingVariants: [PropertyType.Office],
  },
  {
    facility: Facility.ReceptionArea,
    hostingVariants: [PropertyType.CommercialRetail, PropertyType.Office],
  },
  {
    facility: Facility.BreakRoom,
    hostingVariants: [PropertyType.Office],
  },
  {
    facility: Facility.ITInfrastructure,
    hostingVariants: [PropertyType.Office],
  },
  {
    facility: Facility.Mailroom,
    hostingVariants: [PropertyType.Office],
  },
  {
    facility: Facility.RetailSpace,
    hostingVariants: [PropertyType.CommercialRetail],
  },
  {
    facility: Facility.LoadingDock,
    hostingVariants: [PropertyType.Storage, PropertyType.Industrial],
  },
  {
    facility: Facility.WarehouseSpace,
    hostingVariants: [PropertyType.Storage, PropertyType.Industrial],
  },
  {
    facility: Facility.WorkshopArea,
    hostingVariants: [PropertyType.Industrial],
  },
  {
    facility: Facility.HighCeilings,
    hostingVariants: [PropertyType.Storage, PropertyType.Industrial, PropertyType.EventVenue],
  },
  {
    facility: Facility.FreightElevator,
    hostingVariants: [PropertyType.Industrial, PropertyType.Storage],
  },
  {
    facility: Facility.StorageUnits,
    hostingVariants: [PropertyType.Storage],
  },
  {
    facility: Facility.Stage,
    hostingVariants: [PropertyType.EventVenue],
  },
  {
    facility: Facility.SoundSystem,
    hostingVariants: [PropertyType.EventVenue],
  },
  {
    facility: Facility.LightingSystem,
    hostingVariants: [PropertyType.EventVenue],
  },
  {
    facility: Facility.GreenRoom,
    hostingVariants: [PropertyType.EventVenue],
  },
  {
    facility: Facility.NaturalLight,
    hostingVariants: [PropertyType.CreativeStudio],
  },
  {
    facility: Facility.EquipmentRental,
    hostingVariants: [PropertyType.CreativeStudio, PropertyType.EventVenue],
  },
  {
    facility: Facility.ExamRooms,
    hostingVariants: [PropertyType.Medical],
  },
  {
    facility: Facility.Laboratory,
    hostingVariants: [PropertyType.Medical],
  },
  {
    facility: Facility.Classroom,
    hostingVariants: [PropertyType.Educational],
  },
  {
    facility: Facility.Library,
    hostingVariants: [PropertyType.Educational],
  },
  {
    facility: Facility.Auditorium,
    hostingVariants: [PropertyType.Educational, PropertyType.Religious, PropertyType.EventVenue],
  },
  {
    facility: Facility.IrrigationSystem,
    hostingVariants: [PropertyType.Agricultural, PropertyType.LandPlots],
  },
  {
    facility: Facility.Barn,
    hostingVariants: [PropertyType.Agricultural],
  },
  {
    facility: Facility.Greenhouse,
    hostingVariants: [PropertyType.Agricultural],
  },
  {
    facility: Facility.Fencing,
    hostingVariants: [PropertyType.LandPlots, PropertyType.Agricultural, PropertyType.Residential],
  },
  {
    facility: Facility.Utilities,
    hostingVariants: [PropertyType.LandPlots],
  },
];

export interface RoomHostingMapping {
  room: keyof typeof Room;
  hostingVariants: PropertyType[];
}

export const ROOMS_BY_VARIANT: RoomHostingMapping[] = [
  {
    room: Room.Exterior,
    hostingVariants: [
      PropertyType.Residential,
      PropertyType.CommercialRetail,
      PropertyType.Office,
      PropertyType.EventVenue,
      PropertyType.Industrial,
      PropertyType.CreativeStudio,
      PropertyType.Hospitality,
      PropertyType.Medical,
      PropertyType.Educational,
      PropertyType.Religious,
      PropertyType.Agricultural,
    ],
  },
  {
    room: 'LivingRoom',
    hostingVariants: [PropertyType.Residential, PropertyType.Hospitality],
  },
  {
    room: Room.Bedroom,
    hostingVariants: [PropertyType.Residential, PropertyType.Hospitality],
  },
  {
    room: Room.Bathroom,
    hostingVariants: [
      PropertyType.Residential,
      PropertyType.CommercialRetail,
      PropertyType.Office,
      PropertyType.EventVenue,
      PropertyType.Industrial,
      PropertyType.CreativeStudio,
      PropertyType.Hospitality,
      PropertyType.Medical,
      PropertyType.Educational,
    ],
  },
  {
    room: Room.Kitchen,
    hostingVariants: [
      PropertyType.Residential,
      PropertyType.Hospitality,
      PropertyType.Office,
      PropertyType.EventVenue,
    ],
  },
  {
    room: 'DiningRoom',
    hostingVariants: [PropertyType.Residential, PropertyType.Hospitality],
  },
  {
    room: Room.Corridor,
    hostingVariants: [
      PropertyType.Residential,
      PropertyType.CommercialRetail,
      PropertyType.Office,
      PropertyType.EventVenue,
      PropertyType.Hospitality,
      PropertyType.Medical,
      PropertyType.Educational,
    ],
  },
  {
    room: Room.Balcony,
    hostingVariants: [PropertyType.Residential, PropertyType.Hospitality],
  },

  {
    room: 'OfficeSpace',
    hostingVariants: [PropertyType.Office, PropertyType.CommercialRetail],
  },
  {
    room: 'MeetingRoom',
    hostingVariants: [PropertyType.Office, PropertyType.EventVenue],
  },
  {
    room: 'WaitingRoom',
    hostingVariants: [PropertyType.Office, PropertyType.Medical, PropertyType.EventVenue],
  },
  {
    room: 'RetailArea',
    hostingVariants: [PropertyType.CommercialRetail],
  },
  {
    room: 'StockRoom',
    hostingVariants: [PropertyType.CommercialRetail, PropertyType.Storage, PropertyType.Industrial],
  },
  {
    room: 'MainHall',
    hostingVariants: [PropertyType.EventVenue, PropertyType.Religious],
  },
  {
    room: 'GuestRoom',
    hostingVariants: [PropertyType.Hospitality],
  },
  {
    room: 'PatientRoom',
    hostingVariants: [PropertyType.Medical],
  },
  {
    room: 'StudioSpace',
    hostingVariants: [PropertyType.CreativeStudio],
  },
  {
    room: 'WorkshopArea',
    hostingVariants: [PropertyType.Industrial, PropertyType.CreativeStudio],
  },
  {
    room: 'StorageArea',
    hostingVariants: [PropertyType.Storage, PropertyType.Industrial, PropertyType.CommercialRetail],
  },
  {
    room: Room.Others,
    hostingVariants: Object.values(PropertyType),
  },
];
