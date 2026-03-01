import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, User, Eye, Share2, Link2, MessageCircle, Facebook, Twitter, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import DOMPurify from "dompurify";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Increment view count atomically
  useEffect(() => {
    if (post?.id) {
      supabase.rpc("increment_blog_views", { post_id: post.id }).then();
    }
  }, [post?.id]);

  const translations = {
    en: {
      back: "Back to Blog",
      notFound: "Article not found",
      minRead: "min read",
      views: "views",
      share: "Share:",
      linkCopied: "Link copied!",
    },
    hi: {
      back: "ब्लॉग पर वापस",
      notFound: "लेख नहीं मिला",
      minRead: "मिनट पढ़ें",
      views: "बार देखा गया",
      share: "शेयर करें:",
      linkCopied: "लिंक कॉपी हो गया!",
    },
  };

  const t = translations[language];

  // Compute content values after post is loaded
  const title = post ? (language === "hi" && post.title_hi ? post.title_hi : post.title) : "";
  const rawContent = post ? (language === "hi" && post.content_hi ? post.content_hi : post.content) : "";
  const excerpt = post ? (language === "hi" && post.excerpt_hi ? post.excerpt_hi : post.excerpt) : "";
  const readTime = Math.ceil((rawContent?.length || 0) / 1000);

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = useMemo(() => {
    return DOMPurify.sanitize(rawContent || "", {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'a', 'img', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'br', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'style'],
      ALLOW_DATA_ATTR: false,
    });
  }, [rawContent]);

  // Share functions
  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(title + ' - ' + window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success(t.linkCopied);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: title,
        text: excerpt,
        url: window.location.href,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t.notFound}</h1>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.back}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Back button */}
          <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.back}
          </Link>

          {/* Header */}
          <header className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              {post.tags?.map((tag: string) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6">{excerpt}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Admin</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {post.published_at
                    ? format(new Date(post.published_at), "MMMM d, yyyy")
                    : "Draft"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{readTime} {t.minRead}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.views_count || 0} {t.views}</span>
              </div>
            </div>
          </header>

          {/* Share Buttons */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground mr-2">
                {t.share}
              </span>
              
              <Button variant="outline" size="icon" onClick={shareWhatsApp} className="bg-green-500 hover:bg-green-600 text-white border-0" title="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon" onClick={shareFacebook} className="bg-blue-600 hover:bg-blue-700 text-white border-0" title="Facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon" onClick={shareTwitter} className="bg-black hover:bg-gray-800 text-white border-0" title="Twitter/X">
                <Twitter className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon" onClick={shareLinkedIn} className="bg-blue-700 hover:bg-blue-800 text-white border-0" title="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon" onClick={copyLink} title="Copy Link">
                <Link2 className="h-4 w-4" />
              </Button>
              
              {typeof navigator !== 'undefined' && navigator.share && (
                <Button variant="outline" size="icon" onClick={nativeShare} title="Share">
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Cover Image */}
          {post.cover_image && (
            <div className="max-w-4xl mx-auto mb-8">
              <img
                src={post.cover_image}
                alt={title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Content - sanitized to prevent XSS */}
          <div 
            className="max-w-4xl mx-auto prose prose-lg dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-li:text-muted-foreground prose-img:rounded-lg prose-img:shadow-lg prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted prose-pre:text-foreground"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
          />
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
