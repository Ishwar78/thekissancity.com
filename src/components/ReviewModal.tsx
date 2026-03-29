import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, X, Star, Upload } from "lucide-react";

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  productId: string;
  username: string;
  email: string;
  rating: number;
  text: string;
  images: string[];
  status: string;
  approved: boolean;
  createdAt: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  fallbackInfo?: {
    originalProductId: string;
    productTitle: string;
    timestamp: string;
  };
}

export const ReviewModal = ({ isOpen, onClose, productId, productName, fallbackInfo }: ReviewModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState({
    rating: 0,
    text: ""
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setReview({ rating: 0, text: "" });
      setSelectedImages([]);
      setImagePreviews([]);
    }
  }, [isOpen]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: "Please select only image files",
          variant: "destructive"
        });
      }
      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: "Images must be smaller than 5MB",
          variant: "destructive"
        });
      }
      return isValidType && isValidSize;
    });

    // Limit to 5 images
    const newImages = [...selectedImages, ...validFiles].slice(0, 5);
    setSelectedImages(newImages);

    // Create previews
    const newPreviews = [...imagePreviews];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const uploadedUrls: string[] = [];
    
    for (const file of selectedImages) {
      try {
        const formData = new FormData();
        formData.append('file', file); // Changed from 'image' to 'file'
        
        const response = await api('/api/uploads/images', { // Changed endpoint
          method: 'POST',
          body: formData,
        });
        
        if (response.ok && response.json?.url) {
          uploadedUrls.push(response.json.url);
        } else {
          console.error('Failed to upload image:', response);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 [REVIEW] Submitting review:', {
      productId,
      rating: review.rating,
      text: review.text.trim(),
      user: user?.email,
      imageCount: selectedImages.length,
      fallbackInfo
    });
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to write a review",
        variant: "destructive"
      });
      return;
    }

    if (review.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating",
        variant: "destructive"
      });
      return;
    }

    if (review.text.trim().length < 20) {
      toast({
        title: "Review Too Short",
        description: "Review must be at least 20 characters",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      console.log('🔍 [REVIEW] Uploading images...');
      const uploadedImages = await uploadImages();
      console.log('🔍 [REVIEW] Images uploaded:', uploadedImages);

      const requestBody = {
        productId,
        rating: review.rating,
        text: review.text.trim(),
        images: uploadedImages
      };
      
      console.log('🔍 [REVIEW] Request body to be sent:', requestBody);

      console.log('🔍 [REVIEW] Making API call...');
      const { ok, json, status } = await api("/api/reviews", {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log('🔍 [REVIEW] API Response:', {
        ok,
        status,
        json,
        bodySent: requestBody
      });

      if (ok) {
        toast({
          title: "Review Submitted",
          description: "Your review has been posted successfully"
        });
        setReview({ rating: 0, text: "" });
        setSelectedImages([]);
        setImagePreviews([]);
        onClose();
      } else {
        console.error('🔍 [REVIEW] API Error Response:', json);
        
        const errorMessage = json?.message || "Failed to submit review";
        
        // Show user-friendly error for product not found
        if (json?.message === 'Product not found') {
          toast({
            title: "Product Not Available",
            description: `This product is no longer available for review. It may have been removed from the catalog. ${fallbackInfo ? `(Product: ${fallbackInfo.productTitle})` : ''}`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive"
          });
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('🔍 [REVIEW] Submit Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Write a Review</h2>
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
            <p className="font-medium">{productName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-3">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                <Rating
                  value={review.rating}
                  onChange={(value) => setReview(prev => ({ ...prev, rating: value }))}
                />
                <span className="ml-2 text-sm text-gray-600">
                  {review.rating > 0 ? `${review.rating} star${review.rating > 1 ? 's' : ''}` : 'Select a rating'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Review <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={review.text}
                onChange={(e) => setReview(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Share your experience with this product (minimum 20 characters)"
                rows={5}
                minLength={20}
                required
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {review.text.length}/20 characters minimum
              </p>
            </div>
            
            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Images (Optional)
              </label>
              <div className="space-y-3">
                {/* Image Upload Button */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <input
                    type="file"
                    id="review-images-modal"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('review-images-modal')?.click()}
                    disabled={submitting || selectedImages.length >= 5}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Upload className="h-4 w-4" />
                    Add Images
                  </Button>
                  <span className="text-sm text-gray-500 text-center sm:text-left">
                    {selectedImages.length}/5 images (max 5MB each)
                  </span>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-20 sm:h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeImage(index)}
                          disabled={submitting}
                          className="absolute top-1 right-1 h-5 w-5 sm:h-6 sm:w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-2 sm:h-3 w-2 sm:w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={submitting || review.rating === 0 || review.text.trim().length < 20}
                className="w-full sm:flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
                className="w-full sm:w-auto"
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

export default ReviewModal;
