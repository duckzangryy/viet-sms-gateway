"use client";

import { motion } from "framer-motion";
import { MessageSquare, Mail, Phone, MapPin, Share2, Code, Briefcase, Heart } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "API Documentation", href: "#api" },
      { label: "SDKs & Libraries", href: "#sdk" },
      { label: "Status", href: "#status" },
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Blog", href: "#blog" },
      { label: "Press", href: "#press" },
      { label: "Partners", href: "#partners" },
    ],
    resources: [
      { label: "Documentation", href: "#docs" },
      { label: "API Reference", href: "#api-ref" },
      { label: "Guides & Tutorials", href: "#guides" },
      { label: "Help Center", href: "#help" },
      { label: "Community", href: "#community" },
    ],
    legal: [
      { label: "Terms of Service", href: "#terms" },
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Cookie Policy", href: "#cookies" },
      { label: "GDPR", href: "#gdpr" },
      { label: "Compliance", href: "#compliance" },
    ],
  };

  const contactInfo = [
    { icon: <Mail className="w-4 h-4" />, text: "contact@vietsmsapi.com" },
    { icon: <Phone className="w-4 h-4" />, text: "+84 24 7109 9999" },
    { icon: <MapPin className="w-4 h-4" />, text: "Hanoi, Vietnam" },
  ];

  const socialLinks = [
    { icon: <Share2 className="w-5 h-5" />, href: "https://twitter.com/vietsmsapi", label: "Twitter" },
    { icon: <Code className="w-5 h-5" />, href: "https://github.com/vietsmsapi", label: "GitHub" },
    { icon: <Briefcase className="w-5 h-5" />, href: "https://linkedin.com/company/vietsmsapi", label: "LinkedIn" },
    { icon: <Heart className="w-5 h-5" />, href: "https://facebook.com/vietsmsapi", label: "Facebook" },
  ];

  return (
    <footer className="glass border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">VietSMS API</h3>
                <p className="text-gray-400 text-sm">High Deliverability SMS Gateway</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Reliable SMS API service built for the Vietnamese market. 
              Send authentication, marketing, and notification messages with 99.9% deliverability.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-center gap-3 text-gray-400">
                  {info.icon}
                  <span className="text-sm">{info.text}</span>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <div key={category}>
              <h4 className="text-lg font-semibold mb-4 capitalize">{category}</h4>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Bottom Bar */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-400 text-sm">
            © {currentYear} VietSMS API. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>

          <div className="text-gray-400 text-sm">
            Made with ❤️ in Vietnam
          </div>
        </div>

        {/* Trust Badges */}
        <div className="pb-8 pt-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { text: "PCI DSS Compliant", color: "text-green-400" },
              { text: "GDPR Ready", color: "text-blue-400" },
              { text: "99.9% Uptime SLA", color: "text-purple-400" },
              { text: "Vietnamese Carriers", color: "text-cyan-400" },
            ].map((badge, index) => (
              <div
                key={index}
                className={`px-4 py-2 rounded-full glass text-sm font-medium ${badge.color}`}
              >
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;