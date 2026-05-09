import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2, FileText, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentUploadProps {
  onContentExtracted: (content: string, fileName: string) => void;
  className?: string;
}

const ACCEPTED_TYPES = {
  'text/plain': '.txt',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const ACCEPTED_EXTENSIONS = '.txt,.pdf,.doc,.docx';

export function DocumentUpload({ onContentExtracted, className }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const extractTextFromTxt = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const pdfjs = await import('pdfjs-dist');
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: { str?: string }) => ('str' in item ? item.str ?? '' : ''))
        .join(' ');
      pageTexts.push(pageText);
    }

    return pageTexts.join('\n\n').trim();
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const mammoth = await import('mammoth/mammoth.browser');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return (result.value as string).trim();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload to Supabase Storage (using resume bucket for documents)
      const { error: uploadError } = await supabase.storage
        .from('resume')
        .upload(`knowledge/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('resume')
        .getPublicUrl(`knowledge/${fileName}`);

      setUploadedFile({ name: file.name, url: publicUrlData.publicUrl });

      // Extract content based on file type
      let extractedContent = '';
      
      if (file.type === 'text/plain' || fileExt === 'txt') {
        extractedContent = await extractTextFromTxt(file);
        toast({ title: 'Text extracted successfully' });
      } else if (file.type === 'application/pdf' || fileExt === 'pdf') {
        toast({
          title: 'PDF uploaded',
          description: 'Please paste the document content below, or the AI will reference the file URL.',
        });
        extractedContent = `[PDF Document: ${file.name}]\nFile URL: ${publicUrlData.publicUrl}\n\n--- Please paste the document content below ---`;
      } else if (
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileExt === 'doc' ||
        fileExt === 'docx'
      ) {
        toast({
          title: 'Word document uploaded',
          description: 'Please paste the document content below, or the AI will reference the file URL.',
        });
        extractedContent = `[Word Document: ${file.name}]\nFile URL: ${publicUrlData.publicUrl}\n\n--- Please paste the document content below ---`;
      }

      onContentExtracted(extractedContent, file.name);
      toast({ title: 'File uploaded successfully' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Label>Upload Document (Optional)</Label>
      
      {/* Upload controls */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload PDF, Word, or TXT
            </>
          )}
        </Button>
      </div>

      {/* Uploaded file preview */}
      {uploadedFile && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
            <a 
              href={uploadedFile.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              View file
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        TXT files: Content will be extracted automatically. PDF/Word: Upload the file, then paste the content below.
      </p>
    </div>
  );
}
