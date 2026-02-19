import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, X, Star } from "lucide-react";

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
}

export const ReviewModal = ({ isOpen, onClose, productId, productName }: ReviewModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState({
    rating: 0,
    text: ""
  });

  useEffect(() => {
    if (!isOpen) {
      setReview({ rating: 0, text: "" });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const { ok, json } = await api("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          productId,
          rating: review.rating,
          text: review.text.trim()
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
        setReview({ rating: 0, text: "" });
        onClose();
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
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={submitting || review.rating === 0 || review.text.trim().length < 20}
                className="flex-1"
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
