import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Trophy, Users, Sparkles, Target, Gift, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = 'Impact Swing - Golf for Good';
  }, []);

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-slate to-dark opacity-90" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-impact/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-impact/10 text-impact px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Golf for a Cause</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-white">Swing for</span>
              <span className="gradient-text block md:inline"> Impact</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Track your golf performance, compete in monthly draws, and support 
              charities you care about — all in one beautiful platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-impact hover:bg-impact-light text-dark font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-impact/20"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              ) : (
                <>
                  <Link to="/signup">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-impact hover:bg-impact-light text-dark font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-impact/20"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  <Link to="/pricing">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="glass hover:glass-light text-white font-semibold px-8 py-4 rounded-xl border border-gray-700 transition-all"
                    >
                      View Pricing
                    </motion.button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
              {[
                { icon: Trophy, label: 'Monthly Draws', value: '$5K+', color: 'text-gold' },
                { icon: Heart, label: 'Charities Supported', value: '15+', color: 'text-impact' },
                { icon: Users, label: 'Active Golfers', value: '500+', color: 'text-blue-400' },
                { icon: Target, label: 'Total Impact', value: '$50K+', color: 'text-green-400' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="glass rounded-2xl p-6 text-center"
                >
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Three simple steps to start making an impact
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="w-8 h-8 text-impact" />,
                title: 'Subscribe & Choose',
                description: 'Pick a charity you care about and set your contribution percentage. Minimum 10% goes to your chosen cause.',
                color: 'border-impact/20',
              },
              {
                icon: <Target className="w-8 h-8 text-gold" />,
                title: 'Log Your Scores',
                description: 'Enter your Stableford scores (1-45 points) after each round. Your best 5 scores count toward monthly draws.',
                color: 'border-gold/20',
              },
              {
                icon: <Gift className="w-8 h-8 text-purple-400" />,
                title: 'Win & Give Back',
                description: 'Monthly draws with prizes up to 40% of the pool. Verified winners get paid while supporting global causes.',
                color: 'border-purple-400/20',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`glass rounded-2xl p-8 border ${feature.color} hover:scale-105 transition-all duration-300`}
              >
                <div className="bg-dark/50 rounded-xl w-14 h-14 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 border border-impact/20"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to Make an <span className="gradient-text">Impact</span>?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of golfers who are tracking their performance and changing lives.
            </p>
            {!isAuthenticated && (
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-impact hover:bg-impact-light text-dark font-semibold px-10 py-4 rounded-xl text-lg transition-all shadow-lg shadow-impact/20 inline-flex items-center gap-2"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;