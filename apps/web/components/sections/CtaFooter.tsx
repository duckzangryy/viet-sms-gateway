"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Zap, MessageSquare, Clock, Shield } from "lucide-react";

const CtaFooter = () => {
  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Get Started in Minutes",
      description: "No complex setup. Start sending SMS immediately.",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Free Trial Included",
      description: "100 free SMS credits to test our service.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "No Long-Term Contracts",
      description: "Pay monthly. Cancel anytime.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Money-Back Guarantee",
      description: "30-day satisfaction guarantee.",
    },
  ];

  const faqs = [
    {
      question: "How quickly can I start sending SMS?",
      answer: "You can start sending SMS within 5 minutes of signing up. Just verify your email and add credits.",
    },
    {
      question: "Do you support Vietnamese phone numbers?",
      answer: "Yes, we specialize in Vietnamese phone numbers with direct carrier connections for maximum deliverability.",
    },
    {
      question: "What's included in the free trial?",
      answer: "100 free SMS credits, access to all features, and priority support during your trial period.",
    },
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can change your plan at any time. Unused credits carry over to your new plan.",
    },
  ];

  return (
    <section id="cta" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-gray-900" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="glass-dark rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl shadow-blue-500/10">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium gradient-text">Ready to Get Started?</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Start Sending <span className="gradient-text">Reliable SMS</span> Today
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join 500+ Vietnamese businesses that trust VietSMS API for their critical communication needs.
                No credit card required for the free trial.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column: Benefits */}
              <div>
                <h3 className="text-2xl font-bold mb-8">Why Choose VietSMS API</h3>
                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <div className="text-blue-400">{benefit.icon}</div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-2">{benefit.title}</h4>
                        <p className="text-gray-400">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-2 gap-6">
                  {[
                    { value: "99.9%", label: "Deliverability" },
                    { value: "<1s", label: "Average Latency" },
                    { value: "24/7", label: "Support" },
                    { value: "500+", label: "Happy Customers" },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold gradient-text mb-2">
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Signup Form & FAQs */}
              <div>
                {/* Signup Card */}
                <div className="glass rounded-2xl p-6 mb-8">
                  <h3 className="text-2xl font-bold mb-6">Start Your Free Trial</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="Your Company"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+84 90 123 4567"
                        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      Start Free Trial
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                    <p className="text-center text-gray-400 text-sm">
                      By signing up, you agree to our{" "}
                      <a href="#terms" className="text-blue-400 hover:text-blue-300">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#privacy" className="text-blue-400 hover:text-blue-300">
                        Privacy Policy
                      </a>
                    </p>
                  </div>
                </div>

                {/* Quick FAQs */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="glass rounded-lg p-4 border border-white/10"
                      >
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          {faq.question}
                        </h4>
                        <p className="text-gray-400 text-sm">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-6 glass rounded-2xl">
                <div className="text-left">
                  <h4 className="text-xl font-bold mb-2">Need Enterprise Solutions?</h4>
                  <p className="text-gray-300">
                    Custom pricing, dedicated support, and SLA guarantees for large organizations.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Contact Sales
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 glass border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all"
                  >
                    Schedule Demo
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 mb-8">Trusted by leading Vietnamese companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {["TechVina", "FinTech Hub", "MedCare", "EduTech", "RetailPlus", "LogiChain"].map(
              (company, index) => (
                <div
                  key={index}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  {company}
                </div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaFooter;