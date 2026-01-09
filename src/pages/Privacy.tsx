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
                <h2 className="text-xl font-semibold">6. Cookies & Tracking Technologies</h2>
                <p>
                  We use cookies and similar tracking technologies to improve your experience on 
                  the ACIA platform. By continuing to use our website, you consent to the use of cookies 
                  as described below:
                </p>
                <h3 className="text-lg font-medium mt-4">Types of Cookies We Use:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Essential Cookies:</strong> Required for the platform to function properly, 
                    including authentication, security, and session management.
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how visitors interact with 
                    our platform, allowing us to improve performance and user experience.
                  </li>
                  <li>
                    <strong>Functional Cookies:</strong> Remember your preferences and settings to 
                    provide a personalized experience.
                  </li>
                </ul>
                <h3 className="text-lg font-medium mt-4">Your Cookie Choices:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You can control cookies through your browser settings.</li>
                  <li>Disabling essential cookies may affect platform functionality.</li>
                  <li>You may opt out of analytics cookies at any time.</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  By using ACIA, you acknowledge and consent to our use of cookies in accordance 
                  with this policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">7. Data Retention</h2>
                <p>
                  We retain your personal information only for as long as necessary to fulfill the 
                  purposes outlined in this policy, unless a longer retention period is required by law. 
                  Voting records may be retained for audit and verification purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">8. Children's Privacy</h2>
                <p>
                  ACIA is not intended for users under 13 years of age. We do not knowingly collect
                  information from children.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">9. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your 
                  own. We ensure appropriate safeguards are in place to protect your data in accordance 
                  with applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
                <p>
                  We may update this policy periodically. We will notify you of significant changes
                  via the platform or email. Continued use of the platform after changes are posted 
                  constitutes acceptance of the revised policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">11. Contact Us</h2>
                <p>
                  For privacy-related inquiries, contact us at{" "}
                  <a href="mailto:awardsacia@gmail.com" className="text-secondary hover:underline">
                    awardsacia@gmail.com
                  </a>
                  .
                </p>
              </section>

              <section className="bg-muted/50 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground italic">
                  By using the African Creator Impact Awards platform, you acknowledge that you have 
                  read and understood this Privacy Policy and consent to the collection, use, and 
                  disclosure of your information as described herein.
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
