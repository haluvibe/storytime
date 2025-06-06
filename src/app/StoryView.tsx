import { PartialText } from "@blocknote/core";
import "@blocknote/core/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Story } from "./types";

export function StoryView({ story }: { story: Story }) {
  const [stories, setStories] = useLocalStorage<Story[]>("my-stories", []);
  const [error, setError] = useState(false);

  const editor = useCreateBlockNote({
    initialContent: story?.content,
  });

  const saveContentChange = () => {
    const blocks = editor.topLevelBlocks;
    const firstBlock = blocks[0];
    const title =
      firstBlock?.type === "heading"
        ? firstBlock.content
            ?.map((c: PartialText) => c.text)
            .join("")
            .trim()
        : "";
    if (!title) {
      setError(true);
      return;
    }
    setError(false);
    const updatedStories = stories.map((s) =>
      s.title === story.title ? { ...s, title, content: blocks } : s
    );
    setStories(updatedStories);
  };

  // Check if title is empty for disabling the button
  const blocks = editor.topLevelBlocks;
  const firstBlock = blocks[0];
  const title =
    firstBlock?.type === "heading"
      ? firstBlock.content
          ?.map((c: PartialText) => c.text)
          .join("")
          .trim()
      : "";
  const isTitleEmpty = !title;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
        {`The first line (as a heading) is your story's title.`}
      </Typography>
      <BlockNoteView editor={editor} />
      <Button
        variant="contained"
        color={error ? "error" : "primary"}
        onClick={saveContentChange}
        disabled={isTitleEmpty}
        sx={{ mt: 2, mr: 2 }}
      >
        Save
      </Button>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          Please enter a title (first line as heading).
        </Typography>
      )}
    </Box>
  );
}
