import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase environment variables are not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { message, conversationId, sessionId } = await req.json();

    if (!message || !sessionId) {
      return new Response(
        JSON.stringify({ error: "Message and sessionId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch knowledge base documents
    const { data: knowledgeDocs, error: docsError } = await supabase
      .from("knowledge_documents")
      .select("title, content, document_type")
      .eq("is_active", true)
      .order("display_order");

    if (docsError) {
      console.error("Error fetching knowledge documents:", docsError);
    }

    // Also fetch profile info for context
    const { data: profile } = await supabase
      .from("profile")
      .select("*")
      .single();

    // Fetch services for context
    const { data: services } = await supabase
      .from("services")
      .select("title, description")
      .eq("is_active", true);

    // Fetch projects for context
    const { data: projects } = await supabase
      .from("projects")
      .select("title, description, category, technologies")
      .limit(10);

    // Build knowledge context
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

    // Get or create conversation
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
      // Update last_message_at
      await supabase
        .from("chat_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", activeConversationId);
    }

    // Save user message
    await supabase.from("chat_messages").insert({
      conversation_id: activeConversationId,
      role: "user",
      content: message,
    });

    // Fetch conversation history
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", activeConversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    const conversationHistory = history?.map((msg: { role: string; content: string }) => ({
      role: msg.role,
      content: msg.content,
    })) || [];

    // Build system prompt
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

    // Call Perplexity API
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

    // Save assistant response
    await supabase.from("chat_messages").insert({
      conversation_id: activeConversationId,
      role: "assistant",
      content: assistantMessage,
    });

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        conversationId: activeConversationId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
