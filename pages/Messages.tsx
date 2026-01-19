
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Send, 
  Search, 
  MoreVertical, 
  ChevronLeft, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Video, 
  Info,
  Smile,
  Paperclip,
  // Fix: Added missing icon imports to resolve build errors
  CheckCircle2,
  MessageSquare,
  Heart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useInteractions } from '../contexts/InteractionContext';
import { useChat } from '../contexts/ChatContext';
import { MOCK_PROFILES } from '../services/mockData';

const Messages: React.FC = () => {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { interests } = useInteractions();
  const { sendMessage, getConversation } = useChat();
  
  const [activeUserId, setActiveUserId] = useState<string | null>(routeUserId || null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-slate-500">Please log in to view messages</p>
      </div>
    );
  }

  // Get all matched users (accepted interests)
  const matchedInterests = interests.filter(i => 
    (i.senderId === user.uid || i.receiverId === user.uid) && i.status === 'accepted'
  );

  const matchedUsers = matchedInterests.map(interest => {
    const partnerId = interest.senderId === user.uid ? interest.receiverId : interest.senderId;
    return MOCK_PROFILES.find(p => p.id === partnerId);
  }).filter(Boolean);

  const activeProfile = matchedUsers.find(u => u?.id === activeUserId);
  const conversation = activeUserId ? getConversation(activeUserId) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  useEffect(() => {
    if (routeUserId) {
      setActiveUserId(routeUserId);
    }
  }, [routeUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeUserId) return;

    try {
      await sendMessage(activeUserId, messageInput.trim());
      setMessageInput('');
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-0 md:px-4 py-0 md:py-8 h-[calc(100vh-64px)] md:h-[calc(100vh-160px)] flex flex-col">
      <div className="bg-white md:rounded-[40px] shadow-2xl flex-grow flex overflow-hidden border border-slate-100 relative">
        
        {/* Sidebar: Conversations List */}
        <div className={`w-full md:w-96 border-r border-slate-100 flex flex-col shrink-0 ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 border-b border-slate-50">
            <h2 className="text-2xl font-serif font-black text-[#800000] mb-4">Inbox</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search conversations..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#800000] transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto pb-4">
            {matchedUsers.length > 0 ? (
              matchedUsers
                .filter(u => u?.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(u => {
                  const lastMsg = getConversation(u!.id).slice(-1)[0];
                  return (
                    <button 
                      key={u!.id}
                      onClick={() => {
                        setActiveUserId(u!.id);
                        navigate(`/messages/${u!.id}`);
                      }}
                      className={`w-full flex items-center gap-4 p-4 transition-all hover:bg-slate-50 border-l-4 ${activeUserId === u!.id ? 'bg-[#80000005] border-[#800000]' : 'border-transparent'}`}
                    >
                      <div className="relative shrink-0">
                        <img src={u!.photoUrl} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-grow text-left min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-slate-800 truncate">{u!.name}</p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {lastMsg ? lastMsg.text : 'Start a conversation...'}
                        </p>
                      </div>
                    </button>
                  );
                })
            ) : (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                  <Smile size={32} />
                </div>
                <div>
                  <p className="font-bold text-slate-700">No active chats</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">Accepted interests will appear here. Go to your dashboard to manage your connections.</p>
                </div>
                <Link to="/dashboard" className="inline-block text-xs font-black text-[#800000] uppercase tracking-widest hover:underline">
                  Go to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-grow flex flex-col bg-[#FDFBF9] ${!activeUserId ? 'hidden md:flex' : 'flex'}`}>
          {activeProfile ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm relative z-10">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      setActiveUserId(null);
                      navigate('/messages');
                    }}
                    className="md:hidden p-2 text-slate-400 hover:text-slate-600"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div className="flex items-center gap-3">
                    <img src={activeProfile.photoUrl} className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover shadow-sm border border-slate-100" alt="" />
                    <div>
                      <h3 className="font-black text-slate-800 flex items-center gap-1.5 text-sm md:text-base">
                        {activeProfile.name}
                        {activeProfile.isVerified && <ShieldCheck size={14} className="text-blue-500" />}
                      </h3>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[10px] md:text-xs text-slate-400 font-medium">{activeProfile.lastActive}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <button className="p-2 text-slate-400 hover:text-[#800000] transition-colors"><Phone size={20} /></button>
                  <button className="p-2 text-slate-400 hover:text-[#800000] transition-colors"><Video size={20} /></button>
                  <Link to={`/profile/${activeProfile.id}`} className="p-2 text-slate-400 hover:text-[#800000] transition-colors"><Info size={20} /></Link>
                  <button className="p-2 text-slate-400 hover:text-[#800000] transition-colors"><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Messages Content */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                <div className="flex flex-col items-center mb-10">
                   <div className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                     Connected on {new Date(activeProfile.joinedDate).toLocaleDateString()}
                   </div>
                   <div className="max-w-xs text-center">
                     <p className="text-xs text-slate-400 leading-relaxed italic">
                       Always keep your conversation respectful. Do not share financial details early in the process.
                     </p>
                   </div>
                </div>

                {conversation.length > 0 ? (
                  conversation.map((msg, idx) => {
                    const isMe = msg.senderId === user.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[80%] md:max-w-[60%] space-y-1`}>
                          <div className={`p-4 rounded-3xl text-sm shadow-sm leading-relaxed ${
                            isMe ? 'bg-[#800000] text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                          <p className={`text-[10px] font-medium text-slate-400 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && <CheckCircle2 size={10} className="text-[#800000]" />}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <MessageSquare size={64} className="text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold">Say Hello to {activeProfile.name.split(' ')[0]}!</p>
                    <p className="text-xs text-slate-400 mt-1">Don't wait, take the first step towards your future.</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 bg-white border-t border-slate-50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-[24px] p-2 pl-6 shadow-inner">
                  <button type="button" className="text-slate-400 hover:text-[#800000] transition-colors"><Smile size={20} /></button>
                  <button type="button" className="text-slate-400 hover:text-[#800000] transition-colors"><Paperclip size={20} /></button>
                  <input 
                    type="text" 
                    placeholder="Type your message here..."
                    className="flex-grow bg-transparent border-none outline-none text-sm text-slate-700 py-2"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={!messageInput.trim()}
                    className={`p-3 rounded-full transition-all shadow-lg flex items-center justify-center ${
                      messageInput.trim() ? 'bg-[#800000] text-white hover:bg-[#600000] scale-105 active:scale-95' : 'bg-slate-200 text-white cursor-not-allowed'
                    }`}
                  >
                    <Send size={20} />
                  </button>
                </form>
                <div className="mt-4 flex justify-center items-center gap-4">
                   <div className="flex items-center gap-1.5 opacity-40 grayscale pointer-events-none">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trust Guard Enabled</span>
                     <ShieldCheck size={12} />
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center relative shadow-inner">
                 <Heart size={48} className="text-[#80000020]" fill="currentColor" />
                 <div className="absolute top-0 right-0 p-3 bg-white rounded-2xl shadow-lg border border-slate-100 rotate-12">
                   <ShieldCheck size={24} className="text-blue-500" />
                 </div>
              </div>
              <div className="max-w-sm">
                <h3 className="text-2xl font-serif font-black text-slate-800 mb-2">Private Matching Room</h3>
                <p className="text-slate-500 leading-relaxed font-light">
                  Select a conversation from the left to start connecting. Chat is only enabled for mutual interests.
                </p>
              </div>
              <div className="flex gap-3">
                 <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                   Secure End-to-End
                 </div>
                 <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">
                   Safe Connection
                 </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Messages;
