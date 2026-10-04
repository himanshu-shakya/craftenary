import { supabase } from "../../lib/supabase";
import { Craft } from "../../types/craft";

// Fallback seed crafts for initial offline / offline cache readiness
export const FALLBACK_CRAFTS: Craft[] = [
  {
    id: "craft-pottery",
    name: "Pottery",
    description: "Jaipur blue pottery, terracotta sculpting & ceramic wheel wares",
    icon: "cup-water",
    is_active: true,
  },
  {
    id: "craft-woodwork",
    name: "Wood Carving",
    description: "Intricate Sheesham jali fretwork, sandalwood & teak wood panels",
    icon: "axe",
    is_active: true,
  },
  {
    id: "craft-block-printing",
    name: "Block Printing",
    description: "Traditional Sanganeri & Bagru wooden stamp printing with natural indigo",
    icon: "palette-outline",
    is_active: true,
  },
  {
    id: "craft-miniature-painting",
    name: "Miniature Painting",
    description: "Fine Rajasthani court paintings with natural stone pigments & gold foil",
    icon: "brush-outline",
    is_active: true,
  },
  {
    id: "craft-silver-filigree",
    name: "Silver Filigree",
    description: "Ancient Tarkasi silver wire jewelry & ornamental artefacts",
    icon: "diamond-stone",
    is_active: true,
  },
  {
    id: "craft-handloom",
    name: "Handloom Weaving",
    description: "Pashmina, Kota Doria silks & artisan pit-loom dhurrie rugs",
    icon: "hanger",
    is_active: true,
  },
  {
    id: "craft-embroidery",
    name: "Embroidery",
    description: "Vibrant Phulkari, royal Zardozi & delicate Chikankari threadwork",
    icon: "needle",
    is_active: true,
  },
  {
    id: "craft-jewelry",
    name: "Jewelry & Meenakari",
    description: "Kundan gem setting and glass enamel metal crafting",
    icon: "ring",
    is_active: true,
  },
  {
    id: "craft-metal",
    name: "Metal Craft",
    description: "Engraved brassware, bell metal cast figurines & Moradabad inlay",
    icon: "hammer",
    is_active: true,
  },
];

class CraftService {
  private cache: Craft[] | null = null;

  async getCrafts(): Promise<Craft[]> {
    if (this.cache && this.cache.length > 0) {
      return this.cache;
    }

    try {
      const { data, error } = await supabase
        .from("crafts")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error || !data || data.length === 0) {
        return FALLBACK_CRAFTS;
      }

      this.cache = data as Craft[];
      return this.cache;
    } catch {
      return FALLBACK_CRAFTS;
    }
  }

  async getCraftById(craftId: string): Promise<Craft | null> {
    const allCrafts = await this.getCrafts();
    return allCrafts.find((c) => c.id === craftId) || null;
  }
}

export const craftService = new CraftService();
