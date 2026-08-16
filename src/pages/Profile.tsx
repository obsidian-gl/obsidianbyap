import { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { motion } from 'motion/react';
import { Save } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    birthday: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || user.displayName || '',
            phone: data.phone || '',
            address: data.address || '',
            birthday: data.birthday || ''
          });
        } else {
          setFormData(prev => ({ ...prev, name: user.displayName || '', phone: user.phoneNumber || '' }));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'users');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        photoURL: user.photoURL,
        ...formData,
      }, { merge: true });
      alert('Profile updated successfully.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
           <div className="w-2 h-2 bg-accent rounded-full"></div>
           <div className="w-2 h-2 bg-accent rounded-full delay-75"></div>
           <div className="w-2 h-2 bg-accent rounded-full delay-150"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <p className="text-text-main">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12"
      >
        <div className="flex items-center gap-6 mb-10">
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-2 border-accent shadow-[0_0_20px_rgba(102,252,241,0.2)]" 
          />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{formData.name || 'User Profile'}</h1>
            <p className="text-text-main/70">{user.email}</p>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-white/5 rounded-lg w-full"></div>
            <div className="h-12 bg-white/5 rounded-lg w-full"></div>
            <div className="h-12 bg-white/5 rounded-lg w-full"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-main/80 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-obsidian-light border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main/80 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-obsidian-light border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-main/80 mb-2">Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-obsidian-light border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-main/80 mb-2">Birthday</label>
                <input 
                  type="date" 
                  value={formData.birthday}
                  onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                  className="w-full bg-obsidian-light border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
                <p className="text-xs text-text-main/50 mt-2">We'll send you a special surprise on your birthday!</p>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-accent text-obsidian font-semibold rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
