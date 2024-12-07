/**
 * Use this file for JavaScript code that you want to run in the front-end
 * on posts/pages that contain this block.
 *
 * When this file is defined as the value of the `viewScript` property
 * in `block.json` it will be enqueued on the front end of the site.
 *
 * Example:
 *
 * ```js
 * {
 *   "viewScript": "file:./view.js"
 * }
 * ```
 *
 * If you're not making any changes to this file because your project doesn't need any
 * JavaScript running in the front-end, then you should delete this file and remove
 * the `viewScript` property from `block.json`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script
 */

/* eslint-disable no-console */
console.log("Hello World! (from create-block-orcid-data-2 block)");
/* eslint-enable no-console */
/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from "@wordpress/i18n";
import { useState, createRoot } from "@wordpress/element";

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from "@wordpress/block-editor";

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import "./editor.scss";

import {
    __experimentalHeading as Heading,
    __experimentalItemGroup as ItemGroup,
    __experimentalItem as Item,
} from "@wordpress/components";

import { sections } from "./sections";
import { getProcessedData } from "./processdata";

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
function OrcidDataBlock2({ attributes }) {
    const { orcid_id } = attributes || "";
    const { starting_heading_level } = attributes || 2;
    const { verified_orcid_id } = attributes || false;
    const [items, setItems] = useState({});

    if (orcid_id && verified_orcid_id) {
        fetchData();
    }

    async function fetchData() {
        try {
            const response = await fetch(
                `/wp-json/custom/v1/orcid-proxy?orcid_id=${orcid_id}`,
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const result = await response.json();
            setItems(getProcessedData(result));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    function isSectionShown(section) {
        return attributes[`${sections[section].id}_show`];
    }

    function hasNoItems(section) {
        if (!items[section]) {
            return true;
        }
        return items[section].length == 0;
    }

    function canExclude(section) {
        return sections[section].can_exclude;
    }

    function excludedItems(section) {
        let i = [];
        if (canExclude(section)) {
            i = attributes[`${sections[section].id}_excluded`] || {};
        }
        return i;
    }

    return (
        <>
            {(verified_orcid_id && (
                <div {...useBlockProps()}>
                    {Object.keys(sections).map(
                        (section) =>
                            isSectionShown(section) &&
                            !hasNoItems(section) && (
                                <section style={{ marginBottom: "2rem" }}>
                                    <Heading level={starting_heading_level}>
                                        {sections[section].term}
                                    </Heading>
                                    <ItemGroup>
                                        {items[section].map(
                                            (item) =>
                                                excludedItems(section)[
                                                    item.path
                                                ] !== false && (
                                                    <Item>
                                                        {item.display_label}
                                                    </Item>
                                                ),
                                        )}
                                    </ItemGroup>
                                </section>
                            ),
                    )}
                </div>
            )) || (
                <p
                    {...useBlockProps()}
                    style={{ padding: "2rem", border: "1px solid #ddd" }}
                    role="alert"
                >
                    Please provide your ORCID iD
                </p>
            )}
        </>
    );
}
window.addEventListener("DOMContentLoaded", () => {
    const blocks = document.querySelectorAll(".orcid-data-block-2");
    blocks.forEach((block) => {
        const root = createRoot(block);
        const attributes = JSON.parse(block.getAttribute("data-attributes"));
        root.render(<OrcidDataBlock2 attributes={attributes} />);
    });
});
