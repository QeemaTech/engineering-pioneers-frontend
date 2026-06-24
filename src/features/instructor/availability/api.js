import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchInstructorAvailability() {
  const response = await client.get(endpoints.instructor.availability);
  return response?.data?.data || [];
}

export async function createAvailabilitySlot(body) {
  const response = await client.post(endpoints.instructor.availability, body);
  return response?.data?.data;
}

export async function deleteAvailabilitySlot(slotId) {
  const response = await client.delete(`${endpoints.instructor.availability}/${slotId}`);
  return response?.data?.data;
}

export async function updateAvailabilitySlotPrice(slotId, price) {
  const response = await client.patch(`${endpoints.instructor.availability}/${slotId}`, { price });
  return response?.data?.data;
}
