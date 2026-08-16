import { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Download, Mail, Calendar as CalendarIcon, Users, Lock } from 'lucide-react';
import Papa from 'papaparse';
import { sendEmail, createBirthdayEvent } from '../lib/googleApi';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Email form state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const currentUser = auth.currentUser;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'theakshatpopat' && password === 'Aprt9311' && currentUser?.email === 'akshatpopat9311@gmail.com') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert('Invalid credentials or unauthorized account.');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const usersSnap = await getDocs(collection(db, 'users'));
      setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const subsSnap = await getDocs(collection(db, 'subscribers'));
      setSubscribers(subsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users/subscribers');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject || !emailBody) return;
    
    const confirmed = window.confirm(`Are you sure you want to send this email to ${subscribers.length} subscribers?`);
    if (!confirmed) return;

    setSendingEmail(true);
    let successCount = 0;
    try {
      for (const sub of subscribers) {
        const personalizedBody = emailBody.replace('{{name}}', sub.name || 'Subscriber');
        await sendEmail(sub.email, emailSubject, personalizedBody);
        successCount++;
      }
      alert(`Successfully sent emails to ${successCount} subscribers.`);
      setEmailSubject('');
      setEmailBody('');
    } catch (error: any) {
      alert(`Error sending emails: ${error.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleScheduleBirthday = async (user: any) => {
    if (!user.birthday || !user.email) {
      alert('User is missing birthday or email.');
      return;
    }
    
    const confirmed = window.confirm(`Schedule a recurring yearly birthday calendar event for ${user.name || user.email}?`);
    if (!confirmed) return;

    try {
      await createBirthdayEvent(user.email, user.name || 'User', user.birthday);
      alert('Successfully scheduled birthday event!');
    } catch (error: any) {
      alert(`Error scheduling event: ${error.message}`);
    }
  };

  if (!currentUser || currentUser.email !== 'akshatpopat9311@gmail.com') {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-6">
        <Lock className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-text-main">You must be logged in as the master administrator to view this page.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Lock className="text-accent" /> Obsidian Command
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-text-main/80 mb-1">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-obsidian border border-white/10 rounded px-3 py-2 text-white" />
            </div>
            <div>
              <label className="block text-sm text-text-main/80 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-obsidian border border-white/10 rounded px-3 py-2 text-white" />
            </div>
            <button type="submit" className="w-full mt-4 bg-accent text-obsidian font-bold py-2 rounded hover:bg-white transition-colors">
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Obsidian Command Center</h1>
        <button onClick={() => fetchData()} className="text-accent text-sm hover:underline">Refresh Data</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users Section */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="text-accent"/> Registered Users ({users.length})</h2>
            <button onClick={() => downloadCSV(users, 'obsidian_users')} className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-white" title="Download CSV">
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? <p className="text-text-main/50">Loading...</p> : (
              <div className="space-y-4">
                {users.map(u => (
                  <div key={u.id} className="p-4 bg-obsidian-light/50 border border-white/5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{u.name || 'Unnamed'}</p>
                      <p className="text-sm text-text-main/70">{u.email}</p>
                      {u.birthday && <p className="text-xs text-accent mt-1">🎂 {u.birthday}</p>}
                    </div>
                    {u.birthday && (
                      <button onClick={() => handleScheduleBirthday(u)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-accent/10 text-accent border border-accent/20 rounded hover:bg-accent hover:text-obsidian transition-colors">
                        <CalendarIcon className="w-3 h-3" /> Schedule Greeting
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><Mail className="text-accent"/> Subscribers ({subscribers.length})</h2>
            <button onClick={() => downloadCSV(subscribers, 'obsidian_subscribers')} className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-white" title="Download CSV">
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mb-8 p-4 bg-obsidian border border-accent/10 rounded-xl">
            <h3 className="text-sm font-semibold text-white mb-3">Broadcast Message</h3>
            <form onSubmit={handleBulkEmail} className="space-y-3">
              <input type="text" placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} required className="w-full bg-obsidian-light border border-white/5 rounded px-3 py-2 text-white text-sm focus:border-accent outline-none" />
              <textarea placeholder="HTML Body (use {{name}} for placeholder)" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} required rows={4} className="w-full bg-obsidian-light border border-white/5 rounded px-3 py-2 text-white text-sm focus:border-accent outline-none font-mono" />
              <button type="submit" disabled={sendingEmail || subscribers.length === 0} className="w-full flex items-center justify-center gap-2 bg-accent text-obsidian font-bold py-2 text-sm rounded hover:bg-white transition-colors disabled:opacity-50">
                <Mail className="w-4 h-4" /> {sendingEmail ? 'Broadcasting...' : `Send to ${subscribers.length} recipients`}
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {loading ? <p className="text-text-main/50">Loading...</p> : (
              subscribers.map(s => (
                <div key={s.id} className="p-3 bg-obsidian-light/30 border border-white/5 rounded flex items-center justify-between">
                  <span className="text-sm text-white">{s.email}</span>
                  <span className="text-xs text-text-main/50">{new Date(s.subscribedAt).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
