import React, { useState, MouseEvent } from "react";
import TagForm from "../Tags/TagForm";
import { invoke } from "@tauri-apps/api/tauri";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { updateContextMenu } from "../../state/slices/contextMenuSlice";
import { ContextMenuType } from "../../types";

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
  const dispatch = useAppDispatch();

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

  // Recursive function to render tags with indentation
  const renderTags = (tags: Tag[], level = 0) => {
    return tags.map((tag) => (
      <div
        key={tag.id}
        style={{ marginLeft: `${level * 20}px` }}
        className="relative group hover:bg-gray-400 p-1"
        onContextMenu={(e) => handleContextMenu(e, tag)} // Handle right-click
      >
        <input
          type="checkbox"
          checked={filters.selectedTags.includes(tag.name)}
          onChange={() => onTagChange(tag)}
          className="mr-2"
        />
        {/* <span>id: {tag.id} - name: </span>   Only for testing purposes */}
        <span>{tag.name}</span>
        {tag.children && renderTags(tag.children, level + 1)}
      </div>
    ));
  };

  // Handle context menu actions
  const handleContextMenu = (e: MouseEvent<HTMLDivElement>, tag: Tag) => {
    e.preventDefault();
    e.stopPropagation(); //Prevents the event from reaching the General Context menu

    dispatch(
      updateContextMenu({
        currentContextMenu: ContextMenuType.TagEntity,
        mouseX: e.pageX,
        mouseY: e.pageY,
        contextMenuPayload: { tagId: tag.id, tagName: tag.name },
      })
    );
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

  // Delete tag action


  const handleDelete = async() => {
    const { contextMenuPayload } = useAppSelector((state) => state.contextMenu); //Gets current payload
    const dispatch = useAppDispatch;

    if (!contextMenuPayload?.tagId){
      console.error("No tagId found in context menu payload");
      return;
    }

    const tagId = contextMenuPayload.tagId;
    const tagName = contextMenuPayload.tagName;

    if (window.confirm ('Are you sure you want to delete the tag "${tagName}"?')){
      try {
        //Call the backend handler to delete this tag
        await invoke ("delete_tag_handler",{tag_id: tagId});

        //Refresh the tag list
        await refreshTagList();

        //clear the Context Menu

        
        console.log ('Tag "${tagName}" deleted sucessfully.');
      }catch (err){
        console.error("Error deleting tag:", err);
        alert("Failed to delete tag. Please try again");
      }
    }
  }

  return (
    <div>
      {renderTags(availableTags)}
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
