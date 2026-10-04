import { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

const CRAFT_ICON_FALLBACKS: Record<string, MaterialIconName> = {
  smile: "bowl-outline",
  tool: "hammer",
  disc: "cup-water",
  grid: "sprout",
  layers: "layers-outline",
  brush: "palette-outline",
  pottery: "cup-water",
  terracotta: "bowl-outline",
  woodwork: "hammer",
  weaving: "layers-outline",
  metal: "fire",
  bamboo: "sprout",
  painting: "palette-outline",
};

/**
 * Returns a guaranteed valid MaterialCommunityIcons icon name for a given craft icon string.
 */
export function getValidCraftIcon(
  iconName?: string | null,
  defaultIcon: MaterialIconName = "star-outline"
): MaterialIconName {
  if (!iconName) return defaultIcon;

  const cleaned = iconName.trim().toLowerCase();
  if (CRAFT_ICON_FALLBACKS[cleaned]) {
    return CRAFT_ICON_FALLBACKS[cleaned];
  }

  return iconName as MaterialIconName;
}
