export interface Destination {
  id: string
  name: string
  state: string
  tagline: string
  overview: string
  keyFacts: string[]
  nearbyAttractions: Array<{ name: string; distance: string }>
  budgetActivities: Array<{ name: string; description: string; cost?: string }>
  categories: string[]
  attributes: {
    weather: 'warm' | 'year-round' | 'seasonal'
    vibe: string[]
  }
}

export const destinations: Destination[] = [
  {
    id: 'orlando',
    name: 'Orlando',
    state: 'Florida',
    tagline: 'Theme Park Thrills',
    overview: 'Everything is a bit more fun and a whole lot sunnier in Orlando. Whether you want to hit the parks or a hole-in-one, this is the perfect city for the whole fam.',
    keyFacts: [
      'Walt Disney World® is about the same size as San Francisco',
      'Go for maximum thrills at Universal\'s Islands of Adventure®',
      'Eat your way through WalletHub\'s "Best Foodie City in the Country" for 2023'
    ],
    nearbyAttractions: [
      { name: 'Walt Disney World®', distance: '3 miles from resort' },
      { name: 'Disney Springs®', distance: '10 miles from resort' },
      { name: 'Gatorland', distance: '21 miles from resort' },
      { name: 'Icon Park', distance: '18 miles from resort' },
      { name: 'Kennedy Space Center', distance: '71 miles from resort' }
    ],
    budgetActivities: [
      { name: 'Lake Apopka Wildlife Trail', description: '11-mile nature drive with loads of gators, birds, turtles, and fish. REAL Florida experience.', cost: 'Free' },
      { name: 'Blue Spring State Park', description: 'Crystal-clear waters with hundreds of manatees in their natural habitat.', cost: '$6 per carload' },
      { name: 'Orlando\'s Cat Cafe', description: 'Four miles from Disney\'s Animal Kingdom®. Hangout for cool cats.', cost: '$10 for one hour' },
      { name: 'Wekiwa Springs', description: 'Natural oasis with cool, clear water—pool-perfect 72 degrees year-round.', cost: '$6 per carload' }
    ],
    categories: ['themeparks', 'family', 'cities'],
    attributes: {
      weather: 'year-round',
      vibe: ['theme parks', 'family-friendly', 'entertainment', 'dining']
    }
  },
  {
    id: 'branson',
    name: 'Branson',
    state: 'Missouri',
    tagline: 'From Go Time to Showtime',
    overview: 'Open-air adventure, magical mountain views, and incredible theater shows. Escape to the Ozarks for a true something-for-everyone vacation.',
    keyFacts: [
      'Branson is home to more than 50 theater venues',
      'Go on a coaster ride through the Ozarks at Mountain Adventure Park',
      'Options for all tastes—from American fare to Italian to Mexican'
    ],
    nearbyAttractions: [
      { name: 'Table Rock Lake', distance: '12 miles from resort' },
      { name: 'Silver Dollar City® Theme Park', distance: '11 miles from resort' },
      { name: 'Buffalo National River', distance: '51 miles from resort' },
      { name: 'Sight & Sound Theatres®', distance: '19 miles from resort' },
      { name: 'Titanic™ Museum Attraction', distance: '7 miles from resort' }
    ],
    budgetActivities: [
      { name: 'Horse Walk Thoroughfare', description: 'Meet the quarter horses and best trick riders in the world at Dolly Parton\'s Stampede®.', cost: 'Free' },
      { name: 'Dick\'s Old-Time Five & Dime', description: 'Over 250,000 items in this old-fashioned general store.', cost: 'Free' },
      { name: 'The Branson Coaster', description: 'Top 10 mountain coasters in the world with 360-degree loops.', cost: '$16.99-$10.99' },
      { name: 'Butterfly Palace', description: 'Two-story aviary filled with thousands of exotic butterflies.', cost: '$18 for 3-day pass' }
    ],
    categories: ['mountains', 'family', 'entertainment'],
    attributes: {
      weather: 'seasonal',
      vibe: ['shows', 'mountain views', 'family-friendly', 'outdoor adventure']
    }
  },
  {
    id: 'cocoa-beach',
    name: 'Cocoa Beach',
    state: 'Florida',
    tagline: 'Surf and Sun',
    overview: 'Year-round warm weather, miles of surf, and the Kennedy Space Center℠ Visitor Complex make Cocoa Beach a stellar place for your next getaway.',
    keyFacts: [
      'Cocoa Beach is home to the largest surf shop in the world—Ron Jon Surf Shop®',
      'Learn how to surf or go on a paddleboard bioluminescent tour',
      'Bars and grills, cute cafes, and plenty of seafood options'
    ],
    nearbyAttractions: [
      { name: 'Kennedy Space Center℠ Visitor Complex', distance: '16.3 miles from resort' },
      { name: 'Cocoa Beach Pier', distance: '3.2 miles from resort' },
      { name: 'Rocket Launch viewing', distance: '1.9 miles from resort' },
      { name: 'Bioluminescence Tour', distance: '48 miles from resort' },
      { name: 'Jetty Park', distance: '0.2 miles from resort' }
    ],
    budgetActivities: [
      { name: 'Barrier Island Sanctuary', description: 'Access to ocean, lagoon, hiking trail, and coastal biology center.', cost: 'Free' },
      { name: 'Sail Cocoa Beach', description: 'Two-hour catamaran cruise. Kids sail free with adult ticket.', cost: 'Kids free' },
      { name: 'Florida Surf Museum', description: 'Rare boards, vintage decals, surf music, throwback photos.', cost: '$2 donation' },
      { name: 'Turtle Night Walk', description: 'Witness loggerhead sea turtle lay eggs. Second-largest nesting site in the world.', cost: '$15-$20' }
    ],
    categories: ['beaches', 'family', 'water'],
    attributes: {
      weather: 'year-round',
      vibe: ['beach', 'surfing', 'space coast', 'relaxation']
    }
  },
  {
    id: 'galveston',
    name: 'Galveston',
    state: 'Texas',
    tagline: 'Time to Coast',
    overview: 'An island city on the Gulf Coast of Texas with more than 30 miles of beaches, more than a dozen museums, and several historic homes and mansions.',
    keyFacts: [
      'One of the best spots in the country for bird-watching',
      'Stroll along the Seawall, visit the beach, or go on a historic walking tour',
      'Love seafood? You\'ll love this place. Not a fan of fish? There are plenty more options, too'
    ],
    nearbyAttractions: [
      { name: 'Galveston Island Historic Pleasure Pier', distance: '8 miles from resort' },
      { name: 'Moody Gardens®', distance: '5 miles from resort' },
      { name: 'Galveston Railroad Museum', distance: '18 miles from resort' },
      { name: 'The Grand 1894 Opera House', distance: '18 miles from resort' },
      { name: 'Bishop\'s Palace', distance: '18 miles from resort' }
    ],
    budgetActivities: [
      { name: 'Turtles About Town Trail', description: 'More than 60 colorful sea turtle statues by local artists.', cost: 'Free' },
      { name: 'East Beach Sandcastle Saturdays', description: 'Free sandcastle-building sessions with pros.', cost: 'Free' },
      { name: 'Texas Seaport Museum', description: 'Home to the 1877 tall ship ELISSA.', cost: 'Free for under 5' },
      { name: 'Galveston Island Brewery', description: 'FREE brewery tours every Saturday.', cost: 'Free' }
    ],
    categories: ['beaches', 'historic', 'family'],
    attributes: {
      weather: 'warm',
      vibe: ['beach', 'history', 'seafood', 'coastal charm']
    }
  },
  {
    id: 'gatlinburg',
    name: 'Gatlinburg',
    state: 'Tennessee',
    tagline: 'The Great Outdoors',
    overview: 'Nature is calling—and Gatlinburg is the answer. Zip, raft, and hike your way through and around the scenic Smoky Mountains.',
    keyFacts: [
      'The Great Smoky Mountains National Park is the most visited U.S. national park',
      'Get an unreal view of the Smokies from the Gatlinburg SkyLift Park',
      'Feast on BBQ, burgers, and comfort food in cozy diners and rustic cabins'
    ],
    nearbyAttractions: [
      { name: 'Gatlinburg Skypark', distance: '0.4 miles from resort' },
      { name: 'Gatlinburg Mountain Coaster', distance: '2 miles from resort' },
      { name: 'Ole Smoky Moonshine®', distance: '0.4 miles from resort' },
      { name: 'Great Smoky Mountains National Park', distance: '0.6 miles from resort' },
      { name: 'Tuckaleechee Caverns', distance: '25 miles from resort' }
    ],
    budgetActivities: [
      { name: 'Salt and Pepper Shaker Museum', description: 'More than 20,000 shakers from different eras.', cost: 'Free for under 12' },
      { name: 'Bush\'s® Visitor Center', description: '100 years of bean history. Walk inside a can of beans.', cost: 'Free' },
      { name: 'The Great Smoky Firefly Event', description: 'Nature\'s most extraordinary light show with synchronized fireflies.', cost: 'Free' },
      { name: 'Hillbilly Golf', description: 'Smoky Mountain-style putt-putt down a shady hillside.', cost: '$9.50 for kids' }
    ],
    categories: ['mountains', 'family', 'outdoor'],
    attributes: {
      weather: 'seasonal',
      vibe: ['mountains', 'hiking', 'nature', 'outdoor adventure']
    }
  },
  {
    id: 'lake-tahoe',
    name: 'Lake Tahoe',
    state: 'Nevada',
    tagline: 'Freshwater Fun',
    overview: 'Adventure in every season. Swim, kayak, and windsurf in the summer, hike the Tahoe Rim Trail in the fall or spring, or hit the ski slopes in the winter.',
    keyFacts: [
      'Lake Tahoe averages 300 days of sunshine',
      'Hike or kayak at Emerald Bay State Park—jaw-dropping views included',
      'Feast on everything from American to Mexican, seafood to vegetarian dishes'
    ],
    nearbyAttractions: [
      { name: 'Heavenly Village Lake Tahoe', distance: '6 miles from resort' },
      { name: 'Carson Valley Wildlife & Photography Tours', distance: '34 miles from resort' },
      { name: 'Vikingsholm', distance: '20 miles from resort' },
      { name: 'Emerald Bay State Park', distance: '20 miles from resort' },
      { name: 'Sand Harbor', distance: '24 miles from resort' }
    ],
    budgetActivities: [
      { name: 'Nevada State Railroad Museum', description: 'Historic trains featured in old cowboy movies and TV westerns.', cost: 'Free for under 17' },
      { name: 'Tallac Historic Site', description: '150-acre lakefront property showcasing Tahoe\'s "Era of Opulence".', cost: 'Free' },
      { name: 'Vikingsholm', description: 'Lake Tahoe\'s hidden castle with Scandinavian architecture.', cost: 'Free under 7' },
      { name: 'Monkey Rock', description: 'Short hike to gorilla-shaped rock with jaw-dropping Lake Tahoe view.', cost: '$2 per person' }
    ],
    categories: ['mountains', 'water', 'outdoor'],
    attributes: {
      weather: 'seasonal',
      vibe: ['lake', 'skiing', 'hiking', 'scenic beauty']
    }
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas',
    state: 'Nevada',
    tagline: 'Viva La Vacation',
    overview: 'Live it up in Las Vegas—family edition. Go beyond nightlife and casinos to nearby natural attractions like the Grand Canyon.',
    keyFacts: [
      'The Grand Canyon is 277 miles long and 18 miles wide',
      'Reach new heights on the High Roller®—the second largest Ferris wheel in the world',
      'Find new faves—from fine dining to budget eats to delectable food truck options'
    ],
    nearbyAttractions: [
      { name: 'Golfing', distance: '5 miles from resort' },
      { name: 'Vegas Motor Speedway', distance: '15 miles from resort' },
      { name: 'Lake Mead', distance: '36 miles from resort' },
      { name: 'The Sphere', distance: '0.2 miles from resort' },
      { name: 'Fremont Street Experience', distance: '6 miles from resort' }
    ],
    budgetActivities: [
      { name: 'Silverton Las Vegas Mermaid Show', description: 'Real mermaids in 117,000-gallon aquarium.', cost: 'Free' },
      { name: 'Hershey\'s Chocolate World', description: 'Two-story factory of fun. Customize chocolate bars.', cost: 'Free admission' },
      { name: 'Fountains of Bellagio®', description: 'More than 1,200 lighted fountains spring to life every 15-30 minutes.', cost: 'Free' },
      { name: 'Bellagio® Conservatory & Botanical Gardens', description: 'Four seasonal floral fantasies per year.', cost: 'Free' }
    ],
    categories: ['cities', 'entertainment', 'themeparks'],
    attributes: {
      weather: 'warm',
      vibe: ['entertainment', 'shows', 'dining', 'attractions']
    }
  },
  {
    id: 'myrtle-beach',
    name: 'Myrtle Beach',
    state: 'South Carolina',
    tagline: 'Catch a Wave',
    overview: 'The Carolina coast is calling. Get out to the Grand Strand with the whole fam for sunny skies and ocean vibes. Myrtle Beach has shopping and golf courses galore.',
    keyFacts: [
      'Myrtle Beach has more mini golf courses per square mile than any other city in the world',
      'Go 20 stories above the Atlantic on the Myrtle Beach SkyWheel',
      'Fresh oysters, shrimp, and fish. Italian, Mexican, and American fare also available'
    ],
    nearbyAttractions: [
      { name: 'Broadway at the Beach', distance: '6 miles from resort' },
      { name: 'Wonderworks', distance: '6 miles from resort' },
      { name: 'Brookgreen Gardens', distance: '14 miles from resort' },
      { name: 'Ripley\'s Aquarium® of Myrtle Beach', distance: '6 miles from resort' },
      { name: 'Murrels Inlet', distance: '11 miles from resort' }
    ],
    budgetActivities: [
      { name: 'L.W. Paul Living History Farm', description: 'Immerse in life on a Horry County farm. One-hour tours every Saturday.', cost: 'Free' },
      { name: 'Apollo Moonprints in Cement', description: 'Prints made by Charles Duke, 10th man to walk on moon.', cost: 'Free' },
      { name: 'Savannah\'s Playground', description: 'Multi-acre park for kids of all ages and abilities.', cost: 'Free' },
      { name: 'Family Kingdom on the Grand Strand', description: 'Old-time amusement park by the sea. Nearly 40 rides.', cost: 'Free admission' }
    ],
    categories: ['beaches', 'family', 'golf'],
    attributes: {
      weather: 'warm',
      vibe: ['beach', 'boardwalk', 'golf', 'family entertainment']
    }
  },
  {
    id: 'new-orleans',
    name: 'New Orleans',
    state: 'Louisiana',
    tagline: 'Jazzy Times Ahead',
    overview: 'Head down to the Bayou for big-time fun. Go on a swamp tour, take in the iconic architecture, and eat all the Cajun food you can handle.',
    keyFacts: [
      'New Orleans is the birthplace of jazz music',
      'Get out on the water with an air boat swamp tour or a steamboat jazz cruise',
      'Come for the Creole food and stay for the pillowy beignets'
    ],
    nearbyAttractions: [
      { name: 'Bourbon Street', distance: '0.2 miles from resort' },
      { name: 'Jackson Square in French Quarter', distance: '1 mile from resort' },
      { name: 'Woldenburg Riverfront Park', distance: '1 mile from resort' },
      { name: 'Mardi Gras World', distance: '1.9 miles from resort' },
      { name: 'Royal Carriages', distance: '1 mile from resort' }
    ],
    budgetActivities: [
      { name: 'Nola Tour Guy - Garden District Walking Tour', description: 'Local experts take you through historic neighborhood.', cost: 'Free, tips welcome' },
      { name: 'Live Street Performances', description: 'Brass bands, jazz, hip-hop acts on street corners.', cost: 'Free, tips appreciated' },
      { name: 'Music Box Village', description: 'Musical houses that let out sounds when touched.', cost: 'Free admission' },
      { name: 'Hansen\'s Sno-Bliz', description: '85-year tradition. Sno-ball made with fluffy ice and homemade syrups.', cost: 'Low cost' }
    ],
    categories: ['cities', 'historic', 'entertainment'],
    attributes: {
      weather: 'warm',
      vibe: ['culture', 'music', 'food', 'history']
    }
  },
  {
    id: 'scottsdale',
    name: 'Scottsdale',
    state: 'Arizona',
    tagline: 'Relaxation Mode On',
    overview: 'Absolute serenity. With destination spas, more than 200 golf courses, and stunning rock formations, Scottsdale is the perfect place to turn relaxation all the way up.',
    keyFacts: [
      'Scottsdale has more spas per capita than any other city in the U.S.',
      'Make 30,000 acres of desert your playground at the McDowell Sonoran Preserve',
      'Diverse culinary landscape with everything from fine dining to cozy cafes'
    ],
    nearbyAttractions: [
      { name: 'Old Town Scottsdale', distance: '11 miles from resort' },
      { name: 'Pink® Jeep® Scenic Rim Tour', distance: '111 miles from resort' },
      { name: 'Phoenix Zoo', distance: '19 miles from resort' },
      { name: 'Talking Stick Entertainment District', distance: '10 miles from resort' },
      { name: 'Grand Canyon', distance: '219 miles from resort' }
    ],
    budgetActivities: [
      { name: 'Old Town Scottsdale Parada del Sol Rodeo Museum', description: 'Packed with Scottsdale rodeo history. Kids can climb on bulls for photos.', cost: 'Free' },
      { name: 'Salt River', description: 'Oasis in Sonoran Desert. See wild horses, eagles, mud turtles, deer.', cost: 'Free admission' },
      { name: 'Little Canyon Park', description: 'Bank Shot Basketball Court—mini golf with basketball twist.', cost: 'Free' },
      { name: 'Desert Botanical Gardens Flashlight Nights', description: 'Self-guided Saturday adventures after dark.', cost: '$9.95 for kids' }
    ],
    categories: ['cities', 'golf', 'relaxation'],
    attributes: {
      weather: 'warm',
      vibe: ['spa', 'golf', 'desert', 'luxury']
    }
  },
  {
    id: 'williamsburg',
    name: 'Williamsburg',
    state: 'Virginia',
    tagline: 'Living History',
    overview: 'Experience time travel in Williamsburg. Roam the cobblestone streets and watch lively reenactments. When you\'ve had your fill of history, tap into present-day fun.',
    keyFacts: [
      'Williamsburg was one of America\'s first planned cities',
      'Watch for birds from the overlook or hike the trails at York River State Park',
      'Pick from over 40 dining options, including colonial-themed restaurants and taverns'
    ],
    nearbyAttractions: [
      { name: 'Busch Gardens', distance: '12 miles from resort' },
      { name: 'Colonial Williamsburg', distance: '8 miles from resort' },
      { name: 'Virginia Beach', distance: '68 miles from resort' },
      { name: 'Water Country USA®', distance: '13 miles from resort' },
      { name: 'Williamsburg Tasting Trail', distance: '14 miles from resort' }
    ],
    budgetActivities: [
      { name: 'Kidsburg at Veterans Park', description: 'Jamestown-themed playground with replica ship.', cost: 'Free' },
      { name: 'Virginia Living Museum', description: 'Zoo, nature park, aquarium, science center, planetarium all-in-one.', cost: '$16.95 for kids' },
      { name: 'Spooks and Legends Haunted Tour', description: 'After-dark walking tour of colonial Williamsburg.', cost: 'Free under 6' },
      { name: 'Bush Neck Farm', description: 'Berry picking overlooking the Chickahominy River.', cost: 'Free visit, $2/lb berries' }
    ],
    categories: ['historic', 'themeparks', 'family'],
    attributes: {
      weather: 'seasonal',
      vibe: ['history', 'colonial', 'theme parks', 'education']
    }
  }
]

