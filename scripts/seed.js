const fs = require('fs');
const path = require('path');

// Resolve @supabase/supabase-js
let createClient;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch {
  createClient = require(path.join(__dirname, '../node_modules/@supabase/supabase-js')).createClient;
}

// Load .env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SECRET_KEY || process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEMO_PASSWORD = "Password123!";

const SEED_DATA = {
  "artisans": [
    {
      "id": "ART001",
      "name": "Ramesh Kumar",
      "email": "ramesh.kumar@example.com",
      "phone": "+91-9000000001",
      "role": "artisan",
      "profile_image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800",
      "city": "Jagdalpur",
      "state": "Chhattisgarh",
      "craft_category": "Dhokra Art",
      "experience_years": 18,
      "bio": "Traditional Dhokra artisan creating handcrafted tribal figurines and home decor inspired by Bastar's rich cultural heritage.",
      "rating": 4.8,
      "verification_status": "verified",
      "workshop_title": "Bastar Tribal Bell Metal & Dhokra Casting Workshop",
      "workshop_description": "Learn the ancient lost-wax casting technique from Bastar master artisans and sculpt your own traditional brass bell-metal artifact.",
      "workshop_price": 1800,
      "workshop_duration": "3 Hours",
      "workshop_image": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
      "created_at": "2026-08-01T10:00:00Z",
      "updated_at": "2026-08-20T10:00:00Z"
    },
    {
      "id": "ART002",
      "name": "Meena Bai",
      "email": "meena.bai@example.com",
      "phone": "+91-9000000002",
      "role": "artisan",
      "profile_image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800",
      "city": "Dindori",
      "state": "Madhya Pradesh",
      "craft_category": "Gond Painting",
      "experience_years": 12,
      "bio": "Gond artist creating vibrant paintings inspired by nature, animals, folklore, and traditional tribal stories.",
      "rating": 4.7,
      "workshop_title": "Vibrant Gond Tribal Art on Handmade Paper",
      "workshop_description": "Immerse in indigenous storytelling patterns, dynamic lines, and vibrant dot work using natural and vivid pigments.",
      "workshop_price": 1400,
      "workshop_duration": "2.5 Hours",
      "workshop_image": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800",
      "created_at": "2026-08-02T09:30:00Z",
      "updated_at": "2026-08-21T11:00:00Z"
    },
    {
      "id": "ART003",
      "name": "Abdul Rahman",
      "email": "abdul.rahman@example.com",
      "phone": "+91-9000000003",
      "role": "artisan",
      "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
      "city": "Varanasi",
      "state": "Uttar Pradesh",
      "craft_category": "Handloom Weaving",
      "experience_years": 22,
      "bio": "Experienced handloom weaver specializing in traditional Banarasi patterns and finely detailed fabrics.",
      "rating": 4.9,
      "workshop_title": "Banarasi Silk Handloom Weaving & Zari Crafting",
      "workshop_description": "Step behind the pit loom in sacred Varanasi and weave authentic floral and geometric Banarasi silk motifs with master weavers.",
      "workshop_price": 2200,
      "workshop_duration": "3 Hours",
      "workshop_image": "https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800",
      "created_at": "2026-08-03T08:15:00Z",
      "updated_at": "2026-08-22T14:20:00Z"
    },
    {
      "id": "ART004",
      "name": "Sunita Devi",
      "email": "sunita.devi@example.com",
      "phone": "+91-9000000004",
      "role": "artisan",
      "profile_image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
      "city": "Madhubani",
      "state": "Bihar",
      "craft_category": "Madhubani Painting",
      "experience_years": 15,
      "bio": "Traditional Madhubani artist creating detailed folk paintings featuring nature, mythology, and village life.",
      "rating": 4.8,
      "workshop_title": "Sacred Mithila Madhubani Painting with Bamboo Nibs",
      "workshop_description": "Master the Kohbar and Kachni line styles using natural twigs, organic dyes, and plant-derived pigments.",
      "workshop_price": 1600,
      "workshop_duration": "2.5 Hours",
      "workshop_image": "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800",
      "created_at": "2026-08-04T12:00:00Z",
      "updated_at": "2026-08-23T10:45:00Z"
    },
    {
      "id": "ART005",
      "name": "Lakhan Singh",
      "email": "lakhan.singh@example.com",
      "phone": "+91-9000000005",
      "role": "artisan",
      "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800",
      "city": "Saharanpur",
      "state": "Uttar Pradesh",
      "craft_category": "Wood Carving",
      "experience_years": 20,
      "bio": "Skilled wood carver creating traditional sculptures, furniture details, and decorative handcrafted pieces.",
      "rating": 4.6,
      "verification_status": "pending",
      "workshop_title": "Sheesham Wood Relief Carving & Floral Inlay",
      "workshop_description": "Hands-on chisel carving on seasoned Sheesham wood to craft intricate floral jaali panels and coasters.",
      "workshop_price": 1500,
      "workshop_duration": "3 Hours",
      "workshop_image": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800",
      "created_at": "2026-08-05T15:30:00Z",
      "updated_at": "2026-08-24T09:10:00Z"
    },
    {
      "id": "ART006",
      "name": "Kavita Sharma",
      "email": "kavita.sharma@example.com",
      "phone": "+91-9000000006",
      "role": "artisan",
      "profile_image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800",
      "city": "Jaipur",
      "state": "Rajasthan",
      "craft_category": "Blue Pottery",
      "experience_years": 10,
      "bio": "Blue pottery artisan creating handcrafted plates, vases, and decorative pieces using traditional Rajasthani designs.",
      "rating": 4.7,
      "workshop_title": "Royal Jaipur Quartz Blue Pottery Moulding & Glazing",
      "workshop_description": "Experience non-clay Egyptian paste pottery with cobalt oxide blue painting in the heart of the Pink City.",
      "workshop_price": 1900,
      "workshop_duration": "2.5 Hours",
      "workshop_image": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800",
      "created_at": "2026-08-06T10:20:00Z",
      "updated_at": "2026-08-24T13:30:00Z"
    },
    {
      "id": "ART007",
      "name": "Mohan Lal",
      "email": "mohan.lal@example.com",
      "phone": "+91-9000000007",
      "role": "artisan",
      "profile_image": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800",
      "city": "Bankura",
      "state": "West Bengal",
      "craft_category": "Terracotta Craft",
      "experience_years": 16,
      "bio": "Traditional terracotta artisan creating handcrafted horses, figurines, and decorative artwork.",
      "rating": 4.8,
      "workshop_title": "Bankura Terracotta Horse & Earthen Figurine Sculpting",
      "workshop_description": "Wheel throwing and hand-sculpting the iconic long-eared Bankura terracotta horse and decorative wall reliefs.",
      "workshop_price": 1300,
      "workshop_duration": "2 Hours",
      "workshop_image": "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800",
      "created_at": "2026-08-07T11:40:00Z",
      "updated_at": "2026-08-25T16:00:00Z"
    },
    {
      "id": "ART008",
      "name": "Asha Netam",
      "email": "asha.netam@example.com",
      "phone": "+91-9000000008",
      "role": "artisan",
      "profile_image": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=800",
      "city": "Kondagaon",
      "state": "Chhattisgarh",
      "craft_category": "Bamboo Craft",
      "experience_years": 9,
      "bio": "Bamboo craft artist producing sustainable baskets, home decor, and traditional utility products.",
      "rating": 4.6,
      "workshop_title": "Eco-Friendly Bamboo Splitting & Basketry Weaving",
      "workshop_description": "Learn tribal fine-strip bamboo processing and weave authentic aesthetic storage baskets and table lamps.",
      "workshop_price": 1200,
      "workshop_duration": "2 Hours",
      "workshop_image": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800",
      "created_at": "2026-08-08T09:00:00Z",
      "updated_at": "2026-08-26T12:30:00Z"
    }
  ],
  "tourists": [
    {
      "id": "TOU001",
      "name": "Aarav Mehta",
      "email": "aarav.mehta@example.com",
      "phone": "+91-9100000001",
      "role": "tourist",
      "profile_image": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800",
      "city": "Mumbai",
      "state": "Maharashtra",
      "gender": "Male",
      "bio": "Loves discovering local traditions, authentic food, and unique handmade crafts while travelling.",
      "interests": [
        "Dhokra Art",
        "Wood Carving",
        "Handloom Weaving"
      ],
      "travel_style": "Cultural Explorer",
      "created_at": "2026-08-10T10:00:00Z",
      "updated_at": "2026-08-20T10:00:00Z"
    },
    {
      "id": "TOU002",
      "name": "Priya Sharma",
      "email": "priya.sharma@example.com",
      "phone": "+91-9100000002",
      "role": "tourist",
      "profile_image": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800",
      "city": "Bengaluru",
      "state": "Karnataka",
      "gender": "Female",
      "bio": "Enjoys exploring heritage sites, meeting local artists, and learning about regional traditions.",
      "interests": [
        "Blue Pottery",
        "Madhubani Painting",
        "Gond Painting"
      ],
      "travel_style": "Slow Traveller",
      "created_at": "2026-08-11T11:30:00Z",
      "updated_at": "2026-08-21T09:45:00Z"
    },
    {
      "id": "TOU003",
      "name": "Rahul Verma",
      "email": "rahul.verma@example.com",
      "phone": "+91-9100000003",
      "role": "tourist",
      "profile_image": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800",
      "city": "New Delhi",
      "state": "Delhi",
      "gender": "Male",
      "bio": "Enjoys discovering lesser-known destinations, local markets, and authentic cultural experiences.",
      "interests": [
        "Terracotta Craft",
        "Bamboo Craft",
        "Dhokra Art"
      ],
      "travel_style": "Explorer",
      "created_at": "2026-08-12T08:20:00Z",
      "updated_at": "2026-08-22T12:00:00Z"
    },
    {
      "id": "TOU004",
      "name": "Ananya Singh",
      "email": "ananya.singh@example.com",
      "phone": "+91-9100000004",
      "role": "tourist",
      "profile_image": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800",
      "city": "Pune",
      "state": "Maharashtra",
      "gender": "Female",
      "bio": "Interested in unique handmade products, local experiences, and stories behind traditional crafts.",
      "interests": [
        "Handloom Weaving",
        "Blue Pottery",
        "Madhubani Painting"
      ],
      "travel_style": "Experience Seeker",
      "created_at": "2026-08-13T13:10:00Z",
      "updated_at": "2026-08-23T15:30:00Z"
    },
    {
      "id": "TOU005",
      "name": "Vikram Patel",
      "email": "vikram.patel@example.com",
      "phone": "+91-9100000005",
      "role": "tourist",
      "profile_image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800",
      "city": "Ahmedabad",
      "state": "Gujarat",
      "gender": "Male",
      "bio": "Enjoys learning about regional history, traditional architecture, and local craftsmanship.",
      "interests": [
        "Wood Carving",
        "Terracotta Craft",
        "Dhokra Art"
      ],
      "travel_style": "Cultural Explorer",
      "created_at": "2026-08-14T09:40:00Z",
      "updated_at": "2026-08-24T11:20:00Z"
    },
    {
      "id": "TOU006",
      "name": "Neha Kapoor",
      "email": "neha.kapoor@example.com",
      "phone": "+91-9100000006",
      "role": "tourist",
      "profile_image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
      "city": "Chandigarh",
      "state": "Chandigarh",
      "gender": "Female",
      "bio": "Loves discovering unique handmade products, local food, traditional markets, and cultural experiences.",
      "interests": [
        "Gond Painting",
        "Blue Pottery",
        "Handloom Weaving"
      ],
      "travel_style": "Leisure Traveller",
      "created_at": "2026-08-15T14:00:00Z",
      "updated_at": "2026-08-25T10:00:00Z"
    }
  ]
};

