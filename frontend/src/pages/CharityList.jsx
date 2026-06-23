import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import { Heart, Search, Star, Globe, ExternalLink } from 'lucide-react';

const CharityList = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/charities');
      setCharities(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch charities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCharities = charities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-impact"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Our <span className="gradient-text">Charity</span> Partners
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Every subscription supports a cause you care about. Choose your charity
          and make a difference.
        </p>
      </motion.div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-12">
        <Input
          placeholder="Search charities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-5 h-5" />}
          className="bg-slate/50"
        />
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharities.map((charity, index) => (
          <motion.div
            key={charity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="h-full hover:border-impact/30 transition-all group">
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-4">
                  {charity.image_url ? (
                    <img
                      src={charity.image_url}
                      alt={charity.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-impact/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-8 h-8 text-impact" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">
                        {charity.name}
                      </h3>
                      {charity.is_featured && (
                        <Star className="w-4 h-4 text-gold fill-gold flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>

                {charity.description && (
                  <p className="text-sm text-gray-400 mt-3 flex-1 line-clamp-3">
                    {charity.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                  {charity.website ? (
                    <a
                      href={charity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-impact hover:text-impact-light flex items-center gap-1"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">No website</span>
                  )}
                  <span className="text-xs text-gray-500">
                    ID: {charity.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCharities.length === 0 && (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No charities found</p>
          <p className="text-gray-500">Try adjusting your search.</p>
        </div>
      )}
    </div>
  );
};

export default CharityList;