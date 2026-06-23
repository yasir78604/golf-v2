import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import api from '../../services/api';
import {
  Heart,
  Plus,
  Edit2,
  Trash2,
  Star,
  ExternalLink,
  X,
  Image,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CharityManagement = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    website: '',
    isFeatured: false,
  });

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
      toast.error('Failed to load charities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCharity) {
        await api.put(`/admin/charities/${editingCharity.id}`, formData);
        toast.success('Charity updated!');
      } else {
        await api.post('/admin/charities', formData);
        toast.success('Charity created!');
      }
      setShowModal(false);
      setEditingCharity(null);
      setFormData({ name: '', description: '', imageUrl: '', website: '', isFeatured: false });
      fetchCharities();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this charity?')) return;
    try {
      await api.delete(`/admin/charities/${id}`);
      toast.success('Charity deleted');
      fetchCharities();
    } catch (error) {
      toast.error('Failed to delete charity');
    }
  };

  const openEditModal = (charity) => {
    setEditingCharity(charity);
    setFormData({
      name: charity.name,
      description: charity.description || '',
      imageUrl: charity.image_url || '',
      website: charity.website || '',
      isFeatured: charity.is_featured || false,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-impact"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminSidebar />

      <div className="flex-1 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">Charity</span> Management
            </h1>
            <p className="text-gray-400 mt-1">Manage charitable organizations on the platform.</p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditingCharity(null);
              setFormData({ name: '', description: '', imageUrl: '', website: '', isFeatured: false });
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Charity
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {charities.map((charity) => (
            <motion.div
              key={charity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:border-impact/20 transition-all">
                <div className="flex items-start gap-4">
                  {charity.image_url ? (
                    <img
                      src={charity.image_url}
                      alt={charity.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-impact/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-10 h-10 text-impact" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white truncate">{charity.name}</h3>
                        {charity.is_featured && (
                          <span className="text-xs text-gold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-gold" />
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(charity)}
                          className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(charity.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {charity.description && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {charity.description}
                      </p>
                    )}
                    {charity.website && (
                      <a
                        href={charity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-impact hover:text-impact-light flex items-center gap-1 mt-2"
                      >
                        <Globe className="w-3 h-3" />
                        Visit Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {charities.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No charities added yet</p>
            <p className="text-gray-500">Click "Add Charity" to get started</p>
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate rounded-2xl p-8 max-w-md w-full border border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">
                    {editingCharity ? 'Edit Charity' : 'Add New Charity'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Charity Name"
                    placeholder="Enter charity name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Description"
                    placeholder="Brief description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <Input
                    label="Image URL"
                    placeholder="https://example.com/logo.png"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    icon={<Image className="w-4 h-4" />}
                  />
                  <Input
                    label="Website"
                    placeholder="https://charity.org"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    icon={<Globe className="w-4 h-4" />}
                  />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-5 h-5 accent-impact rounded"
                    />
                    <span className="text-gray-300">Feature this charity on homepage</span>
                  </label>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      type="submit"
                    >
                      {editingCharity ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CharityManagement;