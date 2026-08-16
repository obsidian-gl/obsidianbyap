import { Link } from 'react-router-dom';
import { User, LogIn, LogOut, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { googleSignIn, logout, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-obsidian-light/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(102,252,241,0.5)] transition-transform group-hover:scale-105">
            <img src="https://hostit.ai.studio/1786864013998-5092.jpg" alt="Obsidian Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-semibold tracking-wider text-white">OBSIDIAN</span>
        </Link>
        
        <div className="flex items-center gap-8">
          <Link to="/projects" className="text-sm font-medium text-text-main hover:text-accent transition-colors">
            PROJECTS
          </Link>
          
          <div className="h-6 w-px bg-obsidian-light/50"></div>
          
          {user ? (
            <div className="flex items-center gap-4">
              {user.email === 'akshatpopat9311@gmail.com' && (
                <Link to="/admin" className="p-2 rounded-full hover:bg-obsidian-light/50 text-accent-dim hover:text-accent transition-all">
                  <Settings className="w-5 h-5" />
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-3 group">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Profile" className="w-9 h-9 rounded-full border border-accent/20 group-hover:border-accent transition-colors" />
              </Link>
              <button onClick={() => logout()} className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-2">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={googleSignIn}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-obsidian transition-all duration-300 text-sm font-semibold tracking-wide"
            >
              <LogIn className="w-4 h-4" />
              SIGN IN
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
