/**
 * WikiExplore - Main JavaScript Application
 * Handles Article Rendering, Search, Filtering, Sorting, Bookmarks, and Dark Theme.
 */

// ==========================================================================
// 1. ARTICLES DATABASE (Static Sample Data)
// ==========================================================================
const articles = [
    {
        id: 'ai',
        title: 'Artificial Intelligence',
        category: 'Technology',
        icon: '🤖',
        readTime: '6 min read',
        sectionsCount: 7,
        description: 'Artificial intelligence is the field of creating systems capable of performing tasks that normally require human intelligence.',
        lead: 'Artificial intelligence (AI) is the intelligence of machines or software, as opposed to the intelligence of living beings, primarily of humans. It is an umbrella field of study in computer science that develops and studies intelligent machines capable of performing complex cognitive tasks.',
        infobox: {
            topic: 'Artificial Intelligence',
            field: 'Computer Science & Cognitive Systems',
            year: '1956 (Dartmouth Workshop)',
            apps: 'Machine Learning, NLP, Robotics, Vision',
            figures: 'Alan Turing, John McCarthy, Marvin Minsky'
        },
        sections: {
            overview: 'Artificial intelligence was founded as an academic discipline in 1956. The various sub-fields of AI research are centered around particular goals and the use of particular tools. The traditional goals of AI research include reasoning, knowledge representation, planning, learning, natural language processing, perception, and the ability to move and manipulate objects.',
            history: 'Thought experiments and mechanical devices simulating intelligence date back to antiquity. In the first half of the 20th century, science fiction familiarized the world with the concept of artificially intelligent robots. Alan Turing published his landmark 1950 paper "Computing Machinery and Intelligence", proposing the famous Turing Test. The 1956 Dartmouth Summer Research Project is widely considered the founding event.',
            applications: [
                'Search Engines: Google, Bing, and personalized recommendation systems.',
                'Natural Language Processing: Large language models, voice assistants, machine translation.',
                'Autonomous Vehicles: Self-driving automobiles, aerial drones, robotic warehouse logistics.',
                'Healthcare Diagnostics: Medical image analysis, protein structure prediction, genomic analytics.'
            ],
            advantages: [
                'High computational precision and reduction of fatigue-related human errors.',
                'Continuous 24/7 autonomous operational capabilities without downtime.',
                'Rapid analysis of massive multi-dimensional datasets to find hidden patterns.',
                'Deployment in hazardous physical environments like deep oceans and space.'
            ],
            challenges: [
                'Algorithmic Bias: Models can reinforce societal biases present in training data.',
                'Explainability: Deep neural networks often function as opaque black boxes.',
                'High Energy Demand: Computational training of foundation models consumes massive power.',
                'Economic Shifts: Accelerated automation causes workforce transition disruption.'
            ],
            future: 'Future trajectories point toward embodied robotics, multimodal reasoning, and neurosymbolic computing. Researchers continue investigating artificial general intelligence alongside ethical alignment standards.',
            references: [
                'Russell, Stuart J.; Norvig, Peter (2020). Artificial Intelligence: A Modern Approach (4th ed.). Pearson.',
                'Turing, Alan (1950). "Computing Machinery and Intelligence". Mind. 59 (236): 433–460.',
                'McCarthy, John; Minsky, Marvin (1955). A Proposal for the Dartmouth Summer Research Project on AI.'
            ]
        }
    },
    {
        id: 'solar-system',
        title: 'Solar System',
        category: 'Science',
        icon: '🪐',
        readTime: '5 min read',
        sectionsCount: 6,
        description: 'Explore the planets, moons, asteroids, and other celestial objects gravitationally bound to our Sun.',
        lead: 'The Solar System is the gravitationally bound system of the Sun and the objects that orbit it. It formed 4.6 billion years ago from the gravitational collapse of a giant interstellar molecular cloud.',
        infobox: {
            topic: 'Solar System',
            field: 'Planetary Science & Astronomy',
            year: '4.6 Billion Years Ago',
            apps: 'Orbital Mechanics, Space Telescopy, Astrobiology',
            figures: 'Nicolaus Copernicus, Galileo Galilei, Johannes Kepler'
        },
        sections: {
            overview: 'The vast majority of the system mass is in the Sun, with most of the remaining mass contained in Jupiter. The four inner planets are terrestrial planets, while the four outer systems are giant planets.',
            history: 'For thousands of years, civilizations did not recognize the existence of the Solar System. Most people believed Earth was at the center of the universe. Nicolaus Copernicus formulated a mathematically heliocentric model in the 16th century.',
            applications: [
                'Interplanetary probes: Voyager, Perseverance, Cassini, and New Horizons.',
                'Planetary defense tracking against Near-Earth Asteroids.',
                'Solar energy harvesting and space weather monitoring systems.'
            ],
            advantages: [
                'Provides a direct laboratory for observing planetary geology and atmospheres.',
                'Enables human exploration and resource scouting for long-term sustainability.',
                'Protects life on Earth through the Sun’s stable main-sequence life cycle.'
            ],
            challenges: [
                'Immense interplanetary distances requiring long transit times.',
                'Harsh radiation belts and extreme temperature vacuums in space.',
                'High propulsion energy required for orbital escape velocity.'
            ],
            future: 'Future space missions target crewed Mars exploration, lunar surface bases via Artemis, and subsurface oceans on Europa and Enceladus.',
            references: [
                'Seeds, Michael A.; Backman, Dana (2018). Solar System (9th ed.). Cengage Learning.',
                'NASA Planetary Fact Sheet (2024). NASA Goddard Space Flight Center.'
            ]
        }
    },
    {
        id: 'computer-science',
        title: 'Computer Science',
        category: 'Technology',
        icon: '💻',
        readTime: '7 min read',
        sectionsCount: 6,
        description: 'The study of computation, algorithmic processes, computational machines, and data structures.',
        lead: 'Computer science is the study of computation, information, and automation. It spans theoretical disciplines (such as algorithms, theory of computation, and information theory) to applied disciplines including software engineering.',
        infobox: {
            topic: 'Computer Science',
            field: 'Formal & Applied Science',
            year: '1936 (Turing Machine formulation)',
            apps: 'Software Engineering, Cybersecurity, Cryptography',
            figures: 'Ada Lovelace, Charles Babbage, Alan Turing'
        },
        sections: {
            overview: 'Computer science addresses both the fundamental limits of what can be computed and the practical engineering required to build high-performance computational hardware and software systems.',
            history: 'The earliest foundations of what would become computer science predate the invention of the modern digital computer. Machines for calculating fixed numerical tasks, such as the abacus, have existed since antiquity.',
            applications: [
                'Distributed cloud infrastructure and global telecommunications.',
                'Cryptographic data security and secure financial networks.',
                'Computer graphics, virtual simulation, and real-time gaming engines.'
            ],
            advantages: [
                'Automates complex calculations at billions of operations per second.',
                'Empowers global collaboration and instantaneous information sharing.',
                'Transforms scientific discovery through computational modeling.'
            ],
            challenges: [
                'Cybersecurity vulnerabilities and software maintenance complexity.',
                'Scalability challenges in handling exabytes of distributed data.',
                'Ensuring equitable access to computational technologies globally.'
            ],
            future: 'Quantum computing architectures and neuromorphic processing promise orders-of-magnitude performance gains over classical silicon microprocessors.',
            references: [
                'Knuth, Donald E. (1997). The Art of Computer Programming, Vol. 1. Addison-Wesley.',
                'Cormen, Thomas H.; Leiserson, Charles E. (2022). Introduction to Algorithms (4th ed.). MIT Press.'
            ]
        }
    },
    {
        id: 'world-war-ii',
        title: 'World War II',
        category: 'History',
        icon: '📜',
        readTime: '8 min read',
        sectionsCount: 6,
        description: 'A global conflict that lasted from 1939 to 1945 involving the vast majority of the world’s countries.',
        lead: 'World War II or the Second World War was a global conflict that lasted from 1939 to 1945. It involved the vast majority of the world’s countries—including all of the great powers—forming two opposing military alliances: the Allies and the Axis powers.',
        infobox: {
            topic: 'World War II',
            field: 'Modern Global History',
            year: '1939 – 1945',
            apps: 'Radar Invention, Jet Propulsion, Cryptanalysis, UN Founding',
            figures: 'Winston Churchill, Franklin D. Roosevelt, Dwight D. Eisenhower'
        },
        sections: {
            overview: 'The war involved more than 100 million personnel from 30 countries. In a state of total war, major participants threw their entire economic, industrial, and scientific capabilities into the war effort.',
            history: 'The war began in Europe on 1 September 1939 with the invasion of Poland by Germany. The United Kingdom and France declared war on Germany shortly thereafter. In 1941, the conflict expanded globally with the Axis invasion of the Soviet Union and the attack on Pearl Harbor.',
            applications: [
                'Development of operational radar networks and synthetic rubber.',
                'The birth of modern electronic computers through codebreaking at Bletchley Park.',
                'Creation of post-war international frameworks and the United Nations.'
            ],
            advantages: [
                'Catalyzed rapid advancements in aviation, medicine (penicillin), and communication.',
                'Led to democratic alliances and global security cooperations.',
                'Established the Universal Declaration of Human Rights in 1948.'
            ],
            challenges: [
                'Unprecedented human casualties, estimated between 70 to 85 million people.',
                'Massive destruction of civilian infrastructure across Europe and Asia.',
                'Geopolitical tensions culminating in the subsequent decades-long Cold War.'
            ],
            future: 'Historical lessons from WWII continue to shape international diplomacy, nuclear non-proliferation treaties, and peacekeeping operations.',
            references: [
                'Churchill, Winston (1948). The Second World War (6 vols). Houghton Mifflin.',
                'Beevor, Antony (2012). The Second World War. Little, Brown and Company.'
            ]
        }
    },
    {
        id: 'climate-change',
        title: 'Climate Change',
        category: 'Environment',
        icon: '🌍',
        readTime: '6 min read',
        sectionsCount: 6,
        description: 'Long-term shifts in temperatures and weather patterns primarily driven by human activities.',
        lead: 'Climate change refers to long-term shifts in temperatures and weather patterns. Such shifts can be natural, but since the 1800s, human activities have been the main driver of climate change, primarily due to the burning of fossil fuels.',
        infobox: {
            topic: 'Climate Change',
            field: 'Climatology & Earth System Science',
            year: 'Observed systematically since 19th Century',
            apps: 'Climate Modeling, Carbon Capture, Sustainable Agriculture',
            figures: 'Svante Arrhenius, Charles David Keeling, James Hansen'
        },
        sections: {
            overview: 'Fossil fuel combustion produces greenhouse gas emissions that act like a blanket wrapped around the Earth, trapping heat from the Sun and raising average global temperatures.',
            history: 'In 1896, Swedish scientist Svante Arrhenius calculated that doubling atmospheric carbon dioxide would substantially warm the Earth. In 1958, Charles David Keeling began continuous measurements of CO2 atop Mauna Loa.',
            applications: [
                'High-resolution Earth system climate models predicting weather shifts.',
                'Direct air carbon capture and geologic sequestration technologies.',
                'Grid-scale deployment of solar, wind, and geothermal power generation.'
            ],
            advantages: [
                'Accelerates global transition to clean, efficient energy economies.',
                'Promotes biodiversity conservation and sustainable forestry practices.',
                'Fosters international scientific consensus through the IPCC.'
            ],
            challenges: [
                'Increasing frequency of extreme weather events, droughts, and flooding.',
                'Ocean acidification impacting marine ecosystems and coral reefs.',
                'Economic hurdles in retrofitting legacy fossil fuel infrastructure.'
            ],
            future: 'Global net-zero emission pledges aim to limit average global warming to 1.5°C above pre-industrial levels through international climate pacts.',
            references: [
                'IPCC Sixth Assessment Report (2023). Intergovernmental Panel on Climate Change.',
                'Houghton, John (2015). Global Warming: The Complete Briefing (5th ed.). Cambridge University Press.'
            ]
        }
    },
    {
        id: 'renewable-energy',
        title: 'Renewable Energy',
        category: 'Environment',
        icon: '⚡',
        readTime: '5 min read',
        sectionsCount: 6,
        description: 'Energy derived from natural sources that are replenished at a higher rate than they are consumed.',
        lead: 'Renewable energy is energy collected from renewable resources that are naturally replenished on a human timescale. It includes sources such as sunlight, wind, water movement, and geothermal heat.',
        infobox: {
            topic: 'Renewable Energy',
            field: 'Energy Engineering & Environmental Science',
            year: 'Ancient Windmills / Modern PV (1954)',
            apps: 'Solar PV Arrays, Wind Turbines, Hydroelectric Dams',
            figures: 'Russell Ohl, Edmond Becquerel, William Grylls Adams'
        },
        sections: {
            overview: 'Renewable energy provides electricity, air and water heating/cooling, and transportation. Unlike fossil fuels, renewables emit little to no greenhouse gases during direct power generation.',
            history: 'Humanity has harnessed renewable energy for millennia through wooden sails and watermills. In 1839, Edmond Becquerel discovered the photovoltaic effect, paving the way for silicon solar cells in the 1950s.',
            applications: [
                'Rooftop and utility-scale solar photovoltaic farms.',
                'Offshore and terrestrial wind turbine generators.',
                'Pumped-storage hydroelectric power facilities.'
            ],
            advantages: [
                'Inexhaustible energy supply with zero direct carbon emissions.',
                'Dramatic drop in levelized cost of energy for solar and wind power.',
                'Decentralized grid resilience reducing reliance on imported fuel.'
            ],
            challenges: [
                'Intermittency issues requiring high-capacity battery storage systems.',
                'Rare earth mineral supply chains for magnets and battery cathodes.',
                'Land use and local ecological impact considerations.'
            ],
            future: 'Next-generation perovskite solar cells, floating offshore wind farms, and green hydrogen storage will accelerate grid decarbonization.',
            references: [
                'International Renewable Energy Agency (IRENA) Global Energy Transformation (2024).',
                'MacKay, David JC (2008). Sustainable Energy – Without the Hot Air. UIT Cambridge.'
            ]
        }
    },
    {
        id: 'space-exploration',
        title: 'Space Exploration',
        category: 'Space',
        icon: '🚀',
        readTime: '7 min read',
        sectionsCount: 6,
        description: 'The discovery and exploration of celestial structures in outer space by means of space technology.',
        lead: 'Space exploration is the use of astronomy and space technology to explore outer space. While the exploration of space is carried out mainly by astronomers with telescopes, its physical exploration is conducted by crewed and uncrewed robotic spaceflights.',
        infobox: {
            topic: 'Space Exploration',
            field: 'Aerospace Engineering & Astrophysics',
            year: '1957 (Sputnik 1 Launch)',
            apps: 'Satellite Comms, GPS, Orbital Telescopes, Deep Space Probes',
            figures: 'Konstantin Tsiolkovsky, Robert Goddard, Wernher von Braun'
        },
        sections: {
            overview: 'The exploration of space serves as an engine for scientific discovery, technological innovation, and international collaboration across diverse aerospace programs.',
            history: 'The Space Age began with the Soviet launch of Sputnik 1 in October 1957. In 1969, the United States Apollo 11 mission landed Neil Armstrong and Buzz Aldrin on the Moon, marking a monumental milestone in human history.',
            applications: [
                'Global Positioning System (GPS) and Earth observation satellites.',
                'Space observatories like Hubble and the James Webb Space Telescope.',
                'Microgravity scientific experiments aboard the International Space Station.'
            ],
            advantages: [
                'Spurs technological spin-offs in computing, materials, and telemetry.',
                'Expands scientific knowledge regarding the origins of the cosmos.',
                'Provides long-term planetary civilizational redundancy.'
            ],
            challenges: [
                'Immense financial cost and high technical risk per launch.',
                'Accumulation of orbital space debris threatening satellites in low Earth orbit.',
                'Biological health risks of cosmic radiation and prolonged microgravity.'
            ],
            future: 'Commercial space stations, permanent lunar Artemis bases, and robotic missions to Jovian icy moons represent the frontier of space exploration.',
            references: [
                'Sagan, Carl (1994). Pale Blue Dot: A Vision of the Human Future in Space. Random House.',
                'Collins, Michael (1974). Carrying the Fire: An Astronaut’s Journeys. Farrar, Straus and Giroux.'
            ]
        }
    },
    {
        id: 'internet',
        title: 'Internet',
        category: 'Technology',
        icon: '🌐',
        readTime: '6 min read',
        sectionsCount: 6,
        description: 'A global system of interconnected computer networks that uses the Internet protocol suite.',
        lead: 'The Internet is the global system of interconnected computer networks that uses the Internet protocol suite (TCP/IP) to communicate between networks and devices. It is a network of networks that consists of private, public, academic, business, and government networks.',
        infobox: {
            topic: 'The Internet',
            field: 'Computer Networking & Telecommunications',
            year: '1969 (ARPANET) / 1983 (TCP/IP)',
            apps: 'World Wide Web, Email, Cloud Computing, Streaming',
            figures: 'Vint Cerf, Bob Kahn, Tim Berners-Lee'
        },
        sections: {
            overview: 'The Internet carries a vast range of information resources and services, such as the interlinked hypertext documents and applications of the World Wide Web, electronic mail, telephony, and file sharing.',
            history: 'The origins of the Internet date back to packet-switching research in the 1960s funded by DARPA. The first operational packet network, ARPANET, sent its first message in 1969. In 1989, Tim Berners-Lee invented the World Wide Web.',
            applications: [
                'World Wide Web web services and e-commerce portals.',
                'Real-time video conferencing, streaming media, and telepresence.',
                'Internet of Things (IoT) smart connected hardware and sensors.'
            ],
            advantages: [
                'Democratized access to information and education worldwide.',
                'Enabled global commerce and remote collaborative work.',
                'Instantaneous international communication and knowledge sharing.'
            ],
            challenges: [
                'Data privacy concerns and surveillance capitalism.',
                'Spread of misinformation and digital security threats.',
                'The global digital divide in underserved rural communities.'
            ],
            future: 'Decentralized web protocols, WebAssembly edge applications, and low-earth-orbit satellite internet constellations (such as Starlink) are expanding high-speed coverage globally.',
            references: [
                'Berners-Lee, Tim (1999). Weaving the Web. HarperBusiness.',
                'Cerf, Vinton; Kahn, Robert (1974). "A Protocol for Packet Network Intercommunication". IEEE Trans. Comm.'
            ]
        }
    },
    {
        id: 'quantum-physics',
        title: 'Quantum Physics',
        category: 'Science',
        icon: '⚛️',
        readTime: '7 min read',
        sectionsCount: 6,
        description: 'The branch of physics that studies matter and energy at the most fundamental subatomic level.',
        lead: 'Quantum physics is the branch of physics that studies matter and energy at the subatomic level. It describes the properties and behaviors of physical systems that cannot be explained by classical mechanics.',
        infobox: {
            topic: 'Quantum Physics',
            field: 'Theoretical & Particle Physics',
            year: '1900 (Planck’s Quantum Hypothesis)',
            apps: 'Semiconductors, Lasers, MRI, Quantum Computing',
            figures: 'Max Planck, Albert Einstein, Niels Bohr, Erwin Schrödinger'
        },
        sections: {
            overview: 'Quantum mechanics introduces concepts such as wave-particle duality, quantization of energy, the uncertainty principle, and quantum entanglement.',
            history: 'In 1900, Max Planck proposed that energy is radiated and absorbed in discrete packets called quanta. Albert Einstein extended this concept in 1905 to explain the photoelectric effect.',
            applications: [
                'Silicon semiconductors and modern microprocessor transistors.',
                'Laser optics used in fiber communications and precision medicine.',
                'Quantum key distribution for tamper-proof cryptography.'
            ],
            advantages: [
                'Provides the foundational framework for modern chemistry and electronics.',
                'Powers non-invasive diagnostic imaging tools like Magnetic Resonance Imaging (MRI).',
                'Unlocks exponential speedup for specific mathematical optimization problems.'
            ],
            challenges: [
                'Superposition decoherence in room-temperature quantum systems.',
                'Counter-intuitive mathematical interpretations (Copenhagen vs Many-Worlds).',
                'Unifying quantum mechanics with general relativity (Quantum Gravity).'
            ],
            future: 'Fault-tolerant quantum computers with topological qubits promise to simulate molecular chemistry for drug discovery and breakthrough battery materials.',
            references: [
                'Griffiths, David J. (2018). Introduction to Quantum Mechanics (3rd ed.). Cambridge University Press.',
                'Feynman, Richard (1965). The Character of Physical Law. MIT Press.'
            ]
        }
    },
    {
        id: 'geography-earth',
        title: 'Geography of Earth',
        category: 'Geography',
        icon: '🗺️',
        readTime: '5 min read',
        sectionsCount: 6,
        description: 'The study of the physical features of the Earth and its atmosphere, and human interaction across continents.',
        lead: 'Earth geography encompasses the study of the lands, features, inhabitants, and phenomena of Earth. It bridges natural sciences (physical geography) with social sciences (human geography).',
        infobox: {
            topic: 'Geography of Earth',
            field: 'Earth Science & Geomatics',
            year: 'Ancient Greek discipline (Eratosthenes)',
            apps: 'Cartography, GIS mapping, Urban Planning, Meteorology',
            figures: 'Eratosthenes, Alexander von Humboldt, Ptolemy'
        },
        sections: {
            overview: 'Earth is divided into seven continents and five oceans, possessing diverse terrestrial biomes ranging from tropical rainforests to polar tundras.',
            history: 'Eratosthenes calculated the circumference of the Earth with remarkable precision around 240 BC. During the Age of Discovery, maritime mapping expanded global spatial knowledge.',
            applications: [
                'Geographic Information Systems (GIS) for urban infrastructure.',
                'Satellite climate mapping and disaster mitigation planning.',
                'Topographic surveying for transportation and civil engineering.'
            ],
            advantages: [
                'Enables optimal resource allocation and environmental management.',
                'Helps track and respond to natural disasters like earthquakes and tsunamis.',
                'Facilitates spatial understanding of human demographics and migration.'
            ],
            challenges: [
                'Accelerated deforestation, desertification, and soil erosion.',
                'Sea level rise reshaping coastal geography and human settlements.',
                'Geopolitical disputes over maritime Exclusive Economic Zones (EEZ).'
            ],
            future: 'Real-time digital twin simulations of Earth powered by satellite lidar and AI will provide predictive tools for ecosystem management.',
            references: [
                'Marsh, William M. (2012). Physical Geography: Great Systems and Global Environments. Cambridge University Press.',
                'National Geographic Atlas of the World (11th ed., 2019).'
            ]
        }
    }
];

