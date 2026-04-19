import { faker } from "@faker-js/faker";
import { Hosting } from "@/lib/services/graphql/generated";

export type BookingStatus = "Paid" | "Pending";

export interface BookingDetails {
  transactionId: string;
  date: string;
  duration: string;
  durationText: string;
  amount: number;
  discount: number;
  serviceFee: number;
  total: number;
  name: string;
  phoneNumber: string;
  status: BookingStatus;
}

export interface Booking {
  id: string;
  hosting: Hosting;
  status: BookingStatus;
  details: BookingDetails;
}

function generateMockBookingDetails(
  amount: number,
  status: BookingStatus,
): BookingDetails {
  const transactionId = faker.string.numeric(12);
  const startDate = faker.date.future();
  const endDate = faker.date.future({ years: 1, refDate: startDate });

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  };

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  const discount = 0;
  const serviceFee = 0;
  const total = amount - discount + serviceFee;

  return {
    transactionId,
    date: startDate.toISOString(),
    duration: `${formattedStartDate} - ${formattedEndDate}`,
    durationText: "1 Year",
    amount: amount,
    discount: discount,
    serviceFee: serviceFee,
    total: total,
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number({ style: "international" }),
    status: status,
  };
}

/**
 * Generates mock bookings based on an existing list of hostings.
 * @param count The number of bookings to generate.
 * @param hostings An array of Hosting objects to link the bookings to.
 * @returns An array of mock Booking objects.
 */
export function generateMockBookings(
  count: number,
  hostings: Hosting[],
): Booking[] {
  const bookings: Booking[] = [];

  // Handle case where no hostings are provided
  if (!hostings.length) {
    console.warn("Cannot generate bookings because the hosting list is empty.");
    return [];
  }

  for (let i = 0; i < count; i++) {
    const randomHosting = faker.helpers.arrayElement(hostings);

    const status: BookingStatus = faker.helpers.arrayElement([
      "Paid",
      "Pending",
    ]);

    const details = generateMockBookingDetails(randomHosting.price, status);

    bookings.push({
      id: faker.string.uuid(),
      hosting: randomHosting,
      status,
      details,
    });
  }

  return bookings;
}
