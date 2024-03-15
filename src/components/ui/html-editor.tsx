import { Editor } from "@tinymce/tinymce-react";

interface HtmlEditorProps {
    handleEditorChange?: (content: string) => void;
    valueDefault?: string;
    tagsList?: { value: string; title: string }[];
}

export const HtmlEditor: React.FC<HtmlEditorProps> = ({ handleEditorChange, valueDefault = "", tagsList = [] }) => {
    return (
        <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            onEditorChange={handleEditorChange}
            init={{
                plugins:
                    "autolink charmap emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange formatpainter   permanentpen powerpaste editimage mentions  tableofcontents footnotes mergetags autocorrect typography inlinecss preview visualchars emoticons nonbreaking textpattern code",
                toolbar:
                    "mergetags | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table  | a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat preview",
                extended_valid_elements: "svg[viewBox|width|height]",
                mergetags_prefix: "{{",
                mergetags_suffix: "}}",
                mergetags_list: tagsList,
            }}
            initialValue={valueDefault}
        />
    );
};