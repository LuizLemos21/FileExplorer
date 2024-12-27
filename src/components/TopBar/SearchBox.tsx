import React, { ChangeEvent, Dispatch, SetStateAction } from "react";
import Input, { InputSize } from "../../ui/Input";
import { ISearchFilter } from "./SearchBar";


interface Props {
  filters: ISearchFilter;
  setFilters: Dispatch<SetStateAction<ISearchFilter>>;
}

export default function SearchBox({ filters, setFilters }: Props) {
  return (
    <div className="space-y-2">
      <label>Extension</label>
      <Input
        onChange={(e) => setFilters({ ...filters, extension: e.target.value })}
        value={filters.extension}
        placeholder="ext"
        size={InputSize.Tiny}
      />
      <div>
        <label>
          <input
            type="checkbox"
            checked={filters.acceptFiles}
            onChange={(e) =>
              setFilters({
                ...filters,
                acceptFiles: e.target.checked,
                acceptDirectories: !e.target.checked ? true : filters.acceptDirectories,
              })
            }
          />
          Accept Files
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={filters.acceptDirectories}
            onChange={(e) =>
              setFilters({
                ...filters,
                acceptDirectories: e.target.checked,
                acceptFiles: !e.target.checked ? true : filters.acceptFiles,
              })
            }
          />
          Accept Folders
        </label>
      </div>
    </div>
  );
}
