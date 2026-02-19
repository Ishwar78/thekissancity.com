import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VideoUploaderProps {
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  onUpload?: (file: File) => Promise<string>;
  isLoading?: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  videoUrl,
  onVideoUrlChange,
  onUpload,
  isLoading = false,
}) => {
  const [preview, setPreview] = useState<string>(videoUrl);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setPreview(videoUrl);
  }, [videoUrl]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    if (!file.type.startsWith('video/')) {
      toast.error(`${file.name} is not a video file`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.onerror = () => {
      toast.error(`Failed to read ${file.name}`);
    };
    reader.readAsDataURL(file);

    if (onUpload) {
      try {
        const uploadedUrl = await onUpload(file);
        onVideoUrlChange(uploadedUrl);
        toast.success('Video uploaded');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error: any) {
        toast.error(error?.message || 'Video upload failed');
        setPreview(''); // Clear preview on upload failure
        onVideoUrlChange('');
      }
    }
  };

  const removeVideo = () => {
    setPreview('');
    onVideoUrlChange('');
  };

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={isLoading}
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Select Video
            </>
          )}
        </Button>
      </div>

      {preview && (
        <div>
          <label className="text-sm font-medium mb-2 block">Video Preview</label>
          <Card className="relative group rounded-lg overflow-hidden border-2 border-border hover:border-primary/50">
            <video src={preview} controls className="w-full aspect-video object-cover"></video>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={removeVideo}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {!preview && !isLoading && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No video selected. Click "Select Video" to add one.</p>
        </div>
      )}
    </div>
  );
};