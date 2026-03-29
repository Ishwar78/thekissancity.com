import { useState, useEffect } from "react";

import { api } from "@/lib/api";

import { Rating } from "@/components/ui/Rating";

import { Button } from "@/components/ui/button";

import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/contexts/AuthContext";

import { Loader2, Star, ThumbsUp, MessageSquare, Upload, X } from "lucide-react";



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

  replies: Array<{

    authorId: {

      _id: string;

      name: string;

      email: string;

      role?: string;

    };

    text: string;

    createdAt: string;

  }>;

}



interface ReviewsListProps {

  productId: string;

  onReviewCountChange?: (count: number) => void;

  onAverageRatingChange?: (average: number) => void;

}



export const ReviewsList = ({ productId, onReviewCountChange, onAverageRatingChange }: ReviewsListProps) => {

  const { toast } = useToast();

  const { user } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [newReview, setNewReview] = useState({

    rating: 0,

    text: ""

  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [showReviewForm, setShowReviewForm] = useState(false);



  // Calculate average rating from reviews

  const averageRating = reviews.length > 0 

    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 

    : 0;



  useEffect(() => {

    fetchReviews();

  }, [productId]);



  const fetchReviews = async () => {

    try {

      setLoading(true);

      const { ok, json } = await api(`/api/reviews/product/${productId}`);

      if (ok && json?.data) {

        setReviews(json.data);

        // Notify parent component of review count change

        onReviewCountChange?.(json.data.length);

        

        // Calculate and notify parent component of average rating change

        const average = json.data.length > 0 

          ? json.data.reduce((sum: number, review: Review) => sum + review.rating, 0) / json.data.length 

          : 0;

        onAverageRatingChange?.(average);

      }

    } catch (error) {

      console.error('Error fetching reviews:', error);

      toast({

        title: "Error",

        description: "Failed to load reviews",

        variant: "destructive"

      });

    } finally {

      setLoading(false);

    }

  };



  const handleSubmitReview = async (e: React.FormEvent) => {

    e.preventDefault();

    

    if (!user) {

      toast({

        title: "Authentication Required",

        description: "Please login to write a review",

        variant: "destructive"

      });

      return;

    }



    if (newReview.rating === 0) {

      toast({

        title: "Rating Required",

        description: "Please select a rating",

        variant: "destructive"

      });

      return;

    }



    if (newReview.text.trim().length < 20) {

      toast({

        title: "Review Too Short",

        description: "Review must be at least 20 characters",

        variant: "destructive"

      });

      return;

    }



    setSubmitting(true);

    try {

      // Upload images first

      const uploadedImages = await uploadImages();

      const { ok, json } = await api("/api/reviews", {

        method: "POST",

        body: JSON.stringify({

          productId,

          rating: newReview.rating,

          text: newReview.text.trim(),

          images: uploadedImages

        }),

        headers: {

          "Content-Type": "application/json"

        }

      });

      if (ok) {

        toast({

          title: "Review Submitted",

          description: "Your review has been posted successfully"

        });

        setNewReview({ rating: 0, text: "" });

        setSelectedImages([]);

        setImagePreviews([]);

        setShowReviewForm(false);

        fetchReviews();

      } else {

        throw new Error(json?.message || "Failed to submit review");

      }

    } catch (error: any) {

      toast({

        title: "Error",

        description: error.message || "Failed to submit review",

        variant: "destructive"

      });

    } finally {

      setSubmitting(false);

    }

  };



  const formatDate = (dateString: string) => {

    return new Date(dateString).toLocaleDateString('en-US', {

      year: 'numeric',

      month: 'long',

      day: 'numeric'

    });

  };

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
    
    console.log('🔍 [UPLOAD] Starting upload for', selectedImages.length, 'images');
    
    for (const file of selectedImages) {
      try {
        const formData = new FormData();
        formData.append('file', file); // Changed from 'image' to 'file'
        
        console.log('🔍 [UPLOAD] Uploading file:', file.name, file.size);
        
        const response = await api('/api/uploads/images', { // Changed endpoint
          method: 'POST',
          body: formData,
        });
        
        console.log('🔍 [UPLOAD] Upload response:', response);
        
        if (response.ok && response.json?.url) {
          uploadedUrls.push(response.json.url);
          console.log('🔍 [UPLOAD] Image uploaded successfully:', response.json.url);
        } else {
          console.error('🔍 [UPLOAD] Failed to upload image:', response);
        }
      } catch (error) {
        console.error('🔍 [UPLOAD] Error uploading image:', error);
      }
    }
    
    console.log('🔍 [UPLOAD] Final uploaded URLs:', uploadedUrls);
    return uploadedUrls;
  };


  if (loading) {

    return (

      <div className="flex justify-center py-8">

        <Loader2 className="h-8 w-8 animate-spin" />

      </div>

    );

  }



  return (

    <div className="space-y-6">

      {/* Review Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
            <div className="flex items-center">
              <Rating value={averageRating} onChange={() => {}} maxStars={5} size={4} />
            </div>
            <span className="text-sm text-gray-600">
              {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
        </div>
      </div>



      {/* Review Form */}

      {showReviewForm && user && (

        <div className="border rounded-lg p-6 bg-gray-50">

          <h4 className="font-semibold mb-4">Write Your Review</h4>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <Rating
                value={newReview.rating}
                onChange={(value) => setNewReview(prev => ({ ...prev, rating: value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <Textarea
                value={newReview.text}
                onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Share your experience with this product (minimum 20 characters)"
                rows={4}
                minLength={20}
                required
              />
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
                    id="review-images-list"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={submitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('review-images-list')?.click()}
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

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
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
                onClick={() => setShowReviewForm(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>

        </div>

      )}



      {/* Reviews List */}

      <div className="space-y-4">

        {reviews.length === 0 ? (

          <div className="text-center py-8 text-gray-500">

            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />

            <p>No reviews yet. Be the first to review this product!</p>

          </div>

        ) : (

          reviews.map((review) => (

            <div key={review._id} className="border rounded-lg p-6">

              <div className="flex items-start justify-between mb-3">

                <div>

                  <div className="flex items-center gap-2 mb-1">

                    <span className="font-medium">{review.username}</span>

                    <Rating value={review.rating} onChange={() => {}} maxStars={5} size={3} />

                  </div>

                  <p className="text-sm text-gray-500">

                    {formatDate(review.createdAt)}

                  </p>

                </div>

              </div>

              

              <p className="text-gray-700 mb-3 leading-relaxed">

                {review.text}

              </p>

              

              {review.images && review.images.length > 0 && (

                <div className="flex flex-wrap gap-2 mb-3">
                 
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border flex-shrink-0"
                      onError={(e) => {
                        console.error('Image failed to load:', image);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', image);
                      }}
                    />
                  ))}
                </div>
              )}

              

              {review.replies && review.replies.length > 0 && (

                <div className="mt-4 space-y-2">

                  {review.replies.map((reply, index) => (

                    <div key={index} className="bg-gray-50 rounded p-3 border-l-4 border-blue-500">

                      <div className="flex items-center justify-between mb-1">

                        <span className="font-medium text-sm">

                          {reply.authorId.name}

                          {reply.authorId.role === 'admin' && (

                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">

                              Admin

                            </span>

                          )}

                        </span>

                        <span className="text-xs text-gray-500">

                          {formatDate(reply.createdAt)}

                        </span>

                      </div>

                      <p className="text-sm text-gray-700">{reply.text}</p>

                    </div>

                  ))}

                </div>

              )}

            </div>

          ))

        )}

      </div>

    </div>

  );

};



export default ReviewsList;

