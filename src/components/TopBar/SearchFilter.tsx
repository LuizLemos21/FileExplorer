import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import Input, { InputSize } from "../../ui/Input";
import { ISearchFilter } from "./SearchBar";
import { invoke } from "@tauri-apps/api/tauri";
import TagForm from '../Tags/TagForm';

interface Tag {
    id: number;
    name: string;
    parent_id: number | null;
    children? : Tag[]; // estrutura hierárquica de tags
}

interface Props {
    filters: ISearchFilter;
    setFilters: Dispatch<SetStateAction<ISearchFilter>>;
}

export default function SearchFilter({ filters, setFilters }: Props) {
    const [availableTags, setAvailableTags] = useState<Tag[]>([]); // State for dynamic hierarchical tags
    const [showCreateForm, setShowCreateForm] = useState(false); // State for showing the Create Tag form
    const [error, setError] = useState<string | null>(null); // State for error handling

    // Fetch tags from the backend
  const refreshTagList = async () => {
    try {
      const fetchedTags: Tag[] = await invoke("get_tags_hierarchy_handler"); // Call the backend handler
      setAvailableTags(buildTagHierarchy(fetchedTags));
      setError(null); // Clear error on success
    } catch (err: any) {
      console.error("Error fetching tags:", err);
      setError("Failed to fetch tags. Please try again.");
    }
  };

  useEffect(() => {
    refreshTagList();
  }, []);


    // Build hierarchical structure from flat list
  const buildTagHierarchy = (flatTags: Tag[]): Tag[] => {
    const tagMap = new Map<number, Tag>();

    flatTags.forEach((tag) => {
      tagMap.set(tag.id, { ...tag, children: [] });
    });

    const rootTags: Tag[] = [];

    tagMap.forEach((tag) => {
      if (tag.parent_id) {
        const parent = tagMap.get(tag.parent_id);
        parent?.children?.push(tag);
      } else {
        rootTags.push(tag);
      }
    });

    return rootTags;
  };

   // Recursive function to render tags with indentation
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
        {tag.children && renderTags(tag.children, level + 1)}
      </div>
    ));
  };

    // Handle "Accept Files" checkbox
    function onAcceptFilesChange(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.checked && !filters.acceptDirectories) {
            setFilters({
                ...filters,
                acceptFiles: false,
                acceptDirectories: true,
            });
            return;
        }

        setFilters({
            ...filters,
            acceptFiles: e.target.checked,
        });
    }

    // Handle "Accept Folders" checkbox
    function onAcceptDirsChange(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.checked && !filters.acceptFiles) {
            setFilters({
                ...filters,
                acceptDirectories: false,
                acceptFiles: true,
            });
            return;
        }

        setFilters({
            ...filters,
            acceptDirectories: e.target.checked,
        });
    }

    // Handle extension input changes
    function onExtensionChange(e: ChangeEvent<HTMLInputElement>) {
        setFilters({
            ...filters,
            extension: e.target.value,
        });
    }

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


    return (
    <div className="space-x-2 flex justify-center bg-darker p-4 rounded-bl-lg rounded-br-lg w-62">
      <div className="flex flex-col space-y-2">
        <label>Extension</label>
        <label>Files</label>
        <label>Folders</label>
        <label>Tags</label>

        {/* Render hierarchical tags */}
        <div className="flex flex-col space-y-2">
          {availableTags.length > 0 ? (
            renderTags(availableTags)
          ) : (
            <span className="text-gray-400">{error || "No tags available"}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-2 relative">
        <Input
          onChange={(e) => setFilters({ ...filters, extension: e.target.value })}
          value={filters.extension}
          placeholder="ext"
          size={InputSize.Tiny}
          disabled={!filters.acceptFiles}
        />
        <input
          checked={filters.acceptFiles}
          onChange={(e) =>
            setFilters({
              ...filters,
              acceptFiles: e.target.checked,
              acceptDirectories: !e.target.checked ? true : filters.acceptDirectories,
            })
          }
          className="absolute left-2 top-8"
          type="checkbox"
        />
        <input
          checked={filters.acceptDirectories}
          onChange={(e) =>
            setFilters({
              ...filters,
              acceptDirectories: e.target.checked,
              acceptFiles: !e.target.checked ? true : filters.acceptFiles,
            })
          }
          className="absolute left-2 top-16"
          type="checkbox"
        />
      </div>

      {/* Create Tag Button */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="btn btn-primary mt-4"
      >
        Create New Tag
      </button>

      {/* Show the Create Tag Form */}
      {showCreateForm && (
        <TagForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => refreshTagList()}
        />
      )}
    </div>
  );
}