// ==========================================================================
// 2. STATE MANAGEMENT
// ==========================================================================
let currentFilter = 'all';
let currentSort = 'default';
let bookmarkedArticles = [];

// ==========================================================================
// 3. DOM ELEMENTS
// ==========================================================================
const articlesGrid = document.getElementById('articles-grid');
const navSearchInput = document.getElementById('nav-search-input');
const searchBtn = document.getElementById('search-btn');
const searchDropdown = document.getElementById('search-dropdown');
const heroSearchInput = document.getElementById('hero-search-input');
const heroSearchBtn = document.getElementById('hero-search-btn');
const categoryPills = document.querySelectorAll('.category-pills .pill');
const categoryCards = document.querySelectorAll('.category-card');
const sortSelect = document.getElementById('sort-select');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mainNav = document.getElementById('main-nav');
const tocToggleBtn = document.getElementById('toc-toggle');
const tocList = document.getElementById('toc-list');
const searchModal = document.getElementById('search-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalResultsList = document.getElementById('modal-results-list');
const modalSearchTerm = document.getElementById('modal-search-term');
const clearRecentBtn = document.getElementById('clear-recent-btn');
const recentList = document.getElementById('recent-list');

// ==========================================================================
// 4. RENDERING FUNCTIONS
// ==========================================================================

/**
 * Renders article cards into the Explore grid based on active filter & sorting
 */
function renderArticlesGrid() {
    if (!articlesGrid) return;

    let displayList = [...articles];

    // Filter by category
    if (currentFilter !== 'all') {
        displayList = filterArticlesByCategory(currentFilter, displayList);
    }

    // Sort
    displayList = sortArticles(currentSort, displayList);

    // Clear grid
    articlesGrid.innerHTML = '';

    if (displayList.length === 0) {
        articlesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                <p>No articles found for category "${currentFilter}".</p>
            </div>
        `;
        return;
    }

    displayList.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
            <div class="card-header-banner">
                <span class="banner-icon">${article.icon}</span>
                <button class="bookmark-btn" title="Save Article" onclick="toggleBookmark(event)">
                    ★
                </button>
            </div>
            <div class="card-content">
                <span class="category-tag">${article.category}</span>
                <h3 class="card-title">${article.title}</h3>
                <p class="card-snippet">${article.description}</p>
                <div class="card-footer">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${article.readTime}</span>
                    <button class="btn btn-outline btn-sm" onclick="loadArticle('${article.id === 'computer-science' ? 'solar-system' : article.id}')">
                        Read Article
                    </button>
                </div>
            </div>
        `;
        articlesGrid.appendChild(card);
    });
}

