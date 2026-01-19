
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Filter, ChevronRight, SlidersHorizontal, Check, Users } from 'lucide-react';
import { BROWSE_CATEGORIES } from '../constants';
import { MOCK_PROFILES } from '../services/mockData';
import ProfileCard from '../components/ProfileCard';
import { UserProfile } from '../types';

const Browse: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const typeParam = searchParams.get('type') || 'motherTongue';
  
  const currentCategory = BROWSE_CATEGORIES.find(c => c.param === typeParam) || BROWSE_CATEGORIES[0];
  const [selectedItem, setSelectedItem] = useState(currentCategory.items[0]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    // Reset selection when category changes
    setSelectedItem(currentCategory.items[0]);
  }, [typeParam]);

  useEffect(() => {
    // Basic filter logic for mock data, excluding demo profiles
    const filtered = MOCK_PROFILES.filter(p => {
      if (p.isDemo) return false;
      const val = (p as any)[currentCategory.param];
      return val === selectedItem;
    });
    setFilteredProfiles(filtered);
  }, [selectedItem, currentCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link to="/" className="hover:text-[#800000]">Home</Link>
        <ChevronRight size={14} className="shrink-0" />
        <span>Browse Profiles</span>
        <ChevronRight size={14} className="shrink-0" />
        <span className="text-[#800000] font-bold">{currentCategory.label}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 lg:sticky lg:top-24">
            <h3 className="text-lg font-bold text-[#800000] mb-6 flex items-center gap-2">
              <Filter size={20} /> Browse By {currentCategory.label}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {currentCategory.items.map(item => (
                <button
                  key={item}
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    selectedItem === item 
                      ? 'bg-[#800000] text-white shadow-lg shadow-maroon-100' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate pr-2">{item}</span>
                  {selectedItem === item && <Check size={16} className="shrink-0" />}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 hidden lg:block">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Other Categories</h4>
              <div className="grid grid-cols-1 gap-1">
                {BROWSE_CATEGORIES.filter(c => c.id !== currentCategory.id).map(cat => (
                  <Link 
                    key={cat.id} 
                    to={`/browse?type=${cat.param}`}
                    className="text-xs font-bold text-slate-500 hover:text-[#800000] py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Browse by {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Profile Grid */}
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#800000]">
                {selectedItem} {currentCategory.label} Profiles
              </h1>
              <p className="text-sm text-slate-400 mt-1">Found {filteredProfiles.length} verified members</p>
            </div>
            
            <button className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white px-5 py-2.5 rounded-xl border border-slate-100 shadow-sm hover:border-[#800000] transition-colors">
              <SlidersHorizontal size={16} /> Sort: Newest First
            </button>
          </div>

          {filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {filteredProfiles.map(profile => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 lg:p-20 text-center border-2 border-dashed border-slate-100">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Users size={48} />
              </div>
              <h3 className="text-xl font-bold text-slate-700">No matching profiles yet</h3>
              <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm">We're constantly adding new members. Try another {currentCategory.label.toLowerCase()} or check back soon!</p>
              <button 
                onClick={() => setSelectedItem(currentCategory.items[0])}
                className="mt-8 px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold hover:bg-slate-200 transition-all"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;
