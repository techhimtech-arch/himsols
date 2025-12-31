import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, User, Eye } from "lucide-react";
import { format } from "date-fns";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(`
          *,
          profiles:author_id (full_name)
        `)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Increment view count
  useEffect(() => {
    if (post?.id) {
      supabase
        .from("blog_posts")
        .update({ views_count: (post.views_count || 0) + 1 })
        .eq("id", post.id)
        .then();
    }
  }, [post?.id]);

  const translations = {
    en: {
      back: "Back to Blog",
      notFound: "Article not found",
      minRead: "min read",
      views: "views",
    },
    hi: {
      back: "ब्लॉग पर वापस",
      notFound: "लेख नहीं मिला",
      minRead: "मिनट पढ़ें",
      views: "बार देखा गया",
    },
  };

  const t = translations[language];

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

  const title = language === "hi" && post.title_hi ? post.title_hi : post.title;
  const content = language === "hi" && post.content_hi ? post.content_hi : post.content;
  const excerpt = language === "hi" && post.excerpt_hi ? post.excerpt_hi : post.excerpt;
  const readTime = Math.ceil((content?.length || 0) / 1000);

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
                <span>{(post.profiles as any)?.full_name || "Admin"}</span>
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

          {/* Content */}
          <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
