import {
  Artisan,
  CraftCategory,
  FeaturedExperience,
  HeritageLocation,
  Story,
} from "../types/home";

export const CRAFT_CATEGORIES: CraftCategory[] = [
  {
    id: "pottery",
    name: "Pottery",
    icon: "cup-water",
    iconFamily: "MaterialCommunityIcons",
    bgColor: "#E5ECE7",
    description: "Jaipur blue pottery, terracotta & clay wares",
  },
  {
    id: "weaving",
    name: "Weaving",
    icon: "hanger",
    iconFamily: "MaterialCommunityIcons",
    bgColor: "#F1EBE1",
    description: "Handloom silks, Pashmina & dhurrie rugs",
  },
  {
    id: "woodwork",
    name: "Woodwork",
    icon: "axe",
    iconFamily: "MaterialCommunityIcons",
    bgColor: "#EFEAE4",
    description: "Sheesham jali carving & sandalwood crafts",
  },
  {
    id: "painting",
    name: "Painting",
    icon: "brush-outline",
    iconFamily: "MaterialCommunityIcons",
    bgColor: "#F2ECE4",
    description: "Pichwai, miniature art & Madhubani strokes",
  },
  {
    id: "jewelry",
    name: "Jewelry",
    icon: "diamond-stone",
    iconFamily: "MaterialCommunityIcons",
    bgColor: "#E8EFE9",
    description: "Kundan, Meenakari & silver filigree",
  },
  {
    id: "embroidery",
    name: "Embroidery",
    icon: "needle",
    iconFamily: "MaterialCommunityIcons",
    bgColor: "#F4EDE6",
    description: "Phulkari, Zardozi & chikankari needlework",
  },
];

export const FEATURED_EXPERIENCE: FeaturedExperience = {
  id: "exp-blue-pottery",
  badge: "Featured Experience",
  title: "Experience Blue Pottery",
  craft: "Blue Pottery",
  location: "Jaipur, Rajasthan",
  description:
    "Learn the ancient art of quartz-based pottery from master artisan Ram Singh.",
  masterArtisan: "Master Ram Singh",
  price: 1400,
  duration: "2.5 Hours",
  image: require("../../assets/images/blue-pottery-hero.jpg"),
  highlights: [
    "Hands-on glaze application & wheel shaping",
    "Take home your customized fired coaster or tile",
    "Traditional Rajasthani chai & workshop tour",
  ],
};

export const POPULAR_ARTISANS: Artisan[] = [
  {
    id: "artisan-1",
    name: "Kamala Devi",
    craft: "Block Printing",
    location: "Sanganer",
    pricePerHour: 1200,
    rating: 4.9,
    image: require("../../assets/images/kamala-block-printing.jpg"),
    experienceYears: 24,
    reviewsCount: 142,
    about:
      "Master of traditional Sanganeri hand block printing using natural plant-derived indigo and madder dyes.",
  },
  {
    id: "artisan-2",
    name: "Abdul R.",
    craft: "Wood Carving",
    location: "City Center",
    pricePerHour: 900,
    rating: 4.8,
    image: require("../../assets/images/abdul-wood-carving.jpg"),
    experienceYears: 18,
    reviewsCount: 98,
    about:
      "Specializes in intricate floral jali lattice woodwork and traditional teak & rosewood panels.",
  },
  {
    id: "artisan-3",
    name: "Meera Bai",
    craft: "Miniature Painting",
    location: "Old City",
    pricePerHour: 1500,
    rating: 5.0,
    image: require("../../assets/images/story-embroidery.jpg"),
    experienceYears: 20,
    reviewsCount: 116,
    about:
      "Award-winning artist known for royal Rajasthani miniature court paintings with gold leaf embellishments.",
  },
  {
    id: "artisan-4",
    name: "Rajesh Sharma",
    craft: "Blue Pottery",
    location: "Amer",
    pricePerHour: 1100,
    rating: 4.9,
    image: require("../../assets/images/story-pottery-wheel.jpg"),
    experienceYears: 15,
    reviewsCount: 87,
    about:
      "Expert potter conducting interactive studio classes on Jaipur glazed quartz pottery crafting.",
  },
];

export const TRENDING_STORIES: Story[] = [
  {
    id: "story-1",
    title: "The secret of vibrant...",
    author: "Amrita",
    image: require("../../assets/images/story-embroidery.jpg"),
    readTime: "4 min read",
    summary:
      "Exploring how natural plant pigments and centuries-old mordants create hues that never fade.",
  },
  {
    id: "story-2",
    title: "Mastering the Wheel",
    author: "Raj",
    image: require("../../assets/images/story-pottery-wheel.jpg"),
    readTime: "6 min read",
    summary:
      "Three generations of clay artistry passing down the sacred rhythm of pottery wheel balance.",
  },
  {
    id: "story-3",
    title: "Silver Filigree Magic",
    author: "Vikram",
    image: require("../../assets/images/story-silver-filigree.jpg"),
    readTime: "5 min read",
    summary:
      "Inside the ancient workshops where delicate silver wires turn into regal gossamer ornaments.",
  },
];

export const HERITAGE_LOCATIONS: HeritageLocation[] = [
  {
    id: "loc-jaipur",
    city: "Jaipur",
    state: "Rajasthan",
    popularCraft: "Blue Pottery & Block Printing",
  },
  {
    id: "loc-udaipur",
    city: "Udaipur",
    state: "Rajasthan",
    popularCraft: "Miniature Painting & Silver",
  },
  {
    id: "loc-jodhpur",
    city: "Jodhpur",
    state: "Rajasthan",
    popularCraft: "Woodwork & Bandhani",
  },
  {
    id: "loc-varanasi",
    city: "Varanasi",
    state: "Uttar Pradesh",
    popularCraft: "Banarasi Silk & Wooden Toys",
  },
  {
    id: "loc-kutch",
    city: "Kutch",
    state: "Gujarat",
    popularCraft: "Rogan Art & Ajrakh",
  },
];
