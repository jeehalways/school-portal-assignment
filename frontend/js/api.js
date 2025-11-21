async function getFreshToken() {
  const user = firebase.auth().currentUser;
  if (!user) return null;

  // Force refresh token
  const token = await user.getIdToken(true);

  localStorage.setItem("idToken", token);
  sessionStorage.setItem("idToken", token);

  return token;
}

export async function apiRequest(path, method = "GET", body = null) {
  let token =
    localStorage.getItem("idToken") || sessionStorage.getItem("idToken");

  async function sendRequest() {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`http://localhost:3000${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // If unauthorized, caller will handle retry
    return res;
  }

  // FIRST TRY
  let res = await sendRequest();

  // If expired → refresh token → retry once
  if (res.status === 401) {
    token = await getFreshToken();
    if (!token) throw new Error("Not logged in.");

    // Retry AFTER refreshing token
    res = await sendRequest();
  }

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}
