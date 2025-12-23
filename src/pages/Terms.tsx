import { useMemo } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  const canonicalUrl = useMemo(() => `${window.location.origin}/terms`, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Terms & Conditions | ACIA Awards</title>
        <meta
          name="description"
          content="Read the Terms and Conditions for participating in the Africa Content and Influencers Awards (ACIA)."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Navbar />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-3xl">Terms &amp; Conditions</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
              <p className="text-muted-foreground">Last updated: December 2024</p>

              <section>
                <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using the Africa Content and Influencers Awards (ACIA) platform,
                  you agree to be bound by these Terms and Conditions. If you do not agree, please
                  do not use this platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">2. Eligibility</h2>
                <p>
                  Nominees must be African content creators with an active presence on at least one
                  major social media or content platform. Voters may participate from any location.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">3. Voting Rules</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Each device may cast one vote per nominee per voting period.</li>
                  <li>Vote manipulation, bot usage, or fraudulent voting is strictly prohibited.</li>
                  <li>ACIA reserves the right to disqualify votes that violate these rules.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">4. Nominee Conduct</h2>
                <p>
                  Nominees agree to maintain professional conduct and uphold the values of the ACIA
                  community. ACIA reserves the right to remove any nominee engaging in harmful,
                  offensive, or illegal behavior.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
                <p>
                  By registering, nominees grant ACIA a non-exclusive license to use their name,
                  alias, and profile photo for promotional purposes related to the awards.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
                <p>
                  ACIA is provided "as is" without warranties of any kind. We are not liable for
                  any damages arising from the use of this platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
                <p>
                  ACIA may update these terms at any time. Continued use of the platform constitutes
                  acceptance of the revised terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">8. Contact</h2>
                <p>
                  For questions regarding these terms, please contact us at{" "}
                  <a href="mailto:info@aciaawards.com" className="text-secondary hover:underline">
                    info@aciaawards.com
                  </a>
                  .
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
