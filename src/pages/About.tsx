import { Helmet } from "react-helmet";
import { useMemo } from "react";
import { Award, Users, Globe, TrendingUp, Star, Calendar, Target, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const canonicalUrl = useMemo(() => `${window.location.origin}/about`, []);

  const stats = [
    { icon: Users, label: "Nominees", value: "500+", description: "Content creators nominated" },
    { icon: Globe, label: "Countries", value: "30+", description: "African nations represented" },
    { icon: TrendingUp, label: "Votes Cast", value: "100K+", description: "Community votes" },
    { icon: Award, label: "Categories", value: "20+", description: "Award categories" },
  ];

  const values = [
    {
      icon: Star,
      title: "Excellence",
      description: "We celebrate and recognize outstanding achievement in African digital content creation.",
    },
    {
      icon: Heart,
      title: "Community",
      description: "We foster a supportive community that uplifts and empowers African creators.",
    },
    {
      icon: Target,
      title: "Impact",
      description: "We amplify African voices and stories to create lasting positive change.",
    },
    {
      icon: Globe,
      title: "Diversity",
      description: "We embrace the rich diversity of African cultures, languages, and perspectives.",
    },
  ];

  const timeline = [
    {
      year: "2024",
      title: "ACIA Founded",
      description: "The African Content & Influencer Awards was established to celebrate Africa's digital creators.",
    },
    {
      year: "2024",
      title: "First Edition",
      description: "Our inaugural awards ceremony recognized outstanding creators across multiple categories.",
    },
    {
      year: "2025",
      title: "Expanding Reach",
      description: "Growing our platform to include more categories and reach creators across all African nations.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>About Us | ACIA Awards - African Content & Influencer Awards</title>
        <meta
          name="description"
          content="Learn about ACIA Awards - celebrating African content creators and influencers since 2024. Our mission, values, and impact on the African creator economy."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary via-primary/90 to-secondary/30 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.15),transparent_50%)]" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
                Celebrating African Excellence
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed">
                The African Content & Influencer Awards (ACIA) is dedicated to recognizing and celebrating 
                the incredible talent of African content creators and influencers who are shaping the 
                digital landscape across the continent and beyond.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center border-none bg-card shadow-lg">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary/20 mb-4">
                      <stat.icon className="h-6 w-6 text-secondary" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Our Story</h2>
                <div className="w-24 h-1 bg-secondary mx-auto" />
              </div>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="mb-6 text-center">
                  Founded in 2024, the African Content & Influencer Awards (ACIA) emerged from a vision to 
                  create a platform that truly celebrates the incredible talent of African digital creators. 
                  We recognized that Africa's content creation industry was booming, yet there was no 
                  dedicated platform to honor and uplift these creative voices.
                </p>
                <p className="mb-6 text-center">
                  Our mission is simple yet powerful: to spotlight African creators who are making waves 
                  in the digital space, from social media influencers to content creators, podcasters to 
                  video producers. We believe that every African story deserves to be told, and every 
                  creator deserves recognition for their unique contribution to our digital culture.
                </p>
                <p className="text-center">
                  In our inaugural year, we brought together hundreds of nominees from across the continent, 
                  generating thousands of community votes and creating a movement that celebrates African 
                  digital excellence. As we continue to grow, we remain committed to our core mission: 
                  empowering African creators and amplifying their voices on the global stage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Our Journey</h2>
              <div className="w-24 h-1 bg-secondary mx-auto" />
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-6 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-secondary-foreground" />
                      </div>
                    </div>
                    <div className="pt-2">
                      <span className="text-secondary font-bold text-lg">{item.year}</span>
                      <h3 className="font-serif text-xl font-semibold text-foreground mt-1">{item.title}</h3>
                      <p className="text-muted-foreground mt-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Our Values</h2>
              <div className="w-24 h-1 bg-secondary mx-auto" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center border-secondary/20 hover:border-secondary/40 transition-colors">
                  <CardContent className="pt-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-secondary/20 mb-4">
                      <value.icon className="h-7 w-7 text-secondary" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-16 bg-gradient-to-br from-secondary/10 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">Our Impact</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Since our launch in 2024, ACIA has made significant strides in celebrating and 
                empowering African creators:
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-secondary mb-2">Visibility</h3>
                  <p className="text-muted-foreground">
                    Providing a platform for emerging creators to gain recognition and grow their audience.
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-secondary mb-2">Community</h3>
                  <p className="text-muted-foreground">
                    Building a supportive network of creators, brands, and fans across the continent.
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-secondary mb-2">Opportunity</h3>
                  <p className="text-muted-foreground">
                    Creating pathways for creators to connect with brands and monetize their content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Join the Movement
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Be part of Africa's biggest celebration of digital creativity. Register as a nominee, 
              vote for your favorites, or simply follow our journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/auth?mode=signup"
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Register as Nominee
              </a>
              <a
                href="/nominees"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-foreground/10 text-primary-foreground font-semibold rounded-lg border border-primary-foreground/20 hover:bg-primary-foreground/20 transition-colors"
              >
                View Nominees
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