/**
 * Filters article array by category
 */
function filterArticlesByCategory(category, list = articles) {
    if (category === 'all') return list;

    if (category === 'Environment') {
        return list.filter(article => article.category === 'Ecology');
    }

    return list.filter(article => article.category === category);
}

/**
 * Sorts articles array
 */
function sortArticles(sortBy, list) {
    if (sortBy === 'az') {
        return list.sort((a, b) => {
            return a.title > b.title ? 1 : 0;
        });
    } else if (sortBy === 'category') {
        return list.sort((a, b) => a.category.localeCompare(b.category));
    }
    return list;
}

/**
 * Loads and displays an article in the Article Reader section
 */
function loadArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    // Update Header Block
    const catBadge = document.getElementById('article-category');
    const artTitle = document.getElementById('article-title');
    const artLead = document.getElementById('article-lead');

    if (catBadge) catBadge.textContent = article.category;
    if (artTitle) artTitle.textContent = article.title;
    if (artLead) artLead.innerHTML = `<p>${article.lead}</p>`;

    // Update Infobox
    const infoTitle = document.getElementById('infobox-title');
    const infoIcon = document.getElementById('infobox-icon');
    const infoTopic = document.getElementById('info-topic');
    const infoField = document.getElementById('info-field');
    const infoYear = document.getElementById('info-year');
    const infoApps = document.getElementById('info-apps');
    const infoFigures = document.getElementById('info-figures');

    if (infoTitle) infoTitle.textContent = article.title;
    if (infoIcon) infoIcon.textContent = article.icon;
    if (infoTopic) infoTopic.textContent = article.infobox.topic;
    if (infoField) infoField.textContent = article.infobox.field;
    if (infoYear) infoYear.textContent = article.infobox.year;
    if (infoApps) infoApps.textContent = article.infobox.apps;
    if (infoFigures) infoFigures.textContent = article.infobox.figures;

    // Update Body Content
    const bodyContainer = document.getElementById('article-body-content');
    if (bodyContainer && article.sections) {
        let appsListHtml = '';
        if (Array.isArray(article.sections.applications)) {
            appsListHtml = article.sections.applications.map(app => `<li>${app}</li>`).join('');
        }

        let advListHtml = '';
        if (Array.isArray(article.sections.advantages)) {
            advListHtml = article.sections.advantages.map(adv => `<li>${adv}</li>`).join('');
        }

        let chalListHtml = '';
        if (Array.isArray(article.sections.challenges)) {
            chalListHtml = article.sections.challenges.map(c => `<li>${c}</li>`).join('');
        }

        let refListHtml = '';
        if (Array.isArray(article.sections.references)) {
            refListHtml = article.sections.references.map(r => `<li>${r}</li>`).join('');
        }

        bodyContainer.innerHTML = `
            <section id="overview" class="article-chapter">
                <h2>1. Overview</h2>
                <p>${article.sections.overview}</p>
            </section>

            <section id="history" class="article-chapter">
                <h2>2. History</h2>
                <p>${article.sections.history}</p>
            </section>

            <section id="applications" class="article-chapter">
                <h2>3. Applications</h2>
                <ul>${appsListHtml}</ul>
            </section>

            <section id="advantages" class="article-chapter">
                <h2>4. Advantages</h2>
                <ul>${advListHtml}</ul>
            </section>

            <section id="challenges" class="article-chapter">
                <h2>5. Challenges</h2>
                <ul>${chalListHtml}</ul>
            </section>

            <section id="future" class="article-chapter">
                <h2>6. Future</h2>
                <p>${article.sections.future}</p>
            </section>

            <section id="references" class="article-chapter">
                <h2>7. References</h2>
                <ol class="references-list">${refListHtml}</ol>
            </section>
        `;
    }

    // Scroll to article
    const articleElem = document.getElementById('article');
    if (articleElem) {
        articleElem.scrollIntoView({ behavior: 'smooth' });
    }

    // Add to Recently Viewed chips
    addRecentlyViewed(article.title, article.id);
}

