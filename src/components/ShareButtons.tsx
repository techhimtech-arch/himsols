import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, MessageCircle, Facebook, Linkedin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface ShareButtonsProps {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  whatsappMessage?: string;
  size?: "sm" | "default" | "lg";
  variant?: "icons" | "full";
  className?: string;
}

export const ShareButtons = ({
  title,
  description,
  url,
  image,
  whatsappMessage,
  size = "sm",
  variant = "icons",
  className = "",
}: ShareButtonsProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  const defaultWhatsappMessage = whatsappMessage || `${title}\n\n${description}\n\n${shareUrl}`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(defaultWhatsappMessage)}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const shareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  const buttonSize = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  if (variant === "full") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <Button onClick={shareWhatsApp} variant="outline" size={size} className="gap-2 bg-green-50 hover:bg-green-100 text-green-600 border-green-200">
          <MessageCircle className={iconSize} />
          WhatsApp
        </Button>
        <Button onClick={shareFacebook} variant="outline" size={size} className="gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200">
          <Facebook className={iconSize} />
          Facebook
        </Button>
        <Button onClick={shareTwitter} variant="outline" size={size} className="gap-2 bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200">
          <XIcon className={iconSize} />
          X
        </Button>
        <Button onClick={copyLink} variant="outline" size={size} className="gap-2">
          {copied ? <Check className={iconSize} /> : <Copy className={iconSize} />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        {navigator.share && (
          <Button onClick={nativeShare} variant="outline" size={size} className="gap-2">
            <Share2 className={iconSize} />
            Share
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Button
        onClick={shareWhatsApp}
        variant="ghost"
        size="icon"
        className={`${buttonSize} text-green-600 hover:bg-green-100 hover:text-green-700`}
        title="Share on WhatsApp"
      >
        <MessageCircle className={iconSize} />
      </Button>
      <Button
        onClick={shareFacebook}
        variant="ghost"
        size="icon"
        className={`${buttonSize} text-blue-600 hover:bg-blue-100 hover:text-blue-700`}
        title="Share on Facebook"
      >
        <Facebook className={iconSize} />
      </Button>
      <Button
        onClick={shareTwitter}
        variant="ghost"
        size="icon"
        className={`${buttonSize} text-gray-700 hover:bg-gray-100 hover:text-gray-900`}
        title="Share on X"
      >
        <XIcon className={iconSize} />
      </Button>
      <Button
        onClick={shareLinkedIn}
        variant="ghost"
        size="icon"
        className={`${buttonSize} text-blue-700 hover:bg-blue-100 hover:text-blue-800`}
        title="Share on LinkedIn"
      >
        <Linkedin className={iconSize} />
      </Button>
      <Button
        onClick={copyLink}
        variant="ghost"
        size="icon"
        className={`${buttonSize}`}
        title="Copy link"
      >
        {copied ? <Check className={iconSize} /> : <Copy className={iconSize} />}
      </Button>
      {navigator.share && (
        <Button
          onClick={nativeShare}
          variant="ghost"
          size="icon"
          className={buttonSize}
          title="Share"
        >
          <Share2 className={iconSize} />
        </Button>
      )}
    </div>
  );
};
