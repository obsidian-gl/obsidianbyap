import { motion } from 'motion/react';
import { ArrowRight, Mail } from 'lucide-react';
import { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export default function Home() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const subscriberId = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      await setDoc(doc(db, 'subscribers', subscriberId), {
        email,
        subscribedAt: new Date().toISOString()
      });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'subscribers');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center relative">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl text-center z-10"
      >
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-md">
          <span className="text-sm font-semibold text-accent tracking-widest uppercase">The Future of Software</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
          Engineered for <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#2E8BC0]">Perfection.</span>
        </h1>
        <p className="text-lg md:text-xl text-text-main/80 font-light max-w-2xl mx-auto mb-12 leading-relaxed">
          Obsidian creates seamless, scalable, and beautifully designed digital experiences. Led by Akshat Popat, we build the platforms of tomorrow.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a href="/projects" className="px-8 py-4 rounded-full bg-white text-obsidian font-semibold tracking-wide hover:bg-accent transition-colors duration-300 flex items-center gap-2">
            Explore Projects <ArrowRight className="w-5 h-5" />
          </a>
          <a href="https://akshatpopat.veecel.app" target="_blank" rel="noreferrer" className="px-8 py-4 rounded-full glass border border-white/10 text-white font-medium hover:bg-white/5 transition-all duration-300">
            Meet the CEO
          </a>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-32 w-full max-w-lg z-10"
      >
        <div className="glass-panel p-8 text-center">
          <Mail className="w-8 h-8 text-accent mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-white mb-2">Stay Updated</h3>
          <p className="text-sm text-text-main/70 mb-6">Subscribe to get the latest news on our projects and releases.</p>
          
          {subscribed ? (
            <div className="text-accent font-medium p-3 bg-accent/10 rounded-lg border border-accent/20">
              Thank you for subscribing!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className="flex-1 bg-obsidian/50 border border-obsidian-light rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
              />
              <button 
                type="submit" 
                disabled={subscribing}
                className="px-6 bg-accent text-obsidian font-semibold rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-50"
              >
                {subscribing ? '...' : 'Subscribe'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
