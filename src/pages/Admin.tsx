import { useState, useEffect, useRef } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Download, Upload, Mail, Users, Lock, Sparkles, Paperclip, X, Trash2, Search } from 'lucide-react';
import Papa from 'papaparse';
import { sendEmail } from '../lib/googleApi';
import RichTextEditor from '../components/RichTextEditor';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [userSearch, setUserSearch] = useState('');
  const [subSearch, setSubSearch] = useState('');

  // Email form state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Attachment state
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentBase64, setAttachmentBase64] = useState<string>('');

  const csvInputRef = useRef<HTMLInputElement>(null);
  const currentUser = auth.currentUser;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'theakshatpopat' && password === 'Aprt9311') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert('Invalid credentials');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const fetchedUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetchedUsers);

      const subsSnap = await getDocs(collection(db, 'subscribers'));
      setSubscribers(subsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users/subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Auto-Pilot Birthday Email System
  useEffect(() => {
    if (!users.length || !isAuthenticated) return;

    const autoSendBirthdayEmails = async () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
      const currentDay = String(today.getDate()).padStart(2, '0');
      const todayStr = `${currentMonth}-${currentDay}`;

      for (const u of users) {
        if (u.birthday && u.email) {
          const [, month, day] = u.birthday.split('-');
          const bdayStr = `${month}-${day}`;
          
          if (bdayStr === todayStr && u.lastBirthdayEmailSentYear !== currentYear) {
            try {
              const htmlBody = `
                <div style="font-family: sans-serif; text-align: center; padding: 40px;">
                  <h1 style="color: #66FCF1;">Happy Birthday, ${u.name || 'Friend'}! 🎂</h1>
                  <p style="color: #333; font-size: 16px;">We wanted to take a moment to wish you a fantastic birthday and a wonderful year ahead.</p>
                  <p style="color: #666; margin-top: 30px; font-size: 14px;">- The Obsidian Team</p>
                </div>
              `;
              await sendEmail(u.email, "Happy Birthday from Obsidian! 🎉", htmlBody);
              
              await setDoc(doc(db, 'users', u.id), { lastBirthdayEmailSentYear: currentYear }, { merge: true });
              alert(`🎉 Auto-Pilot Success: Automatically sent a Happy Birthday email to ${u.email}!`);
            } catch (error) {
              console.error("Auto-pilot birthday email failed for " + u.email, error);
            }
          }
        }
      }
    };

    autoSendBirthdayEmails();
  }, [users, isAuthenticated]);

  const downloadCSV = (data: any[], filename: string) => {
    const columns = ["id", "email", "name", "phone", "address", "birthday", "role", "photoURL"];
    const normalizedData = data.map(item => {
      const row: any = {};
      columns.forEach(col => { row[col] = item[col] || ''; });
      Object.keys(item).forEach(key => {
        if (!columns.includes(key)) row[key] = item[key];
      });
      return row;
    });

    const csv = Papa.unparse(normalizedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let added = 0;
        try {
          for (const row of results.data as any[]) {
            if (row.email) {
              const subscriberId = btoa(row.email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
              await setDoc(doc(db, 'subscribers', subscriberId), {
                email: row.email,
                name: row.name || '',
                subscribedAt: row.subscribedAt || new Date().toISOString(),
                status: 'active'
              }, { merge: true });
              added++;
            }
          }
          alert(`Imported ${added} subscribers from CSV.`);
          fetchData();
        } catch (error: any) {
          alert(`Error importing CSV: ${error.message}`);
        }
      }
    });
    
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setAttachmentBase64(base64);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentFile(null);
      setAttachmentBase64('');
    }
  };

  const activeSubscribers = subscribers.filter(s => s.status !== 'unsubscribed');

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone?.includes(userSearch) ||
    u.address?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredSubs = activeSubscribers.filter(s => 
    s.name?.toLowerCase().includes(subSearch.toLowerCase()) || 
    s.email?.toLowerCase().includes(subSearch.toLowerCase())
  );

  const handleBulkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject || !emailBody) return;
    
    const confirmed = window.confirm(`Are you sure you want to send this email to ${activeSubscribers.length} subscribers?`);
    if (!confirmed) return;

    setSendingEmail(true);
    let successCount = 0;
    
    const attachment = attachmentFile && attachmentBase64 ? {
      filename: attachmentFile.name,
      mimeType: attachmentFile.type || 'application/octet-stream',
      dataBase64: attachmentBase64
    } : undefined;

    try {
      for (const sub of activeSubscribers) {
        const personalizedBody = emailBody.replace(/\{\{name\}\}/g, sub.name || 'Subscriber');
        await sendEmail(sub.email, emailSubject, personalizedBody, attachment);
        successCount++;
      }
      alert(`Successfully sent emails to ${successCount} subscribers.`);
      setEmailSubject('');
      setEmailBody('');
      setAttachmentFile(null);
      setAttachmentBase64('');
    } catch (error: any) {
      alert(`Error sending emails: ${error.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user completely?")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (e: any) {
      alert("Failed to delete user: " + e.message);
    }
  };

  const deleteSubscriber = async (subId: string) => {
    if (!window.confirm("Are you sure you want to delete this subscriber?")) return;
    try {
      await deleteDoc(doc(db, 'subscribers', subId));
      setSubscribers(prev => prev.filter(s => s.id !== subId));
    } catch (e: any) {
      alert("Failed to delete subscriber: " + e.message);
    }
  };

  if (!currentUser || currentUser.email !== 'akshatpopat9311@gmail.com') {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center px-4 sm:px-6">
        <Lock className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 text-center">Access Denied</h2>
        <p className="text-text-main text-center text-sm sm:text-base">You must be logged in as the master administrator to view this page.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel p-6 sm:p-8 w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
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
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 max-w-[1400px] mx-auto space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Command Center</h1>
        <button onClick={() => fetchData()} className="text-accent text-sm hover:underline self-start sm:self-auto">Refresh Data</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-12rem)] min-h-[800px]">
        {/* Users Section */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-4 sm:p-6 flex flex-col flex-1 overflow-hidden lg:w-1/2 min-h-[400px]">
          <div className="flex flex-col gap-4 mb-4 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Users className="text-accent w-5 h-5"/> Registered Users ({users.length})
              </h2>
              <button onClick={() => downloadCSV(users, 'obsidian_users')} className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-white" title="Download CSV">
                <Download className="w-4 h-4" />
              </button>
            </div>
            
            {/* User Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/50" />
              <input 
                type="text" 
                placeholder="Search users by name, email, phone..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-obsidian-light border border-white/5 rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:border-accent outline-none"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 min-h-0">
            {loading ? <p className="text-text-main/50">Loading...</p> : (
              <div className="space-y-3">
                {filteredUsers.map(u => (
                  <div key={u.id} className="p-3 sm:p-4 bg-obsidian-light/50 border border-white/5 rounded-lg flex flex-col gap-2 relative group overflow-hidden">
                    <button onClick={() => deleteUser(u.id)} className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 z-10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-start gap-3">
                      {u.photoURL && <img src={u.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-white/10 shrink-0" />}
                      <div className="overflow-hidden pr-8 flex-1">
                        <p className="font-semibold text-white text-sm sm:text-base truncate">{u.name || 'Unnamed'}</p>
                        <p className="text-xs sm:text-sm text-text-main/70 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {u.birthday && <span className="text-xs text-accent bg-accent/10 px-2 py-1 rounded flex items-center gap-1">🎂 {u.birthday} <Sparkles className="w-3 h-3 text-yellow-400 inline" title="Auto-Pilot Birthday Email Enabled" /></span>}
                      {u.phone && <span className="text-xs text-white/70 bg-white/5 px-2 py-1 rounded">📞 {u.phone}</span>}
                      {u.address && <span className="text-xs text-white/70 bg-white/5 px-2 py-1 rounded truncate max-w-[200px]">📍 {u.address}</span>}
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && <p className="text-sm text-text-main/50 text-center py-4">No users found.</p>}
              </div>
            )}
          </div>
        </motion.div>

        {/* Newsletter Section */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel p-4 sm:p-6 flex flex-col flex-1 overflow-hidden lg:w-1/2 min-h-[500px]">
          <div className="flex flex-col gap-4 mb-4 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <Mail className="text-accent w-5 h-5"/> Subscribers ({activeSubscribers.length} Active)
              </h2>
              <div className="flex gap-2">
                <label className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-white cursor-pointer" title="Upload CSV">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept=".csv" onChange={handleCsvUpload} ref={csvInputRef} className="hidden" />
                </label>
                <button onClick={() => downloadCSV(subscribers, 'obsidian_all_subscribers')} className="p-2 bg-white/5 hover:bg-white/10 rounded-md transition-colors text-white" title="Download CSV (Includes Unsubscribed)">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mb-6 p-3 sm:p-4 bg-obsidian border border-accent/10 rounded-xl shrink-0">
            <h3 className="text-sm font-semibold text-white mb-3">Broadcast Message</h3>
            <form onSubmit={handleBulkEmail} className="space-y-3">
              <input type="text" placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} required className="w-full bg-obsidian-light border border-white/5 rounded px-3 py-2 text-white text-sm focus:border-accent outline-none" />
              
              {/* Rich Text Editor Component */}
              <RichTextEditor 
                value={emailBody} 
                onChange={setEmailBody} 
                placeholder="HTML Body (use {{name}} for placeholder)" 
              />
              
              <div className="flex items-center gap-3 bg-obsidian-light/50 p-2 rounded border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded transition-colors text-sm text-white">
                  <Paperclip className="w-4 h-4" /> Attach File
                  <input type="file" onChange={handleFileChange} className="hidden" />
                </label>
                {attachmentFile && (
                  <span className="text-xs text-text-main truncate flex items-center gap-2">
                    {attachmentFile.name} 
                    <X className="w-3 h-3 text-red-400 cursor-pointer hover:text-red-300" onClick={() => { setAttachmentFile(null); setAttachmentBase64(''); }} />
                  </span>
                )}
              </div>

              <button type="submit" disabled={sendingEmail || activeSubscribers.length === 0} className="w-full flex items-center justify-center gap-2 bg-accent text-obsidian font-bold py-2 sm:py-3 text-sm rounded hover:bg-white transition-colors disabled:opacity-50 mt-2">
                <Mail className="w-4 h-4" /> {sendingEmail ? 'Broadcasting...' : `Send to ${activeSubscribers.length} recipients`}
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-3 shrink-0 mb-3">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-main/50" />
              <input 
                type="text" 
                placeholder="Search active subscribers..." 
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="w-full bg-obsidian-light border border-white/5 rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:border-accent outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 min-h-0 space-y-2">
            {loading ? <p className="text-text-main/50">Loading...</p> : (
              <>
                {filteredSubs.map(s => (
                  <div key={s.id} className="p-3 bg-obsidian-light/30 border border-white/5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-1 relative group pr-10 overflow-hidden">
                    <span className="text-sm text-white truncate flex-1">{s.email}</span>
                    <span className="text-xs text-text-main/50 shrink-0">{new Date(s.subscribedAt).toLocaleDateString()}</span>
                    <button onClick={() => deleteSubscriber(s.id)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-red-500/10 text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {filteredSubs.length === 0 && <p className="text-sm text-text-main/50 text-center py-4">No subscribers found.</p>}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
