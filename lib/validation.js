// Server-side rules for request data. The browser dropdowns are only a
// convenience — anyone can send a request without using the form, so the
// server checks everything again here.

export const LOCATIONS = ["Minneapolis", "Chicago", "Denver", "Austin"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const STATUSES = ["New", "In Progress", "Complete"];

export const MAX_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;

function asTrimmedText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

// Returns { error } if something is wrong, or { value } with the cleaned fields.
export function validateNewRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "The request body must be a JSON object." };
  }

  const requester_name = asTrimmedText(body.requester_name);
  const location = asTrimmedText(body.location);
  const description = asTrimmedText(body.description);
  const priority = asTrimmedText(body.priority);

  const missing = [];
  if (!requester_name) missing.push("Requester name");
  if (!location) missing.push("Location");
  if (!description) missing.push("Description");
  if (!priority) missing.push("Priority");

  if (missing.length === 1) {
    return { error: `${missing[0]} is required.` };
  }
  if (missing.length > 1) {
    const last = missing.pop();
    return { error: `${missing.join(", ")} and ${last} are required.` };
  }

  if (requester_name.length > MAX_NAME_LENGTH) {
    return {
      error: `Requester name must be ${MAX_NAME_LENGTH} characters or fewer (it is ${requester_name.length}).`,
    };
  }

  if (!LOCATIONS.includes(location)) {
    return { error: "Location must be Minneapolis, Chicago, Denver, or Austin." };
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer (it is ${description.length}).`,
    };
  }

  if (!PRIORITIES.includes(priority)) {
    return { error: "Priority must be Low, Medium, High, or Urgent." };
  }

  return { value: { requester_name, location, description, priority } };
}

export function validateStatus(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "The request body must be a JSON object." };
  }
  const status = asTrimmedText(body.status);
  if (!STATUSES.includes(status)) {
    return { error: "Status must be New, In Progress, or Complete." };
  }
  return { value: status };
}
