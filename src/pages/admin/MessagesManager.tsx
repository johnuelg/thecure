import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Loader2, Mail, MailOpen, Calendar, User, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  submitted_at: string;
}

const MessagesManager = () => {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const openMessage = async (message: ContactSubmission) => {
    setSelectedMessage(message);
    
    if (!message.is_read) {
      try {
        const { error } = await supabase
          .from('contact_submissions')
          .update({ is_read: true })
          .eq('id', message.id);

        if (error) throw error;
        
        setMessages(messages.map(m => 
          m.id === message.id ? { ...m, is_read: true } : m
        ));
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Message deleted successfully' });
      setSelectedMessage(null);
      fetchMessages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
      
      toast({ title: 'All messages marked as read' });
      fetchMessages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <MailOpen className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="text-sm text-muted-foreground">
              Messages from your contact form will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <Card 
              key={message.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${!message.is_read ? 'border-primary/50 bg-primary/5' : ''}`}
              onClick={() => openMessage(message)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    {message.is_read ? (
                      <MailOpen className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Mail className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${!message.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {message.name}
                        </span>
                        {!message.is_read && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {format(new Date(message.submitted_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    {message.subject && (
                      <p className={`text-sm ${!message.is_read ? 'font-medium' : ''}`}>
                        {message.subject}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {message.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Message from {selectedMessage?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedMessage && format(new Date(selectedMessage.submitted_at), 'MMMM d, yyyy at h:mm a')}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{selectedMessage.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${selectedMessage.email}`}
                  className="text-primary hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>
              {selectedMessage.subject && (
                <div>
                  <p className="text-sm font-medium mb-1">Subject</p>
                  <p className="text-sm text-muted-foreground">{selectedMessage.subject}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-1">Message</p>
                <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                  {selectedMessage.message}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button asChild>
                  <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your inquiry'}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Reply via Email
                  </a>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedMessage.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesManager;
