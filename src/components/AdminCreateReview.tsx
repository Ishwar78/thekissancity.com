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

interface AdminCreateReviewProps {
  onReviewCreated?: () => void;
}

interface ProductDetail {
  _id: string;
  title: string;
}

export const AdminCreateReview = ({ onReviewCreated }: AdminCreateReviewProps) => {
  const { toast } = useToast();
  const [productId, setProductId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [allProducts, setAllProducts] = useState<ProductDetail[]>([]);
  const [allProductsLoading, setAllProductsLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"pending" | "published" | "rejected">("published");
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setAllProductsLoading(true);
      try {
        const { ok, json } = await api("/api/products?limit=1000"); 
        if (ok) {
          const sortedProducts = json.data.sort((a: ProductDetail, b: ProductDetail) =>
            a.title.localeCompare(b.title)
          );
          setAllProducts(sortedProducts);
        } else {
          toast({
            title: "Error fetching products",
            description: json?.message || "Failed to load all products.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error fetching products",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setAllProductsLoading(false);
      }
    };
    fetchAllProducts();
  }, [toast]);

  const selectedProduct = allProducts.find(p => p._id === productId) || null;

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
      setImages((prev) => [...prev, ...uploadedUrls]);
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
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!productId || !username || !email || !rating || !text) {
      toast({
        title: "Missing fields",
        description: "A product, Username, Email, Rating, and Review Text are required.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        productId,
        username,
        email,
        rating,
        text,
        images: images.length > 0 ? images : undefined,
        comment: comment || undefined,
        status,
      };

      const { ok, json } = await api("/api/admin/reviews/create", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!ok) {
        throw new Error(json?.message || "Failed to create review");
      }

      toast({
        title: "Review Created!",
        description: `Review for ${selectedProduct?.title || productId} created successfully.`, 
      });

      setProductId("");
      setUsername("");
      setEmail("");
      setRating(0);
      setText("");
      setImages([]);
      setComment("");
      setStatus("published");
      onReviewCreated?.();
    } catch (error: any) {
      toast({
        title: "Error creating review",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create New Product Review</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="productSelect">Product Name</Label>
          <Select value={productId} onValueChange={setProductId} disabled={allProductsLoading}>
            <SelectTrigger id="productSelect" className="w-full">
              <SelectValue placeholder={allProductsLoading ? "Loading products..." : "Select a product"} />
            </SelectTrigger>
            <SelectContent>
              {allProducts.length === 0 && !allProductsLoading ? (
                <SelectItem value="no-products-available" disabled>No products found</SelectItem>
              ) : (
                allProducts.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {!productId && allProducts.length > 0 && (
            <p className="text-red-500 text-sm mt-2">Please select a product from the list.</p>
          )}
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter reviewer's username"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter reviewer's email"
            required
          />
        </div>
        <div>
          <Label>Rating</Label>
          <Rating value={rating} onChange={setRating} />
        </div>
        <div>
          <Label htmlFor="reviewText">Review Text</Label>
          <Textarea
            id="reviewText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your review here (min 20 characters)"
            required
            rows={4}
          />
        </div>
        <div>
          <Label htmlFor="comment">Admin Comment (Optional)</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add an internal comment for this review"
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value: "pending" | "published" | "rejected") => setStatus(value)}>
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
          <Label htmlFor="imageUpload">Images (Optional)</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {images.map((img, index) => (
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

        <Button type="submit" disabled={loading || !productId || uploadingImages}>
          {loading ? "Creating..." : "Create Review"}
        </Button>
      </form>
    </div>
  );
};

export default AdminCreateReview;
