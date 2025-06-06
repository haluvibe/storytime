"use client";

import BarChartIcon from "@mui/icons-material/BarChart";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import LayersIcon from "@mui/icons-material/Layers";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { createTheme } from "@mui/material/styles";
import { AppProvider, Navigation, Router } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { useSetAtom } from "jotai";
import * as React from "react";
import { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { routerAtom } from "../atoms/routerAtom";
import { AddNewStory } from "./AddNewStory";
import { StoryView } from "./StoryView";
import { Story } from "./types";

const NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    segment: "home",
    title: "Home",
    icon: <DashboardIcon />,
  },
  {
    segment: "orders",
    title: "Orders",
    icon: <ShoppingCartIcon />,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Analytics",
  },
  {
    segment: "stories",
    title: "My Stories",
    icon: <BarChartIcon />,
    children: [
      {
        segment: "add",
        title: "Add a new story",
        icon: <DescriptionIcon />,
      },
    ],
  },
  {
    segment: "integrations",
    title: "Integrations",
    icon: <LayersIcon />,
  },
];

const demoTheme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function useDemoRouter(initialPath: string): Router {
  const [pathname, setPathname] = React.useState(initialPath);

  const router = React.useMemo(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path: string | URL) => setPathname(String(path)),
    };
  }, [pathname]);

  return router;
}

export default function DashboardLayoutBasic() {
  const setRouter = useSetAtom(routerAtom);
  const router = useDemoRouter("/");

  const [stories] = useLocalStorage<Story[]>("my-stories", []);
  const [navigation, setNavigation] = React.useState(NAVIGATION);

  React.useEffect(() => {
    setRouter(router);
  }, [router, setRouter]);

  function renderSegmentContent(segment: string) {
    // Handle story segments
    if (segment.startsWith("story-")) {
      const storyTitle = segment.replace("story-", "");
      const story = stories.find((s) => s.title === storyTitle);
      return story ? <StoryView story={story} /> : <div>Story not found</div>;
    }

    switch (segment) {
      case "new":
        return <div>New story content here</div>;
      case "orders":
        return <div>Orders content here</div>;
      case "add":
        return <AddNewStory />;
      case "traffic":
        return <div>Traffic book content here</div>;
      case "stories":
        return <div>Stories content here</div>;
      case "integrations":
        return <div>Integrations content here</div>;
      default:
        return <div>Welcome!</div>;
    }
  }

  // Extract the current segment from the router's pathname
  const segment = router.pathname.split("/").filter(Boolean).pop() || "new";

  useEffect(() => {
    setNavigation((prevNav) => {
      const newNav = [...prevNav];
      const storiesNavItem = newNav.find(
        (
          item
        ): item is {
          segment: string;
          title: string;
          icon: React.ReactNode;
          children: Array<{
            segment: string;
            title: string;
            icon: React.ReactNode;
          }>;
        } => "segment" in item && item.segment === "stories"
      );

      if (storiesNavItem) {
        storiesNavItem.children = [
          {
            segment: "add",
            title: "Add a new story",
            icon: <DescriptionIcon />,
          },
          ...stories.map((story) => ({
            segment: `story-${story.title}`,
            title: story.title,
            icon: <DescriptionIcon />,
          })),
        ];
      }
      return newNav;
    });
  }, [stories]);

  return (
    <AppProvider navigation={navigation} router={router} theme={demoTheme}>
      <DashboardLayout>
        <PageContainer>{renderSegmentContent(segment)}</PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
}
