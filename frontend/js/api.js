export async function apiRequest(path, method = "GET", body = null) {
  const token =
    localStorage.getItem("idToken") || sessionStorage.getItem("idToken");

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`http://localhost:3000${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
