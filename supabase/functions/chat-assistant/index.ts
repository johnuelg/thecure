import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limits (per IP+session)
const BURST_MAX = 5;
const BURST_WINDOW_SECONDS = 20;
const SUSTAINED_MAX = 30;
const SUSTAINED_WINDOW_SECONDS = 3600;

// Input limits
const MAX_MESSAGE_CHARS = 2000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase environment variables are not configured");
    }

    // Service-role client: edge function is trusted server code and must bypass
    // the locked-down RLS policies on chat_conversations / chat_messages.
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { message, conversationId, sessionId } = await req.json();

    // --- Input validation -----------------------------------------------
    if (typeof message !== "string" || typeof sessionId !== "string") {
      return json({ error: "Message and sessionId are required" }, 400);
    }
    const cleanMessage = message.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "").trim();
    if (!cleanMessage) {
      return json({ error: "Message cannot be empty" }, 400);
    }
    if (cleanMessage.length > MAX_MESSAGE_CHARS) {
      return json({ error: `Message is too long (max ${MAX_MESSAGE_CHARS} characters).` }, 400);
    }
    if (!UUID_RE.test(sessionId)) {
      return json({ error: "Invalid sessionId" }, 400);
    }
    if (conversationId !== undefined && conversationId !== null && !UUID_RE.test(String(conversationId))) {
      return json({ error: "Invalid conversationId" }, 400);
    }

    // --- Rate limiting --------------------------------------------------
    const forwarded = req.headers.get("x-forwarded-for") || "";
    const ip = forwarded.split(",")[0].trim() || "unknown";
    const rlKey = `${ip}:${sessionId}`;

    const burst = await supabase.rpc("check_and_increment_rate_limit", {
      _key: `burst:${rlKey}`,
      _max_requests: BURST_MAX,
      _window_seconds: BURST_WINDOW_SECONDS,
    });
    if (burst.error) {
      console.error("Rate limit RPC (burst) error:", burst.error);
    } else if (burst.data === false) {
      return json(
        { error: "You're sending messages too quickly. Please wait a few seconds and try again." },
        429,
      );
    }

    const sustained = await supabase.rpc("check_and_increment_rate_limit", {
      _key: `hour:${rlKey}`,
      _max_requests: SUSTAINED_MAX,
      _window_seconds: SUSTAINED_WINDOW_SECONDS,
    });
    if (sustained.error) {
      console.error("Rate limit RPC (sustained) error:", sustained.error);
    } else if (sustained.data === false) {
      return json(
        { error: "You've reached the hourly chat limit. Please try again later." },
        429,
      );
    }

    // --- Knowledge base context ----------------------------------------
    const { data: knowledgeDocs, error: docsError } = await supabase
      .from("knowledge_documents")
      .select("title, content, document_type")
      .eq("is_active", true)
      .order("display_order");

    if (docsError) {
      console.error("Error fetching knowledge documents:", docsError);
    }

    const { data: profile } = await supabase.from("profile").select("*").single();

    const { data: services } = await supabase
      .from("services")
      .select("title, description")
      .eq("is_active", true);

    const { data: projects } = await supabase
      .from("projects")
      .select("title, description, category, technologies")
      .limit(10);

    let knowledgeContext = "";

    if (profile) {
      knowledgeContext += `## About Me\nName: ${profile.full_name}\nTitle: ${profile.professional_title}\nBio: ${profile.bio || "Not provided"}\nLocation: ${profile.location || "Not provided"}\nEmail: ${profile.email || "Not provided"}\n\n`;
    }

    if (services && services.length > 0) {
      knowledgeContext += `## Services Offered\n`;
      services.forEach((s: { title: string; description: string }) => {
        knowledgeContext += `- **${s.title}**: ${s.description}\n`;
      });
      knowledgeContext += "\n";
    }

    if (projects && projects.length > 0) {
      knowledgeContext += `## Projects & Case Studies\n`;
      projects.forEach((p: { title: string; description: string; category?: string; technologies?: string[] }) => {
        knowledgeContext += `- **${p.title}** (${p.category || "General"}): ${p.description}\n`;
        if (p.technologies?.length) {
          knowledgeContext += `  Technologies: ${p.technologies.join(", ")}\n`;
        }
      });
      knowledgeContext += "\n";
    }

    if (knowledgeDocs && knowledgeDocs.length > 0) {
      knowledgeContext += `## Additional Information\n`;
      knowledgeDocs.forEach((doc: { title: string; content: string; document_type: string }) => {
        knowledgeContext += `### ${doc.title} (${doc.document_type})\n${doc.content}\n\n`;
      });
    }

    // --- Conversation persistence --------------------------------------
    let activeConversationId = conversationId;

    if (!activeConversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from("chat_conversations")
        .insert({ session_id: sessionId })
        .select()
        .single();

      if (convError) {
        throw new Error(`Failed to create conversation: ${convError.message}`);
      }
      activeConversationId = newConversation.id;
    } else {
      await supabase
        .from("chat_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", activeConversationId);
    }

    await supabase.from("chat_messages").insert({
      conversation_id: activeConversationId,
      role: "user",
      content: cleanMessage,
    });

    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const conversationHistory =
      history?.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })) || [];

    const systemPrompt = `You are a helpful AI assistant for a professional portfolio website. Your role is to answer questions about the portfolio owner's services, experience, expertise, and projects.

Use the following knowledge base to provide accurate and helpful responses:

${knowledgeContext}

Guidelines:
- Be friendly, professional, and concise
- If asked about services, refer to the services information above
- If asked about projects or case studies, use the projects information
- For contact inquiries, encourage visitors to use the contact form on the website
- If you don't have specific information to answer a question, acknowledge that and suggest the visitor reach out directly
- Keep responses focused and relevant to the portfolio content
- Do not make up information not present in the knowledge base`;

    // --- LLM call ------------------------------------------------------
    const geminiContents = conversationHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: geminiContents,
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return json({ error: "Too many requests. Please try again in a moment." }, 429);
      }

      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I apologize, but I couldn't generate a response. Please try again.";

    await supabase.from("chat_messages").insert({
      conversation_id: activeConversationId,
      role: "assistant",
      content: assistantMessage,
    });

    return json({
      message: assistantMessage,
      conversationId: activeConversationId,
    });
  } catch (error) {
    console.error("Chat assistant error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      500,
    );
  }
});
