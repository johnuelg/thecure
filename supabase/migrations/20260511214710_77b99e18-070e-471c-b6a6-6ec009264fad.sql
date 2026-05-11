-- 1. Storage: drop overly permissive "Authenticated users can ..." policies
DROP POLICY IF EXISTS "Authenticated users can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their uploads" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update resumes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete resumes" ON storage.objects;

-- 2. chat_messages: remove public SELECT (admins keep access via existing "Admins can manage messages")
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;

-- 3. chat_conversations: remove public SELECT and public UPDATE (admins keep ALL via existing policy)
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.chat_conversations;