"use client";

import { motion } from "framer-motion";
import { Star, Quote, Building, Users, TrendingUp, Shield } from "lucide-react";
import { useState } from "react";

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      name: "Nguyễn Minh Anh",
      role: "CTO at TechVina",
      company: "E-commerce Platform",
      avatar: "NA",
      rating: 5,
      content: "VietSMS API reduced our OTP delivery failures by 95%. The reliability and support have been exceptional. Our customer authentication process is now seamless.",
      stats: "50,000+ monthly messages",
      icon: <Building className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Trần Quốc Bảo",
      role: "Product Manager at FinTech Hub",
      company: "Financial Services",
      avatar: "TB",
      rating: 5,
      content: "The API documentation is the best I've seen. We integrated in under 2 hours. The real-time delivery reports help us optimize our marketing campaigns.",
      stats: "100,000+ monthly messages",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Lê Thị Hương",
      role: "Operations Director at MedCare",
      company: "Healthcare",
      avatar: "LH",
      rating: 5,
      content: "Critical for our appointment reminders. The 99.9% deliverability gives us confidence. Their support team is responsive and helpful.",
      stats: "25,000+ monthly messages",
      icon: <Shield className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      name: "Phạm Văn Cường",
      role: "Founder at EduTech Solutions",
      company: "Education Technology",
      avatar: "PC",
      rating: 5,
      content: "As a startup, we needed reliable SMS at affordable prices. VietSMS delivered on both. The pricing is transparent with no hidden fees.",
      stats: "15,000+ monthly messages",
      icon: <Users className="w-5 h-5" />,
      color: "from-orange-500 to-red-500",
    },
    {
      name: "Vũ Thị Diễm",
      role: "Head of Marketing at RetailPlus",
      company: "Retail Chain",
      avatar: "VD",
      rating: 5,
      content: "Our promotional campaign success rate improved by 40% after switching. The delivery analytics help us target better and reduce costs.",
      stats: "75,000+ monthly messages",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-indigo-500 to-blue-500",
    },
  ];

  const companies = [
    { name: "TechVina", logo: "TV", industry: "E-commerce" },
    { name: "FinTech Hub", logo: "FH", industry: "Finance" },
    { name: "MedCare", logo: "MC", industry: "Healthcare" },
    { name: "EduTech", logo: "ET", industry: "Education" },
    { name: "RetailPlus", logo: "RP", industry: "Retail" },
    { name: "LogiChain", logo: "LC", industry: "Logistics" },
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
    <section id="testimonials" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      <div className="absolute top-1/3 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

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
            <Quote className="w-4 h-4" />
            <span className="text-sm font-medium gradient-text">Customer Stories</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Trusted by <span className="gradient-text">500+ Vietnamese Businesses</span>
          </h2>
          <p className="text-xl text-gray-300">
            See how companies across Vietnam rely on VietSMS API for their critical communication needs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Testimonial */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="glass-dark rounded-3xl p-8 h-full">
              <div className="flex items-start gap-6 mb-8">
                {/* Avatar */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${testimonials[activeIndex].color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-2xl font-bold text-white">
                    {testimonials[activeIndex].avatar}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {testimonials[activeIndex].name}
                      </h3>
                      <p className="text-gray-400">
                        {testimonials[activeIndex].role}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    {testimonials[activeIndex].icon}
                    <span>{testimonials[activeIndex].company}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-400">
                      {testimonials[activeIndex].stats}
                    </span>
                  </div>
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-500/20" />
                <p className="text-xl text-gray-300 leading-relaxed pl-6">
                  "{testimonials[activeIndex].content}"
                </p>
              </div>

              {/* Navigation Dots */}
              <div className="flex items-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeIndex
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 w-8"
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats & Companies */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Stats Card */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-6">Impact Numbers</h3>
              <div className="space-y-4">
                {[
                  { label: "Customer Satisfaction", value: "98%", change: "+5%" },
                  { label: "Delivery Success", value: "99.9%", change: "+0.5%" },
                  { label: "Integration Time", value: "<2 hours", change: "-60%" },
                  { label: "Cost Reduction", value: "40%", change: "-40%" },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-400">{stat.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{stat.value}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        stat.change.startsWith('+')
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trusted Companies */}
            <div className="glass-dark rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-6">Trusted By</h3>
              <div className="grid grid-cols-2 gap-4">
                {companies.map((company, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <span className="font-bold text-sm">{company.logo}</span>
                    </div>
                    <div>
                      <div className="font-medium">{company.name}</div>
                      <div className="text-xs text-gray-400">{company.industry}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Card */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
              <h3 className="text-xl font-bold mb-4">Join Our Customers</h3>
              <p className="text-gray-300 text-sm mb-6">
                Start sending reliable SMS messages today. No credit card required for free trial.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Start Free Trial
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Additional Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="glass-dark rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${testimonial.color} flex items-center justify-center`}>
                    <span className="font-bold text-white">{testimonial.avatar.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-300 text-sm line-clamp-3">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;