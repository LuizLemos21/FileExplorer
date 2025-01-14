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
  const [selectedParentTag, setSelectedParentTag] = useState<Tag | null>(null);

  const onTagChange = (tag: Tag) => {
    let updatedTags = [...filters.selectedTags];

    if (updatedTags.includes(tag.id.toString())) {
      updatedTags = updatedTags.filter((t) => !isTagOrDescendant(tag, parseInt(t)));
    } else {
      updatedTags = [...updatedTags, ...getAllDescendants(tag).map((t) => t.id.toString())];
    }

    setFilters({ ...filters, selectedTags: updatedTags });
  };

  const getAllDescendants = (tag: Tag): Tag[] => {
    let descendants: Tag[] = [tag];
    if (tag.children) {
      tag.children.forEach((child) => {
        descendants = descendants.concat(getAllDescendants(child));
      });
    }
    return descendants;
  };

  const isTagOrDescendant = (tag: Tag, selectedTagId: number) => {
    return tag.id === selectedTagId || getAllDescendants(tag).some((descendant) => descendant.id === selectedTagId);
  };

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
          checked={filters.selectedTags.includes(tag.id.toString())}
          onChange={() => onTagChange(tag)}
          className="mr-2"
        />
        <span>{tag.name}</span>
        {tag.children && renderTags(tag.children, level + 1)}
      </div>
    ));
  };

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

  return <div>{renderTags(availableTags)}</div>;
};

export default TagList;