export function saveProfile(data) {
  localStorage.setItem("profile", JSON.stringify(data));
}

export function loadProfile() {
  const raw = localStorage.getItem("profile");
  return raw ? JSON.parse(raw) : null;
}

export function clearProfile() {
  localStorage.removeItem("profile");
}
