import { motion } from 'framer-motion';
import { ChatInput } from './ChatInput';
import { ArrowRight, Lightbulb, Target, Users, Zap } from 'lucide-react';

interface LandingPageProps {
  onStartChat: (message: string) => Promise<void>;
}

export const LandingPage = ({ onStartChat }: LandingPageProps) => {
  const handleSend = (message: string) => {
    onStartChat(message);
  };

  const handleAttach = (file: File) => {
    console.log('File attached:', file.name);
    // Handle file attachment logic here
  };

  const communityCards = [
    {
      title: "AI Fitness Coach",
      description: "Personal training app with AI-powered workout recommendations",
      tags: ["Health", "AI", "Mobile"],
      gradient: "from-emerald-400 to-cyan-400"
    },
    {
      title: "EcoCommerce Platform",
      description: "Sustainable marketplace connecting eco-friendly brands with conscious consumers",
      tags: ["E-commerce", "Sustainability", "Web"],
      gradient: "from-purple-400 to-pink-400"
    },
    {
      title: "FinTech Dashboard",
      description: "Real-time financial analytics for small business cash flow management",
      tags: ["FinTech", "Analytics", "SaaS"],
      gradient: "from-blue-400 to-indigo-400"
    },
    {
      title: "Remote Team Hub",
      description: "All-in-one workspace for distributed teams with AI-powered productivity insights",
      tags: ["Productivity", "Remote Work", "AI"],
      gradient: "from-orange-400 to-red-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-orange-500/20 animate-gradient-x"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center p-6 md:p-8"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl">Startup Compass</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-white/70 hover:text-white transition-colors duration-200 font-medium">
              Log in
            </button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-xl font-medium hover:bg-white/20 transition-all duration-200"
            >
              Get started
            </motion.button>
          </div>
        </motion.header>

        {/* Hero section */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto mb-16"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Build something{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
                Remarkable
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Hi! I'm your Startup Compass assistant. Describe your startup idea and I'll help you validate it, 
              create a business plan, find relevant funders, analyze competitors, and build a project timeline. 
              Just tell me about your idea!
            </motion.p>
          </motion.div>

          {/* Chat Input */}
          <div className="w-full max-w-4xl mb-16">
            <ChatInput 
              onSend={handleSend}
              onAttach={handleAttach}
              placeholder="Describe your startup idea..."
            />
          </div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-20"
          >
            {[
              { icon: Target, label: "Market Analysis", color: "from-blue-400 to-cyan-400" },
              { icon: Lightbulb, label: "Business Planning", color: "from-purple-400 to-pink-400" },
              { icon: Users, label: "Funding Opportunities", color: "from-emerald-400 to-teal-400" },
              { icon: ArrowRight, label: "Project Timeline", color: "from-orange-400 to-red-400" }
            ].map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-white/80 font-medium text-sm text-center">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Community section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="px-6 md:px-8 pb-20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white">From the Community</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2 font-medium"
              >
                View all
                <ArrowRight size={16} />
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {communityCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                >
                  <div className={`w-full h-32 bg-gradient-to-br ${card.gradient} rounded-xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <h3 className="text-white font-semibold text-lg mb-2">{card.title}</h3>
                  <p className="text-white/60 text-sm mb-4 leading-relaxed">{card.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-lg font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};
