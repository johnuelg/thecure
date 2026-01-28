import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FileText, Trash2, Edit, GripVertical, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  document_type: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const documentTypes = [
  { value: "general", label: "General Information" },
  { value: "services", label: "Services" },
  { value: "experience", label: "Experience" },
  { value: "faq", label: "FAQ" },
  { value: "case_study", label: "Case Study" },
  { value: "resume", label: "Resume" },
];

const KnowledgeBaseManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDocument | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    document_type: "general",
    is_active: true,
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["admin-knowledge-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_documents")
        .select("*")
        .order("display_order");
      
      if (error) throw error;
      return data as KnowledgeDocument[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (doc: Omit<KnowledgeDocument, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("knowledge_documents").insert(doc);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-knowledge-documents"] });
      toast({ title: "Document created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KnowledgeDocument> & { id: string }) => {
      const { error } = await supabase
        .from("knowledge_documents")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-knowledge-documents"] });
      toast({ title: "Document updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("knowledge_documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-knowledge-documents"] });
      toast({ title: "Document deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      document_type: "general",
      is_active: true,
    });
    setEditingDoc(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDoc) {
      updateMutation.mutate({ id: editingDoc.id, ...formData });
    } else {
      createMutation.mutate({
        ...formData,
        display_order: (documents?.length || 0) + 1,
      });
    }
  };

  const openEditDialog = (doc: KnowledgeDocument) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      content: doc.content,
      document_type: doc.document_type,
      is_active: doc.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = (doc: KnowledgeDocument) => {
    updateMutation.mutate({ id: doc.id, is_active: !doc.is_active });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage documents that power the AI chat assistant
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDoc ? "Edit Document" : "Add New Document"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., AI Healthcare Services"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="document_type">Document Type</Label>
                <Select
                  value={formData.document_type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, document_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter detailed information that the AI can use to answer visitor questions..."
                  rows={12}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This content will be used as context for the AI assistant. Be detailed and specific.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active (included in AI context)</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingDoc ? "Update" : "Create"} Document
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{documents?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {documents?.filter((d) => d.is_active).length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      {documents && documents.length > 0 ? (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className={!doc.is_active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-muted cursor-grab">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{doc.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                        {documentTypes.find((t) => t.value === doc.document_type)?.label || doc.document_type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doc.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Updated {new Date(doc.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={doc.is_active}
                      onCheckedChange={() => handleToggleActive(doc)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(doc)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No documents yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add documents to help the AI assistant answer visitor questions accurately.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KnowledgeBaseManager;
