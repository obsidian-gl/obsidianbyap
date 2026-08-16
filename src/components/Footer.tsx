export default function Footer() {
  return (
    <footer className="w-full py-8 mt-24 border-t border-obsidian-light/30 bg-obsidian/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="https://hostit.ai.studio/1786864013998-5092.jpg" alt="Obsidian" className="w-6 h-6 rounded-md opacity-80" />
          <span className="text-sm text-text-main/70 font-medium">© {new Date().getFullYear()} Obsidian. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-text-main/60">
          <a href="https://akshatpopat.vercel.app" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">CEO Portfolio</a>
          <a href="https://instagram.com/theakshatpopat" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Instagram</a>
          <a href="https://linkedin.com/in/akshatpopat" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">LinkedIn</a>
          <a href="mailto:enquiry.akshatpopat@gmail.com" className="hover:text-accent transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
