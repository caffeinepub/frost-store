import { Button } from "@/components/ui/button";
import { CheckCircle, Gift, Mail, MapPin, ShieldCheck } from "lucide-react";
import type { Variants } from "motion/react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const denominations = [
  {
    value: 10,
    label: "£10",
    tagline: "Perfect for a small treat",
    popular: false,
  },
  {
    value: 25,
    label: "£25",
    tagline: "Great for a birthday",
    popular: false,
  },
  {
    value: 50,
    label: "£50",
    tagline: "Spoil a garden lover",
    popular: true,
  },
  {
    value: 100,
    label: "£100",
    tagline: "The ultimate gift",
    popular: false,
  },
];

const steps = [
  {
    icon: Gift,
    title: "Choose & Purchase",
    desc: "Pick a denomination and complete your purchase via PayPal. Our team will process it within 24 hours.",
  },
  {
    icon: Mail,
    title: "Receive Your Code",
    desc: "We'll email your unique gift card code. Ready to use immediately or share with a friend.",
  },
  {
    icon: CheckCircle,
    title: "Redeem at Checkout",
    desc: "Apply the code in your profile or enter it at checkout on any eligible UK order.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function GiftCardsPage() {
  const [selected, setSelected] = useState<number | null>(null);

  const handleBuy = (value: number) => {
    setSelected(value);
    toast.info(
      "Please complete your purchase via PayPal — contact us to arrange payment.",
      { duration: 5000 },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden frost-gradient py-20 px-4">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, oklch(0.9 0.08 140 / 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.85 0.12 55 / 0.3) 0%, transparent 50%)",
          }}
        />
        <div className="container mx-auto max-w-3xl text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/15 mb-6 mx-auto">
              <Gift className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              Gift Cards
            </h1>
            <p className="text-white/80 text-xl max-w-md mx-auto leading-relaxed">
              Give the gift of a beautiful garden
            </p>
          </motion.div>
        </div>
      </section>

      {/* UK Notice Banner */}
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-amber-50 border-b border-amber-200"
        data-ocid="giftcards.uk_notice.section"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-2 text-amber-800 text-sm font-medium">
          <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            We only sell and deliver to addresses within the United Kingdom.
          </span>
        </div>
      </motion.section>

      {/* Denomination Cards */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl font-bold text-foreground mb-2">
            Choose Your Amount
          </h2>
          <p className="text-muted-foreground">
            Select a gift card value — the perfect amount for any occasion
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {denominations.map((d, i) => (
            <motion.div
              key={d.value}
              variants={itemVariants}
              data-ocid={`giftcards.denomination.item.${i + 1}`}
            >
              <button
                type="button"
                onClick={() => setSelected(d.value)}
                className={`relative w-full crystal-card rounded-2xl p-6 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                  selected === d.value
                    ? "ring-2 ring-primary bg-primary/5 shadow-lg"
                    : "hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {d.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <div
                  className={`text-4xl font-display font-bold mb-2 ${selected === d.value ? "text-primary" : "text-foreground"}`}
                >
                  {d.label}
                </div>
                <p className="text-muted-foreground text-xs leading-snug">
                  {d.tagline}
                </p>
                {selected === d.value && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Buy Buttons */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {denominations.map((d, i) => (
            <motion.div key={d.value} variants={itemVariants}>
              <Button
                className={`w-full h-10 font-semibold text-sm transition-all ${
                  selected === d.value
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                    : "bg-primary/80 text-primary-foreground hover:bg-primary/90"
                }`}
                onClick={() => handleBuy(d.value)}
                data-ocid={`giftcards.buy.button.${i + 1}`}
              >
                Buy {d.label}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="bg-secondary/30 py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Three simple steps to the perfect gift
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                variants={itemVariants}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-5">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <step.icon
                      className="h-7 w-7 text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bottom UK Notice */}
      <section className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-5"
        >
          <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-blue-900 text-sm font-medium mb-0.5">
              UK Orders Only
            </p>
            <p className="text-blue-700 text-sm leading-relaxed">
              Gardening World only ships to UK addresses. Gift cards can be
              purchased from anywhere but are only redeemable on UK orders.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
