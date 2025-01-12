import React, { useState, MouseEvent } from "react";
import TagForm from "../Tags/TagForm";
import { invoke } from "@tauri-apps/api/tauri";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import { updateContextMenu } from "../../state/slices/contextMenuSlice";
import { ContextMenuType } from "../../types";
import InputModal from "../InputModal";
import TagListModal from "./TagListModal";

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
  
}

const TagList: React.FC<Props> = ({ availableTags, filters, setFilters }) => {
  const dispatch = useAppDispatch(); // Redux dispatch function
  const [editingTag, setEditingTag] = useState<Tag | null>(null); // State for the tag being edited
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false); // State for the create tag modal
  const [newTagName, setNewTagName] = useState<string>("");
  //const setAvailableTags = useState<Tag[]>([])[1];
  const [selectedParentTag, setSelectedParentTag] = useState<Tag | null>(null);



  const [parentTag, setParentTag] = useState<Tag | null>(null);
  const [showInput, setShowInput] = useState<boolean>(false);
  const [showParentSelector, setShowParentSelector] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);



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


  const handleCreateTag = async () => {
    console.log("Creating tag with name:", newTagName, "and parent ID:", selectedParentTag?.id);

    try {
      await invoke("create_tag_handler", { name: newTagName, parent_id: selectedParentTag?.id });
      setShowCreateModal(false);
      setNewTagName("");
      setSelectedParentTag(null);
      //refreshTagList();
    } catch (e) {
      alert(e);
    }
  }

  return (
    <div>
      {renderTags(availableTags)}
      <button onClick={() => setShowCreateModal(true)} className="btn btn-primary mt-2">
        Create New Tag
      </button>
      {editingTag && (
        <TagForm
          tag={editingTag}
          onClose={() => setEditingTag(null)}
          onSuccess={() => {
            setEditingTag(null);
            // refreshTagList(); implement this function
          }}
        />
      )}
      {showCreateModal && (
        <InputModal
          shown={showCreateModal}
          setShown={setShowCreateModal}
          title="Create New Tag"
          onSubmit={handleCreateTag}
          submitName="Create"
        >
          <input
            type="text"
            value={newTagName}
            onChange={(e) => {
              console.log("New tag name:", e.target.value); // Debugging statement
              setNewTagName(e.target.value);
            }}
            placeholder="Tag Name"
            className="block w-full mb-2"
          />
          <div className="block w-full mb-2">
            <label>Select Parent Tag:</label>
            <select
              value={selectedParentTag?.id || ""}
              onChange={(e) => {
                const selectedTag = availableTags.find((tag) => tag.id === parseInt(e.target.value));
                setSelectedParentTag(selectedTag || null);
              }}
              className="block w-full"
            >
              <option value="">None</option>
              {availableTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </InputModal>
      )}
    </div>
  );
};

export default TagList;