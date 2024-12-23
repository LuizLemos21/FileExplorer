import React, { useState } from "react";
import TagForm from "../Tags/TagForm";
import { invoke } from '@tauri-apps/api/tauri';

interface Tag {
  id: number;
  name: string;
  parent_id: number | null;
  children?: Tag[];
}

interface Props {
  availableTags: Tag[];
  filters: {
    selectedTags: string[];
  };
  setFilters: (filters: any) => void;
  refreshTagList: () => Promise<void>;
}

const TagList: React.FC<Props> = ({ availableTags, filters, setFilters, refreshTagList }) => {
  const [editingTag, setEditingTag] = useState<Tag | null>(null); // State for the tag being edited

  const renderTags = (tags: Tag[], level = 0) => {
    return tags.map((tag) => (
      <div key={tag.id} style={{ marginLeft: `${level * 20}px` }}>
        <input
          type="checkbox"
          checked={filters.selectedTags.includes(tag.name)}
          onChange={() => onTagChange(tag)}
          className="mr-2"
        />
        <span>{tag.name}</span>

        {/* Update and Delete options */}
        <button onClick={() => setEditingTag(tag)}>Update</button>
        <button onClick={() => handleDelete(tag.id)}>Delete</button>

        {tag.children && renderTags(tag.children, level + 1)}
      </div>
    ));
  };

  const onTagChange = (tag: Tag) => {
    // Logic for tag selection/deselection (unchanged from earlier implementation)
  };

  const handleDelete = async (tagId: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this tag?");
    if (confirmed) {
      try {
        await invoke("delete_tag_handler", { tag_id: tagId });
        await refreshTagList(); // Refresh tag list after deletion
      } catch (err: any) {
        console.error("Error deleting tag:", err);
        alert("Failed to delete tag. Please try again.");
      }
    }
  };

  return (
    <div className="tag-list">
      {renderTags(availableTags)}

      {/* Show TagForm for updating */}
      {editingTag && (
        <TagForm
          tag={editingTag} // Pass the tag to edit
          onClose={() => setEditingTag(null)}
          onSuccess={() => {
            setEditingTag(null);
            refreshTagList(); // Refresh tag list after update
          }}
        />
      )}
    </div>
  );
};

export default TagList;
