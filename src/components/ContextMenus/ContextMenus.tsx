import { ContextMenuType, DirectoryContent } from "../../types";
import ContextMenu from "./ContextMenu";
import { useAppDispatch, useAppSelector } from "../../state/hooks";
import InputModal from "../InputModal";
import { useState } from "react";
import { confirm } from "@tauri-apps/api/dialog";
import {
  DirectoryEntityContextPayload,
  GeneralContextPayload,
  TagContextPayload,
} from "../../state/slices/contextMenuSlice";
import { createFile, createDirectory, deleteFile, renameFile } from "../../ipc";
import {
  addContent,
  deleteContent,
  renameContent,
  selectContentIdx,
} from "../../state/slices/currentDirectorySlice";
import { createDirectoryContent, removeFileNameFromPath } from "../../util";
import { invoke } from "@tauri-apps/api/tauri";
import {} from "../Tags/TagList";



export default function ContextMenus() {
  const { currentContextMenu, contextMenuPayload } = useAppSelector(
    (state) => state.contextMenu
  );
  const [newFileShown, setNewFileShown] = useState(false);
  const [newDirectoryShown, setNewDirectoryShown] = useState(false);
  const [renameFileShown, setRenameFileShown] = useState(false);
  const [editingTag, setEditingTag] = useState<TagContextPayload | null>(null);

  const directoryEntityPayload = contextMenuPayload as DirectoryEntityContextPayload;
  const generalPayload = contextMenuPayload as GeneralContextPayload;
  const tagPayload = contextMenuPayload as TagContextPayload;

  const dispatch = useAppDispatch();

  async function onNewFile(name: string) {
    try {
      const path = generalPayload.currentPath + "\\" + name;
      await createFile(path);

      const newDirectoryContent = createDirectoryContent("File", name, path);
      dispatch(addContent(newDirectoryContent));
      dispatch(selectContentIdx(0)); // Select top item as content is added to the top.
    } catch (e) {
      alert(e);
    }
  }

  async function onNewFolder(name: string) {
    try {
      const path = generalPayload.currentPath + "\\" + name;
      await createDirectory(path);

      const newDirectoryContent = createDirectoryContent("Directory", name, path);
      dispatch(addContent(newDirectoryContent));
      dispatch(selectContentIdx(0)); // Select top item as content is added to the top.
    } catch (e) {
      alert(e);
    }
  }

  async function onRename(newName: string) {
    try {
      const path = removeFileNameFromPath(directoryEntityPayload.filePath);
      const oldPath = path + "\\" + directoryEntityPayload.fileName;
      const newPath = path + "\\" + newName;

      await renameFile(oldPath, newPath);

      const oldContent = createDirectoryContent(
        directoryEntityPayload.type,
        directoryEntityPayload.fileName,
        oldPath
      );
      const newContent = createDirectoryContent(
        directoryEntityPayload.type,
        newName,
        newPath
      );

      dispatch(renameContent([oldContent, newContent]));
      dispatch(selectContentIdx(0)); // Select top item as content is added to the top.
    } catch (e) {
      alert(e);
    }
  }

  async function onDelete() {
    const result = await confirm(
      `Are you sure you want to delete "${directoryEntityPayload.fileName}"?`
    );
    if (!result) return;

    try {
      await deleteFile(directoryEntityPayload.filePath);
      const content = createDirectoryContent(
        directoryEntityPayload.type,
        directoryEntityPayload.fileName,
        directoryEntityPayload.filePath
      );
      dispatch(deleteContent(content));
    } catch (e) {
      alert(e);
    }
  }


  async function onDeleteTag() {
    const result = await confirm(
      `Are you sure you want to delete "${tagPayload.tagName}"?`
    );
    if (!result) return;

    try {
      console.log("calling delete_tag handler on Tag with id:", tagPayload.tagId);
      await invoke("delete_tag_handler", { tagId: tagPayload.tagId });
      //refreshTagList();

      setEditingTag(null);
    } catch (e) {
      alert(e);
    }
  }

/*
  async function onAssociateTag(){
    try{
      await invoke("tag_file_handler", 
       name: directoryEntityPayload.fileName,
       path: directoryEntityPayload.filePath,
       tag_ids: selectedTags,
    });
  }
    */

  return (
    <>
      {currentContextMenu == ContextMenuType.General ? (
        <ContextMenu
          options={[
            { name: "New File", onClick: () => setNewFileShown(true) },
            { name: "New Folder", onClick: () => setNewDirectoryShown(true) },
          ]}
        />
      ) : currentContextMenu == ContextMenuType.DirectoryEntity ? (
        <ContextMenu
          options={[
            { name: "Associate Tag", onClick: () => console.log("Associate a tag to this File") }, // Add tag-file logic
            { name: "Rename", onClick: () => setRenameFileShown(true) },
            { name: "Delete", onClick: async () => onDelete() },
          ]}
        />
      ) : currentContextMenu == ContextMenuType.TagEntity ? (
        <ContextMenu
          options={[
            { name: "Update", onClick: () => setEditingTag(tagPayload) },
            { name: "Delete", onClick: async () => onDeleteTag() },
          ]}
        />
      ) : (
        ""
      )}

      {/* Input Modals */}
      <InputModal
        shown={newFileShown}
        setShown={setNewFileShown}
        title="New File"
        onSubmit={onNewFile}
        submitName="Create"
        children={undefined}      

      />
      <InputModal
        shown={newDirectoryShown}
        setShown={setNewDirectoryShown}
        title="New Folder"
        onSubmit={onNewFolder}
        submitName="Create"
        children={undefined}      

        
      />
      <InputModal
        shown={renameFileShown}
        setShown={setRenameFileShown}
        title="Rename File"
        onSubmit={onRename}
        submitName="Rename" 
        children={undefined}      />
      {editingTag && (
        <InputModal
          shown={!!editingTag}
          setShown={() => setEditingTag(null)}
          title="Update Tag"
          onSubmit={async (newName) => {
            try {
              console.log("Calling update tag handler on tag with ID:", editingTag.tagId, "New name:", newName);
              await invoke("update_tag_handler", { tagId: editingTag.tagId, newName: newName, parent_id: null });
              setEditingTag(null);
            } catch (e) {
              alert(e);
            }
          } }
          submitName="Update" 
          children={undefined}        />
      )}
    </>
  );
}

