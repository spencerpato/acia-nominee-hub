import { useMemo } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  const canonicalUrl = useMemo(() => `${window.location.origin}/privacy`, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Privacy Policy | ACIA Awards</title>
        <meta
          name="description"
          content="Learn how the African Creator Impact Awards (ACIA) collects, uses, and protects your personal information."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Navbar />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-3xl">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
              <p className="text-muted-foreground">Last updated: December 2024</p>

              <section>
                <h2 className="text-xl font-semibold">1. Information We Collect</h2>
                <p>We collect information you provide directly, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information (name, email, phone number)</li>
                  <li>Profile data (alias, bio, profile photo)</li>
                  <li>Voting activity and preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To operate and improve the ACIA platform</li>
                  <li>To display nominee profiles and vote counts</li>
                  <li>To communicate award updates and announcements</li>
                  <li>To prevent fraud and ensure fair voting</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">3. Information Sharing</h2>
                <p>
                  We do not sell your personal information. We may share information with service
                  providers who assist in platform operations, and when required by law.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">4. Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your information. However,
                  no method of transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your account</li>
                  <li>Opt out of promotional communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">6. Cookies</h2>
                <p>
                  We use cookies and similar technologies to improve your experience, analyze
                  traffic, and for security purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">7. Children's Privacy</h2>
                <p>
                  ACIA is not intended for users under 13 years of age. We do not knowingly collect
                  information from children.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">8. Changes to This Policy</h2>
                <p>
                  We may update this policy periodically. We will notify you of significant changes
                  via the platform or email.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">9. Contact Us</h2>
                <p>
                  For privacy-related inquiries, contact us at{" "}
                  <a href="mailto:privacy@aciaawards.com" className="text-secondary hover:underline">
                    privacy@aciaawards.com
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

export default Privacy;
