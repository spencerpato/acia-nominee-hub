import { Mail, MapPin, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted">
        {/* Hero */}
        <section className="bg-gradient-hero py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Have questions about the African Creator Impact Awards? We'd love to hear from you.
            </p>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <Card className="border-border/50">
              <CardContent className="p-8 md:p-12">
                <div className="space-y-8">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                        Email
                      </h3>
                      <a
                        href="mailto:awardsacia@gmail.com"
                        className="text-secondary hover:underline text-lg"
                      >
                        awardsacia@gmail.com
                      </a>
                      <p className="text-muted-foreground text-sm mt-1">
                        For general inquiries, nominations, and partnerships.
                      </p>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                        Response Time
                      </h3>
                      <p className="text-muted-foreground">
                        We typically respond within 24-48 hours during business days.
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                        Location
                      </h3>
                      <p className="text-muted-foreground">
                        Celebrating creators across Africa
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-12 pt-8 border-t border-border">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                    Get in Touch
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Whether you're a creator looking to participate, a brand interested in 
                    partnership opportunities, or simply want to learn more about the 
                    African Creator Impact Awards, we're here to help. Drop us an email 
                    and our team will get back to you as soon as possible.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
