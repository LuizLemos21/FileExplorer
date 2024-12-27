import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { DirectoryContent, Volume } from "./types";
import { openDirectory } from "./ipc";
import VolumeList from "./components/MainBody/Volumes/VolumeList";
import FolderNavigation from "./components/TopBar/FolderNavigation";
import { DirectoryContents } from "./components/MainBody/DirectoryContents";
import useNavigation from "./hooks/useNavigation";
import SearchBar from "./components/TopBar/SearchBar";
import { useAppDispatch, useAppSelector } from "./state/hooks";
import useContextMenu from "./hooks/useContextMenu";
import ContextMenus from "./components/ContextMenus/ContextMenus";
import {
  selectDirectoryContents,
  unselectDirectoryContents,
  updateDirectoryContents
} from "./state/slices/currentDirectorySlice";
import { DIRECTORY_ENTITY_ID } from "./components/MainBody/DirectoryEntity";

interface Tag {
  id: number;
  name: string;
  parent_id: number | null;
  children?: Tag[];
}

function App() {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]); // State for tags
  const directoryContents = useAppSelector(selectDirectoryContents);
  const dispatch = useAppDispatch();
  const [searchResults, setSearchResults] = useState<DirectoryContent[]>([]);

  const {
    pathHistory,
    historyPlace,
    setHistoryPlace,
    onBackArrowClick,
    onForwardArrowClick,
    canGoBackward,
    canGoForward,
    currentVolume,
    setCurrentVolume,
  } = useNavigation(searchResults, setSearchResults);

  // Function to refresh the tag list
  const refreshTagList = async () => {
    try {
      const fetchedTags: Tag[] = await invoke("get_tags_hierarchy_handler"); // Fetch tags from backend
      setAvailableTags(fetchedTags); // Update state
    } catch (err) {
      console.error("Failed to refresh tags:", err);
    }
  };

  // Fetch volumes
  async function getVolumes() {
    if (volumes.length > 0) {
      return;
    }

    const newVolumes = await invoke<Volume[]>("get_volumes");
    setVolumes(newVolumes);
  }

  async function getNewDirectoryContents() {
    const contents = await openDirectory(pathHistory[historyPlace]);
    dispatch(updateDirectoryContents(contents));
  }

  async function onVolumeClick(mountpoint: string) {
    if (pathHistory[pathHistory.length - 1] !== mountpoint) {
      pathHistory.push(mountpoint);
    }
    setHistoryPlace(pathHistory.length - 1);
    setCurrentVolume(mountpoint);

    await getNewDirectoryContents();
  }

  async function onDirectoryClick(filePath: string) {
    if (searchResults.length > 0) {
      setSearchResults([]);
    }

    pathHistory.push(filePath);
    setHistoryPlace(pathHistory.length - 1);

    await getNewDirectoryContents();
  }

  let render = 0;

  useEffect(() => {
    if (render === 0) {
      getVolumes().catch(console.error);
      refreshTagList().catch(console.error); // Fetch tags initially
    }
    render += 1; // Prevent multiple renders
  }, []);

  useEffect(() => {
    if (pathHistory[historyPlace] === "") {
      setCurrentVolume("");
      return;
    }

    getNewDirectoryContents().catch(console.error);
  }, [historyPlace]);

  const [handleMainContextMenu, handleCloseContextMenu] = useContextMenu(dispatch, pathHistory[historyPlace]);

  return (
    <div
      className="h-full"
      onClick={(e) => {
        handleCloseContextMenu(e);

        if (e.target instanceof HTMLElement) {
          if (e.target.id === DIRECTORY_ENTITY_ID) return;
        }

        dispatch(unselectDirectoryContents());
      }}
      onContextMenu={handleMainContextMenu}
    >
      <ContextMenus />

      <div className="p-4">
        <FolderNavigation
          onBackArrowClick={onBackArrowClick}
          canGoBackward={canGoBackward()}
          onForwardArrowClick={onForwardArrowClick}
          canGoForward={canGoForward()}
        />

        <div className="pb-5">
          {/* Pass tags and refresh function to SearchBar */}
          <SearchBar
            filters={{
              selectedTags: [],
              extension: "",
              acceptFiles: true,
              acceptDirectories: false,
            }}
            setFilters={(newFilters: any) => {
              console.log(newFilters); // Replace with your filter logic
            }}
            availableTags={availableTags} // Pass available tags
            refreshTagList={refreshTagList} // Pass refresh function
          />

          <div className="w-7/12">
            {pathHistory[historyPlace] === "" && searchResults.length === 0 ? (
              <VolumeList volumes={volumes} onClick={onVolumeClick} />
            ) : (
              <DirectoryContents
                content={
                  searchResults.length === 0 ? directoryContents : searchResults
                }
                onDirectoryClick={onDirectoryClick}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