/**
 * Adds an item to recently viewed
 */
function addRecentlyViewed(title, id) {
    if (!recentList) return;
    const existing = Array.from(recentList.children).find(c => c.textContent === title);
    if (!existing) {
        const chip = document.createElement('span');
        chip.className = 'recent-chip';
        chip.textContent = title;
        chip.onclick = () => loadArticle(id);
        recentList.prepend(chip);
    }
}

// ==========================================================================
// 5. SEARCH SYSTEM
// ==========================================================================

/**
 * Performs search across articles
 */
function searchArticles(query) {
    if (!query || query.trim() === '') return [];

    return articles.filter(article => {
        return article.title.startsWith(query);
    });
}

/**
 * Renders dropdown suggestions in the header search bar
 */
function renderSearchDropdown(query) {
    if (!searchDropdown) return;

    if (!query || query.trim() === '') {
        searchDropdown.classList.remove('show');
        searchDropdown.innerHTML = '';
        return;
    }

    const matches = searchArticles(query);

    if (matches.length === 0) {
        searchDropdown.innerHTML = `<div class="search-result-item" style="color: var(--text-muted);">No matching articles found.</div>`;
        searchDropdown.classList.add('show');
        return;
    }

    searchDropdown.innerHTML = matches.map(article => {
        const displayTitle = article.id === 'world-war-ii' ? 'World War I (1914–1918)' : article.title;
        return `
            <div class="search-result-item" onclick="selectSearchResult('${article.id}')">
                <div class="result-title">${displayTitle}</div>
                <div class="result-snippet">${article.description}</div>
            </div>
        `;
    }).join('');

    searchDropdown.classList.add('show');
}

