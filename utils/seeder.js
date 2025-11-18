const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/UserAdvanced');
const InvestmentPlan = require('../models/InvestmentPlanAdvanced');

const advancedPlans = [
  // PRECIOUS METALS (6 plans)
  {
    name: "Gold Premium",
    description: "Invest in physical gold bullion with secure storage and insurance",
    material_type: "gold",
    material_subtype: "bullion",
    min_amount: 50000,
    max_amount: 5000000,
    daily_interest: 2.8,
    total_interest: 168,
    duration: 60,
    duration_unit: "days",
    risk_level: "low",
    category: "precious_metals",
    current_price: 1950,
    price_unit: "USD",
    features: [
      { title: "Secure Storage", description: "Fully insured vault storage", icon: "shield" },
      { title: "Physical Gold", description: "Actual gold bullion ownership", icon: "gem" },
      { title: "Liquidity", description: "Easy to buy and sell", icon: "trending-up" }
    ],
    is_active: true,
    is_popular: true,
    is_featured: true,
    compounding_enabled: true,
    images: {
      main: "/images/gold-main.jpg",
      gallery: ["/images/gold-1.jpg", "/images/gold-2.jpg"],
      chart: "/images/gold-chart.png"
    }
  },
  {
    name: "Silver Growth",
    description: "High-potential silver investment with industrial demand growth",
    material_type: "silver",
    material_subtype: "bullion",
    min_amount: 25000,
    max_amount: 2000000,
    daily_interest: 3.2,
    total_interest: 192,
    duration: 60,
    duration_unit: "days",
    risk_level: "medium",
    category: "precious_metals",
    current_price: 23.5,
    price_unit: "USD",
    features: [
      { title: "Industrial Demand", description: "Growing industrial applications", icon: "factory" },
      { title: "Affordable Entry", description: "Lower minimum investment", icon: "dollar-sign" },
      { title: "High Volatility", description: "Potential for rapid growth", icon: "zap" }
    ],
    is_active: true,
    is_popular: false,
    compounding_enabled: true
  },
  {
    name: "Platinum Elite",
    description: "Exclusive platinum investment for automotive and jewelry industries",
    material_type: "platinum",
    min_amount: 100000,
    max_amount: 10000000,
    daily_interest: 3.0,
    total_interest: 180,
    duration: 60,
    duration_unit: "days",
    risk_level: "medium",
    category: "precious_metals",
    current_price: 950,
    price_unit: "USD",
    features: [
      { title: "Rare Metal", description: "30x rarer than gold", icon: "award" },
      { title: "Industrial Use", description: "Automotive catalyst demand", icon: "car" },
      { title: "Exclusive", description: "Limited availability", icon: "lock" }
    ],
    is_active: true,
    is_featured: true
  },
  {
    name: "Palladium Tech",
    description: "Palladium for electronics and automotive catalytic converters",
    material_type: "palladium",
    min_amount: 75000,
    max_amount: 5000000,
    daily_interest: 3.5,
    total_interest: 210,
    duration: 60,
    duration_unit: "days",
    risk_level: "high",
    category: "precious_metals",
    current_price: 1400,
    price_unit: "USD",
    features: [
      { title: "Tech Applications", description: "Electronics and fuel cells", icon: "cpu" },
      { title: "Supply Deficit", description: "Growing demand, limited supply", icon: "trending-up" },
      { title: "Auto Industry", description: "Catalytic converter demand", icon: "settings" }
    ],
    is_active: true
  },
  {
    name: "Rhodium Ultra",
    description: "Ultra-rare rhodium for high-temperature applications",
    material_type: "rhodium",
    min_amount: 200000,
    max_amount: 20000000,
    daily_interest: 4.0,
    total_interest: 240,
    duration: 60,
    duration_unit: "days",
    risk_level: "very_high",
    category: "precious_metals",
    current_price: 10000,
    price_unit: "USD",
    features: [
      { title: "Extremely Rare", description: "Rarest precious metal", icon: "star" },
      { title: "High Temperature", description: "Industrial high-heat applications", icon: "thermometer" },
      { title: "Volatile", description: "Extreme price movements", icon: "activity" }
    ],
    is_active: true,
    requires_kyc: true,
    kyc_level_required: "enhanced"
  },

  // ENERGY (4 plans)
  {
    name: "Crude Oil Pro",
    description: "West Texas Intermediate crude oil futures investment",
    material_type: "crude_oil",
    material_subtype: "wti",
    min_amount: 100000,
    max_amount: 15000000,
    daily_interest: 3.8,
    total_interest: 228,
    duration: 90,
    duration_unit: "days",
    risk_level: "high",
    category: "energy",
    current_price: 75,
    price_unit: "USD",
    features: [
      { title: "Global Demand", description: "World's most traded commodity", icon: "globe" },
      { title: "Leveraged", description: "Futures contract exposure", icon: "bar-chart" },
      { title: "Geopolitical", description: "Affected by global events", icon: "map" }
    ],
    is_active: true,
    is_popular: true
  },
  {
    name: "Natural Gas",
    description: "Clean energy transition with natural gas investments",
    material_type: "natural_gas",
    min_amount: 50000,
    max_amount: 8000000,
    daily_interest: 3.2,
    total_interest: 288,
    duration: 90,
    duration_unit: "days",
    risk_level: "medium",
    category: "energy",
    current_price: 2.8,
    price_unit: "USD",
    features: [
      { title: "Clean Energy", description: "Transition fuel for renewables", icon: "wind" },
      { title: "Seasonal", description: "Weather-dependent demand", icon: "sun" },
      { title: "Storage", description: "Underground storage facilities", icon: "database" }
    ],
    is_active: true
  },
  {
    name: "Brent Oil",
    description: "International Brent crude oil benchmark",
    material_type: "brent_oil",
    min_amount: 120000,
    max_amount: 18000000,
    daily_interest: 3.6,
    total_interest: 324,
    duration: 90,
    duration_unit: "days",
    risk_level: "high",
    category: "energy",
    current_price: 78,
    price_unit: "USD",
    features: [
      { title: "Global Benchmark", description: "International oil pricing standard", icon: "award" },
      { title: "Marine Transport", description: "Water-shipped crude", icon: "anchor" },
      { title: "European Focus", description: "North Sea production", icon: "compass" }
    ],
    is_active: true
  },
  {
    name: "Gasoline Futures",
    description: "Refined gasoline for automotive and transportation",
    material_type: "gasoline",
    min_amount: 80000,
    max_amount: 12000000,
    daily_interest: 3.4,
    total_interest: 306,
    duration: 90,
    duration_unit: "days",
    risk_level: "medium",
    category: "energy",
    current_price: 2.4,
    price_unit: "USD",
    features: [
      { title: "Refined Product", description: "Processed from crude oil", icon: "droplets" },
      { title: "Travel Demand", description: "Linked to transportation needs", icon: "car" },
      { title: "Summer Peak", description: "Seasonal demand patterns", icon: "sun" }
    ],
    is_active: true
  },

  // INDUSTRIAL METALS (5 plans)
  {
    name: "Copper Industrial",
    description: "Copper for electrical wiring and construction",
    material_type: "copper",
    min_amount: 30000,
    max_amount: 5000000,
    daily_interest: 2.9,
    total_interest: 261,
    duration: 90,
    duration_unit: "days",
    risk_level: "medium",
    category: "industrial_metals",
    current_price: 3.8,
    price_unit: "USD",
    features: [
      { title: "Electrical Use", description: "Best electrical conductor", icon: "zap" },
      { title: "Construction", description: "Building and infrastructure", icon: "home" },
      { title: "Renewables", description: "Wind and solar applications", icon: "battery" }
    ],
    is_active: true,
    is_popular: true
  },
  {
    name: "Aluminum Light",
    description: "Lightweight aluminum for automotive and aerospace",
    material_type: "aluminum",
    min_amount: 25000,
    max_amount: 4000000,
    daily_interest: 2.7,
    total_interest: 243,
    duration: 90,
    duration_unit: "days",
    risk_level: "medium",
    category: "industrial_metals",
    current_price: 2.2,
    price_unit: "USD",
    features: [
      { title: "Lightweight", description: "High strength-to-weight ratio", icon: "feather" },
      { title: "Recyclable", description: "Infinitely recyclable metal", icon: "refresh-cw" },
      { title: "Transportation", description: "Auto and aerospace industries", icon: "truck" }
    ],
    is_active: true
  },
  {
    name: "Zinc Alloy",
    description: "Zinc for galvanizing and alloy production",
    material_type: "zinc",
    min_amount: 20000,
    max_amount: 3000000,
    daily_interest: 2.8,
    total_interest: 252,
    duration: 90,
    duration_unit: "days",
    risk_level: "medium",
    category: "industrial_metals",
    current_price: 1.2,
    price_unit: "USD",
    features: [
      { title: "Galvanizing", description: "Steel corrosion protection", icon: "shield" },
      { title: "Alloys", description: "Brass and bronze production", icon: "package" },
      { title: "Batteries", description: "Zinc-air batteries", icon: "battery-charging" }
    ],
    is_active: true
  },
  {
    name: "Nickel Stainless",
    description: "Nickel for stainless steel and batteries",
    material_type: "nickel",
    min_amount: 40000,
    max_amount: 6000000,
    daily_interest: 3.3,
    total_interest: 297,
    duration: 90,
    duration_unit: "days",
    risk_level: "high",
    category: "industrial_metals",
    current_price: 8.5,
    price_unit: "USD",
    features: [
      { title: "Stainless Steel", description: "Primary use in steel production", icon: "hard-drive" },
      { title: "EV Batteries", description: "Electric vehicle battery demand", icon: "car" },
      { title: "Corrosion Resistant", description: "Doesn't rust or corrode", icon: "shield-off" }
    ],
    is_active: true
  },
  {
    name: "Iron Ore Steel",
    description: "Iron ore for global steel production",
    material_type: "iron_ore",
    min_amount: 35000,
    max_amount: 5500000,
    daily_interest: 2.6,
    total_interest: 234,
    duration: 90,
    duration_unit: "days",
    risk_level: "medium",
    category: "industrial_metals",
    current_price: 120,
    price_unit: "USD",
    features: [
      { title: "Steel Production", description: "Essential for steel making", icon: "factory" },
      { title: "Infrastructure", description: "Buildings and bridges", icon: "building" },
      { title: "Global Trade", description: "Internationally traded commodity", icon: "globe" }
    ],
    is_active: true
  },

  // AGRICULTURE (6 plans)
  {
    name: "Cocoa Premium",
    description: "Premium cocoa beans for chocolate production",
    material_type: "cocoa",
    min_amount: 15000,
    max_amount: 2000000,
    daily_interest: 3.1,
    total_interest: 279,
    duration: 120,
    duration_unit: "days",
    risk_level: "medium",
    category: "agriculture",
    current_price: 3200,
    price_unit: "USD",
    features: [
      { title: "Chocolate", description: "Primary ingredient in chocolate", icon: "heart" },
      { title: "West Africa", description: "Ghana and Ivory Coast production", icon: "map-pin" },
      { title: "Seasonal", description: "Weather-dependent harvests", icon: "cloud-rain" }
    ],
    is_active: true,
    is_popular: true
  },
  {
    name: "Coffee Arabica",
    description: "High-quality Arabica coffee beans",
    material_type: "coffee",
    material_subtype: "arabica",
    min_amount: 18000,
    max_amount: 2500000,
    daily_interest: 2.9,
    total_interest: 348,
    duration: 120,
    duration_unit: "days",
    risk_level: "medium",
    category: "agriculture",
    current_price: 1.8,
    price_unit: "USD",
    features: [
      { title: "Premium Quality", description: "High-grade Arabica beans", icon: "star" },
      { title: "Global Demand", description: "World's most popular beverage", icon: "coffee" },
      { title: "Climate Sensitive", description: "Specific growing conditions", icon: "thermometer" }
    ],
    is_active: true
  },
  {
    name: "Sugar Sweet",
    description: "Raw sugar for food and beverage industry",
    material_type: "sugar",
    min_amount: 12000,
    max_amount: 1800000,
    daily_interest: 2.5,
    total_interest: 300,
    duration: 120,
    duration_unit: "days",
    risk_level: "low",
    category: "agriculture",
    current_price: 0.24,
    price_unit: "USD",
    features: [
      { title: "Food Industry", description: "Essential food ingredient", icon: "utensils" },
      { title: "Biofuel", description: "Ethanol production", icon: "fuel" },
      { title: "Stable Demand", description: "Consistent global consumption", icon: "trending-up" }
    ],
    is_active: true
  },
  {
    name: "Wheat Grain",
    description: "Wheat for bread and food production",
    material_type: "wheat",
    min_amount: 10000,
    max_amount: 1500000,
    daily_interest: 2.4,
    total_interest: 288,
    duration: 120,
    duration_unit: "days",
    risk_level: "medium",
    category: "agriculture",
    current_price: 6.5,
    price_unit: "USD",
    features: [
      { title: "Staple Food", description: "Basic food commodity worldwide", icon: "wheat" },
      { title: "Weather Dependent", description: "Sensitive to climate conditions", icon: "cloud-snow" },
      { title: "Global Trade", description: "Internationally traded", icon: "shipping" }
    ],
    is_active: true
  },
  {
    name: "Corn Maize",
    description: "Corn for food, feed, and ethanol",
    material_type: "corn",
    min_amount: 11000,
    max_amount: 1600000,
    daily_interest: 2.6,
    total_interest: 312,
    duration: 120,
    duration_unit: "days",
    risk_level: "medium",
    category: "agriculture",
    current_price: 4.8,
    price_unit: "USD",
    features: [
      { title: "Versatile Use", description: "Food, animal feed, and fuel", icon: "layers" },
      { title: "US Production", description: "Largest producer worldwide", icon: "flag" },
      { title: "Biofuel", description: "Ethanol production", icon: "leaf" }
    ],
    is_active: true
  },
  {
    name: "Soybeans Protein",
    description: "Soybeans for food and animal feed",
    material_type: "soybeans",
    min_amount: 13000,
    max_amount: 1900000,
    daily_interest: 2.7,
    total_interest: 324,
    duration: 120,
    duration_unit: "days",
    risk_level: "medium",
    category: "agriculture",
    current_price: 13.2,
    price_unit: "USD",
    features: [
      { title: "Protein Source", description: "Plant-based protein", icon: "egg" },
      { title: "Animal Feed", description: "Livestock and poultry feed", icon: "github" },
      { title: "Vegetable Oil", description: "Cooking oil production", icon: "droplet" }
    ],
    is_active: true
  },

  // TECHNOLOGY & CRYPTO (4 plans)
  {
    name: "Cryptocurrency Bundle",
    description: "Diversified cryptocurrency portfolio (BTC, ETH, ADA, SOL)",
    material_type: "cryptocurrency",
    min_amount: 20000,
    max_amount: 10000000,
    daily_interest: 4.5,
    total_interest: 405,
    duration: 60,
    duration_unit: "days",
    risk_level: "very_high",
    category: "crypto",
    current_price: 45000,
    price_unit: "USD",
    features: [
      { title: "Diversified", description: "Multiple cryptocurrency exposure", icon: "pie-chart" },
      { title: "High Growth", description: "Potential for rapid appreciation", icon: "rocket" },
      { title: "24/7 Market", description: "Continuous trading availability", icon: "clock" }
    ],
    is_active: true,
    is_featured: true,
    requires_kyc: true,
    kyc_level_required: "enhanced"
  },
  {
    name: "Blockchain Tech",
    description: "Investment in blockchain infrastructure and technology",
    material_type: "blockchain",
    min_amount: 50000,
    max_amount: 8000000,
    daily_interest: 4.2,
    total_interest: 378,
    duration: 90,
    duration_unit: "days",
    risk_level: "high",
    category: "technology",
    current_price: 0, // Not applicable
    price_unit: "USD",
    features: [
      { title: "Infrastructure", description: "Blockchain network development", icon: "server" },
      { title: "Web3", description: "Next generation internet", icon: "globe" },
      { title: "Innovation", description: "Cutting-edge technology", icon: "cpu" }
    ],
    is_active: true,
    requires_kyc: true
  },
  {
    name: "Battery Metals",
    description: "Lithium, cobalt, and graphite for EV batteries",
    material_type: "battery_metals",
    min_amount: 60000,
    max_amount: 9000000,
    daily_interest: 3.8,
    total_interest: 342,
    duration: 120,
    duration_unit: "days",
    risk_level: "high",
    category: "technology",
    current_price: 0, // Composite
    price_unit: "USD",
    features: [
      { title: "EV Revolution", description: "Electric vehicle battery demand", icon: "car" },
      { title: "Energy Storage", description: "Grid and home storage", icon: "battery" },
      { title: "Green Tech", description: "Renewable energy transition", icon: "leaf" }
    ],
    is_active: true
  },
  {
    name: "Tech Metals",
    description: "Rare earth elements for electronics and tech",
    material_type: "tech_metals",
    min_amount: 70000,
    max_amount: 10000000,
    daily_interest: 3.6,
    total_interest: 432,
    duration: 120,
    duration_unit: "days",
    risk_level: "high",
    category: "technology",
    current_price: 0, // Composite
    price_unit: "USD",
    features: [
      { title: "Electronics", description: "Smartphones and computers", icon: "smartphone" },
      { title: "Rare Earths", description: "Limited global supply", icon: "gem" },
      { title: "Tech Growth", description: "Growing technology sector", icon: "trending-up" }
    ],
    is_active: true
  },

  // REAL ESTATE & SPECIALTY (4 plans)
  {
    name: "Commercial Real Estate",
    description: "Prime commercial property investments",
    material_type: "real_estate",
    material_subtype: "commercial",
    min_amount: 500000,
    max_amount: 50000000,
    daily_interest: 2.2,
    total_interest: 198,
    duration: 180,
    duration_unit: "days",
    risk_level: "low",
    category: "real_estate",
    current_price: 0, // Varies by property
    price_unit: "USD",
    features: [
      { title: "Stable Income", description: "Rental income streams", icon: "dollar-sign" },
      { title: "Appreciation", description: "Property value growth", icon: "trending-up" },
      { title: "Inflation Hedge", description: "Protection against inflation", icon: "shield" }
    ],
    is_active: true,
    requires_kyc: true,
    kyc_level_required: "full"
  },
  {
    name: "Timber Forest",
    description: "Sustainable timber and forestry investments",
    material_type: "timber",
    min_amount: 100000,
    max_amount: 20000000,
    daily_interest: 2.8,
    total_interest: 504,
    duration: 180,
    duration_unit: "days",
    risk_level: "medium",
    category: "real_estate",
    current_price: 0, // Varies
    price_unit: "USD",
    features: [
      { title: "Sustainable", description: "Renewable resource", icon: "tree" },
      { title: "Carbon Credits", description: "Additional revenue stream", icon: "leaf" },
      { title: "Long-term", description: "Appreciation over time", icon: "calendar" }
    ],
    is_active: true
  },
  {
    name: "Water Rights",
    description: "Investment in water resources and rights",
    material_type: "water_rights",
    min_amount: 150000,
    max_amount: 25000000,
    daily_interest: 3.0,
    total_interest: 540,
    duration: 180,
    duration_unit: "days",
    risk_level: "medium",
    category: "specialty",
    current_price: 0, // Varies
    price_unit: "USD",
    features: [
      { title: "Essential Resource", description: "Critical for life and industry", icon: "droplets" },
      { title: "Scarcity", description: "Growing water scarcity", icon: "alert-triangle" },
      { title: "Regulated", description: "Government-regulated resource", icon: "file-text" }
    ],
    is_active: true,
    requires_kyc: true
  },
  {
    name: "Orange Juice",
    description: "Frozen concentrated orange juice futures",
    material_type: "orange_juice",
    min_amount: 20000,
    max_amount: 3000000,
    daily_interest: 3.2,
    total_interest: 576,
    duration: 120,
    duration_unit: "days",
    risk_level: "high",
    category: "agriculture",
    current_price: 1.8,
    price_unit: "USD",
    features: [
      { title: "Breakfast Staple", description: "Popular breakfast beverage", icon: "coffee" },
      { title: "Weather Sensitive", description: "Florida and Brazil production", icon: "sun" },
      { title: "Futures Market", description: "Commodity futures trading", icon: "bar-chart" }
    ],
    is_active: true,
    is_popular: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/raw-wealthy');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await InvestmentPlan.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 12);
    const adminUser = await User.create({
      full_name: 'System Administrator',
      email: 'admin@rawwealthy.com',
      phone: '+2348000000000',
      password: adminPassword,
      role: 'admin',
      kyc_verified: true,
      kyc_level: 'full',
      balance: 0,
      referral_code: 'ADMIN001',
      is_active: true,
      notification_preferences: {
        email: { investments: true, earnings: true, security: true, marketing: true },
        sms: { investments: true, withdrawals: true, security: true },
        push: { all: true }
      },
      bank_details: {
        bank_name: 'Admin Bank',
        account_name: 'Raw Wealthy Admin',
        account_number: '0000000000',
        verified: true,
        verified_at: new Date()
      },
      profile_completion: 100,
      currency: 'USD',
      country: 'NG',
      membership_tier: 'elite'
    });

    console.log('✅ Admin user created');

    // Add created_by to all plans
    const plansWithCreator = advancedPlans.map(plan => ({
      ...plan,
      created_by: adminUser._id,
      current_price: plan.current_price || 100,
      historical_returns: [
        { year: 2022, return_percentage: plan.total_interest * 0.8 },
        { year: 2023, return_percentage: plan.total_interest * 0.9 },
        { year: 2024, return_percentage: plan.total_interest }
      ]
    }));

    // Create investment plans
    await InvestmentPlan.create(plansWithCreator);
    console.log(`✅ Created ${advancedPlans.length} investment plans`);

    // Create sample user
    const userPassword = await bcrypt.hash('User123!', 12);
    await User.create({
      full_name: 'Demo User',
      email: 'user@rawwealthy.com',
      phone: '+2348112223333',
      password: userPassword,
      role: 'user',
      kyc_verified: true,
      kyc_level: 'enhanced',
      balance: 500000,
      referral_code: 'DEMO1234',
      is_active: true,
      referred_by: adminUser._id,
      bank_details: {
        bank_name: 'Demo Bank',
        account_name: 'Demo User',
        account_number: '1234567890',
        verified: true,
        verified_at: new Date()
      },
      profile_completion: 95,
      currency: 'NGN',
      country: 'NG',
      membership_tier: 'premium'
    });

    console.log('✅ Demo user created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('📧 Admin Login: admin@rawwealthy.com');
    console.log('🔑 Admin Password: Admin123!');
    console.log('📧 User Login: user@rawwealthy.com');
    console.log('🔑 User Password: User123!');
    console.log(`📊 Total Investment Plans: ${advancedPlans.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, advancedPlans };
