import React, { useState, useEffect } from 'react';
import { invoke } from "@tauri-apps/api/tauri";


interface TagFormProps {
  tag?: { id: number; name: string; parent_id: number | null }; // Optional for Update
  onClose: () => void;
  onSuccess: () => void;
}

const TagForm: React.FC<TagFormProps> = ({ tag, onClose, onSuccess }) => {
  const [tagName, setTagName] = useState(tag?.name || '');
  const [parentId, setParentId] = useState<number | null>(tag?.parent_id || null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const route = tag ? 'update_tag_handler' : 'create_tag_handler';
      const body = tag
        ? { tag_id: tag.id, new_name: tagName, parent_id: parentId }
        : { name: tagName, parent_id: parentId };

      const res = await invoke(route, body);

      if (res) {
        onSuccess(); // Notify parent to refresh the tag list
        onClose(); // Close the form
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  };

  return (
    <div className="tag-form">
      <h3>{tag ? 'Update Tag' : 'Create New Tag'}</h3>

      {/* Error Message */}
      {error && <p className="error">{error}</p>}

      {/* Tag Name */}
      <div>
        <label>Tag Name:</label>
        <input
            type="text"
            value={tagName}
            onChange={(e) => setTagName(e.target.value)}
            style={{ color: "black", backgroundColor: "white", padding: "4px" }}
            />
      </div>

      {/* Parent Tag Selection */}
      <div>
        <label>Parent Tag:</label>
        <select
          value={parentId || ''}
          onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">None</option>
          {/* Render collapsible list of parent tags here */}
        </select>
      </div>

      {/* Buttons */}
      <div>
        <button onClick={handleSubmit} className="btn btn-success">
          {tag ? 'Update Tag' : 'Create Tag'}
        </button>
        <button onClick={onClose} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TagForm;
