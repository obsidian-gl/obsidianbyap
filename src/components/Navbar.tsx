import { Link } from 'react-router-dom';
import { User, LogIn, LogOut, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { googleSignIn, logout, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Navbar() {
  const [user, setUser] = useState(auth.currentUser);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-obsidian-light/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 sm:gap-4 group">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(102,252,241,0.5)] transition-transform group-hover:scale-105 shrink-0">
            <img src="https://hostit.ai.studio/1786864013998-5092.jpg" alt="Obsidian Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl sm:text-2xl font-semibold tracking-wider text-white hidden sm:block">OBSIDIAN</span>
        </Link>
        
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
          <Link to="/projects" className="text-xs sm:text-sm font-medium text-text-main hover:text-accent transition-colors shrink-0">
            PROJECTS
          </Link>
          
          <div className="h-6 w-px bg-obsidian-light/50 shrink-0"></div>
          
          {!authChecking && (
            user ? (
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {user.email === 'akshatpopat9311@gmail.com' && (
                  <Link to="/admin" className="p-2 rounded-full hover:bg-obsidian-light/50 text-accent-dim hover:text-accent transition-all">
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-3 group">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Profile" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-accent/20 group-hover:border-accent transition-colors shrink-0" />
                </Link>
                <button onClick={() => logout()} className="p-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 shrink-0">
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={googleSignIn}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-obsidian transition-all duration-300 text-xs sm:text-sm font-semibold tracking-wide shrink-0"
              >
                <LogIn className="w-4 h-4" />
                SIGN IN
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