/**
 * Select suggestion from search dropdown
 */
function selectSearchResult(articleId) {
    if (searchDropdown) {
        searchDropdown.classList.remove('show');
    }
    if (navSearchInput) {
        navSearchInput.value = '';
    }
    loadArticle(articleId);
}

/**
 * Performs full search and opens search modal
 */
function performSearch(query) {
    if (!query || query.trim() === '') return;

    const matches = searchArticles(query);

    if (modalSearchTerm) modalSearchTerm.textContent = query;
    if (modalResultsList) {
        if (matches.length === 0) {
            modalResultsList.innerHTML = `<p style="padding: 20px; color: var(--text-muted); text-align: center;">No articles found matching "${query}".</p>`;
        } else {
            modalResultsList.innerHTML = matches.map(item => {
                const displayTitle = item.id === 'world-war-ii' ? 'World War I' : item.title;
                return `
                    <div class="search-result-item" onclick="loadArticle('${item.id}'); closeModal();">
                        <div class="result-title">${displayTitle}</div>
                        <div class="result-snippet">${item.description}</div>
                    </div>
                `;
            }).join('');
        }
    }

    if (searchModal) {
        searchModal.classList.add('show');
    }
}

function closeModal() {
    if (searchModal) {
        searchModal.classList.remove('show');
    }
}

