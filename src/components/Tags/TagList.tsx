import React, { useState } from "react";
import TagForm from "../Tags/TagForm";
import ContextMenu from "../ContextMenus/ContextMenu";
import { invoke } from "@tauri-apps/api/tauri";


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
    const [error, setError] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);



  // Recursive function to render tags with indentation
  const renderTags = (tags: Tag[], level = 0) => {
    return tags.map((tag) => (
      <div
        key={tag.id}
        style={{ marginLeft: `${level * 20}px` }}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ x: e.clientX, y: e.clientY });        
        }}
      >
        <input
          type="checkbox"
          checked={filters.selectedTags.includes(tag.name)}
          onChange={() => onTagChange(tag)}
          className="mr-2"
        />
        <span>{tag.name}</span>
        {tag.children && renderTags(tag.children, level + 1)}
      </div>
    ));
  };



  // Handle tag selection or deselection
  const onTagChange = (tag: Tag) => {
    let updatedTags = [...filters.selectedTags];

    // If the tag is already selected, deselect it and all its children
    if (updatedTags.includes(tag.name)) {
      updatedTags = updatedTags.filter((t) => !isTagOrDescendant(tag, t));
    } else {
      // If the tag is not selected, select it and all its children
      updatedTags = [...updatedTags, ...getAllDescendants(tag).map((t) => t.name)];
    }

    setFilters({ ...filters, selectedTags: updatedTags });
  };

  // Function to get all descendants of a tag
  const getAllDescendants = (tag: Tag): Tag[] => {
    let descendants: Tag[] = [tag];
    if (tag.children) {
      tag.children.forEach((child) => {
        descendants = [...descendants, ...getAllDescendants(child)];
      });
    }
    return descendants;
  };

  // Function to check if a tag or one of its descendants is selected
  const isTagOrDescendant = (tag: Tag, selectedTag: string) => {
    return tag.name === selectedTag || getAllDescendants(tag).some((descendant) => descendant.name === selectedTag);
  };

  const handleDelete = async (tagId: number) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      try {
        await invoke("delete_tag_handler", { tag_id: tagId });
        await refreshTagList();
      } catch (err) {
        console.error("Error deleting tag:", err);
        alert("Failed to delete tag.");
      }
    }
  };

  return (
    <div>
      {renderTags(availableTags)}
      {ContextMenu && (
        <ContextMenu
          options={[
            { name: "Update", onClick: () => setEditingTag(ContextMenu.tag) },
            { name: "Delete", onClick: () => handleDelete(contextMenu.tag.id) },
          ]}
        />
      )}
      {editingTag && (
        <TagForm
          tag={editingTag}
          onClose={() => setEditingTag(null)}
          onSuccess={() => {
            setEditingTag(null);
            refreshTagList();
          }}
        />
      )}
    </div>
  );
};

export default TagList;