const CRAFT_DEFINITIONS = [
  { id: "craft-dhokra", name: "Dhokra Art", category: "Metal Craft", description: "Ancient non-ferrous lost-wax metal casting practiced in Central and Eastern India.", icon: "fire", image_url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800" },
  { id: "craft-gond", name: "Gond Painting", category: "Folk Painting", description: "Vibrant tribal art characterized by dots and dashes depicting wildlife and nature.", icon: "palette-outline", image_url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800" },
  { id: "craft-handloom", name: "Handloom Weaving", category: "Textiles", description: "Generational artisan loom weaving of sacred silk and cotton fabrics.", icon: "layers-outline", image_url: "https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800" },
  { id: "craft-madhubani", name: "Madhubani Painting", category: "Folk Painting", description: "Geometric Mithila folk paintings with natural plant pigments and bamboo nibs.", icon: "feather", image_url: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800" },
  { id: "craft-woodwork", name: "Wood Carving", category: "Woodwork", description: "Detailed relief carvings, fretwork, and inlay on seasoned Sheesham and teak.", icon: "hammer", image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800" },
  { id: "craft-blue-pottery", name: "Blue Pottery", category: "Ceramics", description: "Glazed non-clay quartz ceramic craft with vibrant Persian turquoise and cobalt blue.", icon: "cup-water", image_url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800" },
  { id: "craft-terracotta", name: "Terracotta Craft", category: "Earthen Art", description: "Sculptural baked clay pottery, ritual horses, and ornamental temple plaques.", icon: "bowl-outline", image_url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800" },
  { id: "craft-bamboo", name: "Bamboo Craft", category: "Eco Craft", description: "Sustainable bamboo stripping and weaving into intricate basketry and homeware.", icon: "sprout", image_url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800" }
];

async function seed() {
  console.log("=== STARTING CRAFTINERY DATABASE SEEDING ===");
  console.log(`Target Supabase URL: ${supabaseUrl}`);

  // 1. Ensure crafts exist
  console.log("\n[1/4] Ensuring Crafts in Database...");
  const craftMap = {}; // name -> craftId

  for (const craft of CRAFT_DEFINITIONS) {
    const { data: existingCraft } = await supabase
      .from('crafts')
      .select('id, name')
      .eq('name', craft.name)
      .maybeSingle();

    if (existingCraft) {
      craftMap[craft.name] = existingCraft.id;
      // Update icon & category to ensure clean valid icons
      await supabase.from('crafts').update({
        icon: craft.icon,
        category: craft.category,
        description: craft.description,
        image_url: craft.image_url
      }).eq('id', existingCraft.id);
      console.log(`  ✓ Updated craft: ${craft.name} (icon: '${craft.icon}')`);
    } else {
      const { data: newCraft, error: insertError } = await supabase
        .from('crafts')
        .insert({
          id: craft.id,
          name: craft.name,
          category: craft.category,
          description: craft.description,
          icon: craft.icon,
          image_url: craft.image_url,
          is_active: true
        })
        .select()
        .single();

      if (insertError) {
        console.error(`  ✗ Failed to insert craft ${craft.name}:`, insertError.message);
      } else {
        craftMap[craft.name] = newCraft.id;
        console.log(`  ✓ Inserted craft: ${craft.name} (${newCraft.id})`);
      }
    }
  }

  // Also query any other existing crafts to populate craftMap
  const { data: allCrafts } = await supabase.from('crafts').select('id, name');
  if (allCrafts) {
    allCrafts.forEach(c => {
      craftMap[c.name] = c.id;
    });
  }

  // 2. Seed Artisans
  console.log("\n[2/4] Seeding Artisans...");
  for (const artisan of SEED_DATA.artisans) {
    const [firstName, ...lastParts] = artisan.name.split(' ');
    const lastName = lastParts.join(' ') || 'Artisan';
    const craftId = craftMap[artisan.craft_category] || allCrafts?.[0]?.id;

    // A. Create/Find Auth User
    let userId;
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existingAuthUser = listData?.users?.find(u => u.email === artisan.email);

    const cleanPhone = artisan.phone ? artisan.phone.replace(/[^+\d]/g, '') : undefined;

    if (existingAuthUser) {
      userId = existingAuthUser.id;
      console.log(`  • Auth user exists: ${artisan.email} (${userId})`);
    } else {
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email: artisan.email,
        phone: cleanPhone,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: artisan.name,
          role: 'artisan',
          phone: artisan.phone
        }
      });

      if (authError) {
        console.error(`  ✗ Error creating auth user ${artisan.email}:`, authError.message);
        continue;
      }
      userId = newAuthUser.user.id;
      console.log(`  ✓ Created auth user: ${artisan.email} (${userId})`);
    }

    // B. Upsert Profile
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: artisan.name,
      avatar_url: artisan.profile_image,
      role: 'artisan',
      onboarding_completed: true,
      created_at: artisan.created_at,
      updated_at: artisan.updated_at
    });
    if (profileErr) console.error(`  ✗ Error in profiles table:`, profileErr.message);

    // C. Upsert ArtisanProfile
    const { data: artisanProfile, error: artProfErr } = await supabase.from('artisan_profiles').upsert({
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      city: artisan.city,
      state: artisan.state,
      country: 'India',
      address: `${artisan.city} Master Craft Studio, ${artisan.state}`,
      craft_id: craftId,
      bio: artisan.bio,
      experience_years: artisan.experience_years,
      price_per_hour: 450.00,
      profile_image_url: artisan.profile_image,
      verification_status: artisan.verification_status || 'verified',
      created_at: artisan.created_at,
      updated_at: artisan.updated_at
    }, { onConflict: 'user_id' }).select().single();

    if (artProfErr) {
      console.error(`  ✗ Error in artisan_profiles:`, artProfErr.message);
      continue;
    }

    // D. Create a curated demo Workshop for this artisan
    const artisanProfileId = artisanProfile.id;
    const { data: existingWorkshop } = await supabase
      .from('workshops')
      .select('id')
      .eq('artisan_id', artisanProfileId)
      .maybeSingle();

    if (!existingWorkshop) {
      const { data: newWorkshop, error: wsErr } = await supabase.from('workshops').insert({
        artisan_id: artisanProfileId,
        craft_id: craftId,
        name: artisan.workshop_title,
        description: artisan.workshop_description,
        location: `${artisan.city}, ${artisan.state}`,
        city: artisan.city,
        state: artisan.state,
        price: artisan.workshop_price,
        duration: artisan.workshop_duration,
        max_participants: 6,
        rating: artisan.rating || 4.8,
        reviews_count: Math.floor(Math.random() * 25) + 10,
        is_active: true,
        created_at: artisan.created_at,
        updated_at: artisan.updated_at
      }).select().single();

      if (wsErr) {
        console.error(`  ✗ Error creating workshop for ${artisan.name}:`, wsErr.message);
      } else {
        // Add Workshop Image
        await supabase.from('workshop_images').insert({
          workshop_id: newWorkshop.id,
          image_url: artisan.workshop_image,
          display_order: 1,
          created_at: artisan.created_at
        });
        console.log(`    + Published workshop: "${artisan.workshop_title}" (₹${artisan.workshop_price})`);
      }
    }
    console.log(`  ✓ Seeded Artisan: ${artisan.name} [${artisan.craft_category}, ${artisan.city}]`);
  }

  // 3. Seed Tourists
  console.log("\n[3/4] Seeding Tourists...");
  for (const tourist of SEED_DATA.tourists) {
    const [firstName, ...lastParts] = tourist.name.split(' ');
    const lastName = lastParts.join(' ') || 'Explorer';

    // A. Create/Find Auth User
    let userId;
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existingAuthUser = listData?.users?.find(u => u.email === tourist.email);

    const cleanPhone = tourist.phone ? tourist.phone.replace(/[^+\d]/g, '') : undefined;

    if (existingAuthUser) {
      userId = existingAuthUser.id;
      console.log(`  • Auth user exists: ${tourist.email} (${userId})`);
    } else {
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email: tourist.email,
        phone: cleanPhone,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: tourist.name,
          role: 'tourist',
          phone: tourist.phone
        }
      });

      if (authError) {
        console.error(`  ✗ Error creating auth user ${tourist.email}:`, authError.message);
        continue;
      }
      userId = newAuthUser.user.id;
      console.log(`  ✓ Created auth user: ${tourist.email} (${userId})`);
    }

    // B. Upsert Profile
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: tourist.name,
      avatar_url: tourist.profile_image,
      role: 'tourist',
      onboarding_completed: true,
      created_at: tourist.created_at,
      updated_at: tourist.updated_at
    });
    if (profileErr) console.error(`  ✗ Error in profiles table:`, profileErr.message);

    // C. Upsert TouristProfile
    const { data: touristProfile, error: tourProfErr } = await supabase.from('tourist_profiles').upsert({
      user_id: userId,
      first_name: firstName,
      last_name: lastName,
      gender: tourist.gender || 'Prefer not to say',
      city: tourist.city,
      state: tourist.state,
      country: 'India',
      profile_image_url: tourist.profile_image,
      created_at: tourist.created_at,
      updated_at: tourist.updated_at
    }, { onConflict: 'user_id' }).select().single();

    if (tourProfErr) {
      console.error(`  ✗ Error in tourist_profiles:`, tourProfErr.message);
      continue;
    }

    // D. Link Craft Interests
    if (touristProfile && tourist.interests) {
      for (const interestName of tourist.interests) {
        const craftId = craftMap[interestName] || allCrafts?.[0]?.id;
        if (craftId) {
          await supabase.from('tourist_craft_interests').upsert({
            tourist_id: touristProfile.id,
            craft_id: craftId,
            created_at: tourist.created_at
          }, { onConflict: 'tourist_id,craft_id' });
        }
      }
    }

    console.log(`  ✓ Seeded Tourist: ${tourist.name} [${tourist.travel_style}, ${tourist.city}]`);
  }

  // 4. Verification and Summary
  console.log("\n[4/4] Verifying Final Database Records...");
  const tables = [
    'crafts',
    'profiles',
    'artisan_profiles',
    'workshops',
    'workshop_images',
    'tourist_profiles',
    'tourist_craft_interests'
  ];

  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`  • Table '${table}': ${count} total records`);
  }

  const { data: finalAuthUsers } = await supabase.auth.admin.listUsers();
  console.log(`  • Supabase Auth Users: ${finalAuthUsers?.users?.length || 0} active accounts`);

  console.log("\n=======================================================");
  console.log("✅ SEEDING COMPLETE!");
  console.log(`Default login password for all accounts: "${DEMO_PASSWORD}"`);
  console.log("=======================================================\n");
}

seed().catch(err => {
  console.error("Fatal Seeding Error:", err);
  process.exit(1);
});
