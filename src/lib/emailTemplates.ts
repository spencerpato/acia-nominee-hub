export interface EmailTemplateData {
  nomineeName: string;
  voteCount: number;
  expectedEarnings: string;
  votingLink: string;
  creatorAlias: string;
}

export type EmailCategory = 
  | "encouragement"
  | "dormant"
  | "nomination_acceptance"
  | "policy_warning"
  | "withdrawal_confirmation"
  | "payout_notification"
  | "disqualification";

export interface EmailTemplate {
  id: EmailCategory;
  name: string;
  subject: string;
  generateContent: (data: EmailTemplateData) => string;
}

// Calculate expected earnings based on vote count
export const calculateExpectedEarnings = (voteCount: number): number => {
  const pricePerVote = 20; // KES 20 per vote
  const grossEarnings = voteCount * pricePerVote;
  const platformFee = grossEarnings * 0.15; // 15% platform fee
  return Math.floor(grossEarnings - platformFee);
};

export const formatEarnings = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const emailTemplates: EmailTemplate[] = [
  {
    id: "encouragement",
    name: "Encouragement / Campaign Motivation",
    subject: "Keep Up the Great Work! 🌟",
    generateContent: (data) => `
Hello ${data.nomineeName},

Congratulations on your amazing progress in the Africa Creators Impact Awards! 🎉

You currently have ${data.voteCount.toLocaleString()} verified votes. Your dedication and influence are truly inspiring!

🔗 Your Voting Link (Share with your fans!):
${data.votingLink}

To continue climbing the ranks and maximize your impact, here are some tips:

📱 Share your unique voting link on all your social media platforms
🔗 Add your voting link to your bio on Instagram, TikTok, Twitter, and YouTube
📝 Create engaging content with captions that include a call-to-action for your fans to vote
🎯 Visit the Tips section on your dashboard for more campaign strategies

Remember, every vote counts and brings you closer to recognition as one of Africa's most impactful creators!

Keep shining! ✨

Regards,
Africa Creators Impact Awards (ACIA)
    `.trim(),
  },
  {
    id: "dormant",
    name: "Dormant Account Follow-Up",
    subject: "We Miss You! - ACIA Check-In",
    generateContent: (data) => `
Hello ${data.nomineeName},

We noticed that your account has been inactive for a while, and we wanted to check in with you.

Your current standing:
• Verified Votes: ${data.voteCount.toLocaleString()}
• Expected Earnings: ${data.expectedEarnings}

🔗 Your Voting Link:
${data.votingLink}

We'd love to know if you:
1. Wish to continue participating in the Africa Creators Impact Awards and actively campaign for more votes
2. Would like to withdraw from the awards

Important Notice: As per our Terms & Conditions, if you choose to withdraw before the voting period ends, you will forfeit eligibility for all payouts and awards, regardless of the votes you have already received.

Please reply to this email or contact us at awardsacia@gmail.com to let us know your decision.

We hope to see you continue your journey with us!

Regards,
Africa Creators Impact Awards (ACIA)
    `.trim(),
  },
  {
    id: "nomination_acceptance",
    name: "Nomination Acceptance",
    subject: "Welcome to ACIA! Your Nomination is Confirmed 🎊",
    generateContent: (data) => `
Hello ${data.nomineeName},

Congratulations! 🎉 Your nomination for the Africa Creators Impact Awards has been successfully confirmed!

You are now officially part of a prestigious community of African digital creators making a difference across the continent.

🔗 Your Unique Voting Link:
${data.votingLink}

How Voting Works:
• Your fans and supporters can vote for you through your unique profile page
• Each vote contributes to your ranking and potential earnings
• The more votes you receive, the higher you climb on the leaderboard
• Top creators will be recognized and rewarded at the end of the voting period

Next Steps:
1. Share your voting link across all your social media platforms
2. Engage your audience and encourage them to vote
3. Check the Tips section for campaign strategies

We're excited to have you on this journey. Let's celebrate African creativity together!

Regards,
Africa Creators Impact Awards (ACIA)
    `.trim(),
  },
  {
    id: "policy_warning",
    name: "Policy Warning",
    subject: "Important Notice: Terms & Conditions Violation",
    generateContent: (data) => `
Dear ${data.nomineeName},

We are writing to inform you of a matter that requires your immediate attention.

It has come to our notice that certain activities associated with your account may be in violation of the Africa Creators Impact Awards (ACIA) Terms & Conditions.

As outlined in our Terms & Conditions, the following actions are strictly prohibited:
• Threats, blackmail, or coercion
• Defamation or harassment
• Attempts to force payments outside official processes
• Any form of fraudulent activity

Consequences: Continued violation of these terms may result in:
• Immediate disqualification from the awards
• Suspension or permanent removal from the platform
• Forfeiture of all accumulated votes and potential earnings

We urge you to review our Terms & Conditions and ensure full compliance going forward. If you believe this notice was sent in error, please contact us immediately at awardsacia@gmail.com.

Thank you for your understanding and cooperation.

Regards,
Africa Creators Impact Awards (ACIA)
    `.trim(),
  },
  {
    id: "withdrawal_confirmation",
    name: "Withdrawal Confirmation",
    subject: "Withdrawal Request Received - ACIA",
    generateContent: (data) => `
Dear ${data.nomineeName},

We have received your request to withdraw from the Africa Creators Impact Awards.

As per our Terms & Conditions (Withdrawal Policy):

"Withdrawal Before Voting Ends: Any nominee who withdraws before the official close of the voting period forfeits eligibility for all payouts, awards, and benefits, regardless of the number of votes already received. Votes cast before withdrawal are considered final contributions made during an active campaign and are not refundable and not payable."

Your current stats at the time of withdrawal:
• Total Verified Votes: ${data.voteCount.toLocaleString()}
• Forfeited Earnings: ${data.expectedEarnings}

Your profile will be removed from public listings, and no further participation will occur.

If you have any questions or wish to reconsider, please contact us at awardsacia@gmail.com before the withdrawal is fully processed.

We wish you all the best in your future endeavors.

Regards,
Africa Creators Impact Awards (ACIA)
    `.trim(),
  },
  {
    id: "payout_notification",
    name: "Payout Notification",
    subject: "Great News! You're Eligible for Payout 💰",
    generateContent: (data) => `
Dear ${data.nomineeName},

Congratulations! 🎉 The voting period for the Africa Creators Impact Awards has officially ended, and we are thrilled to inform you that you are eligible for a payout!

Your final results:
• Total Verified Votes: ${data.voteCount.toLocaleString()}
• Payout Amount: ${data.expectedEarnings}

Payout Timeline:
Payouts are expected to be processed by mid-February, subject to verification, audits, and system confirmation.

Next Steps:
1. Ensure your profile information and contact details are up to date
2. Prepare your preferred payment method details
3. Watch for our next email with verification instructions
4. Complete the payout method selection when prompted

Thank you for being part of the Africa Creators Impact Awards. Your dedication and influence have truly made a difference!

Regards,
Africa Creators Impact Awards (ACIA)
    `.trim(),
  },
  {
    id: "disqualification",
    name: "Disqualification Notice",
    subject: "Important Notice: Disqualification from ACIA",
    generateContent: (data) => `
Dear ${data.nomineeName},

We regret to inform you that your participation in the Africa Creators Impact Awards has been terminated effective immediately.

This decision has been made in accordance with our Terms & Conditions, Section: Conduct, Abuse & Disqualification, which states:

"Any form of threats, blackmail, coercion, defamation, harassment, or attempts to force payments will result in immediate disqualification, suspension, or removal from the platform, at ACIA's discretion."

Consequences of disqualification:
• Your profile has been removed from all public listings
• All accumulated votes (${data.voteCount.toLocaleString()}) are voided
• All potential earnings (${data.expectedEarnings}) are forfeited
• You are no longer eligible for any awards or recognition
• You may not re-register for current or future ACIA events

If you believe this decision was made in error, you may submit an appeal in writing to awardsacia@gmail.com within 7 days of receiving this notice. All appeals will be reviewed, and the final decision rests with ACIA.

We take the integrity of our platform seriously and appreciate your understanding.

Regards,
Africa Creators Impact Awards (ACIA)
    `.trim(),
  },
];

export const getTemplateById = (id: EmailCategory): EmailTemplate | undefined => {
  return emailTemplates.find(template => template.id === id);
};
