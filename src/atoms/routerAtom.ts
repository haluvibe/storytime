import { Router } from "@toolpad/core/AppProvider";
import { atom } from "jotai";

export const routerAtom = atom<Router | null>(null); 