import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

export default function Chatify() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-w-3xl"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Chatify</h1>
        <p className="text-lg text-text-main/80 font-light mb-8">
          Local offline conversation tool. Connect and chat with people nearby using just Bluetooth without needing a central Wi-Fi network.
        </p>
        <a 
          href="https://chatify.ai.studio" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-obsidian rounded-full font-semibold hover:bg-white transition-colors duration-300"
        >
          Open Web Application <ExternalLink className="w-5 h-5" />
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full h-[70vh] md:aspect-video md:h-auto max-w-5xl rounded-2xl overflow-hidden glass-panel border border-accent/20 p-2"
      >
        <iframe 
          src="https://chatify.ai.studio" 
          className="w-full h-full rounded-xl bg-obsidian-light"
          title="Chatify App"
        />
      </motion.div>
    </div>
  );
}
