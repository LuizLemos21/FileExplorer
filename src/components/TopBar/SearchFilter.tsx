import Input, {InputSize} from "../../ui/Input";
import {ChangeEvent, Dispatch, SetStateAction} from "react";
import {ISearchFilter} from "./SearchBar";
import { filter } from "lodash";

interface Props {
    filters: ISearchFilter;
    setFilters: Dispatch<SetStateAction<ISearchFilter>>;
}

export default function SearchFilter({ filters, setFilters }: Props) {

    // tags hard-coded (SUBSTITUIR DEPOIS POR TAGS GERADAS DE FORMA DINÂMICA)
    const availableTags = ["tag1","tag2","tag3","tag4","tag5","tag6"];

    // gerenciar mudanças na checkbox "Accept Files"
    function onAcceptFilesChange(e: ChangeEvent<HTMLInputElement>) {

        //verifica se a checkbox está não marcada e "Accept Directiories" está marcada para previnir seleções conflitantes
        if (!e.target.checked && !filters.acceptDirectories) {
            setFilters({
                ...filters,
                acceptFiles: false,
                acceptDirectories: true,  //Default, aceita diretórios
            });

            return;
        }

        // se a checkbox está marcada, atualiza o "Accept Files"
        setFilters({
            ...filters,
            acceptFiles: e.target.checked,
        });
    }

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

    function onExtensionChange(e: ChangeEvent<HTMLInputElement>) {
        setFilters({
            ...filters,
            extension: e.target.value,
        })
    }

    //Função para gerenciar a seleção ou deseleção de tags
    function onTagChange(tag: string){
        const updatedTags = filters.selectedTags.includes(tag)
            ? filters.selectedTags.filter(t => t !== tag)
            : [...filters.selectedTags, tag];
        
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

                {/* Renderiza as tags disponíveis como checkboxes */}
                <div className="flex flex-col space-y-2">
                    {availableTags.map(tag => (
                        <div key = {tag} className = "flex items-center">
                            <input 
                                type="checkbox"
                                checked={filters.selectedTags.includes(tag)}
                                onChange={() => onTagChange(tag)}
                                className="mr-2"
                            />
                            <span>{tag}</span>
                   
                        </div>
                 ))}
                 </div>
            </div>

            <div className="flex flex-col space-y-2 relative">
                <Input onChange={onExtensionChange} value={filters.extension} placeholder="ext" size={InputSize.Tiny} disabled={!filters.acceptFiles} />
                <input
                    checked={filters.acceptFiles}
                    onChange={onAcceptFilesChange}
                    className="absolute left-2 top-8" type="checkbox"
                />
                <input
                    checked={filters.acceptDirectories}
                    onChange={onAcceptDirsChange}
                    className="absolute left-2 top-16" type="checkbox"
                />
            </div>
        </div>
    )
}