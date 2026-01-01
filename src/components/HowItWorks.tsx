import { UserPlus, Heart, Wallet, Smartphone, Trophy } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register for Free",
    description: "Nominees sign up and create their profile at no cost",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Heart,
    title: "Choose a Creator",
    description: "Supporters browse and select their favorite creator to support",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Wallet,
    title: "Select Votes",
    description: "Choose number of votes at KES 10 per vote",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: Smartphone,
    title: "Pay via M-Pesa",
    description: "Complete secure payment instantly via M-Pesa STK Push",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Trophy,
    title: "Votes Counted",
    description: "Votes are recorded instantly after successful payment",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Support your favorite African creators in 5 simple steps
          </p>
        </div>

        {/* Desktop: Horizontal flow */}
        <div className="hidden lg:block">
          <div className="flex items-start justify-between max-w-5xl mx-auto relative">
            {/* Connecting line */}
            <div className="absolute top-8 left-[10%] right-[10%] h-0.5 bg-border" />
            
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center text-center relative z-10 w-44">
                <div className={`w-16 h-16 ${step.bgColor} rounded-full flex items-center justify-center mb-4 ring-4 ring-background`}>
                  <step.icon className={`h-7 w-7 ${step.color}`} />
                </div>
                <span className="text-xs font-semibold text-muted-foreground mb-1">
                  Step {index + 1}
                </span>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet: Vertical flow */}
        <div className="lg:hidden space-y-6 max-w-md mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="flex gap-4 items-start">
              <div className="relative">
                <div className={`w-12 h-12 ${step.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <step.icon className={`h-5 w-5 ${step.color}`} />
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-border" />
                )}
              </div>
              <div className="pt-1">
                <span className="text-xs font-semibold text-muted-foreground">
                  Step {index + 1}
                </span>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
