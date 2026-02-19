import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Star, ThumbsUp, MessageSquare } from "lucide-react";

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
}

export const ReviewsList = ({ productId }: ReviewsListProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    text: ""
  });
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { ok, json } = await api(`/api/reviews/product/${productId}`);
      if (ok && json?.data) {
        setReviews(json.data);
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
      const { ok, json } = await api("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId,
          rating: newReview.rating,
          text: newReview.text.trim()
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Rating value={4.5} readonly />
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
            
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
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
                    <Rating value={review.rating} readonly size="sm" />
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
                <div className="flex gap-2 mb-3">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-20 h-20 object-cover rounded border"
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
