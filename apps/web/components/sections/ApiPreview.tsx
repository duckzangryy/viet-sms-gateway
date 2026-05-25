"use client";

import { motion } from "framer-motion";
import { Code, Terminal, Zap, Copy, Check, Globe, Shield, Clock } from "lucide-react";
import { useState } from "react";

const ApiPreview = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"node" | "python" | "curl">("node");

  const codeExamples = {
    node: `// Send SMS with Node.js
const axios = require('axios');

const sendSMS = async () => {
  try {
    const response = await axios.post(
      'https://api.vietsms.com/v1/sms/send',
      {
        to: '+84901234567',
        message: 'Your OTP code is: 123456',
        sender_id: 'VIETSMS',
        type: 'otp'
      },
      {
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Message sent:', response.data);
    // Response: { id: 'msg_123', status: 'queued', price: 350 }
  } catch (error) {
    console.error('Error:', error.response?.data);
  }
};`,
    python: `# Send SMS with Python
import requests

def send_sms():
    url = "https://api.vietsms.com/v1/sms/send"
    headers = {
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    }
    data = {
        "to": "+84901234567",
        "message": "Your OTP code is: 123456",
        "sender_id": "VIETSMS",
        "type": "otp"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        print("Message sent:", response.json())
        # Response: {"id": "msg_123", "status": "queued", "price": 350}
    except requests.exceptions.RequestException as e:
        print("Error:", e.response.json() if e.response else str(e))`,
    curl: `# Send SMS with cURL
curl -X POST https://api.vietsms.com/v1/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+84901234567",
    "message": "Your OTP code is: 123456",
    "sender_id": "VIETSMS",
    "type": "otp"
  }'

# Response:
# {
#   "id": "msg_123",
#   "status": "queued",
#   "price": 350
# }`,
  };

  const endpoints = [
    {
      method: "POST",
      path: "/v1/sms/send",
      description: "Send SMS message",
    },
    {
      method: "GET",
      path: "/v1/sms/{id}",
      description: "Get message status",
    },
    {
      method: "GET",
      path: "/v1/balance",
      description: "Check account balance",
    },
    {
      method: "POST",
      path: "/v1/verify/otp",
      description: "Verify OTP code",
    },
    {
      method: "GET",
      path: "/v1/analytics",
      description: "Get delivery analytics",
    },
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Integration",
      description: "Get started in minutes with our comprehensive SDKs",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure by Design",
      description: "HTTPS encryption, API key rotation, and audit logs",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global CDN",
      description: "Low latency worldwide with edge caching",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "99.9% Uptime",
      description: "Enterprise-grade reliability with SLA guarantee",
    },
  ];

  const handleCopy = (code: string, lang: string) => {
    navigator.clipboard.writeText(code);
    setCopied(lang);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section id="api" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

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
            <Code className="w-4 h-4" />
            <span className="text-sm font-medium gradient-text">Developer First</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Powerful <span className="gradient-text">API & SDKs</span>
          </h2>
          <p className="text-xl text-gray-300">
            Clean, well-documented API with SDKs for all major programming languages.
            Built for developers, by developers.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column: Code Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="glass-dark rounded-2xl overflow-hidden">
              {/* Code Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">Send SMS Example</span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(codeExamples[activeTab], activeTab)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {copied === activeTab ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Language Tabs */}
              <div className="flex border-b border-white/10">
                {Object.keys(codeExamples).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveTab(lang as any)}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === lang
                        ? "text-white border-b-2 border-blue-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {lang === "node" ? "Node.js" : lang === "python" ? "Python" : "cURL"}
                  </button>
                ))}
              </div>

              {/* Code Block */}
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300 leading-relaxed">
                  <code>{codeExamples[activeTab]}</code>
                </pre>
              </div>
            </div>

            {/* API Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <div className="text-blue-400">{feature.icon}</div>
                    </div>
                    <h4 className="font-semibold">{feature.title}</h4>
                  </div>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Endpoints & Documentation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Available Endpoints */}
            <div className="glass-dark rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-6">Available Endpoints</h3>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          endpoint.method === "POST" 
                            ? "bg-green-500/20 text-green-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="font-mono text-sm">{endpoint.path}</code>
                      </div>
                      <p className="text-gray-400 text-sm">{endpoint.description}</p>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {index === 0 && "← Try it above"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SDKs & Libraries */}
            <div className="glass-dark rounded-2xl p-6">
              <h3 className="text-2xl font-bold mb-6">SDKs & Libraries</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Node.js", version: "v2.1.0", color: "bg-green-500/20 text-green-400" },
                  { name: "Python", version: "v1.4.0", color: "bg-blue-500/20 text-blue-400" },
                  { name: "PHP", version: "v1.2.0", color: "bg-purple-500/20 text-purple-400" },
                  { name: "Go", version: "v1.0.0", color: "bg-cyan-500/20 text-cyan-400" },
                  { name: "Ruby", version: "v0.9.0", color: "bg-red-500/20 text-red-400" },
                  { name: "Java", version: "v1.1.0", color: "bg-orange-500/20 text-orange-400" },
                ].map((sdk, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <span className="font-medium">{sdk.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${sdk.color}`}>
                      {sdk.version}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentation CTA */}
            <div className="glass rounded-2xl p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
              <h3 className="text-2xl font-bold mb-4">Complete Documentation</h3>
              <p className="text-gray-300 mb-6">
                Explore our comprehensive documentation with guides, tutorials, 
                and API reference for all features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="#docs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-center"
                >
                  View Documentation
                </motion.a>
                <motion.a
                  href="#playground"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 glass border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all text-center"
                >
                  Try API Playground
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ApiPreview;