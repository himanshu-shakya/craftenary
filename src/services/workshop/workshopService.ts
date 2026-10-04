import { supabase } from "../../lib/supabase";
import { CreateWorkshopInput, Workshop } from "../../types/workshop";

// Fallback curated workshops to ensure the tourist experience is rich immediately
export const FALLBACK_WORKSHOPS: Workshop[] = [
  {
    id: "fallback-w1",
    artisan_id: "artisan-1",
    name: "Jaipur Blue Pottery Masterclass",
    description:
      "Learn the ancient art of quartz-based pottery shaping, turquoise glaze preparation, and intricate hand-painted floral motifs directly from master artisan Ram Singh.",
    craft_id: "craft-pottery",
    craft: {
      id: "craft-pottery",
      name: "Pottery",
      icon: "cup-water",
      is_active: true,
    },
    artisan: {
      id: "artisan-1",
      user_id: "user-1",
      first_name: "Ram",
      last_name: "Singh",
      craft_id: "craft-pottery",
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      verification_status: "verified",
      experience_years: 28,
      price_per_hour: 1200,
      profile_image_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    location: "Amer Road Artisan Quarter, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    price: 1400,
    duration: "2.5 Hours",
    max_participants: 6,
    rating: 4.9,
    reviews_count: 148,
    is_active: true,
    images: [
      {
        id: "img-1",
        workshop_id: "fallback-w1",
        image_url:
          "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
        display_order: 0,
      },
      {
        id: "img-2",
        workshop_id: "fallback-w1",
        image_url:
          "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800",
        display_order: 1,
      },
    ],
  },
  {
    id: "fallback-w2",
    artisan_id: "artisan-2",
    name: "Traditional Sanganeri Hand Block Printing",
    description:
      "Stamp your own botanical silk scarf using centuries-old teak wood blocks and authentic fermented natural plant-based indigo and madder dyes with Kamala Devi.",
    craft_id: "craft-block-printing",
    craft: {
      id: "craft-block-printing",
      name: "Block Printing",
      icon: "palette-outline",
      is_active: true,
    },
    artisan: {
      id: "artisan-2",
      user_id: "user-2",
      first_name: "Kamala",
      last_name: "Devi",
      craft_id: "craft-block-printing",
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      verification_status: "verified",
      experience_years: 24,
      price_per_hour: 1200,
      profile_image_url:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    },
    location: "Sanganer Textile Village, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    price: 1200,
    duration: "2 Hours",
    max_participants: 8,
    rating: 4.9,
    reviews_count: 112,
    is_active: true,
    images: [
      {
        id: "img-3",
        workshop_id: "fallback-w2",
        image_url:
          "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800",
        display_order: 0,
      },
      {
        id: "img-4",
        workshop_id: "fallback-w2",
        image_url:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
        display_order: 1,
      },
    ],
  },
  {
    id: "fallback-w3",
    artisan_id: "artisan-3",
    name: "Sheesham Jali Floral Wood Carving",
    description:
      "Discover the rhythm of chisels and gouges to carve traditional royal Rajasthani floral lattice screens under the mentorship of master craftsman Abdul.",
    craft_id: "craft-woodwork",
    craft: {
      id: "craft-woodwork",
      name: "Wood Carving",
      icon: "axe",
      is_active: true,
    },
    artisan: {
      id: "artisan-3",
      user_id: "user-3",
      first_name: "Abdul",
      last_name: "Rahman",
      craft_id: "craft-woodwork",
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      verification_status: "unverified",
      experience_years: 18,
      price_per_hour: 900,
      profile_image_url:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    },
    location: "City Center Wood Guild, Jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    price: 900,
    duration: "3 Hours",
    max_participants: 4,
    rating: 4.8,
    reviews_count: 86,
    is_active: true,
    images: [
      {
        id: "img-5",
        workshop_id: "fallback-w3",
        image_url:
          "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
        display_order: 0,
      },
    ],
  },
];

class WorkshopService {
  /**
   * Query discovery workshops matching location / craft interests
   */
  async getWorkshops(options?: {
    city?: string;
    craftId?: string;
    craftIds?: string[];
    searchQuery?: string;
  }): Promise<Workshop[]> {
    try {
      let query = supabase
        .from("workshops")
        .select(`
          *,
          artisan:artisan_profiles (
            *,
            craft:crafts(*)
          ),
          craft:crafts (*),
          images:workshop_images (*)
        `)
        .eq("is_active", true)
        .order("rating", { ascending: false });

      if (options?.craftId) {
        query = query.eq("craft_id", options.craftId);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        // Filter fallback workshops
        return this.filterFallbackWorkshops(options);
      }

      let results = data as Workshop[];

      // In-memory filter for city/crafts/search if needed
      if (options?.city) {
        const cityLower = options.city.toLowerCase();
        const cityMatches = results.filter(
          (w) =>
            w.city.toLowerCase().includes(cityLower) ||
            w.location.toLowerCase().includes(cityLower)
        );
        if (cityMatches.length > 0) {
          results = cityMatches;
        }
      }

      if (options?.searchQuery && options.searchQuery.trim()) {
        const q = options.searchQuery.toLowerCase();
        results = results.filter(
          (w) =>
            w.name.toLowerCase().includes(q) ||
            w.description.toLowerCase().includes(q) ||
            w.artisan?.first_name.toLowerCase().includes(q) ||
            w.artisan?.last_name.toLowerCase().includes(q) ||
            w.craft?.name.toLowerCase().includes(q)
        );
      }

      return results;
    } catch {
      return this.filterFallbackWorkshops(options);
    }
  }

  private filterFallbackWorkshops(options?: {
    city?: string;
    craftId?: string;
    craftIds?: string[];
    searchQuery?: string;
  }): Workshop[] {
    let list = [...FALLBACK_WORKSHOPS];

    if (options?.craftId) {
      list = list.filter((w) => w.craft_id === options.craftId);
    } else if (options?.craftIds && options.craftIds.length > 0) {
      const interestMatches = list.filter((w) =>
        options.craftIds?.includes(w.craft_id)
      );
      if (interestMatches.length > 0) {
        list = interestMatches;
      }
    }

    if (options?.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase();
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.artisan?.first_name.toLowerCase().includes(q) ||
          w.craft?.name.toLowerCase().includes(q)
      );
    }

    return list;
  }

  /**
   * Get workshops created by an artisan
   */
  async getArtisanWorkshops(artisanId: string): Promise<Workshop[]> {
    try {
      let { data, error } = await supabase
        .from("workshops")
        .select(`
          *,
          craft:crafts(*),
          images:workshop_images(*)
        `)
        .eq("artisan_id", artisanId)
        .order("created_at", { ascending: false });

      if (!data || data.length === 0) {
        // Look up by user_id
        const { data: artisanProfile } = await supabase
          .from("artisan_profiles")
          .select("id")
          .eq("user_id", artisanId)
          .maybeSingle();

        if (artisanProfile?.id) {
          const { data: byProfileData } = await supabase
            .from("workshops")
            .select(`
              *,
              craft:crafts(*),
              images:workshop_images(*)
            `)
            .eq("artisan_id", artisanProfile.id)
            .order("created_at", { ascending: false });

          if (byProfileData && byProfileData.length > 0) {
            data = byProfileData;
          }
        }
      }

      if (error || !data) {
        return [];
      }

      return data as Workshop[];
    } catch {
      return [];
    }
  }

  /**
   * Fetch single workshop by ID
   */
  async getWorkshopById(workshopId: string): Promise<Workshop | null> {
    try {
      const { data, error } = await supabase
        .from("workshops")
        .select(`
          *,
          artisan:artisan_profiles (
            *,
            craft:crafts(*)
          ),
          craft:crafts (*),
          images:workshop_images (*)
        `)
        .eq("id", workshopId)
        .single();

      if (error || !data) {
        return FALLBACK_WORKSHOPS.find((w) => w.id === workshopId) || null;
      }

      return data as Workshop;
    } catch {
      return FALLBACK_WORKSHOPS.find((w) => w.id === workshopId) || null;
    }
  }

  /**
   * Create a new workshop listing with multiple images
   */
  async createWorkshop(
    artisanId: string,
    input: CreateWorkshopInput
  ): Promise<{ success: boolean; workshop?: Workshop; error?: string }> {
    if (!input.name.trim()) {
      return { success: false, error: "Please enter a workshop name." };
    }
    if (!input.description.trim()) {
      return { success: false, error: "Please enter a workshop description." };
    }
    if (!input.craftId) {
      return { success: false, error: "Please select a craft category." };
    }
    if (input.price < 0) {
      return { success: false, error: "Price cannot be negative." };
    }
    if (!input.imageUrls || input.imageUrls.length === 0) {
      return {
        success: false,
        error: "Please add at least one workshop image.",
      };
    }

    try {
      // Resolve artisan_profiles.id safely (handles either artisan_profiles.id or user_id)
      let targetArtisanId = artisanId;
      const { data: existingArtisanById } = await supabase
        .from("artisan_profiles")
        .select("id")
        .eq("id", artisanId)
        .maybeSingle();

      if (existingArtisanById?.id) {
        targetArtisanId = existingArtisanById.id;
      } else {
        // Check if passed ID is user_id
        const { data: existingArtisanByUser } = await supabase
          .from("artisan_profiles")
          .select("id")
          .eq("user_id", artisanId)
          .maybeSingle();

        if (existingArtisanByUser?.id) {
          targetArtisanId = existingArtisanByUser.id;
        } else {
          // Auto-provision profile and artisan_profile to guarantee foreign key integrity
          await supabase
            .from("profiles")
            .upsert(
              {
                id: artisanId,
                role: "artisan",
                onboarding_completed: true,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );

          const { data: createdArtisan, error: createArtisanError } = await supabase
            .from("artisan_profiles")
            .upsert(
              {
                user_id: artisanId,
                first_name: "Master",
                last_name: "Artisan",
                city: input.city.trim() || "Jaipur",
                state: input.state.trim() || "Rajasthan",
                craft_id: input.craftId,
                country: "India",
                verification_status: "unverified",
              },
              { onConflict: "user_id" }
            )
            .select("id")
            .single();

          if (createArtisanError || !createdArtisan) {
            return {
              success: false,
              error: createArtisanError?.message || "Artisan profile could not be verified in database.",
            };
          }
          targetArtisanId = createdArtisan.id;
        }
      }

      // 1. Insert workshop record with verified artisan foreign key
      const { data: workshopData, error: workshopError } = await supabase
        .from("workshops")
        .insert({
          artisan_id: targetArtisanId,
          name: input.name.trim(),
          description: input.description.trim(),
          craft_id: input.craftId,
          location: input.location.trim(),
          city: input.city.trim(),
          state: input.state.trim(),
          price: input.price,
          duration: input.duration || "2 Hours",
          max_participants: input.maxParticipants || 6,
          rating: 5.0,
          reviews_count: 0,
          is_active: true,
        })
        .select(`*, craft:crafts(*)`)
        .single();

      if (workshopError || !workshopData) {
        return {
          success: false,
          error: workshopError?.message || "Failed to create workshop",
        };
      }

      // 2. Insert workshop images
      const imageRows = input.imageUrls.map((url, index) => ({
        workshop_id: workshopData.id,
        image_url: url,
        display_order: index,
      }));

      const { data: imagesData, error: imagesError } = await supabase
        .from("workshop_images")
        .insert(imageRows)
        .select();

      if (imagesError) {
        console.warn("[Workshop] Image insertion warning:", imagesError.message);
      }

      const completeWorkshop: Workshop = {
        ...workshopData,
        images: imagesData || [],
      };

      return {
        success: true,
        workshop: completeWorkshop,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create workshop",
      };
    }
  }

  /**
   * Delete workshop listing
   */
  async deleteWorkshop(
    workshopId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("workshops")
        .delete()
        .eq("id", workshopId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to delete workshop",
      };
    }
  }
}

export const workshopService = new WorkshopService();
