import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
} from "@blocknote/core";
import { en } from "@blocknote/core/locales";
import "@blocknote/core/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { Box, Button, Typography, styled } from "@mui/material";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { routerAtom } from "../atoms/routerAtom";
import { Story } from "./types";

const schema = BlockNoteSchema.create({
  blockSpecs: {
    heading: defaultBlockSpecs.heading,
    paragraph: defaultBlockSpecs.paragraph,
  },
  inlineContentSpecs: {
    text: defaultInlineContentSpecs.text,
    link: defaultInlineContentSpecs.link,
  },
  styleSpecs: {
    textColor: defaultStyleSpecs.textColor,
    backgroundColor: defaultStyleSpecs.backgroundColor,
  },
});

// Custom hook to detect Toolpad's color scheme
function useToolpadColorScheme() {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check multiple possible attributes and log them for debugging
    const checkAttributes = () => {
      const root = document.documentElement;

      // Check for various possible theme indicators
      const toolpadScheme = root.getAttribute("data-toolpad-color-scheme");
      const colorScheme = root.getAttribute("data-color-scheme");
      const muiScheme = root.getAttribute("data-mui-color-scheme");
      const hasLight = root.classList.contains("light");
      const hasDark = root.classList.contains("dark");

      // Determine the actual theme
      let detectedTheme: "light" | "dark" = "light";

      if (
        toolpadScheme === "dark" ||
        colorScheme === "dark" ||
        muiScheme === "dark" ||
        hasDark
      ) {
        detectedTheme = "dark";
      } else if (
        toolpadScheme === "light" ||
        colorScheme === "light" ||
        muiScheme === "light" ||
        hasLight
      ) {
        detectedTheme = "light";
      }

      return detectedTheme;
    };

    // Check initial value
    const initialTheme = checkAttributes();
    setColorScheme(initialTheme);

    // Observer for changes - watch all possible attributes and classes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          const newTheme = checkAttributes();
          setColorScheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-toolpad-color-scheme",
        "data-color-scheme",
        "data-theme",
        "class",
        "data-mui-color-scheme",
      ],
    });

    return () => observer.disconnect();
  }, []);

  return colorScheme;
}

// Styled wrapper to increase paragraph font size by 30%
const StyledBlockNoteWrapper = styled(Box)({
  '& .bn-block-content[data-content-type="paragraph"]': {
    fontSize: "1.3em", // 30% increase
  },
  '& .bn-block-content[data-content-type="paragraph"] p': {
    fontSize: "1.3em", // 30% increase
  },
});

export function StoryView({ story }: { story: Story }) {
  const [stories, setStories] = useLocalStorage<Story[]>("my-stories", []);
  const [error, setError] = useState<string>("");
  const router = useAtomValue(routerAtom);
  const [originalTitle] = useState(story.title);
  const colorScheme = useToolpadColorScheme();

  const editor = useCreateBlockNote({
    initialContent: story?.content as (typeof schema.PartialBlock)[],
    schema,
    dictionary: {
      ...en,
      placeholders: {
        ...en.placeholders,
        heading: "Title",
        default: "Paragraph",
      },
    },
  });

  // Function to remove emojis from text
  const removeEmojis = (text: string): string => {
    // Remove emojis using Unicode ranges
    return text.replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
      ""
    );
  };

  const enforceTitleHeading = () => {
    const blocks = editor.document;
    const firstBlock = blocks[0];

    // Only convert the FIRST block to heading if it's not already
    if (firstBlock && firstBlock.type !== "heading") {
      editor.updateBlock(firstBlock.id, {
        type: "heading",
        props: { level: 1 },
      });
    }

    // Ensure all OTHER blocks (after the first) are paragraphs
    blocks.slice(1).forEach((block) => {
      if (block.type !== "paragraph") {
        editor.updateBlock(block.id, {
          type: "paragraph",
          props: {},
        });
      }
    });

    // Strip formatting from title (first block) and remove emojis
    if (firstBlock && firstBlock.type === "heading" && firstBlock.content) {
      const cleanContent = firstBlock.content.map((item) => {
        if ("text" in item) {
          return {
            type: "text" as const,
            text: removeEmojis(item.text),
            styles: {},
          };
        }
        return item;
      });

      if (JSON.stringify(cleanContent) !== JSON.stringify(firstBlock.content)) {
        editor.updateBlock(firstBlock.id, { content: cleanContent });
      }
    }

    // Clean emojis from all blocks (but don't change their types)
    blocks.forEach((block) => {
      if (block.content && Array.isArray(block.content)) {
        const cleanedContent = block.content.map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "type" in item &&
            item.type === "text" &&
            "text" in item &&
            typeof item.text === "string"
          ) {
            const cleanedText = removeEmojis(item.text);
            if (cleanedText !== item.text) {
              return { ...item, text: cleanedText };
            }
          }
          return item;
        });

        if (JSON.stringify(cleanedContent) !== JSON.stringify(block.content)) {
          editor.updateBlock(block.id, { content: cleanedContent });
        }
      }
    });
  };

  const saveContentChange = () => {
    const blocks = editor.document;
    const firstBlock = blocks[0];
    const title =
      firstBlock?.type === "heading"
        ? firstBlock.content
            ?.filter((c) => "text" in c)
            ?.map((c) => (c as { text: string }).text)
            .join("")
            .trim()
        : "";
    if (!title) {
      setError("Please enter a title (first line as heading).");
      return;
    }

    // Check for duplicate titles (excluding the current story)
    const titleExists = stories.some(
      (s) => s.title !== story.title && s.title === title
    );
    if (titleExists) {
      setError(
        "A story with this title already exists. Please choose a different title."
      );
      return;
    }

    setError("");
    const updatedStories = stories.map((s) =>
      s.title === story.title ? { ...s, title, content: blocks } : s
    );
    setStories(updatedStories);
    if (title !== originalTitle) {
      router?.navigate(`/stories/story-${title}`);
    }
  };

  // Check if title is empty for disabling the button
  const blocks = editor.document;
  const firstBlock = blocks[0];
  const title =
    firstBlock?.type === "heading"
      ? firstBlock.content
          ?.filter((c) => "text" in c)
          ?.map((c) => (c as { text: string }).text)
          .join("")
          .trim()
      : "";
  const isTitleEmpty = !title;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
        {`The first line (as a heading) is your story's title. All subsequent lines are are your story.`}
      </Typography>
      <StyledBlockNoteWrapper>
        <BlockNoteView
          editor={editor}
          onChange={enforceTitleHeading}
          theme={colorScheme}
          emojiPicker={false}
          slashMenu={false}
          sideMenu={false}
          formattingToolbar={false}
          linkToolbar={false}
          filePanel={false}
          tableHandles={false}
        />
      </StyledBlockNoteWrapper>
      <Button
        variant="contained"
        color={error ? "error" : "primary"}
        onClick={saveContentChange}
        sx={{ mt: 2, mr: 2 }}
      >
        Save
      </Button>
      {(error || isTitleEmpty) && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error || "Please enter a title (first line as heading)."}
        </Typography>
      )}
    </Box>
  );
}
