import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

export default function QrFerry() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 max-w-3xl"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">QR-Ferry</h1>
        <p className="text-lg text-text-main/80 font-light mb-8">
          The ultimate offline file transfer solution. Secure, fast, and reliant purely on QR code routing architecture. No Wi-Fi or Bluetooth required.
        </p>
        <a 
          href="https://qr-ferry.vercel.app" 
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
        className="w-full aspect-video max-w-5xl rounded-2xl overflow-hidden glass-panel border border-accent/20 p-2"
      >
        <iframe 
          src="https://qr-ferry.vercel.app" 
          className="w-full h-full rounded-xl bg-obsidian-light"
          title="QR-Ferry App"
        />
      </motion.div>
    </div>
  );
}
