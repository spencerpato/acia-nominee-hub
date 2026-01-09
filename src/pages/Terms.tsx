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
          content="Read the Terms and Conditions for participating in the African Creator Impact Awards (ACIA)."
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
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
              <p className="text-muted-foreground">Last updated: January 2025</p>

              <section>
                <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
                <p>
                  By registering, voting, or participating in the African Creator Impact Awards (ACIA) 
                  in any capacity, you confirm that you have read, understood, and agreed to be bound 
                  by these Terms and Conditions. If you do not agree to these terms, please do not 
                  use this platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">2. Voluntary Participation</h2>
                <p>
                  Participation in ACIA is entirely voluntary. Registration, nomination, voting, and 
                  campaigning are done at the participant's own discretion. No individual is forced, 
                  coerced, or required to take part in any aspect of the awards. All participants 
                  engage of their own free will.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">3. Voting & Support Model</h2>
                <p>
                  Votes on the ACIA platform represent support and engagement for nominated creators. 
                  Voting is not a form of gambling, betting, lottery, or any game of chance.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Voters may cast multiple votes to support their preferred nominees.</li>
                  <li>Each vote contributes to nominee rankings and overall recognition.</li>
                  <li>Vote counts are used to determine standings and award outcomes.</li>
                  <li>Voting serves as a measure of community support and creator impact.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">4. Eligibility</h2>
                <p>
                  Nominees must be African content creators with an active presence on at least one 
                  major social media or content platform. Voters may participate from any location 
                  worldwide.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">5. Voting Rules</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Vote manipulation, bot usage, or fraudulent voting is strictly prohibited.</li>
                  <li>ACIA reserves the right to verify, audit, and disqualify votes that violate these rules.</li>
                  <li>Suspicious voting patterns may result in vote removal or account suspension.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">6. Payment & Payout Policy</h2>
                <p>
                  All payouts to eligible nominees are processed only after the official voting period 
                  has concluded. Please note the following:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payouts are not instant and are not available during the active voting phase.</li>
                  <li>Payments are expected to be processed by mid-February, subject to verification, audits, and system confirmation.</li>
                  <li>Payout amounts are determined by total verified votes and platform policy.</li>
                  <li>ACIA reserves the right to withhold payouts pending fraud investigation or policy violations.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">7. No Early Payouts Policy</h2>
                <p>
                  Requests for early payouts will not be honored under any circumstances, regardless 
                  of vote count, ranking position, or individual situation. All participants must 
                  wait until the official payout period following the conclusion of voting.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">8. Withdrawal Policy</h2>
                <p>
                  Nominees may withdraw from the awards at any time by submitting a formal withdrawal 
                  request to <a href="mailto:awardsacia@gmail.com" className="text-secondary hover:underline">awardsacia@gmail.com</a>.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upon withdrawal, the nominee's profile will be removed from public listings.</li>
                  <li>No further participation or ranking will occur after withdrawal.</li>
                  <li>Withdrawn nominees may not be eligible for reinstatement in the same award cycle.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">9. Conduct, Abuse & Disqualification</h2>
                <p>
                  ACIA maintains a zero-tolerance policy for misconduct. Any form of the following 
                  will result in immediate disqualification, suspension, or removal from the platform 
                  at ACIA's sole discretion:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Threats or intimidation directed at ACIA staff, other nominees, or voters</li>
                  <li>Blackmail or coercion in any form</li>
                  <li>Defamation of ACIA, its partners, or other participants</li>
                  <li>Harassment of any individual associated with the platform</li>
                  <li>Attempts to force, demand, or coerce payments outside official channels</li>
                  <li>Any behavior that brings the awards into disrepute</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">10. Platform Rights & Discretion</h2>
                <p>ACIA reserves the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Verify all votes and remove fraudulent or suspicious votes</li>
                  <li>Adjust rankings if fraudulent activity is detected</li>
                  <li>Suspend or terminate accounts that violate platform policies</li>
                  <li>Make final decisions on awards, rankings, and payouts</li>
                  <li>Modify these terms at any time with appropriate notice</li>
                  <li>Cancel, postpone, or modify the awards program as necessary</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">11. No Guaranteed Ranking</h2>
                <p>
                  Nomination and participation in ACIA does not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A specific ranking position</li>
                  <li>A specific payout amount</li>
                  <li>A top-three or winning position</li>
                  <li>Any particular outcome or recognition</li>
                </ul>
                <p className="mt-2">
                  All outcomes depend on verified votes, platform rules, and ACIA's final determination.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">12. Intellectual Property</h2>
                <p>
                  By registering, nominees grant ACIA a non-exclusive license to use their name, 
                  alias, profile photo, and related content for promotional purposes related to the 
                  awards, including social media, marketing materials, and press releases.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">13. Data & Privacy</h2>
                <p>
                  Personal data collected through the ACIA platform is handled in accordance with 
                  applicable data protection laws. We are committed to protecting your privacy:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your personal information will not be sold or misused.</li>
                  <li>Data is used solely for platform operations and award administration.</li>
                  <li>Please refer to our <a href="/privacy" className="text-secondary hover:underline">Privacy Policy</a> for detailed information.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold">14. Limitation of Liability</h2>
                <p>
                  ACIA is provided "as is" without warranties of any kind, express or implied. 
                  We are not liable for any direct, indirect, incidental, or consequential damages 
                  arising from the use of this platform, participation in the awards, or reliance 
                  on any information provided.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">15. Dispute Resolution</h2>
                <p>
                  Any disputes, concerns, or complaints should first be addressed through official 
                  communication with ACIA at{" "}
                  <a href="mailto:awardsacia@gmail.com" className="text-secondary hover:underline">
                    awardsacia@gmail.com
                  </a>{" "}
                  before any external or legal action is taken. ACIA will endeavor to resolve all 
                  disputes fairly and in good faith.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">16. Changes to Terms</h2>
                <p>
                  ACIA may update these Terms and Conditions at any time. Changes will be posted on 
                  this page with an updated revision date. Continued use of the platform after changes 
                  are posted constitutes acceptance of the revised terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">17. Contact</h2>
                <p>
                  For questions, concerns, or inquiries regarding these Terms and Conditions, 
                  please contact us at{" "}
                  <a href="mailto:awardsacia@gmail.com" className="text-secondary hover:underline">
                    awardsacia@gmail.com
                  </a>
                  .
                </p>
              </section>

              <section className="bg-muted/50 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground italic">
                  By participating in the African Creator Impact Awards, you acknowledge that you have 
                  read, understood, and agree to abide by these Terms and Conditions in their entirety.
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
