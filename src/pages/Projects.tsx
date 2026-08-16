import { motion } from 'motion/react';
import { ExternalLink, Layers, WifiOff, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const projects = [
  {
    id: 'kyro-rhythm',
    title: 'Kyro-Rhythm',
    description: 'Virtual VR Type Game where the camera tracks player hand movements. Slice vanishing stars with a sword controlled entirely by your hands.',
    url: '/kyro-rhythm',
    icon: <Layers className="w-8 h-8 text-accent" />
  },
  {
    id: 'qr-ferry',
    title: 'Qr-Ferry',
    description: 'Seamlessly send files from one device to another without Wi-Fi or Bluetooth, using ultra-fast QR routing architecture.',
    url: '/qr-ferry',
    icon: <WifiOff className="w-8 h-8 text-accent" />
  },
  {
    id: 'chatify',
    title: 'Chatify',
    description: 'Local offline conversation tool. Connect and chat with people nearby using just Bluetooth without needing a central Wi-Fi network.',
    url: '/chatify',
    icon: <MessageSquare className="w-8 h-8 text-accent" />
  }
];

export default function Projects() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Our Ecosystem</h1>
        <p className="text-lg text-text-main/80 max-w-2xl font-light">
          Discover the suite of applications engineered by Obsidian. Built for performance, privacy, and future-forward interaction.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 group hover:-translate-y-2 transition-transform duration-500 relative overflow-hidden flex flex-col h-full"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-accent/10 transition-colors duration-500"></div>
            
            <div className="mb-6">{project.icon}</div>
            <h3 className="text-2xl font-semibold text-white mb-3">{project.title}</h3>
            <p className="text-text-main/70 mb-8 leading-relaxed font-light flex-1">{project.description}</p>
            
            <Link to={project.url} className="inline-flex items-center gap-2 text-accent font-medium hover:text-white transition-colors mt-auto">
              Details <ExternalLink className="w-4 h-4" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
