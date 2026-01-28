-- Create knowledge_documents table for admin-managed content
CREATE TABLE public.knowledge_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Knowledge documents policies (admin manage, public read active)
CREATE POLICY "Admins can manage knowledge documents"
ON public.knowledge_documents FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Anyone can view active knowledge documents"
ON public.knowledge_documents FOR SELECT
USING (is_active = true);

-- Chat conversations policies (anyone can create and view their own by session)
CREATE POLICY "Anyone can create conversations"
ON public.chat_conversations FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view conversations"
ON public.chat_conversations FOR SELECT
USING (true);

CREATE POLICY "Anyone can update conversations"
ON public.chat_conversations FOR UPDATE
USING (true)
WITH CHECK (true);

-- Chat messages policies (anyone can create and read)
CREATE POLICY "Anyone can create messages"
ON public.chat_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
ON public.chat_messages FOR SELECT
USING (true);

-- Admins can manage all chat data
CREATE POLICY "Admins can manage conversations"
ON public.chat_conversations FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can manage messages"
ON public.chat_messages FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Create indexes for performance
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_conversations_session_id ON public.chat_conversations(session_id);
CREATE INDEX idx_knowledge_documents_active ON public.knowledge_documents(is_active) WHERE is_active = true;

-- Add updated_at trigger for knowledge_documents
CREATE TRIGGER update_knowledge_documents_updated_at
BEFORE UPDATE ON public.knowledge_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();