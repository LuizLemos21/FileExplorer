import React from "react";

interface Tag {
  id: number;
  name: string;
  parent_id: number | null;
}

interface Props {
  availableTags: Tag[];
  onSelect: (tag: Tag) => void;
  onClose: () => void;
}

const TagListModal: React.FC<Props> = ({ availableTags, onSelect, onClose }) => {
  return (
    <div className="modal">
      <h3>Select a Parent Tag</h3>
      <ul>
        {availableTags.map((tag) => (
          <li
            key={tag.id}
            className="cursor-pointer hover:bg-gray-200"
            onClick={() => onSelect(tag)}
          >
            {tag.name}
          </li>
        ))}
      </ul>
      <button className="btn btn-secondary mt-2" onClick={onClose}>
        Cancel
      </button>
    </div>
  );
};

export default TagListModal;
