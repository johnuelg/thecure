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

  const CACHE_PREFIX = 'kb-extract:';
  const CACHE_MAX_ENTRIES = 50;

  const hashFile = async (file: File): Promise<string> => {
    const buf = await file.arrayBuffer();
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const getLocalCachedExtraction = (hash: string): string | null => {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + hash);
      if (!raw) return null;
      const entry = JSON.parse(raw) as { content: string };
      localStorage.setItem(CACHE_PREFIX + hash, JSON.stringify({ ...entry, lastUsed: Date.now() }));
      return entry.content ?? null;
    } catch {
      return null;
    }
  };

  const setLocalCachedExtraction = (hash: string, content: string, fileName: string) => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
      if (keys.length >= CACHE_MAX_ENTRIES) {
        const sorted = keys
          .map((k) => {
            try {
              const v = JSON.parse(localStorage.getItem(k) || '{}');
              return { k, lastUsed: v.lastUsed ?? 0 };
            } catch {
              return { k, lastUsed: 0 };
            }
          })
          .sort((a, b) => a.lastUsed - b.lastUsed);
        const toRemove = sorted.slice(0, keys.length - CACHE_MAX_ENTRIES + 1);
        toRemove.forEach((e) => localStorage.removeItem(e.k));
      }
      localStorage.setItem(
        CACHE_PREFIX + hash,
        JSON.stringify({ content, fileName, lastUsed: Date.now() })
      );
    } catch (err) {
      console.warn('Failed to cache extraction locally:', err);
    }
  };

  const getRemoteCachedExtraction = async (hash: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('knowledge_extraction_cache')
        .select('content')
        .eq('content_hash', hash)
        .maybeSingle();
      if (error || !data) return null;
      supabase
        .from('knowledge_extraction_cache')
        .update({ last_used_at: new Date().toISOString() })
        .eq('content_hash', hash)
        .then(() => {}, () => {});
      return (data as { content: string }).content ?? null;
    } catch (err) {
      console.warn('Remote cache lookup failed:', err);
      return null;
    }
  };

  const setRemoteCachedExtraction = async (hash: string, content: string, fileName: string) => {
    try {
      await supabase
        .from('knowledge_extraction_cache')
        .upsert(
          {
            content_hash: hash,
            content,
            file_name: fileName,
            char_count: content.length,
            last_used_at: new Date().toISOString(),
          },
          { onConflict: 'content_hash' }
        );
    } catch (err) {
      console.warn('Failed to cache extraction remotely:', err);
    }
  };

  const getCachedExtraction = async (hash: string): Promise<string | null> => {
    const local = getLocalCachedExtraction(hash);
    if (local !== null) return local;
    const remote = await getRemoteCachedExtraction(hash);
    if (remote !== null) {
      setLocalCachedExtraction(hash, remote, '');
      return remote;
    }
    return null;
  };

  const setCachedExtraction = async (hash: string, content: string, fileName: string) => {
    setLocalCachedExtraction(hash, content, fileName);
    await setRemoteCachedExtraction(hash, content, fileName);
  };

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
      const pageText = (textContent.items as Array<{ str?: string }>)
        .map((item) => ('str' in item ? item.str ?? '' : ''))
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
      // Compute content hash for caching
      const fileHash = await hashFile(file);
      const cached = await getCachedExtraction(fileHash);

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

      if (cached !== null) {
        onContentExtracted(cached, file.name);
        toast({ title: 'Reused cached extraction', description: `${cached.length.toLocaleString()} characters loaded from cache.` });
        return;
      }

      if (file.type === 'text/plain' || fileExt === 'txt') {
        extractedContent = await extractTextFromTxt(file);
        toast({ title: 'Text extracted successfully' });
      } else if (file.type === 'application/pdf' || fileExt === 'pdf') {
        try {
          extractedContent = await extractTextFromPdf(file);
          if (!extractedContent) {
            extractedContent = `[PDF Document: ${file.name}]\nFile URL: ${publicUrlData.publicUrl}\n\nNo extractable text found (the PDF may be a scanned image). Please paste the content manually.`;
            toast({ title: 'No text found in PDF', description: 'The PDF appears to be scanned. Paste content manually.', variant: 'destructive' });
          } else {
            toast({ title: 'PDF text extracted', description: `${extractedContent.length.toLocaleString()} characters extracted.` });
          }
        } catch (err) {
          console.error('PDF extraction failed:', err);
          extractedContent = `[PDF Document: ${file.name}]\nFile URL: ${publicUrlData.publicUrl}\n\nAutomatic extraction failed. Please paste the content manually.`;
          toast({ title: 'PDF extraction failed', description: 'Please paste content manually.', variant: 'destructive' });
        }
      } else if (
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileExt === 'doc' ||
        fileExt === 'docx'
      ) {
        if (fileExt === 'doc') {
          extractedContent = `[Word Document: ${file.name}]\nFile URL: ${publicUrlData.publicUrl}\n\nLegacy .doc format is not supported for automatic extraction. Please save as .docx or paste the content manually.`;
          toast({ title: 'Legacy .doc not supported', description: 'Please save as .docx for automatic extraction.', variant: 'destructive' });
        } else {
          try {
            extractedContent = await extractTextFromDocx(file);
            if (!extractedContent) {
              extractedContent = `[Word Document: ${file.name}]\nFile URL: ${publicUrlData.publicUrl}\n\nNo extractable text found.`;
              toast({ title: 'No text found in document', variant: 'destructive' });
            } else {
              toast({ title: 'Word text extracted', description: `${extractedContent.length.toLocaleString()} characters extracted.` });
            }
          } catch (err) {
            console.error('DOCX extraction failed:', err);
            extractedContent = `[Word Document: ${file.name}]\nFile URL: ${publicUrlData.publicUrl}\n\nAutomatic extraction failed. Please paste the content manually.`;
            toast({ title: 'Word extraction failed', description: 'Please paste content manually.', variant: 'destructive' });
          }
        }
      }

      if (extractedContent) {
        setCachedExtraction(fileHash, extractedContent, file.name);
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
        Text is extracted automatically from TXT, PDF, and DOCX files. Scanned PDFs and legacy .doc files require manual paste.
      </p>
    </div>
  );
}
