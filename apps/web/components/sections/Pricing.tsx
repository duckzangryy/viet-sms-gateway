"use client";

import { motion } from "framer-motion";
import { Check, Star, Zap, TrendingUp, Users, Building } from "lucide-react";
import { useState } from "react";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small businesses and startups",
      monthlyPrice: "299,000",
      yearlyPrice: "2,990,000",
      savings: "Save 16%",
      icon: <Zap className="w-6 h-6" />,
      popular: false,
      features: [
        "1,000 SMS per month",
        "Basic OTP authentication",
        "Email support",
        "99% deliverability",
        "Basic analytics",
        "1 team member",
        "Vietnamese carriers only",
      ],
      ctaText: "Get Started",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "Business",
      description: "For growing companies with higher volume needs",
      monthlyPrice: "899,000",
      yearlyPrice: "8,990,000",
      savings: "Save 17%",
      icon: <TrendingUp className="w-6 h-6" />,
      popular: true,
      features: [
        "10,000 SMS per month",
        "Advanced OTP & 2FA",
        "Priority support",
        "99.5% deliverability",
        "Advanced analytics",
        "5 team members",
        "All Vietnamese carriers",
        "API access",
        "Webhook support",
        "Custom sender ID",
      ],
      ctaText: "Start Free Trial",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Enterprise",
      description: "For large organizations with custom requirements",
      monthlyPrice: "2,999,000",
      yearlyPrice: "29,990,000",
      savings: "Save 20%",
      icon: <Building className="w-6 h-6" />,
      popular: false,
      features: [
        "100,000+ SMS per month",
        "Unlimited OTP & 2FA",
        "24/7 phone support",
        "99.9% deliverability SLA",
        "Enterprise analytics",
        "Unlimited team members",
        "Global carrier coverage",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "Volume discounts",
        "White-label options",
      ],
      ctaText: "Contact Sales",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <span className="text-sm font-medium gradient-text">Transparent Pricing</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Simple, <span className="gradient-text">Predictable Pricing</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            No hidden fees. Pay only for what you use with volume discounts available.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 glass rounded-full">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "yearly"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Yearly Billing
              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                Save up to 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`relative ${
                plan.popular ? "md:-translate-y-4" : ""
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div
                className={`h-full glass-dark rounded-3xl p-8 border ${
                  plan.popular
                    ? "border-purple-500/30 shadow-2xl shadow-purple-500/10"
                    : "border-white/10"
                }`}
              >
                {/* Plan Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center`}>
                      <div className="text-white">
                        {plan.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">
                        {billingCycle === "monthly" 
                          ? `${plan.monthlyPrice}₫` 
                          : `${plan.yearlyPrice}₫`
                        }
                      </span>
                      <span className="text-gray-400">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                    {billingCycle === "yearly" && (
                      <div className="text-green-400 text-sm mt-2">
                        {plan.savings}
                      </div>
                    )}
                  </div>
                </div>

                {/* Features List */}
                <div className="mb-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                      : "glass border border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  {plan.ctaText}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Pricing Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="glass rounded-3xl p-8 max-w-3xl mx-auto">
            <h4 className="text-2xl font-bold mb-4">Need Custom Pricing?</h4>
            <p className="text-gray-300 mb-6">
              We offer custom plans for high-volume senders, resellers, and enterprise clients.
              Contact our sales team for personalized pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Contact Sales
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 glass border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all"
              >
                View Full Pricing Details
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;