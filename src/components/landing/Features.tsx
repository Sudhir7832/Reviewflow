import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Sparkles, LineChart } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Custom QR Codes",
      description: "Generate beautiful, branded QR codes for your tables, counters, or windows.",
      icon: <QrCode className="w-10 h-10 text-primary" />,
    },
    {
      title: "AI Review Assistant",
      description: "Customers select a star rating, and our AI drafts a personalized, SEO-friendly review for them to post.",
      icon: <Sparkles className="w-10 h-10 text-primary" />,
    },
    {
      title: "Powerful Analytics",
      description: "Track scans, conversions, and review generation across all your business locations.",
      icon: <LineChart className="w-10 h-10 text-primary" />,
    },
  ];

  return (
    <section id="features" className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow your reputation</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ReppulseAI simplifies the process of collecting Google reviews, turning your happy customers into your best marketers.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, i) => (
            <Card key={i} className="border-none shadow-md bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