// Category mappings for natural language queries
export const categoryMappings = {
  beaches: ['cocoa-beach', 'galveston', 'myrtle-beach'],
  mountains: ['lake-tahoe', 'gatlinburg', 'branson'],
  cities: ['las-vegas', 'new-orleans', 'scottsdale', 'orlando'],
  themeparks: ['orlando', 'williamsburg'],
  historic: ['williamsburg', 'new-orleans', 'galveston'],
  family: ['orlando', 'branson', 'williamsburg', 'myrtle-beach', 'cocoa-beach', 'gatlinburg'],
  entertainment: ['branson', 'las-vegas', 'new-orleans'],
  golf: ['scottsdale', 'myrtle-beach', 'orlando'],
  water: ['cocoa-beach', 'galveston', 'myrtle-beach', 'lake-tahoe'],
  outdoor: ['gatlinburg', 'lake-tahoe', 'branson'],
  relaxation: ['scottsdale', 'lake-tahoe']
}

// Attribute mappings for filtering
export const attributeMappings = {
  weather: {
    warm: ['orlando', 'scottsdale', 'las-vegas', 'new-orleans', 'cocoa-beach', 'galveston', 'myrtle-beach'],
    yearRound: ['orlando', 'las-vegas', 'scottsdale', 'cocoa-beach'],
    seasonal: ['lake-tahoe', 'gatlinburg', 'branson', 'williamsburg']
  },
  activities: {
    skiing: ['lake-tahoe'],
    surfing: ['cocoa-beach'],
    golf: ['scottsdale', 'myrtle-beach', 'orlando'],
    hiking: ['gatlinburg', 'lake-tahoe', 'scottsdale'],
    shows: ['branson', 'las-vegas'],
    themeparks: ['orlando', 'williamsburg']
  }
}

