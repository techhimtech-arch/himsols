import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import { ShareButtons } from "@/components/ShareButtons";
import { Link } from "react-router-dom";
import { TreePine, ArrowRight, ArrowLeft, Leaf, RotateCcw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface QuizQuestion {
  id: number;
  question_en: string;
  question_hi: string;
  options: { label_en: string; label_hi: string; score: number }[];
}

const questions: QuizQuestion[] = [
  {
    id: 1,
    question_en: "How do you commute daily?",
    question_hi: "आप रोज़ कैसे यात्रा करते हैं?",
    options: [
      { label_en: "Walk / Cycle", label_hi: "पैदल / साइकिल", score: 4 },
      { label_en: "Public Transport", label_hi: "सार्वजनिक परिवहन", score: 3 },
      { label_en: "Carpool / EV", label_hi: "कारपूल / ईवी", score: 2 },
      { label_en: "Personal Car / Bike", label_hi: "निजी कार / बाइक", score: 0 },
    ],
  },
  {
    id: 2,
    question_en: "How often do you eat non-veg?",
    question_hi: "आप कितनी बार नॉन-वेज खाते हैं?",
    options: [
      { label_en: "Fully vegetarian / vegan", label_hi: "पूर्ण शाकाहारी / वीगन", score: 4 },
      { label_en: "Once a week", label_hi: "हफ्ते में एक बार", score: 3 },
      { label_en: "3-4 times a week", label_hi: "हफ्ते में 3-4 बार", score: 1 },
      { label_en: "Daily", label_hi: "रोज़", score: 0 },
    ],
  },
  {
    id: 3,
    question_en: "Do you segregate your waste?",
    question_hi: "क्या आप कचरा अलग करते हैं?",
    options: [
      { label_en: "Yes, always", label_hi: "हां, हमेशा", score: 4 },
      { label_en: "Sometimes", label_hi: "कभी-कभी", score: 2 },
      { label_en: "Rarely", label_hi: "बहुत कम", score: 1 },
      { label_en: "Never", label_hi: "कभी नहीं", score: 0 },
    ],
  },
  {
    id: 4,
    question_en: "How many trees have you planted in your life?",
    question_hi: "आपने अपनी ज़िंदगी में कितने पेड़ लगाए हैं?",
    options: [
      { label_en: "10 or more", label_hi: "10 या उससे ज़्यादा", score: 4 },
      { label_en: "3-9 trees", label_hi: "3-9 पेड़", score: 3 },
      { label_en: "1-2 trees", label_hi: "1-2 पेड़", score: 1 },
      { label_en: "None yet", label_hi: "अभी तक कोई नहीं", score: 0 },
    ],
  },
  {
    id: 5,
    question_en: "Do you carry your own bag/bottle when going out?",
    question_hi: "क्या आप बाहर जाते वक्त अपना बैग/बोतल ले जाते हैं?",
    options: [
      { label_en: "Always", label_hi: "हमेशा", score: 4 },
      { label_en: "Most of the time", label_hi: "ज़्यादातर", score: 3 },
      { label_en: "Sometimes", label_hi: "कभी-कभी", score: 1 },
      { label_en: "Never", label_hi: "कभी नहीं", score: 0 },
    ],
  },
  {
    id: 6,
    question_en: "How do you handle old clothes and electronics?",
    question_hi: "पुराने कपड़े और इलेक्ट्रॉनिक्स का क्या करते हैं?",
    options: [
      { label_en: "Donate / Recycle", label_hi: "दान / रीसायकल", score: 4 },
      { label_en: "Sell to scrap dealer", label_hi: "कबाड़ीवाले को बेचते हैं", score: 3 },
      { label_en: "Keep at home unused", label_hi: "घर पर रखे रहते हैं", score: 1 },
      { label_en: "Throw away", label_hi: "फेंक देते हैं", score: 0 },
    ],
  },
  {
    id: 7,
    question_en: "Do you use energy-efficient appliances at home?",
    question_hi: "क्या आप घर में ऊर्जा-कुशल उपकरण इस्तेमाल करते हैं?",
    options: [
      { label_en: "Yes, all LED & 5-star rated", label_hi: "हां, सब LED और 5-स्टार", score: 4 },
      { label_en: "Mostly", label_hi: "ज़्यादातर", score: 3 },
      { label_en: "Some", label_hi: "कुछ", score: 1 },
      { label_en: "No idea", label_hi: "पता नहीं", score: 0 },
    ],
  },
];

const getResult = (score: number, maxScore: number) => {
  const pct = (score / maxScore) * 100;
  if (pct >= 80)
    return {
      tier: "eco-hero",
      title_en: "🌳 Eco Hero!",
      title_hi: "🌳 इको हीरो!",
      desc_en: "You're already living green! Inspire others by planting a tree in someone's name.",
      desc_hi: "आप पहले से ही ग्रीन जी रहे हैं! किसी के नाम पर पेड़ लगाकर और लोगों को प्रेरित करें।",
      color: "text-primary",
      co2_en: "Your lifestyle saves ~2.5 tons CO₂/year",
      co2_hi: "आपकी जीवनशैली ~2.5 टन CO₂/साल बचाती है",
    };
  if (pct >= 55)
    return {
      tier: "green-starter",
      title_en: "🌿 Green Starter",
      title_hi: "🌿 ग्रीन स्टार्टर",
      desc_en: "Good going! Small changes can make a big impact. Start with planting a tree today.",
      desc_hi: "बढ़िया! छोटे बदलाव बड़ा असर डालते हैं। आज एक पेड़ लगाकर शुरुआत करें।",
      color: "text-secondary",
      co2_en: "You can offset ~1.5 tons CO₂/year more",
      co2_hi: "आप ~1.5 टन CO₂/साल और ऑफसेट कर सकते हैं",
    };
  return {
    tier: "needs-work",
    title_en: "🌱 Time to Go Green!",
    title_hi: "🌱 ग्रीन होने का समय!",
    desc_en: "Your footprint is high, but it's never too late! Plant a tree to start your green journey.",
    desc_hi: "आपका कार्बन फुटप्रिंट ज़्यादा है, लेकिन कभी देर नहीं होती! एक पेड़ लगाकर ग्रीन सफ़र शुरू करें।",
    color: "text-orange-500",
    co2_en: "A single tree absorbs ~22 kg CO₂/year",
    co2_hi: "एक पेड़ ~22 kg CO₂/साल सोखता है",
  };
};

const GreenQuiz = () => {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const maxScore = questions.length * 4;
  const totalScore = answers.reduce((s, a) => s + a, 0);
  const result = useMemo(() => getResult(totalScore, maxScore), [totalScore, maxScore]);
  const progress = showResult ? 100 : (currentQ / questions.length) * 100;

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const reset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setShowResult(false);
  };

  const pctScore = Math.round((totalScore / maxScore) * 100);
  const shareText = isHi
    ? `मैंने Himsols Green Quiz में ${pctScore}% स्कोर किया! मेरा रिज़ल्ट: ${result.title_hi}। तुम भी खेलो 🌱`
    : `I scored ${pctScore}% on the Himsols Green Quiz! My result: ${result.title_en}. Take the quiz 🌱`;

  const q = questions[currentQ];

  return (
    <div className="min-h-screen">
      <SEO
        title={isHi ? "कितने ग्रीन हो तुम? - Himsols Quiz" : "How Green Are You? - Himsols Quiz"}
        description={isHi ? "अपना ग्रीन स्कोर जानें और पेड़ लगाकर पर्यावरण बचाएं" : "Find your green score and plant a tree to offset your carbon footprint"}
        url="https://himsols.online/green-quiz"
      />
      <Navbar />

      <section className="pt-24 md:pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary mb-4">
              <Leaf className="h-3.5 w-3.5" />
              {isHi ? "ग्रीन क्विज़" : "Green Quiz"}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              {isHi ? "कितने ग्रीन हो तुम?" : "How Green Are You?"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {isHi
                ? "7 सवालों में जानो अपना ग्रीन स्कोर 🌿"
                : "Answer 7 questions to find your green score 🌿"}
            </p>
          </div>

          {/* Progress */}
          <Progress value={progress} className="mb-8 h-2" />

          {!showResult ? (
            /* Quiz Question */
            <Card className="border-border/50 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <p className="text-sm text-muted-foreground mb-2">
                  {isHi ? `सवाल ${currentQ + 1} / ${questions.length}` : `Question ${currentQ + 1} of ${questions.length}`}
                </p>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                  {isHi ? q.question_hi : q.question_en}
                </h2>

                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt.score)}
                      className="w-full text-left px-5 py-4 rounded-xl border-2 border-border/50 bg-background hover:border-primary hover:bg-primary/5 transition-all duration-200 text-foreground font-medium"
                    >
                      {isHi ? opt.label_hi : opt.label_en}
                    </button>
                  ))}
                </div>

                {currentQ > 0 && (
                  <Button variant="ghost" onClick={handleBack} className="mt-4 gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    {isHi ? "पीछे" : "Back"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Result */
            <Card className="border-primary/30 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
              <CardContent className="p-6 md:p-10 text-center space-y-6">
                <div className={`text-5xl md:text-6xl font-bold ${result.color}`}>
                  {pctScore}%
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {isHi ? result.title_hi : result.title_en}
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  {isHi ? result.desc_hi : result.desc_en}
                </p>
                <div className="inline-block px-4 py-2 rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  🌍 {isHi ? result.co2_hi : result.co2_en}
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Link to="/shop">
                    <Button size="lg" className="w-full sm:w-auto gap-2">
                      <TreePine className="h-4 w-4" />
                      {isHi ? "₹299 में पेड़ लगाओ" : "Plant a Tree – ₹299"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" onClick={reset} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    {isHi ? "फिर से खेलो" : "Retake Quiz"}
                  </Button>
                </div>

                {/* Share */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-3">
                    {isHi ? "अपना रिज़ल्ट शेयर करो 👇" : "Share your result 👇"}
                  </p>
                  <ShareButtons
                    title={isHi ? "Himsols ग्रीन क्विज़" : "Himsols Green Quiz"}
                    description={shareText}
                    url="/green-quiz"
                    whatsappMessage={shareText + "\nhttps://himsols.online/green-quiz"}
                    variant="full"
                    size="sm"
                    className="justify-center"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GreenQuiz;
