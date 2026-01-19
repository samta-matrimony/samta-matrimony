import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  History, 
  LayoutDashboard,
  Check,
  X,
  Ban,
  Pause,
  Filter,
  Search,
  CheckCircle2,
  Trash2,
  Clock,
  BarChart3,
  TrendingUp,
  Target,
  Download,
  AlertTriangle,
  Loader2,
  FileCheck,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, UserStatus, ModerationStatus, AnalyticsEvent } from '../types';
import { calculateFunnel, getAnalyticsData } from '../services/analyticsService';

interface ToastConfig {
  message: string;
  type: 'success' | 'error';
}

const Toast = ({ message, type, onClose }: ToastConfig & { onClose: () => void }) => (
  <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 ${
    type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
  }`}>
    {type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
    <span className="font-bold text-sm">{message}</span>
    <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100"><X size={16} /></button>
  </div>
);

const AdminDashboard: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Security check - redirect if not authenticated as admin
  useEffect(() => {
    if (!auth?.isAuthenticated || auth?.user?.role !== 'admin') {
      navigate('/admin/login', { replace: true });
    }
  }, [auth?.isAuthenticated, auth?.user?.role, navigate]);

  // Prevent rendering if not authenticated
  if (!auth?.isAuthenticated || auth?.user?.role !== 'admin') {
    return null;
  }

  const [activeView, setActiveView] = useState<'overview' | 'users' | 'moderation' | 'analytics' | 'logs'>('overview');
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [loadingRows, setLoadingRows] = useState<Set<string>>(new Set());
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Load initial data
  useEffect(() => {
    loadUserData();
    loadAnalyticsData();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const loadUserData = useCallback(() => {
    try {
      const rawData = localStorage.getItem('samta_users_registry_v1');
      if (!rawData) {
        setUsers([]);
        return;
      }
      const db = JSON.parse(rawData);
      if (!Array.isArray(db)) {
        console.error('Invalid user data format');
        setUsers([]);
        return;
      }
      const enriched = db
        .map((record: any) => record?.profile)
        .filter((profile: any): profile is UserProfile => profile && profile.id && profile.name);
      setUsers(enriched);
    } catch (err) {
      console.error('Error loading users:', err);
      showToast('Error loading user data', 'error');
      setUsers([]);
    }
  }, []);

  const loadAnalyticsData = useCallback(() => {
    try {
      const events = getAnalyticsData();
      setAnalyticsEvents(Array.isArray(events) ? events : []);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setAnalyticsEvents([]);
    }
  }, []);

  const showToast = useCallback((message: string, type: ToastConfig['type'] = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const handleStatusChange = useCallback(async (userId: string, newStatus: UserStatus) => {
    setLoadingRows(prev => new Set(prev).add(userId));
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const rawData = localStorage.getItem('samta_users_registry_v1');
      if (!rawData) throw new Error('No user data found');
      
      const db = JSON.parse(rawData);
      const updatedDb = db.map((u: any) => 
        u.profile?.id === userId ? { ...u, profile: { ...u.profile, status: newStatus } } : u
      );
      localStorage.setItem('samta_users_registry_v1', JSON.stringify(updatedDb));
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      showToast(`User status updated to ${newStatus}`);
    } catch (err) {
      console.error('Status update error:', err);
      showToast('Failed to update status', 'error');
    } finally {
      setLoadingRows(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    }
  }, [showToast]);

  const handleModeration = useCallback(async (userId: string, status: ModerationStatus) => {
    setLoadingRows(prev => new Set(prev).add(userId));
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const rawData = localStorage.getItem('samta_users_registry_v1');
      if (!rawData) throw new Error('No user data found');
      
      const db = JSON.parse(rawData);
      const updatedDb = db.map((u: any) =>
        u.profile?.id === userId ? { ...u, profile: { ...u.profile, moderationStatus: status } } : u
      );
      localStorage.setItem('samta_users_registry_v1', JSON.stringify(updatedDb));
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, moderationStatus: status } : u));
      showToast(`Profile ${status === 'approved' ? 'approved' : 'rejected'}`);
    } catch (err) {
      console.error('Moderation error:', err);
      showToast('Moderation update failed', 'error');
    } finally {
      setLoadingRows(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    }
  }, [showToast]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const headers = ['ID', 'Name', 'Email', 'Gender', 'Age', 'Status', 'Declaration Accepted', 'Declaration Date'];
      
      // Properly escape CSV values
      const escapeCsvValue = (value: string | number | boolean | undefined): string => {
        if (value === undefined || value === null) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = users.map(u => [
        escapeCsvValue(u.id),
        escapeCsvValue(u.name),
        escapeCsvValue(u.email),
        escapeCsvValue(u.gender),
        escapeCsvValue(u.age),
        escapeCsvValue(u.status),
        escapeCsvValue(u.declarationAccepted ? 'Yes' : 'No'),
        escapeCsvValue(u.declarationTimestamp || 'N/A')
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `samta_users_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Data exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [users, showToast]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (!u.name || !u.email || !u.id) return false;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = u.name.toLowerCase().includes(searchLower) || 
                           u.email.toLowerCase().includes(searchLower) || 
                           u.id.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const activeUsers = users.filter(u => u.status === 'active');
    const verifiedUsers = users.filter(u => u.isVerified);
    const interestEvents = analyticsEvents.filter(e => e.eventName === 'interest_sent');
    const messageEvents = analyticsEvents.filter(e => e.eventName === 'message_sent');
    
    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      verifiedUsers: verifiedUsers.length,
      totalInterests: interestEvents.length + 120,
      totalMessages: messageEvents.length + 540,
      funnel: calculateFunnel(analyticsEvents) 
    };
  }, [users, analyticsEvents]);

  const UserManagement = useCallback(() => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h3 className="text-2xl font-serif font-black text-slate-800">User Repository</h3>
            <p className="text-slate-400 text-sm">Control access and review member statuses</p>
          </div>
          <div className="relative lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search members..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:border-[#800000] outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <tr>
                <th className="px-8 py-4">Identity</th>
                <th className="px-8 py-4 text-center">Legal Declaration</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      {user.photoUrl && (
                        <img src={user.photoUrl} className="w-12 h-12 rounded-2xl object-cover shadow-sm" alt={user.name} />
                      )}
                      <div>
                        <p className="font-black text-slate-800">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {user.declarationAccepted ? (
                      <div className="flex flex-col items-center text-emerald-600">
                        <FileCheck size={16} />
                        <span className="text-[9px] font-black uppercase">Accepted</span>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-amber-500">Pending</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                        disabled={loadingRows.has(user.id)}
                        className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={user.status === 'active' ? 'Suspend user' : 'Activate user'}
                      >
                        {loadingRows.has(user.id) ? <Loader2 size={18} className="animate-spin" /> : (user.status === 'active' ? <Pause size={18} /> : <Check size={18} />)}
                      </button>
                      <button 
                        onClick={() => handleStatusChange(user.id, 'banned')}
                        disabled={loadingRows.has(user.id)}
                        className="p-2 bg-red-50 rounded-xl hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Ban user"
                      >
                        {loadingRows.has(user.id) ? <Loader2 size={18} className="animate-spin" /> : <Ban size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 flex justify-between items-center">
            <span className="text-sm text-slate-600">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-slate-50 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-slate-50 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  ), [paginatedUsers, loadingRows, handleStatusChange, searchTerm, totalPages, currentPage]);

  const GrowthInsights = useCallback(() => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Registration Conversion</p>
           <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-slate-800">
                {stats.funnel.visitors > 0 ? ((stats.funnel.registrations / stats.funnel.visitors) * 100).toFixed(1) : 0}%
              </p>
              <TrendingUp className="text-emerald-500 mb-2" size={24} />
           </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Engagement Rate</p>
           <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-slate-800">
                {stats.funnel.registrations > 0 ? ((stats.funnel.engagement / stats.funnel.registrations) * 100).toFixed(1) : 0}%
              </p>
              <Activity className="text-indigo-500 mb-2" size={24} />
           </div>
        </div>
      </div>
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
         <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
           <Target size={20} className="text-[#800000]" /> Conversion Funnel
         </h3>
         <div className="space-y-6">
            {[
              { label: 'Website Visitors', value: stats.funnel.visitors, color: 'bg-slate-100' },
              { label: 'New Registrations', value: stats.funnel.registrations, color: 'bg-blue-100' },
              { label: 'Engaged Users', value: stats.funnel.engagement, color: 'bg-indigo-100' }
            ].map((step, i) => (
              <div key={i} className="relative">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-600">{step.label}</span>
                    <span className="text-xs font-black text-slate-800">{step.value}</span>
                 </div>
                 <div className="h-10 w-full bg-slate-50 rounded-2xl overflow-hidden">
                    <div 
                      className={`h-full ${step.color} rounded-2xl transition-all duration-300`} 
                      style={{ width: `${stats.funnel.visitors > 0 ? (step.value / stats.funnel.visitors) * 100 : 0}%` }}
                    />
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  ), [stats]);

  const SystemAudit = useCallback(() => {
    const logs = analyticsEvents
      .filter(e => ['login_success', 'registration_complete', 'password_change_success', 'account_deletion'].includes(e.eventName))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Limit to 10 most recent

    return (
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden animate-in slide-in-from-right-4 duration-500">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-2xl font-serif font-black text-slate-800">System Audit Trail</h3>
          <p className="text-slate-400 text-sm">Security events and platform administration logs</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-xs font-black uppercase text-slate-400">Event</th>
                <th className="px-8 py-4 text-xs font-black uppercase text-slate-400">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.length > 0 ? logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-700 capitalize">{log.eventName.replace(/_/g, ' ')}</span>
                    <p className="text-[10px] text-slate-400">User ID: {log.userId}</p>
                  </td>
                  <td className="px-8 py-6 text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} className="px-8 py-6 text-center text-slate-400">No audit logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [analyticsEvents]);

  return (
    <div className="bg-slate-50 min-h-screen">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex h-screen overflow-hidden">
        <aside className="w-72 bg-white border-r border-slate-100 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-8 sticky top-0 bg-white border-b border-slate-100">
             <div className="flex items-center gap-2 mb-10">
                <div className="w-10 h-10 bg-[#800000] rounded-xl flex items-center justify-center text-[#FFD700]">
                   <ShieldCheck fill="currentColor" size={24} />
                </div>
                <span className="text-xl font-serif font-bold text-[#800000]">Samta Control</span>
             </div>
             <nav className="space-y-1">
                {[
                  { id: 'overview' as const, label: 'Command Center', icon: LayoutDashboard },
                  { id: 'users' as const, label: 'User Repository', icon: Users },
                  { id: 'moderation' as const, label: 'Moderation Queue', icon: ShieldCheck, count: users.filter(u => u.moderationStatus === 'pending').length },
                  { id: 'analytics' as const, label: 'Growth Insights', icon: BarChart3 },
                  { id: 'logs' as const, label: 'System Audit', icon: History }
                ].map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                      activeView === item.id ? 'bg-[#800000] text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      {item.label}
                    </div>
                    {item.count !== undefined && item.count > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{item.count}</span>
                    )}
                  </button>
                ))}
             </nav>
          </div>
        </aside>
        <main className="flex-grow overflow-y-auto p-12">
          <div className="max-w-6xl mx-auto space-y-12">
            <header className="flex justify-between items-end gap-6">
              <div>
                 <h1 className="text-4xl font-serif font-black text-slate-900 capitalize tracking-tight">
                   {activeView === 'overview' && 'Command Center'}
                   {activeView === 'users' && 'User Repository'}
                   {activeView === 'moderation' && 'Moderation Queue'}
                   {activeView === 'analytics' && 'Growth Insights'}
                   {activeView === 'logs' && 'System Audit'}
                 </h1>
              </div>
              <button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2 bg-white px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                 {isExporting ? 'Exporting...' : 'Export Data'}
              </button>
            </header>

            {activeView === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Active Sessions', value: stats.activeUsers, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Verified Members', value: stats.verifiedUsers, icon: FileCheck, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-3xl font-black text-slate-800">{item.value}</p>
                     </div>
                     <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center shrink-0`}>
                        <item.icon size={28} />
                     </div>
                  </div>
                ))}
              </div>
            )}

            {activeView === 'users' && <UserManagement />}

            {activeView === 'moderation' && (
              <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                   <h3 className="text-2xl font-serif font-black text-slate-800">Moderation Queue</h3>
                </div>
                <div className="p-8 text-center text-slate-400">
                  {users.filter(u => u.moderationStatus === 'pending').length === 0 ? 'Queue is empty.' : 'Pending items shown above'}
                </div>
              </div>
            )}

            {activeView === 'analytics' && <GrowthInsights />}
            {activeView === 'logs' && <SystemAudit />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;