import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { Story } from "./types";

export function AddNewStory() {
  const [mode, setMode] = React.useState<"choose" | "ai" | "manual">("choose");
  const [title, setTitle] = React.useState("");
  const [stories, setStories] = useLocalStorage<Story[]>("my-stories", []);

  const handleAddStory = () => {
    if (title.trim()) {
      setStories([
        ...stories,
        {
          title: title.trim(),
          content: [
            {
              type: "heading",
              props: { level: 1 },
              content: [{ type: "text", text: title.trim(), styles: {} }],
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: "", styles: {} }],
            },
          ],
        },
      ]);
      setTitle("");
      setMode("choose");
    }
  };

  if (mode === "ai") {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          AI Story Generator
        </Typography>
        <Typography variant="body1" gutterBottom>
          (Here you can add your AI story generation UI.)
        </Typography>
        <Button variant="outlined" onClick={() => setMode("choose")}>
          Back
        </Button>
      </Box>
    );
  }

  if (mode === "manual") {
    return (
      <Box>
        <Stack spacing={2} direction="column" sx={{ maxWidth: "100%" }}>
          <TextField
            label="Story Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddStory}
            disabled={!title.trim()}
          >
            Add this story
          </Button>
          <Button variant="outlined" onClick={() => setMode("choose")}>
            Back
          </Button>
        </Stack>
      </Box>
    );
  }

  // Default: ask the user
  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        Would you like AI to generate a story for you, or would you like to
        write it yourself?
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setMode("ai")}
        >
          Generate with AI
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setMode("manual")}
        >
          Write myself
        </Button>
      </Stack>
    </Box>
  );
}
