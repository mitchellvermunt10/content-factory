"use client";

import {
  Square,
  ChevronsLeftRight,
  ChevronsUpDown,
  ArrowRightFromLine,
  ArrowLeftFromLine,
  MoveHorizontal,
  ZoomIn,
  ZoomOut,
  Zap,
  ChevronsUp,
  Activity,
  Move,
  Orbit,
} from "lucide-react";
import type { CameraMovement } from "@/lib/constants";

const ICONS: Record<CameraMovement, React.ElementType> = {
  static: Square,
  pan: ChevronsLeftRight,
  tilt: ChevronsUpDown,
  "dolly-in": ArrowRightFromLine,
  "dolly-out": ArrowLeftFromLine,
  truck: MoveHorizontal,
  "zoom-in": ZoomIn,
  "zoom-out": ZoomOut,
  "whip-pan": Zap,
  crane: ChevronsUp,
  handheld: Activity,
  tracking: Move,
  orbit: Orbit,
};

export function CameraIcon({
  movement,
  className,
}: {
  movement: CameraMovement;
  className?: string;
}) {
  const Icon = ICONS[movement] ?? Square;
  return <Icon className={className} />;
}
