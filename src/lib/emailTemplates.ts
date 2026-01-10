export interface EmailTemplateData {
  nomineeName: string;
  voteCount: number;
  expectedEarnings: string;
  votingLink?: string;
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
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <p>Hello <strong>${data.nomineeName}</strong>,</p>
        
        <p>Congratulations on your amazing progress in the Africa Creators Impact Awards! 🎉</p>
        
        <p>You currently have <strong>${data.voteCount.toLocaleString()} verified votes</strong>, which translates to estimated earnings of <strong>${data.expectedEarnings}</strong>. Your dedication and influence are truly inspiring!</p>
        
        <p>To continue climbing the ranks and maximize your impact, here are some tips:</p>
        
        <ul>
          <li>📱 Share your unique voting link on all your social media platforms</li>
          <li>🔗 Add your voting link to your bio on Instagram, TikTok, Twitter, and YouTube</li>
          <li>📝 Create engaging content with captions that include a call-to-action for your fans to vote</li>
          <li>🎯 Visit the Tips section on your dashboard for more campaign strategies</li>
        </ul>
        
        <p>Remember, every vote counts and brings you closer to recognition as one of Africa's most impactful creators!</p>
        
        <p>Keep shining! ✨</p>
      </div>
    `,
  },
  {
    id: "dormant",
    name: "Dormant Account Follow-Up",
    subject: "We Miss You! - ACIA Check-In",
    generateContent: (data) => `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <p>Hello <strong>${data.nomineeName}</strong>,</p>
        
        <p>We noticed that your account has been inactive for a while, and we wanted to check in with you.</p>
        
        <p>Your current standing:</p>
        <ul>
          <li>Verified Votes: <strong>${data.voteCount.toLocaleString()}</strong></li>
          <li>Expected Earnings: <strong>${data.expectedEarnings}</strong></li>
        </ul>
        
        <p>We'd love to know if you:</p>
        <ol>
          <li><strong>Wish to continue participating</strong> in the Africa Creators Impact Awards and actively campaign for more votes</li>
          <li><strong>Would like to withdraw</strong> from the awards</li>
        </ol>
        
        <p><strong>Important Notice:</strong> As per our Terms & Conditions, if you choose to withdraw before the voting period ends, you will forfeit eligibility for all payouts and awards, regardless of the votes you have already received.</p>
        
        <p>Please reply to this email or contact us at <a href="mailto:awardsacia@gmail.com">awardsacia@gmail.com</a> to let us know your decision.</p>
        
        <p>We hope to see you continue your journey with us!</p>
      </div>
    `,
  },
  {
    id: "nomination_acceptance",
    name: "Nomination Acceptance",
    subject: "Welcome to ACIA! Your Nomination is Confirmed 🎊",
    generateContent: (data) => `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <p>Hello <strong>${data.nomineeName}</strong>,</p>
        
        <p>Congratulations! 🎉 Your nomination for the Africa Creators Impact Awards has been successfully confirmed!</p>
        
        <p>You are now officially part of a prestigious community of African digital creators making a difference across the continent.</p>
        
        <h3 style="color: #B8860B;">How Voting Works:</h3>
        <ul>
          <li>Your fans and supporters can vote for you through your unique profile page</li>
          <li>Each vote contributes to your ranking and potential earnings</li>
          <li>The more votes you receive, the higher you climb on the leaderboard</li>
          <li>Top creators will be recognized and rewarded at the end of the voting period</li>
        </ul>
        
        <h3 style="color: #B8860B;">Next Steps:</h3>
        <ol>
          <li>Log in to your dashboard to access your unique voting link</li>
          <li>Share your voting link across all your social media platforms</li>
          <li>Engage your audience and encourage them to vote</li>
          <li>Check the Tips section for campaign strategies</li>
        </ol>
        
        <p>We're excited to have you on this journey. Let's celebrate African creativity together!</p>
      </div>
    `,
  },
  {
    id: "policy_warning",
    name: "Policy Warning",
    subject: "Important Notice: Terms & Conditions Violation",
    generateContent: (data) => `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <p>Dear <strong>${data.nomineeName}</strong>,</p>
        
        <p>We are writing to inform you of a matter that requires your immediate attention.</p>
        
        <p>It has come to our notice that certain activities associated with your account may be in violation of the Africa Creators Impact Awards (ACIA) <strong>Terms & Conditions</strong>.</p>
        
        <p>As outlined in our Terms & Conditions, the following actions are strictly prohibited:</p>
        <ul>
          <li>Threats, blackmail, or coercion</li>
          <li>Defamation or harassment</li>
          <li>Attempts to force payments outside official processes</li>
          <li>Any form of fraudulent activity</li>
        </ul>
        
        <p><strong>Consequences:</strong> Continued violation of these terms may result in:</p>
        <ul>
          <li>Immediate disqualification from the awards</li>
          <li>Suspension or permanent removal from the platform</li>
          <li>Forfeiture of all accumulated votes and potential earnings</li>
        </ul>
        
        <p>We urge you to review our Terms & Conditions and ensure full compliance going forward. If you believe this notice was sent in error, please contact us immediately at <a href="mailto:awardsacia@gmail.com">awardsacia@gmail.com</a>.</p>
        
        <p>Thank you for your understanding and cooperation.</p>
      </div>
    `,
  },
  {
    id: "withdrawal_confirmation",
    name: "Withdrawal Confirmation",
    subject: "Withdrawal Request Received - ACIA",
    generateContent: (data) => `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <p>Dear <strong>${data.nomineeName}</strong>,</p>
        
        <p>We have received your request to withdraw from the Africa Creators Impact Awards.</p>
        
        <p>As per our <strong>Terms & Conditions</strong> (Withdrawal Policy):</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #B8860B; margin: 15px 0;">
          <p style="margin: 0;"><strong>Withdrawal Before Voting Ends:</strong></p>
          <p style="margin: 5px 0 0 0;">Any nominee who withdraws before the official close of the voting period forfeits eligibility for all payouts, awards, and benefits, regardless of the number of votes already received. Votes cast before withdrawal are considered final contributions made during an active campaign and are not refundable and not payable.</p>
        </div>
        
        <p>Your current stats at the time of withdrawal:</p>
        <ul>
          <li>Total Verified Votes: <strong>${data.voteCount.toLocaleString()}</strong></li>
          <li>Forfeited Earnings: <strong>${data.expectedEarnings}</strong></li>
        </ul>
        
        <p>Your profile will be removed from public listings, and no further participation will occur.</p>
        
        <p>If you have any questions or wish to reconsider, please contact us at <a href="mailto:awardsacia@gmail.com">awardsacia@gmail.com</a> before the withdrawal is fully processed.</p>
        
        <p>We wish you all the best in your future endeavors.</p>
      </div>
    `,
  },
  {
    id: "payout_notification",
    name: "Payout Notification",
    subject: "Great News! You're Eligible for Payout 💰",
    generateContent: (data) => `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <p>Dear <strong>${data.nomineeName}</strong>,</p>
        
        <p>Congratulations! 🎉 The voting period for the Africa Creators Impact Awards has officially ended, and we are thrilled to inform you that <strong>you are eligible for a payout!</strong></p>
        
        <p>Your final results:</p>
        <table style="border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="padding: 8px 15px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Total Verified Votes</strong></td>
            <td style="padding: 8px 15px; border: 1px solid #ddd;">${data.voteCount.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 8px 15px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Payout Amount</strong></td>
            <td style="padding: 8px 15px; border: 1px solid #ddd; color: #228B22; font-weight: bold;">${data.expectedEarnings}</td>
          </tr>
        </table>
        
        <h3 style="color: #B8860B;">Payout Timeline</h3>
        <p>Payouts are expected to be processed by <strong>mid-February</strong>, subject to verification, audits, and system confirmation.</p>
        
        <h3 style="color: #B8860B;">Next Steps</h3>
        <ol>
          <li>Ensure your profile information and contact details are up to date</li>
          <li>Prepare your preferred payment method details</li>
          <li>Watch for our next email with verification instructions</li>
          <li>Complete the payout method selection when prompted</li>
        </ol>
        
        <p>Thank you for being part of the Africa Creators Impact Awards. Your dedication and influence have truly made a difference!</p>
      </div>
    `,
  },
  {
    id: "disqualification",
    name: "Disqualification Notice",
    subject: "Important Notice: Disqualification from ACIA",
    generateContent: (data) => `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <p>Dear <strong>${data.nomineeName}</strong>,</p>
        
        <p>We regret to inform you that your participation in the Africa Creators Impact Awards has been <strong>terminated</strong> effective immediately.</p>
        
        <p>This decision has been made in accordance with our <strong>Terms & Conditions, Section: Conduct, Abuse & Disqualification</strong>, which states:</p>
        
        <div style="background-color: #fff3f3; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0;">
          <p style="margin: 0;"><em>"Any form of threats, blackmail, coercion, defamation, harassment, or attempts to force payments will result in immediate disqualification, suspension, or removal from the platform, at ACIA's discretion."</em></p>
        </div>
        
        <p><strong>Consequences of disqualification:</strong></p>
        <ul>
          <li>Your profile has been removed from all public listings</li>
          <li>All accumulated votes (${data.voteCount.toLocaleString()}) are voided</li>
          <li>All potential earnings (${data.expectedEarnings}) are forfeited</li>
          <li>You are no longer eligible for any awards or recognition</li>
          <li>You may not re-register for current or future ACIA events</li>
        </ul>
        
        <p>If you believe this decision was made in error, you may submit an appeal in writing to <a href="mailto:awardsacia@gmail.com">awardsacia@gmail.com</a> within 7 days of receiving this notice. All appeals will be reviewed, and the final decision rests with ACIA.</p>
        
        <p>We take the integrity of our platform seriously and appreciate your understanding.</p>
      </div>
    `,
  },
];

export const getTemplateById = (id: EmailCategory): EmailTemplate | undefined => {
  return emailTemplates.find(template => template.id === id);
};
