import React, { useState } from "react";
import TagForm from "./TagForm";
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
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number; tag: Tag } | null>(null);

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

  const renderTags = (tags: Tag[], level = 0) => {
    return tags.map((tag) => (
      <div
        key={tag.id}
        style={{ marginLeft: `${level * 20}px` }}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenu({ mouseX: e.clientX, mouseY: e.clientY, tag });
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

  const onTagChange = (tag: Tag) => {
    // Selection/deselection logic
  };

  return (
    <div>
      {renderTags(availableTags)}
      {contextMenu && (
        <ContextMenu
          options={[
            { name: "Update", onClick: () => setEditingTag(contextMenu.tag) },
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
