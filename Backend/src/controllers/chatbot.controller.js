import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are Maidan Assistant, a helpful AI chatbot for Maidan — a sports ground booking platform in Pakistan.

You help users with:
- Finding sports grounds by city, sport type, budget, and facilities
- Explaining how to book a ground on Maidan
- Checking ground availability
- Answering FAQs about cancellations, payments, and refunds
- Helping with disputes (e.g., owner cancelled booking)
- Guiding ground owners on how to add/manage grounds and block slots
- Providing weather-aware suggestions (e.g., indoor vs outdoor grounds based on weather)

Platform details:
- Sports supported: Cricket, Football, Hockey, Badminton, Tennis, Squash
- Payment methods: JazzCash, EasyPaisa, Card, Cash
- Booking statuses: Pending, Confirmed, Cancelled, Completed
- Users can be: Players, Ground Owners, or Admins
- Based in Pakistan (cities like Islamabad, Lahore, Karachi, etc.)

Always be friendly, concise, and helpful. If asked about something outside your scope, politely say you can only help with Maidan-related queries.`;

// POST /api/chatbot — send message in a session
export const chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user?.id;
    if (!message) return res.status(400).json({ error: "Message is required" });

    let session;

    if (sessionId) {
      // Load existing session
      session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    if (!session) {
      // Create new session with title from first message
      session = await prisma.chatSession.create({
        data: {
          userId,
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
          messages: { create: [] },
        },
        include: { messages: true },
      });
    }

    // Build history for Groq
    const history = session.messages.map((m) => ({ role: m.role, content: m.content }));

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.slice(-10),
      { role: "user", content: message },
    ];

    // Inject ground data if relevant
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("ground") || lowerMsg.includes("book") || lowerMsg.includes("available")) {
      try {
        const grounds = await prisma.ground.findMany({
          where: { isActive: true },
          select: { name: true, city: true, sportType: true, pricePerHour: true, facilities: true, openTime: true, closeTime: true, location: true },
          take: 10,
        });
        if (grounds.length > 0) {
          messages[0].content += `\n\nCurrent available grounds:\n${JSON.stringify(grounds, null, 2)}`;
        }
      } catch (dbErr) {
        console.error("DB fetch error:", dbErr.message);
      }
    }

    // Call Groq
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, max_tokens: 500, temperature: 0.7 }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: "Groq API error" });

    const reply = data.choices[0].message.content;

    // Save both messages to DB under this session
    await prisma.chatMessage.createMany({
      data: [
        { sessionId: session.id, userId, role: "user", content: message },
        { sessionId: session.id, userId, role: "assistant", content: reply },
      ],
    });

    // Update session updatedAt
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    });

    res.json({ reply, sessionId: session.id });
  } catch (error) {
    console.error("Chatbot error:", error.message);
    res.status(500).json({ error: "Chatbot failed to respond." });
  }
};

// GET /api/chatbot/sessions — get all sessions for sidebar
export const getSessions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, updatedAt: true },
    });
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch sessions" });
  }
};

// GET /api/chatbot/sessions/:sessionId — load messages of a session
export const getSessionMessages = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ messages: session.messages });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch messages" });
  }
};

// DELETE /api/chatbot/sessions/:sessionId — delete one session
export const deleteSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    await prisma.chatSession.deleteMany({ where: { id: sessionId, userId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Could not delete session" });
  }
};

// DELETE /api/chatbot/sessions — delete all sessions for user
export const deleteAllSessions = async (req, res) => {
  try {
    const userId = req.user?.id;
    await prisma.chatSession.deleteMany({ where: { userId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Could not delete all sessions" });
  }
};