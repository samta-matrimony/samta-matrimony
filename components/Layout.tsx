
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Heart, 
  Search, 
  User, 
  MessageSquare, 
  LogOut,
  ChevronDown,
  Settings,
  ShieldCheck,
  Phone,
  MapPin
} from 'lucide-react';
import { BROWSE_CATEGORIES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../contexts/AnalyticsContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { track } = useAnalytics();
  const navigate = useNavigate();
  const location = useLocation();

  // Page View Tracking
  useEffect(() => {
    track('page_view', { 
      path: location.pathname,
      search: location.search,
      title: document.title
    });
  }, [location.pathname, track]);

  const handleLogout = () => {
    track('logout');
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-[#800000] rounded-lg flex items-center justify-center text-[#FFD700] transition-transform group-hover:scale-105">
                <Heart fill="currentColor" size={24} />
              </div>
              <span className="text-2xl font-serif font-bold text-[#800000] tracking-tight">
                Samta <span className="text-[#B22222]">Matrimony</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <div 
                className="relative"
                onMouseEnter={() => setIsBrowseOpen(true)}
                onMouseLeave={() => setIsBrowseOpen(false)}
              >
                <button 
                  className="flex items-center gap-1 text-slate-600 hover:text-[#800000] font-medium py-6"
                >
                  Browse By <ChevronDown size={16} className={`transition-transform duration-200 ${isBrowseOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isBrowseOpen && (
                  <div className="absolute top-[calc(100%-8px)] left-0 w-72 bg-white shadow-2xl rounded-2xl border border-slate-100 py-4 grid grid-cols-1 gap-1 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 pb-2 mb-2 border-b border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Find Your Match By</p>
                    </div>
                    {BROWSE_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/browse?type=${cat.param}`}
                        className="px-4 py-2.5 text-sm text-slate-600 hover:bg-[#80000008] hover:text-[#800000] flex items-center justify-between group/item"
                        onClick={() => {
                          setIsBrowseOpen(false);
                          track('nav_browse_category', { category: cat.label });
                        }}
                      >
                        <span className="font-medium">{cat.label}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700] opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <Link to="/search" className="flex items-center gap-1 text-slate-600 hover:text-[#800000] font-medium transition-colors">
                <Search size={18} /> Search
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="text-slate-600 hover:text-[#800000] font-medium transition-colors">My Matches</Link>
                  <Link to="/messages" className="text-slate-600 hover:text-[#800000] font-medium relative transition-colors">
                    Inbox
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-1 text-[#800000] font-black uppercase text-[10px] bg-red-50 px-2 py-1 rounded border border-red-100 animate-pulse">
                      <ShieldCheck size={12} /> Admin
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" state={{ mode: 'login' }} className="text-[#800000] font-semibold px-4 py-2 rounded-lg hover:bg-slate-100">Login</Link>
                  <Link to="/register" className="bg-[#800000] text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-[#600000] transition-colors">
                    Register Free
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#800000] text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {user?.name?.[0].toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{user?.name}</span>
                    <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white shadow-2xl rounded-2xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#800000] font-bold hover:bg-red-50">
                          <ShieldCheck size={16} /> Admin Panel
                        </Link>
                      )}
                      <Link to="/my-profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                        <User size={16} /> My Profile
                      </Link>
                      <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50">
                        <Settings size={16} /> Settings
                      </Link>
                      <hr className="my-2 border-slate-50" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl mb-4">
                <div className="w-12 h-12 bg-[#800000] text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {user?.name?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{user?.name}</p>
                  <button onClick={handleLogout} className="text-xs text-red-600 font-bold">Logout</button>
                </div>
              </div>
            ) : null}

            {user?.role === 'admin' && (
              <Link to="/admin" className="block w-full bg-red-600 text-white text-center py-4 rounded-xl font-bold shadow-lg" onClick={() => setIsMenuOpen(false)}>
                Admin Dashboard
              </Link>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Link to="/search" className="flex flex-col items-center p-4 bg-slate-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                <Search className="text-[#800000] mb-1" />
                <span className="text-xs font-medium">Search</span>
              </Link>
              <Link to={isAuthenticated ? "/my-profile" : "/register"} className="flex flex-col items-center p-4 bg-slate-50 rounded-xl" onClick={() => setIsMenuOpen(false)}>
                <User className="text-[#800000] mb-1" />
                <span className="text-xs font-medium">{isAuthenticated ? 'My Profile' : 'Register'}</span>
              </Link>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase px-2">Browse Profiles By</p>
              <div className="grid grid-cols-2 gap-2">
                {BROWSE_CATEGORIES.map(cat => (
                  <Link 
                    key={cat.id} 
                    to={`/browse?type=${cat.param}`} 
                    className="px-3 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-[#80000010] active:scale-95 transition-all"
                    onClick={() => {
                      setIsMenuOpen(false);
                      track('nav_browse_category_mobile', { category: cat.label });
                    }}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
            {!isAuthenticated && (
              <Link to="/register" className="block w-full bg-[#800000] text-white text-center py-4 rounded-xl font-bold shadow-lg" onClick={() => setIsMenuOpen(false)}>
                Join Samta Matrimony
              </Link>
            )}
            {isAuthenticated && (
               <>
                 <Link to="/messages" className="block w-full bg-slate-100 text-[#800000] text-center py-4 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>
                   View Inbox
                 </Link>
                 <Link to="/settings" className="block w-full bg-slate-100 text-[#800000] text-center py-4 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>
                   Settings
                 </Link>
               </>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Heart fill="#FFD700" className="text-[#FFD700]" />
                <span className="text-xl font-serif font-bold text-white">Samta Matrimony</span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                The most trusted site to find your perfect life partner. We celebrate cultural values and modernize the matchmaking experience.
              </p>
              
              <div className="space-y-3 mb-6">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Phone size={14} className="text-[#FFD700]" /> +91 8426914414
                 </div>
                 <div className="flex items-start gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    <MapPin size={14} className="text-[#FFD700] shrink-0 mt-0.5" /> 
                    <span>Ganesh Nagar, Bharatpur,<br/>Rajasthan – 321001</span>
                 </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#800000] transition-colors cursor-pointer text-xs font-bold">FB</div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#800000] transition-colors cursor-pointer text-xs font-bold">IN</div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[#800000] transition-colors cursor-pointer text-xs font-bold">IG</div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Information</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Browse Profiles</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/browse?type=religion" className="hover:text-white transition-colors">By Religion</Link></li>
                <li><Link to="/browse?type=caste" className="hover:text-white transition-colors">By Caste</Link></li>
                <li><Link to="/browse?type=city" className="hover:text-white transition-colors">By City</Link></li>
                <li><Link to="/browse?type=occupation" className="hover:text-white transition-colors">By Profession</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Mobile App</h4>
              <p className="text-sm mb-4">Download the app for a better experience</p>
              <div className="space-y-3">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center gap-3 cursor-pointer hover:border-slate-500">
                  <div className="w-8 h-8 bg-slate-700 rounded"></div>
                  <span className="text-xs font-bold">GET IT ON <br/> <span className="text-sm">Google Play</span></span>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center gap-3 cursor-pointer hover:border-slate-500">
                  <div className="w-8 h-8 bg-slate-700 rounded"></div>
                  <span className="text-xs font-bold">Download on <br/> <span className="text-sm">App Store</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-xs">
            <p>&copy; {new Date().getFullYear()} Samta Matrimony Services Pvt. Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
