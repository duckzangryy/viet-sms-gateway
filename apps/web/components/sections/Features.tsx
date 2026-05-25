"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  Shield, 
  Globe, 
  Clock, 
  BarChart, 
  Code,
  MessageSquare,
  Users,
  Lock,
  Cloud
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "High Deliverability",
      description: "99.9% message delivery rate with automatic retry and fallback mechanisms.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Grade Security",
      description: "End-to-end encryption, GDPR compliance, and secure API keys management.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Vietnam-Wide Coverage",
      description: "Direct partnerships with all major Vietnamese telecom providers.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-time Delivery",
      description: "Instant message delivery with <1 second average latency.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: <BarChart className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Detailed delivery reports, open rates, and performance metrics.",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Developer Friendly",
      description: "RESTful API, comprehensive documentation, and SDKs for popular languages.",
      gradient: "from-cyan-500 to-teal-500",
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Multi-Channel Support",
      description: "SMS, OTP, promotional messages, and voice SMS capabilities.",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Multi-user accounts, role-based permissions, and audit logs.",
      gradient: "from-yellow-500 to-amber-500",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Compliance Ready",
      description: "Fully compliant with Vietnamese telecommunications regulations.",
      gradient: "from-gray-500 to-slate-500",
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Scalable Infrastructure",
      description: "Auto-scaling infrastructure that grows with your business needs.",
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
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
    <section id="features" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

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
            <span className="text-sm font-medium gradient-text">Why Choose VietSMS API</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Built for <span className="gradient-text">Vietnamese Businesses</span>
          </h2>
          <p className="text-xl text-gray-300">
            Everything you need to send reliable SMS messages in Vietnam, 
            from authentication to marketing campaigns.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="group"
            >
              <div className="h-full glass-dark rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
                {/* Icon with Gradient Background */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect Line */}
                <div className="mt-6 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20"
        >
          <div className="glass rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "500+", label: "Active Customers" },
                { value: "10M+", label: "Monthly Messages" },
                { value: "99.9%", label: "Uptime SLA" },
                { value: "<50ms", label: "API Response Time" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;