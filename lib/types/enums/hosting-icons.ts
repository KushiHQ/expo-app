import { IconoirElevator } from "@/components/icons/i-elevator";
import { Facility, HostingVariant } from "./hostings";
import {
	ChefHatIcon,
	LucideIcon,
	ParkingCircleIcon,
	Snowflake,
	Thermometer,
	ToiletIcon,
	WifiIcon,
	Accessibility,
	WashingMachine,
	Building2,
	Dumbbell,
	PawPrint,
	ShieldCheck,
	Presentation,
	Bell,
	Coffee,
	Server,
	Mail,
	ShoppingBag,
	Truck,
	Warehouse,
	Hammer,
	ChevronUp,
	Box,
	Archive,
	Theater,
	Volume2,
	Lightbulb,
	UsersRound,
	Sun,
	ToolCase,
	Stethoscope,
	Microscope,
	BookOpen,
	Library,
	Monitor,
	Droplet,
	Fence,
	Zap,
	HelpCircle,
	Home,
	Briefcase,
	CalendarCheck,
	Factory,
	Hotel,
	LandPlot,
	ParkingCircle,
	Tractor,
	Hospital,
	GraduationCap,
	Church,
} from "lucide-react-native";
import { CustomSvgProps } from "../svgType";
import React from "react";
import { TablerSwiming } from "@/components/icons/i-swiming";
import { MaterialSymbolsLightPlaygroundOutline } from "@/components/icons/i-playground";
import { HeroiconsCamera } from "@/components/icons/i-camera";
import { GameIconsGreenhouse, PhBarn } from "@/components/icons/i-buildings";

export type IconType = React.FC<CustomSvgProps> | LucideIcon;

export type FacilityIconMap = {
	[key in Facility]: IconType;
};

export const FACILITY_ICONS: FacilityIconMap = {
	[Facility.Internet]: WifiIcon,
	[Facility.Parking]: ParkingCircleIcon,
	[Facility.Restrooms]: ToiletIcon,
	[Facility.Kitchen]: ChefHatIcon,
	[Facility.Heating]: Thermometer,
	[Facility.AirConditioning]: Snowflake,
	[Facility.Elevator]: IconoirElevator,
	[Facility.Accessibility]: Accessibility,
	[Facility.LaundryRoom]: WashingMachine,
	[Facility.Balcony]: Building2,
	[Facility.SwimmingPool]: TablerSwiming,
	[Facility.Gym]: Dumbbell,
	[Facility.Playground]: MaterialSymbolsLightPlaygroundOutline,
	[Facility.PetFriendly]: PawPrint,
	[Facility.SecuritySystem]: ShieldCheck,
	[Facility.ConferenceRoom]: Presentation,
	[Facility.ReceptionArea]: Bell,
	[Facility.BreakRoom]: Coffee,
	[Facility.ITInfrastructure]: Server,
	[Facility.Mailroom]: Mail,
	[Facility.RetailSpace]: ShoppingBag,
	[Facility.LoadingDock]: Truck,
	[Facility.WarehouseSpace]: Warehouse,
	[Facility.WorkshopArea]: Hammer,
	[Facility.HighCeilings]: ChevronUp,
	[Facility.FreightElevator]: Box,
	[Facility.StorageUnits]: Archive,
	[Facility.Stage]: Theater,
	[Facility.SoundSystem]: Volume2,
	[Facility.LightingSystem]: Lightbulb,
	[Facility.GreenRoom]: UsersRound,
	[Facility.NaturalLight]: Sun,
	[Facility.EquipmentRental]: ToolCase,
	[Facility.ExamRooms]: Stethoscope,
	[Facility.Laboratory]: Microscope,
	[Facility.Classroom]: BookOpen,
	[Facility.Library]: Library,
	[Facility.Auditorium]: Monitor,
	[Facility.IrrigationSystem]: Droplet,
	[Facility.Barn]: PhBarn,
	[Facility.Greenhouse]: GameIconsGreenhouse,
	[Facility.Fencing]: Fence,
	[Facility.Utilities]: Zap,
};

export type HostingVariantIconMap = {
	[key in HostingVariant]: IconType;
};

export const HOSTING_VARIANT_ICONS: HostingVariantIconMap = {
	[HostingVariant.Residential]: Home,
	[HostingVariant.CommercialRetail]: ShoppingBag,
	[HostingVariant.Office]: Briefcase,
	[HostingVariant.Storage]: Archive,
	[HostingVariant.EventVenue]: CalendarCheck,
	[HostingVariant.Industrial]: Factory,
	[HostingVariant.CreativeStudio]: HeroiconsCamera,
	[HostingVariant.Hospitality]: Hotel,
	[HostingVariant.LandPlots]: LandPlot,
	[HostingVariant.Parking]: ParkingCircle,
	[HostingVariant.Agricultural]: Tractor,
	[HostingVariant.Medical]: Hospital,
	[HostingVariant.Educational]: GraduationCap,
	[HostingVariant.Religious]: Church,
	[HostingVariant.Custom]: Building2,
};

export const FALLBACK_FACILITY_ICON = HelpCircle;
