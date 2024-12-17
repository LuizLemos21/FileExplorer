import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import Input, { InputSize } from "../../ui/Input";
import { ISearchFilter } from "./SearchBar";
import { invoke } from "@tauri-apps/api/tauri";

interface Tag {
    id: number;
    name: string;
    parent_id: number | null;
}

interface Props {
    filters: ISearchFilter;
    setFilters: Dispatch<SetStateAction<ISearchFilter>>;
}

export default function SearchFilter({ filters, setFilters }: Props) {
    const [availableTags, setAvailableTags] = useState<Tag[]>([]); // State for dynamic tags

    // Fetch tags from the backend
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const fetchedTags: Tag[] = await invoke("get_tags_handler"); // Call the backend handler
                setAvailableTags(fetchedTags);
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        };

        fetchTags();
    }, []);

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
    function onTagChange(tagName: string) {
        const updatedTags = filters.selectedTags.includes(tagName)
            ? filters.selectedTags.filter((t) => t !== tagName)
            : [...filters.selectedTags, tagName];

        setFilters({
            ...filters,
            selectedTags: updatedTags,
        });
    }

    return (
        <div className="space-x-2 flex justify-center bg-darker p-4 rounded-bl-lg rounded-br-lg w-62">
            <div className="flex flex-col space-y-2">
                <label>Extension</label>
                <label>Files</label>
                <label>Folders</label>
                <label>Tags</label>

                {/* Render dynamic tags */}
                <div className="flex flex-col space-y-2">
                    {availableTags.length > 0 ? (
                        availableTags.map((tag) => (
                            <div key={tag.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={filters.selectedTags.includes(tag.name)}
                                    onChange={() => onTagChange(tag.name)}
                                    className="mr-2"
                                />
                                <span>{tag.name}</span>
                            </div>
                        ))
                    ) : (
                        <span className="text-gray-400">No tags available</span>
                    )}
                </div>
            </div>

            <div className="flex flex-col space-y-2 relative">
                <Input
                    onChange={onExtensionChange}
                    value={filters.extension}
                    placeholder="ext"
                    size={InputSize.Tiny}
                    disabled={!filters.acceptFiles}
                />
                <input
                    checked={filters.acceptFiles}
                    onChange={onAcceptFilesChange}
                    className="absolute left-2 top-8"
                    type="checkbox"
                />
                <input
                    checked={filters.acceptDirectories}
                    onChange={onAcceptDirsChange}
                    className="absolute left-2 top-16"
                    type="checkbox"
                />
            </div>
        </div>
    );
}
