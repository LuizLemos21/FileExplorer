import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import Input, { InputSize } from "../../ui/Input";
import { ISearchFilter } from "./SearchBar";
import { invoke } from "@tauri-apps/api/tauri";
import TagForm from '../Tags/TagForm';
import TagList from '../Tags/TagList';

interface Tag {
  id: number;
  name: string;
  parent_id: number | null;
  children?: Tag[];
}

interface Props {
  filters: ISearchFilter;
  setFilters: Dispatch<SetStateAction<ISearchFilter>>;
}

export default function SearchFilter({ filters, setFilters }: Props) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch tags from the backend
  const refreshTagList = async () => {
    try {
      const fetchedTags: Tag[] = await invoke("get_tags_hierarchy_handler");
      setAvailableTags(buildTagHierarchy(fetchedTags));
    } catch (err) {
      console.error("Error fetching tags:", err);
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

  return (
    <div className="space-x-2 flex justify-center bg-darker p-4 rounded-bl-lg rounded-br-lg w-62">
      <div className="flex flex-col space-y-2">
        <label>Extension</label>
        <label>Files</label>
        <label>Folders</label>
        <label>Tags</label>

        {/* Render TagList */}
        <TagList
          availableTags={availableTags}
          filters={filters}
          setFilters={setFilters}
          refreshTagList={refreshTagList}
        />
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
