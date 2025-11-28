import { parseISO, intervalToDuration } from "date-fns";

export const formatSeconds = (seconds: number): string => {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;

	const formattedMinutes = minutes.toString().padStart(2, "0");
	const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

	return `${formattedMinutes}:${formattedSeconds}`;
};

export function formatDate(datetimeString: string): string {
	const date = new Date(datetimeString);
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function formatDateToMonthYear(dateString: string): string {
	const date = new Date(dateString);

	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
	});
}

export function formatToShortTime(datetimeString: string) {
	const date = new Date(datetimeString);

	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

export const calculateBookingDuration = (
	checkInDateString: string,
	checkOutDateString: string,
): string => {
	if (!checkInDateString || !checkOutDateString) {
		return "N/A";
	}

	try {
		const start = parseISO(checkInDateString);
		const end = parseISO(checkOutDateString);

		const duration = intervalToDuration({
			start: start,
			end: end,
		});

		if (duration.years && duration.years > 0) {
			return `${duration.years} Year${duration.years > 1 ? "s" : ""}`;
		}
		if (duration.months && duration.months > 0) {
			return `${duration.months} Month${duration.months > 1 ? "s" : ""}`;
		}
		if (duration.weeks && duration.weeks > 0) {
			return `${duration.weeks} Week${duration.weeks > 1 ? "s" : ""}`;
		}
		if (duration.days && duration.days > 0) {
			return `${duration.days} Day${duration.days > 1 ? "s" : ""}`;
		}
		if (duration.hours && duration.hours > 0) {
			return `${duration.hours} Hour${duration.hours > 1 ? "s" : ""}`;
		}

		return "Same Day";
	} catch (error) {
		console.error("Error calculating duration:", error);
		return "Invalid Dates";
	}
};
