import "@blocknote/core/style.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { Box, Button, Typography } from "@mui/material";
import { useLocalStorage } from "usehooks-ts";
import { Story } from "./types";

export function StoryView({ story }: { story: Story }) {
  const [stories, setStories] = useLocalStorage<Story[]>("my-stories", []);
  const editor = useCreateBlockNote({
    initialContent: story?.content,
  });

  const handleContentChange = () => {
    if (story) {
      const updatedStories = stories.map((s) =>
        s.title === story.title ? { ...s, content: editor.topLevelBlocks } : s
      );
      setStories(updatedStories);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {story?.title}
      </Typography>
      <Box sx={{ height: "500px", border: "1px solid #ccc", borderRadius: 1 }}>
        <BlockNoteView editor={editor} onChange={handleContentChange} />
      </Box>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => window.history.back()}
        sx={{ mt: 2 }}
      >
        Back to Stories
      </Button>
    </Box>
  );
}