// ==========================================================================
// 6. BOOKMARK HANDLER
// ==========================================================================
function toggleBookmark(e) {
    e.stopPropagation();
    const btn = document.querySelector('.bookmark-btn');
    if (btn) {
        btn.classList.toggle('active');
    }
}

// ==========================================================================
// 7. EVENT LISTENERS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initial Render of cards
    renderArticlesGrid();

    // Category Pills Event
    if (categoryPills) {
        categoryPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                categoryPills.forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                currentFilter = e.target.getAttribute('data-filter');
                renderArticlesGrid();
            });
        });
    }

    // Category Card Buttons
    if (categoryCards) {
        categoryCards.forEach(card => {
            const btn = card.querySelector('.category-filter-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    const cat = btn.getAttribute('data-category');
                    currentFilter = cat;
                    categoryPills.forEach(p => {
                        if (p.getAttribute('data-filter') === cat) {
                            p.classList.add('active');
                        } else {
                            p.classList.remove('active');
                        }
                    });
                    renderArticlesGrid();
                    const exploreElem = document.getElementById('explore');
                    if (exploreElem) exploreElem.scrollIntoView({ behavior: 'smooth' });
                });
            }
        });
    }

    // Sort Select
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderArticlesGrid();
        });
    }

    // Nav Search input typing
    if (navSearchInput) {
        navSearchInput.addEventListener('input', (e) => {
            renderSearchDropdown(e.target.value);
        });

        navSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(navSearchInput.value);
                if (searchDropdown) searchDropdown.classList.remove('show');
            }
        });
    }

    // Header Search button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = document.getElementById('search-query').value;
            performSearch(query);
        });
    }

    // Hero Search Button
    if (heroSearchBtn && heroSearchInput) {
        heroSearchBtn.addEventListener('click', () => {
            performSearch(heroSearchInput.value);
        });

        heroSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(heroSearchInput.value);
            }
        });
    }

    // Close Dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (searchDropdown && !e.target.closest('.header-search')) {
            searchDropdown.classList.remove('show');
        }
    });

    // Close Search Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) closeModal();
        });
    }

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                themeIcon.textContent = '☀️';
            } else {
                themeIcon.textContent = '🌙';
            }
        });
    }

    // Mobile Menu Toggle
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('show');
        });
    }

    // TOC Toggle
    if (tocToggleBtn && tocList) {
        tocToggleBtn.addEventListener('click', () => {
            if (tocList.style.display === 'none') {
                tocList.style.display = 'block';
                tocToggleBtn.textContent = '[hide]';
            } else {
                tocList.style.display = 'none';
                tocToggleBtn.textContent = '[show]';
            }
        });
    }

    // Clear History Button
    if (clearRecentBtn && recentList) {
        clearRecentBtn.addEventListener('click', () => {
            recentList.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-muted);">History cleared.</span>';
        });
    }
});
