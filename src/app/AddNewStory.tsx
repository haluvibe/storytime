import "@blocknote/core/style.css";
import "@blocknote/mantine/style.css";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import { routerAtom } from "../atoms/routerAtom";
import { Story } from "./types";

export function AddNewStory() {
  const [mode, setMode] = React.useState<"choose" | "ai" | "manual">("choose");
  const [title, setTitle] = React.useState("");
  const [error, setError] = React.useState<string>("");
  const [stories, setStories] = useLocalStorage<Story[]>("my-stories", []);
  const router = useAtomValue(routerAtom);

  const handleAddStory = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Please enter a title.");
      return;
    }

    // Check for duplicate titles
    const titleExists = stories.some((story) => story.title === trimmedTitle);
    if (titleExists) {
      setError(
        "A story with this title already exists. Please choose a different title."
      );
      return;
    }

    // Clear any previous errors
    setError("");

    setStories([
      ...stories,
      {
        title: trimmedTitle,
        content: [
          {
            type: "heading",
            props: { level: 1 },
            content: [{ type: "text", text: trimmedTitle, styles: {} }],
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
    router?.navigate(`/stories/story-${trimmedTitle}`);
  };

  // Clear error when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (error) {
      setError("");
    }
  };

  if (mode === "ai") {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          AI Story Generator
        </Typography>
        <Typography variant="body1" gutterBottom>
          (Coming soon.)
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
            onChange={handleTitleChange}
            fullWidth
            error={!!error}
            helperText={error}
          />
          <Button
            variant="contained"
            color={error ? "error" : "primary"}
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
