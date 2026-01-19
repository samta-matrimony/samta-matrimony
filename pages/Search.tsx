
import React, { useState } from 'react';
import { Search as SearchIcon, SlidersHorizontal, MapPin, Briefcase, Info } from 'lucide-react';
import { MOCK_PROFILES } from '../services/mockData';
import ProfileCard from '../components/ProfileCard';
import { useAuth } from '../contexts/AuthContext';
import AdSlot from '../components/AdSlot';

const Search: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    keyword: '',
    religion: 'All',
    motherTongue: 'All',
    maritalStatus: 'All'
  });

  // Filter out demo profiles from search results
  const filtered = MOCK_PROFILES.filter(p => {
    if (p.isDemo) return false;
    const matchesReligion = filters.religion === 'All' || p.religion === filters.religion;
    const matchesKeyword = !filters.keyword || p.name.toLowerCase().includes(filters.keyword.toLowerCase()) || p.occupation.toLowerCase().includes(filters.keyword.toLowerCase());
    return matchesReligion && matchesKeyword;
  });

  const handleAdvancedFilters = () => {
    alert("Displaying all available advanced search filters.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="mb-12">
        <h1 className="text-3xl font-serif font-bold text-[#800000] mb-2">Advanced Search</h1>
        <p className="text-slate-500">Fine-tune your search with our extensive filters</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Search Keyword</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, profession, or city..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm"
                value={filters.keyword}
                onChange={e => setFilters({...filters, keyword: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Religion</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm"
              value={filters.religion}
              onChange={e => setFilters({...filters, religion: e.target.value})}
            >
              <option>All</option>
              <option>Hindu</option>
              <option>Muslim</option>
              <option>Christian</option>
              <option>Sikh</option>
              <option>Jain</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-[#800000] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#600000] transition-all">
              Update Results
            </button>
          </div>
        </div>
      </div>

      {/* Search Page Horizontal Ad Slot */}
      <AdSlot id="search-top-horizontal" format="horizontal" className="mb-12" />

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-slate-800">
          {filtered.length === 0 ? "No results found (Demo profiles excluded)" : `Showing ${filtered.length} matching profiles`}
        </h2>
        <button 
          onClick={handleAdvancedFilters}
          className={`flex items-center gap-2 text-sm font-bold text-[#800000] transition-colors`}
        >
          <SlidersHorizontal size={18} /> More Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map((profile, index) => (
          <React.Fragment key={profile.id}>
            <ProfileCard profile={profile} />
            {/* Inject an ad after the 4th profile in the results */}
            {index === 3 && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 py-4">
                <AdSlot id="search-in-feed-ad" format="fluid" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Search;
