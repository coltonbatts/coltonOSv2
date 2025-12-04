import React, { useState } from 'react';
import {
  Database,
  FolderOpen,
  FileText,
  Link2,
  MessageSquare,
  Plus,
  Search,
  Grid,
  List,
  Trash2,
  ExternalLink,
  Copy,
  Edit2,
  Filter,
  ChevronDown
} from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import { Widget, Modal, Input, TextArea, Select, Tag, EmptyState } from '../components/UI';

// ============================================
// VAULT CATEGORIES
// ============================================
const CATEGORIES = {
  projects: {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    color: 'blue',
    description: 'Portfolio work, client projects, experiments'
  },
  assets: {
    id: 'assets',
    label: 'Assets',
    icon: FileText,
    color: 'green',
    description: 'Templates, graphics, reusable files'
  },
  prompts: {
    id: 'prompts',
    label: 'Prompts',
    icon: MessageSquare,
    color: 'purple',
    description: 'System prompts, context blocks, instructions'
  },
  links: {
    id: 'links',
    label: 'Links',
    icon: Link2,
    color: 'yellow',
    description: 'References, inspiration, bookmarks'
  }
};

// ============================================
// MAIN VAULT VIEW
// ============================================
export default function VaultView({ uid }) {
  const [activeCategory, setActiveCategory] = useState('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { items, loading, add, update, remove } = useCollection(uid, `vault_${activeCategory}`);

  // Filter items by search
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.tags?.some(t => t.toLowerCase().includes(query))
    );
  });

  const handleAdd = async (data) => {
    await add(data);
    setShowAddModal(false);
  };

  const handleUpdate = async (data) => {
    if (editingItem) {
      await update(editingItem.id, data);
      setEditingItem(null);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      await remove(id);
    }
  };

  const category = CATEGORIES[activeCategory];

  return (
    <div className="h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6 mb-6">
        <div>
          <h1 className="text-4xl font-light text-white mb-2 flex items-center gap-3">
            <Database size={32} strokeWidth={1.5} className="text-white/60" />
            Asset Vault
          </h1>
          <p className="text-sm text-white/40 font-mono">
            Your centralized data layer. Everything in one place.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white text-black px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-white/90 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Add {category.label.slice(0, -1)}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        {Object.values(CATEGORIES).map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 border transition-all font-mono text-sm ${
              activeCategory === cat.id
                ? 'border-white/40 bg-white/10 text-white'
                : 'border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
            }`}
          >
            <cat.icon size={16} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${category.label.toLowerCase()}...`}
            className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors font-mono text-sm"
          />
        </div>

        <div className="flex border border-white/10">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/30 font-mono animate-pulse">Loading vault...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={category.icon}
            title={`No ${category.label} Yet`}
            description={category.description}
            action={`Add your first ${category.label.slice(0, -1).toLowerCase()}`}
            onAction={() => setShowAddModal(true)}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <VaultCard
                key={item.id}
                item={item}
                category={activeCategory}
                onEdit={() => setEditingItem(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map(item => (
              <VaultListItem
                key={item.id}
                item={item}
                category={activeCategory}
                onEdit={() => setEditingItem(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <VaultModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAdd}
        category={activeCategory}
        title={`Add ${category.label.slice(0, -1)}`}
      />

      {/* Edit Modal */}
      <VaultModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleUpdate}
        category={activeCategory}
        title={`Edit ${category.label.slice(0, -1)}`}
        initialData={editingItem}
      />
    </div>
  );
}

// ============================================
// VAULT CARD (Grid View)
// ============================================
function VaultCard({ item, category, onEdit, onDelete }) {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white/5 border border-white/10 p-5 hover:border-white/30 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg text-white font-light line-clamp-1">{item.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {category === 'prompts' && (
            <button
              onClick={() => copyToClipboard(item.content)}
              className="p-1 text-white/40 hover:text-white transition-colors"
              title="Copy to clipboard"
            >
              <Copy size={14} />
            </button>
          )}
          {category === 'links' && item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-white/40 hover:text-white transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button
            onClick={onEdit}
            className="p-1 text-white/40 hover:text-white transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-white/40 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-white/50 mb-4 line-clamp-2">{item.description}</p>
      )}

      {/* Content preview for prompts */}
      {category === 'prompts' && item.content && (
        <div className="bg-black/30 p-3 mb-4 font-mono text-xs text-white/60 line-clamp-3 border-l-2 border-purple-500/50">
          {item.content}
        </div>
      )}

      {/* URL for links */}
      {category === 'links' && item.url && (
        <div className="text-xs text-white/30 font-mono truncate mb-4">
          {item.url}
        </div>
      )}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag, i) => (
            <Tag key={i} color={CATEGORIES[category].color}>{tag}</Tag>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
        {item.type && (
          <span className="text-xs text-white/30 font-mono uppercase">{item.type}</span>
        )}
        {item.status && (
          <span className={`text-xs font-mono px-2 py-0.5 ${
            item.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10' :
            item.status === 'Archived' ? 'text-white/30 bg-white/5' :
            'text-yellow-400 bg-yellow-500/10'
          }`}>
            {item.status}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// VAULT LIST ITEM (List View)
// ============================================
function VaultListItem({ item, category, onEdit, onDelete }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 hover:border-white/30 transition-all group flex items-center gap-4">
      {/* Icon */}
      <div className="w-10 h-10 bg-white/5 flex items-center justify-center">
        {React.createElement(CATEGORIES[category].icon, { size: 18, className: 'text-white/40' })}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-light truncate">{item.title}</h3>
        {item.description && (
          <p className="text-sm text-white/40 truncate">{item.description}</p>
        )}
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="hidden md:flex gap-1">
          {item.tags.slice(0, 3).map((tag, i) => (
            <Tag key={i} color={CATEGORIES[category].color}>{tag}</Tag>
          ))}
          {item.tags.length > 3 && (
            <span className="text-xs text-white/30">+{item.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 text-white/40 hover:text-white transition-colors"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-white/40 hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ============================================
// VAULT MODAL (Add/Edit)
// ============================================
function VaultModal({ isOpen, onClose, onSave, category, title, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    url: '',
    type: '',
    status: 'Active',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          content: initialData.content || '',
          url: initialData.url || '',
          type: initialData.type || '',
          status: initialData.status || 'Active',
          tags: initialData.tags || []
        });
      } else {
        setFormData({
          title: '',
          description: '',
          content: '',
          url: '',
          type: '',
          status: 'Active',
          tags: []
        });
      }
      setTagInput('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const typeOptions = {
    projects: [
      { value: '', label: 'Select type...' },
      { value: 'Client Work', label: 'Client Work' },
      { value: 'Personal', label: 'Personal' },
      { value: 'Experiment', label: 'Experiment' },
      { value: 'Case Study', label: 'Case Study' }
    ],
    assets: [
      { value: '', label: 'Select type...' },
      { value: 'Template', label: 'Template' },
      { value: 'Graphic', label: 'Graphic' },
      { value: 'Video', label: 'Video' },
      { value: 'Audio', label: 'Audio' },
      { value: 'Document', label: 'Document' },
      { value: 'Font', label: 'Font' },
      { value: 'LUT', label: 'LUT' },
      { value: 'Preset', label: 'Preset' }
    ],
    prompts: [
      { value: '', label: 'Select type...' },
      { value: 'System Prompt', label: 'System Prompt' },
      { value: 'Context Block', label: 'Context Block' },
      { value: 'Persona', label: 'Persona' },
      { value: 'Workflow', label: 'Workflow' },
      { value: 'Template', label: 'Template' }
    ],
    links: [
      { value: '', label: 'Select type...' },
      { value: 'Inspiration', label: 'Inspiration' },
      { value: 'Reference', label: 'Reference' },
      { value: 'Tool', label: 'Tool' },
      { value: 'Article', label: 'Article' },
      { value: 'Tutorial', label: 'Tutorial' },
      { value: 'Resource', label: 'Resource' }
    ]
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter title..."
          required
        />

        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description..."
          rows={3}
        />

        {/* Category-specific fields */}
        {category === 'prompts' && (
          <TextArea
            label="Prompt Content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Your prompt or context block..."
            rows={8}
          />
        )}

        {category === 'links' && (
          <Input
            label="URL"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://..."
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            options={typeOptions[category]}
          />

          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Archived', label: 'Archived' }
            ]}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-xs text-white/40 font-mono uppercase tracking-wider">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tag..."
              className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors font-mono text-sm"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, i) => (
                <Tag key={i} onRemove={() => removeTag(tag)}>{tag}</Tag>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-white/60 hover:text-white transition-colors font-mono text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-white text-black px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-white/90 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
