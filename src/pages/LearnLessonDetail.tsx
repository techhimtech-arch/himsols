import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, TreePine, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSafe } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from "dompurify";

interface QuizQ { question: string; question_hi?: string; options: string[]; options_hi?: string[]; correct_index: number }

const LearnLessonDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isHi = language === "hi";
  const { user } = useAuthSafe();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("slug", slug!)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: existing } = useQuery({
    queryKey: ["lesson-completion", lesson?.id, user?.id],
    enabled: !!lesson?.id && !!user?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("lesson_completions")
        .select("*")
        .eq("lesson_id", lesson!.id)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen"><Navbar /><main className="pt-24 px-4 container mx-auto">Loading…</main></div>;
  if (!lesson) return <div className="min-h-screen"><Navbar /><main className="pt-24 px-4 container mx-auto">Lesson not found. <Link to="/learn/lessons" className="text-primary">Back</Link></main></div>;

  const title = isHi && lesson.title_hi ? lesson.title_hi : lesson.title;
  const body = isHi && lesson.body_hi ? lesson.body_hi : lesson.body;
  const quiz: QuizQ[] = Array.isArray(lesson.quiz_json) ? (lesson.quiz_json as any) : [];

  const submit = async () => {
    if (!user) {
      toast({ title: isHi ? "लॉगिन ज़रूरी" : "Login required", description: isHi ? "बैज पाने के लिए लॉगिन करो।" : "Sign in to save your badge.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    let score = 0;
    quiz.forEach((q, i) => { if (answers[i] === q.correct_index) score++; });
    const { error } = await supabase.from("lesson_completions").upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      score,
      total_questions: quiz.length,
    }, { onConflict: "user_id,lesson_id" });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setSubmitted(true);
    toast({ title: isHi ? "🎉 बैज मिला!" : "🎉 Badge earned!", description: `${score}/${quiz.length}` });
  };

  const clean = DOMPurify.sanitize(body || "");

  return (
    <div className="min-h-screen">
      <SEO title={`${title} | Himsols Learn`} description={lesson.summary || title} url={`https://himsols.online/learn/lessons/${lesson.slug}`} />
      <Navbar />
      <main className="pt-24 pb-20 px-4">
        <article className="container mx-auto max-w-3xl">
          <Link to="/learn/lessons" className="text-sm text-muted-foreground hover:text-primary">← {isHi ? "सभी पाठ" : "All lessons"}</Link>
          <div className="mt-4 mb-6 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{lesson.category}</Badge>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> {lesson.read_minutes} min
              </span>
              {existing && (
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                  <CheckCircle2 className="h-3 w-3" /> {isHi ? "पूरा" : "Completed"} · {existing.score}/{existing.total_questions}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          </div>

          {lesson.cover_image_url && (
            <img src={lesson.cover_image_url} alt={title} className="w-full rounded-xl mb-8" loading="lazy" />
          )}

          <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: clean }} />

          {quiz.length > 0 && (
            <Card className="mt-10 border-primary/20">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">{isHi ? "छोटा क्विज़" : "Quick Quiz"}</h2>
                </div>
                {quiz.map((q, i) => {
                  const qText = isHi && q.question_hi ? q.question_hi : q.question;
                  const opts = isHi && q.options_hi ? q.options_hi : q.options;
                  return (
                    <div key={i} className="space-y-2">
                      <p className="font-medium">{i + 1}. {qText}</p>
                      <div className="grid gap-2">
                        {opts.map((opt, oi) => {
                          const isSelected = answers[i] === oi;
                          const isCorrect = submitted && oi === q.correct_index;
                          const isWrong = submitted && isSelected && oi !== q.correct_index;
                          return (
                            <button
                              key={oi}
                              disabled={submitted}
                              onClick={() => setAnswers({ ...answers, [i]: oi })}
                              className={`text-left px-4 py-2 rounded-lg border transition-colors ${
                                isCorrect ? "border-green-500 bg-green-500/10" :
                                isWrong ? "border-red-500 bg-red-500/10" :
                                isSelected ? "border-primary bg-primary/10" :
                                "border-border hover:border-primary/50"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {!submitted ? (
                  <Button onClick={submit} disabled={Object.keys(answers).length < quiz.length} className="w-full">
                    {isHi ? "सबमिट करो और बैज कमाओ" : "Submit & Earn Badge"}
                  </Button>
                ) : (
                  <div className="text-center space-y-3 pt-2">
                    <p className="font-semibold">
                      {isHi ? "बहुत बढ़िया! अब असली कदम उठाओ:" : "Great job! Now take a real step:"}
                    </p>
                    <Link to="/single-tree-pack">
                      <Button className="gap-2"><TreePine className="h-4 w-4" /> {isHi ? "एक पेड़ लगाओ ₹269" : "Plant a Tree · ₹269"}</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {quiz.length === 0 && (
            <Card className="mt-10">
              <CardContent className="p-6 text-center space-y-3">
                <p className="font-semibold">{isHi ? "जो सीखा उसे कर्म में बदलो:" : "Turn what you learned into action:"}</p>
                <Link to="/single-tree-pack">
                  <Button className="gap-2"><TreePine className="h-4 w-4" /> {isHi ? "एक पेड़ लगाओ ₹269" : "Plant a Tree · ₹269"}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default LearnLessonDetail;
