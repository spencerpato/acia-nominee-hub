import { useMemo } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";

const FAQ = () => {
  const canonicalUrl = useMemo(() => `${window.location.origin}/faq`, []);

  const faqCategories = [
    {
      title: "General Questions",
      faqs: [
        {
          question: "What is the Africa Creators Impact Awards (ACIA)?",
          answer:
            "ACIA is an award platform that celebrates and recognizes African content creators for their impact and influence across digital platforms. We provide a platform for creators to be nominated, receive votes from supporters, and compete for recognition and prizes.",
        },
        {
          question: "Who can participate in ACIA?",
          answer:
            "African content creators with an active presence on at least one major social media or content platform can participate as nominees. Voters can participate from any location worldwide.",
        },
        {
          question: "Is participation in ACIA mandatory?",
          answer:
            "No, participation is entirely voluntary. Registration, nomination, voting, and campaigning are done at the participant's own discretion.",
        },
      ],
    },
    {
      title: "Voting & Support",
      faqs: [
        {
          question: "How does voting work?",
          answer:
            "Voters can cast votes for their favorite nominees through the platform. Each vote contributes to the nominee's ranking and overall recognition. Voters may cast multiple votes to show their support.",
        },
        {
          question: "Is voting considered gambling or betting?",
          answer:
            "No. Votes represent support and engagement for nominees and are not a form of gambling, betting, lottery, or any game of chance. Voting is purely a measure of community support and creator impact.",
        },
        {
          question: "Can I vote for multiple nominees?",
          answer:
            "Yes, you can vote for multiple nominees and cast multiple votes for the same nominee to show your support.",
        },
        {
          question: "Are my votes refundable?",
          answer:
            "No. Votes cast are considered final contributions made during an active campaign and are not refundable.",
        },
      ],
    },
    {
      title: "Payouts & Payments",
      faqs: [
        {
          question: "When are payouts processed?",
          answer:
            "All payouts are processed only after the official voting period has ended. Payouts are expected by mid-February, subject to verification, audits, and system confirmation. No payouts are available during the active voting phase.",
        },
        {
          question: "Can I request an early payout?",
          answer:
            "No. Early payout requests are strictly prohibited and will not be considered under any circumstances, regardless of vote count, ranking position, or individual situation.",
        },
        {
          question: "How is my payout amount determined?",
          answer:
            "Payout amounts are determined by total verified votes and platform policy. All payouts are subject to verification and fraud review.",
        },
        {
          question: "What are the payout eligibility conditions?",
          answer:
            "Payout eligibility is determined only after: the official voting period has closed, all votes have been verified and audited, any suspected fraudulent activity has been reviewed, and the nominee has completed any required verification steps.",
        },
      ],
    },
    {
      title: "Withdrawal Policy",
      faqs: [
        {
          question: "Can I withdraw from the awards?",
          answer:
            "Yes, nominees may voluntarily withdraw at any time by submitting a formal request to awardsacia@gmail.com.",
        },
        {
          question: "What happens if I withdraw before voting ends?",
          answer:
            "If you withdraw before the end of the voting period, you forfeit eligibility for all payouts, awards, and benefits, regardless of the number of votes already received. Votes cast before withdrawal are not refundable or payable to the withdrawn nominee.",
        },
        {
          question: "What happens if I withdraw after voting ends?",
          answer:
            "Nominees who remain active until the voting period officially ends and complete verification remain eligible for payouts and awards, even if they choose to withdraw afterward.",
        },
        {
          question: "Can I rejoin after withdrawing?",
          answer:
            "Withdrawn nominees may not be eligible for reinstatement in the same award cycle.",
        },
      ],
    },
    {
      title: "Rankings & Awards",
      faqs: [
        {
          question: "Does nomination guarantee a specific ranking?",
          answer:
            "No. Nomination and participation in ACIA does not guarantee a specific ranking position, payout amount, top-three position, or any particular outcome. All outcomes depend on verified votes and platform rules.",
        },
        {
          question: "How are rankings determined?",
          answer:
            "Rankings are determined by the total number of verified votes received by each nominee. ACIA reserves the right to verify all votes and adjust rankings if fraudulent activity is detected.",
        },
        {
          question: "Can rankings change?",
          answer:
            "Yes, rankings can change throughout the voting period as votes are cast. Final rankings are determined after the voting period closes and all votes are verified.",
        },
      ],
    },
    {
      title: "Rules & Conduct",
      faqs: [
        {
          question: "What behavior can lead to disqualification?",
          answer:
            "Threats, blackmail, coercion, defamation, harassment, attempts to force payments, vote manipulation, bot usage, or any behavior that brings the awards into disrepute will result in immediate disqualification at ACIA's discretion.",
        },
        {
          question: "Can ACIA suspend or remove my account?",
          answer:
            "Yes. ACIA reserves the right to suspend or terminate accounts that violate platform policies, engage in fraudulent activity, or exhibit misconduct.",
        },
        {
          question: "How do I report misconduct?",
          answer:
            "Please report any misconduct or concerns to awardsacia@gmail.com. All reports will be reviewed and addressed appropriately.",
        },
      ],
    },
    {
      title: "Privacy & Data",
      faqs: [
        {
          question: "How is my personal data handled?",
          answer:
            "Personal data is handled in accordance with applicable data protection laws. Your information will not be sold or misused and is used solely for platform operations and award administration. Please refer to our Privacy Policy for detailed information.",
        },
        {
          question: "Do you use cookies?",
          answer:
            "Yes, we use cookies to enhance your experience, including essential cookies for platform functionality, analytics cookies to improve our services, and functional cookies for personalization. You can control cookie settings through your browser.",
        },
      ],
    },
    {
      title: "Contact & Support",
      faqs: [
        {
          question: "How do I contact ACIA?",
          answer:
            "For any questions, concerns, or inquiries, please contact us at awardsacia@gmail.com.",
        },
        {
          question: "How are disputes resolved?",
          answer:
            "Any disputes should first be addressed through official communication with ACIA at awardsacia@gmail.com before any external or legal action is taken. ACIA will endeavor to resolve all disputes fairly and in good faith.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>FAQ | ACIA Awards</title>
        <meta
          name="description"
          content="Find answers to frequently asked questions about the Africa Creators Impact Awards (ACIA), including voting, payouts, withdrawals, and more."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <Navbar />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="mb-8">
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-3xl md:text-4xl">
                Frequently Asked Questions
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Find answers to common questions about ACIA
              </p>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-secondary">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`${categoryIndex}-${faqIndex}`}
                      >
                        <AccordionTrigger className="text-left hover:text-secondary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardContent className="py-6 text-center">
              <p className="text-muted-foreground mb-4">
                Still have questions? We're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-md bg-secondary px-6 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
                >
                  Contact Us
                </Link>
                <Link
                  to="/terms"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  View Terms & Conditions
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
