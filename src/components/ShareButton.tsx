import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share, Instagram, Mail, MessageSquare } from "lucide-react";

interface ShareButtonProps {
  productName: string;
  productUrl: string;
  productImage?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  productName,
  productUrl,
  productImage,
}) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          url: productUrl,
        });
        console.log("Product shared successfully");
      } catch (error) {
        console.error("Error sharing product:", error);
      }
    } else {
      // Fallback for browsers that do not support navigator.share
      // The dropdown will handle specific social media shares
      console.log("Web Share API not supported. Using dropdown for sharing.");
    }
  };

  const shareOnWhatsApp = () => {
    const text = `Check out this product: ${productName} - ${productUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareOnInstagram = () => {
    // Instagram sharing is complex for web. Typically requires deep linking to app
    // or using the official share API which is not directly available for web.
    // As a fallback, we can suggest users to copy the link or open Instagram.
    // For a fully functional share, usually a backend integration or specific SDK is needed.
    // For now, we'll open Instagram web and inform the user.
    alert("For Instagram, please share the link manually: " + productUrl);
    window.open("https://www.instagram.com/", "_blank");
  };

  const shareViaEmail = () => {
    const subject = `Check out this product: ${productName}`;
    const body = `I thought you might be interested in this: ${productName} - ${productUrl}`;
    window.open(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        body
      )}`,
      "_blank"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={shareOnWhatsApp}>
          <MessageSquare className="mr-2 h-4 w-4 text-green-500" /> WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnInstagram}>
          <Instagram className="mr-2 h-4 w-4 text-pink-600" /> Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaEmail}>
          <Mail className="mr-2 h-4 w-4 text-blue-500" /> Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

