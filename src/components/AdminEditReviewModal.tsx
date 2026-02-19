import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rating } from "@/components/ui/Rating";
import { Loader2, Upload, X } from "lucide-react";

interface Review {
  _id: string;
  productId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  username: string;
  email: string;
  rating: number;
  text: string;
  images: string[];
  status: string;
  approved: boolean;
  comment?: string;
  createdAt: string;
  product?: {
    _id: string;
    title: string;
  };
}

interface AdminEditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: Review | null;
  onReviewUpdated?: () => void;
}

export const AdminEditReviewModal = ({ isOpen, onClose, review, onReviewUpdated }: AdminEditReviewModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    rating: 0,
    text: "",
    images: [] as string[],
    comment: "",
    status: "published" as "pending" | "published" | "rejected"
  });

  useEffect(() => {
    if (review && isOpen) {
      setFormData({
        username: review.username || "",
        email: review.email || "",
        rating: review.rating || 0,
        text: review.text || "",
        images: review.images || [],
        comment: review.comment || "",
        status: review.status as "pending" | "published" | "rejected" || "published"
      });
    }
  }, [review, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const { ok, json } = await api("/api/uploads/images", {
          method: "POST",
          body: formData,
        });

        if (ok && json?.url) {
          uploadedUrls.push(json.url);
        } else {
          toast({
            title: "Image upload failed",
            description: json?.message || `Failed to upload ${file.name}.`,
            variant: "destructive",
          });
        }
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      toast({ title: "Images uploaded!", description: `${uploadedUrls.length} image(s) uploaded successfully.` });
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!review) return;
    
    setLoading(true);

    if (!formData.username || !formData.email || !formData.rating || !formData.text) {
      toast({
        title: "Missing fields",
        description: "Username, Email, Rating, and Review Text are required.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        rating: formData.rating,
        text: formData.text,
        images: formData.images.length > 0 ? formData.images : [],
        comment: formData.comment || undefined,
        status: formData.status,
      };

      const { ok, json } = await api(`/api/admin/reviews/${review._id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!ok) {
        throw new Error(json?.message || "Failed to update review");
      }

      toast({
        title: "Review Updated!",
        description: `Review has been updated successfully.`, 
      });

      onClose();
      onReviewUpdated?.();
    } catch (error: any) {
      toast({
        title: "Error updating review",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !review) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Review</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Product:</p>
            <p className="font-medium">{review.product?.title || 'Unknown Product'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter reviewer's username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter reviewer's email"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Rating</Label>
              <Rating value={formData.rating} onChange={(value) => setFormData(prev => ({ ...prev, rating: value }))} />
            </div>

            <div>
              <Label htmlFor="reviewText">Review Text</Label>
              <Textarea
                id="reviewText"
                value={formData.text}
                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Write your review here (min 20 characters)"
                required
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="comment">Admin Comment (Optional)</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Add an internal comment for this review"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: "pending" | "published" | "rejected") => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="imageUpload">Images</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden group">
                    <img src={img} alt={`Review image ${index + 1}`} className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <label htmlFor="imageUpload" className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  {uploadingImages ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-6 w-6 text-gray-400" />
                  )}
                  <span className="sr-only">Upload images</span>
                </label>
                <Input
                  id="imageUpload"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading || uploadingImages}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Review"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditReviewModal;