// Helper functions
export function getDestinationById(id: string): Destination | undefined {
  return destinations.find(d => d.id === id)
}

export function getDestinationsByCategory(category: string): Destination[] {
  const ids = categoryMappings[category as keyof typeof categoryMappings] || []
  return ids.map(id => getDestinationById(id)).filter(Boolean) as Destination[]
}

export function getDestinationsByAttribute(attributeType: 'weather' | 'activities', attributeValue: string): Destination[] {
  const ids = attributeMappings[attributeType]?.[attributeValue as keyof typeof attributeMappings[typeof attributeType]] || []
  return ids.map(id => getDestinationById(id)).filter(Boolean) as Destination[]
}

export function searchDestinations(query: string): Destination[] {
  const lowerQuery = query.toLowerCase()
  return destinations.filter(dest =>
    dest.name.toLowerCase().includes(lowerQuery) ||
    dest.state.toLowerCase().includes(lowerQuery) ||
    dest.overview.toLowerCase().includes(lowerQuery) ||
    dest.tagline.toLowerCase().includes(lowerQuery) ||
    dest.categories.some(cat => cat.includes(lowerQuery))
  )
}

export function getDestinationDisplayName(id: string): string {
  const dest = getDestinationById(id)
  return dest ? `${dest.name}, ${dest.state}` : ''
}
