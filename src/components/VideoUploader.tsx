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
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <label className="text-sm font-semibold mb-2 block text-muted-foreground flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            Video Preview
          </label>
          <Card className="relative group rounded-xl overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 shadow-md">
            {/* 9:16 Aspect Ratio Container */}
            <div className="aspect-[9/16] bg-black flex items-center justify-center">
              <video 
                src={preview} 
                controls 
                className="w-full h-full object-contain"
              ></video>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-8 w-8 rounded-full shadow-lg"
                onClick={removeVideo}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      {!preview && !isLoading && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
        >
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="font-medium text-sm text-foreground">Click to upload video</p>
          <p className="text-xs text-muted-foreground mt-1">MP4, WebM or Ogg (Max 100MB)</p>
        </div>
      )}
    </div>
  );
};