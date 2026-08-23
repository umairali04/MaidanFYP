const BASE_URL = process.env.NEXT_PUBLIC_API_URL

// Your auth token lives in a cookie named "token" (set on login, read by
// proxy.ts for route protection). This reads it on the client the same way.
function getTokenFromCookie() {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : null
}

// exported so pages can check login state before rendering
export function isLoggedIn() {
  return !!getTokenFromCookie()
}

// exported so pages can clear all auth state on logout / 401
// FIX: also clears localStorage — previously only cookies were cleared here,
// but login() sets the token in BOTH cookie and localStorage, so any
// component reading from localStorage (e.g. SlotRecommendations) kept
// seeing a valid token after "logout".
export function clearAuthCookies() {
  if (typeof document === "undefined") return
  document.cookie = 'token=; Max-Age=0; path=/'
  document.cookie = 'role=; Max-Age=0; path=/'
  document.cookie = 'email=; Max-Age=0; path=/'
  document.cookie = 'name=; Max-Age=0; path=/'
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem('token')
  }
}

// Decodes the JWT payload client-side (no verification — just reading the
// id your backend put in it, same id used in auth.middleware.js: decoded.id)
export function getCurrentUserId() {
  const token = getTokenFromCookie()
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.id || null
  } catch {
    return null
  }
}

async function authedRequest(path, options = {}) {
  const token = getTokenFromCookie()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.message || "Request failed")
    err.status = res.status
    throw err
  }
  return data
}

// ---------- Players ----------
export const searchPlayers = ({ name, sport } = {}) => {
  const params = new URLSearchParams()
  if (name) params.set("name", name)
  if (sport) params.set("sport", sport)
  return authedRequest(`/api/players/search?${params.toString()}`)
}

export const getRecommendedPlayers = () => authedRequest(`/api/players/recommendations`)

export const getPlayerProfile = (userId) => authedRequest(`/api/players/${userId}`)

// ---------- Connections ----------
export const sendConnectionRequest = (receiverId) =>
  authedRequest(`/api/connections/request`, {
    method: "POST",
    body: JSON.stringify({ receiverId }),
  })

export const respondToConnection = (connectionId, action) =>
  authedRequest(`/api/connections/${connectionId}/respond`, {
    method: "PUT",
    body: JSON.stringify({ action }), // "ACCEPT" | "REJECT"
  })

export const getIncomingRequests = () => authedRequest(`/api/connections/requests/incoming`)

export const getSentRequests = () => authedRequest(`/api/connections/requests/sent`)

export const getMyConnections = () => authedRequest(`/api/connections/my`)

export const removeConnection = (connectionId) =>
  authedRequest(`/api/connections/${connectionId}`, { method: "DELETE" })

// ---------- Messages ----------
export const sendMessage = (receiverId, content) =>
  authedRequest(`/api/messages`, {
    method: "POST",
    body: JSON.stringify({ receiverId, content }),
  })

export const getConversation = (userId) => authedRequest(`/api/messages/${userId}`)

export const getConversations = () => authedRequest(`/api/messages`)

export const deleteMessage = (messageId) =>
  authedRequest(`/api/messages/${messageId}`, { method: "DELETE" })

// ---------- Media Messages (image/voice) ----------
export async function sendMediaMessage(receiverId, file, type, duration) {
  const token = getTokenFromCookie()
  const formData = new FormData()
  formData.append("receiverId", receiverId)
  formData.append("type", type) // "IMAGE" or "VOICE"
  if (duration) formData.append("duration", duration)
  formData.append("file", file)

  const res = await fetch(`${BASE_URL}/api/messages/media`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // no Content-Type here — browser sets the multipart boundary automatically
    },
    body: formData,
  })

  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.message || "Upload failed")
    err.status = res.status
    throw err
  }
  return data
}

export { getTokenFromCookie }