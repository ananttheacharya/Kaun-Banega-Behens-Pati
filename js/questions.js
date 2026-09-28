// KBC question bank: 3 rounds x 15 + 15 contingency = 60 questions
// Levels 1-5 easy | 6-10 medium | 11-15 hard. `correct` is the index into `options`.

const PRIZE_LADDER = {
  1: "₹1,000", 2: "₹2,000", 3: "₹3,000", 4: "₹5,000", 5: "₹10,000",
  6: "₹20,000", 7: "₹40,000", 8: "₹80,000", 9: "₹1,60,000", 10: "₹3,20,000",
  11: "₹6,40,000", 12: "₹12,50,000", 13: "₹25,00,000", 14: "₹50,00,000", 15: "₹1 Crore"
};

const ROUND_1 = [
  { id: "R1-1", level: 1, category: "Tech", question: "A penguin wearing a tuxedo is the mascot of which operating system?", options: ["Windows", "macOS", "Linux", "Android"], correct: 2 },
  { id: "R1-2", level: 2, category: "Pop Culture", question: "Which fictional African nation is home to Black Panther and the metal vibranium?", options: ["Genovia", "Wakanda", "Latveria", "Sokovia"], correct: 1 },
  { id: "R1-3", level: 3, category: "GK", question: "Which place is known as the highest battlefield in the world?", options: ["Siachen Glacier", "Tibetan Plateau", "Donbas", "Gaza Strip"], correct: 0 },
  { id: "R1-4", level: 4, category: "Tech", question: "F-22, F-16, F-35 and F-18 are all types of what?", options: ["Camera lenses", "Graphics cards", "Server racks", "Fighter jets"], correct: 3 },
  { id: "R1-5", level: 5, category: "Current Affairs", question: "In 2023, Chandrayaan-3 became the first mission to soft-land near which region of the Moon?", options: ["South pole", "North pole", "Equator", "Sea of Tranquility"], correct: 0 },
  { id: "R1-6", level: 6, category: "Tech", question: "In 'ChatGPT', what does the 'G' in GPT stand for?", options: ["General", "Generative", "Google", "Graph"], correct: 1 },
  { id: "R1-7", level: 7, category: "GK", question: "Which Indian state has the longest coastline?", options: ["Tamil Nadu", "Andhra Pradesh", "Gujarat", "Maharashtra"], correct: 2 },
  { id: "R1-8", level: 8, category: "GK", question: "Which is the only bird capable of flying backwards?", options: ["Kingfisher", "Swift", "Hummingbird", "Sparrow"], correct: 2 },
  { id: "R1-9", level: 9, category: "Current Affairs", question: "In December 2024, who became the youngest undisputed World Chess Champion in history?", options: ["R. Praggnanandhaa", "Arjun Erigaisi", "Gukesh D", "Nihal Sarin"], correct: 2 },
  { id: "R1-10", level: 10, category: "Tech", question: "Which programming language is named after a British comedy troupe rather than a snake?", options: ["Ruby", "Python", "Perl", "Java"], correct: 1 },
  { id: "R1-11", level: 11, category: "Pop Culture", question: "Which Studio Ghibli film won the Oscar for Best Animated Feature in 2003?", options: ["Princess Mononoke", "Spirited Away", "My Neighbor Totoro", "Howl's Moving Castle"], correct: 1 },
  { id: "R1-12", level: 12, category: "Pop Culture", question: "In 'Money Heist', which institution does the Professor's gang rob in the first heist?", options: ["Bank of Madrid", "Royal Mint of Spain", "Banco de España vault", "Barcelona Diamond Exchange"], correct: 1 },
  { id: "R1-13", level: 13, category: "Pop Culture", question: "Hans Zimmer's score for which Christopher Nolan film famously uses the 'Shepard tone' to create endless rising tension?", options: ["Interstellar", "Inception", "Dunkirk", "Tenet"], correct: 2 },
  { id: "R1-14", level: 14, category: "Current Affairs", question: "Who became the first Indian astronaut to visit the International Space Station, aboard Axiom-4 in 2025?", options: ["Prasanth Balakrishnan Nair", "Ajit Krishnan", "Shubhanshu Shukla", "Angad Pratap"], correct: 2 },
  { id: "R1-15", level: 15, category: "Tech", question: "Which deep learning model won the 2012 ImageNet competition by a huge margin and kicked off the modern deep learning boom?", options: ["AlexNet", "ResNet", "LeNet", "GoogLeNet"], correct: 0 }
];

const ROUND_2 = [
  { id: "R2-1", level: 1, category: "Tech", question: "Which app has a white ghost on a yellow background as its logo?", options: ["Bumble", "Snapchat", "Duolingo", "Tinder"], correct: 1 },
  { id: "R2-2", level: 2, category: "Pop Culture", question: "What was the name of Tony Stark's original AI butler, before FRIDAY took over?", options: ["JARVIS", "EDITH", "ULTRON", "KAREN"], correct: 0 },
  { id: "R2-3", level: 3, category: "GK", question: "Which planet is often called the 'Morning Star' or 'Evening Star'?", options: ["Mars", "Mercury", "Venus", "Jupiter"], correct: 2 },
  { id: "R2-4", level: 4, category: "Current Affairs", question: "Which city hosted the 2024 Summer Olympics?", options: ["Paris", "Tokyo", "Los Angeles", "Rome"], correct: 0 },
  { id: "R2-5", level: 5, category: "Tech", question: "What does the 'HTTP' in a website address stand for?", options: ["High Transfer Text Process", "HyperLink Text Transmission Path", "Host Terminal Transfer Protocol", "HyperText Transfer Protocol"], correct: 3 },
  { id: "R2-6", level: 6, category: "GK", question: "Jaipur is the Pink City. Which Rajasthan city is known as the Blue City?", options: ["Jaisalmer", "Bikaner", "Jodhpur", "Ajmer"], correct: 2 },
  { id: "R2-7", level: 7, category: "Pop Culture", question: "In Pokémon, which Pokémon does Pikachu evolve into when exposed to a Thunder Stone?", options: ["Pichu", "Raichu", "Electabuzz", "Pikachu Libre"], correct: 1 },
  { id: "R2-8", level: 8, category: "Tech", question: "Which company bought GitHub in 2018 for roughly $7.5 billion?", options: ["Google", "Microsoft", "Amazon", "Meta"], correct: 1 },
  { id: "R2-9", level: 9, category: "Pop Culture", question: "Which Hindi film gave us the villain's catchphrase 'Mogambo khush hua'?", options: ["Sholay", "Don", "Karan Arjun", "Mr. India"], correct: 3 },
  { id: "R2-10", level: 10, category: "Current Affairs", question: "The 2024 Nobel Prize in Physics was awarded to Hopfield and Hinton for foundational work on what?", options: ["Quantum computing", "Artificial neural networks", "Dark matter detection", "Gravitational waves"], correct: 1 },
  { id: "R2-11", level: 11, category: "GK", question: "Which is the only letter of the English alphabet that does not appear in the name of any US state?", options: ["Q", "X", "Z", "J"], correct: 0 },
  { id: "R2-12", level: 12, category: "Tech", question: "In cryptography, Alice and Bob are the usual communicators. Which character is the classic passive eavesdropper?", options: ["Mallory", "Trent", "Eve", "Carol"], correct: 2 },
  { id: "R2-13", level: 13, category: "Pop Culture", question: "Which director made 'Parasite', the first non-English film to win the Oscar for Best Picture?", options: ["Park Chan-wook", "Bong Joon-ho", "Kim Ki-duk", "Hirokazu Kore-eda"], correct: 1 },
  { id: "R2-14", level: 14, category: "GK", question: "Which country has the most time zones when its overseas territories are counted?", options: ["Russia", "United States", "France", "China"], correct: 2 },
  { id: "R2-15", level: 15, category: "Tech", question: "Which sorting algorithm was invented by Tony Hoare in 1959 and is famous for its pivot-based partitioning?", options: ["Merge Sort", "Heap Sort", "Timsort", "Quicksort"], correct: 3 }
];

const ROUND_3 = [
  { id: "R3-1", level: 1, category: "Tech", question: "Which gaming company's mascot is a fast blue hedgehog?", options: ["Nintendo", "Sega", "Sony", "Atari"], correct: 1 },
  { id: "R3-2", level: 2, category: "Pop Culture", question: "In 'Squid Game', what is the very first game the contestants play?", options: ["Tug of war", "Marbles", "Red Light, Green Light", "Dalgona candy"], correct: 2 },
  { id: "R3-3", level: 3, category: "GK", question: "Which is the largest desert in the world by area?", options: ["Sahara", "Gobi", "Arabian", "Antarctic"], correct: 3 },
  { id: "R3-4", level: 4, category: "Current Affairs", question: "Which city hosted the 2023 G20 Leaders' Summit at Bharat Mandapam?", options: ["Mumbai", "New Delhi", "Bengaluru", "Jaipur"], correct: 1 },
  { id: "R3-5", level: 5, category: "Tech", question: "Which social platform was rebranded as 'X' in 2023?", options: ["Threads", "Tumblr", "Twitter", "Telegram"], correct: 2 },
  { id: "R3-6", level: 6, category: "GK", question: "Which river is known as the 'Sorrow of Bihar' for its devastating floods?", options: ["Ganga", "Kosi", "Son", "Gandak"], correct: 1 },
  { id: "R3-7", level: 7, category: "Pop Culture", question: "Whose Eras Tour became the highest-grossing concert tour of all time?", options: ["Taylor Swift", "Beyoncé", "Coldplay", "Ed Sheeran"], correct: 0 },
  { id: "R3-8", level: 8, category: "Tech", question: "What does CAPTCHA, the 'select all traffic lights' test, actually stand for?", options: ["Computer Access Protocol to Check Human Authentication", "Compressed Authentication Process To Check Hackers Actively", "Central Automated Password Test for Computer Humans Access", "Completely Automated Public Turing test to tell Computers and Humans Apart"], correct: 3 },
  { id: "R3-9", level: 9, category: "Pop Culture", question: "In 'The Legend of Zelda', what is the name of the hero the player actually controls?", options: ["Zelda", "Link", "Ganon", "Epona"], correct: 1 },
  { id: "R3-10", level: 10, category: "Current Affairs", question: "Which Indian shooter became the first Indian since independence to win two medals at a single Olympics, at Paris 2024?", options: ["Avani Lekhara", "Manu Bhaker", "Mirabai Chanu", "P. V. Sindhu"], correct: 1 },
  { id: "R3-11", level: 11, category: "GK", question: "The Jantar Mantar observatory in Jaipur was built by which ruler?", options: ["Man Singh I", "Sawai Jai Singh II", "Prithviraj Chauhan", "Maharana Pratap"], correct: 1 },
  { id: "R3-12", level: 12, category: "Tech", question: "Which 2017 Google paper introduced the Transformer architecture behind modern LLMs?", options: ["Language Models are Few-Shot Learners", "Deep Residual Learning for Image Recognition", "Attention Is All You Need", "Playing Atari with Deep Reinforcement Learning"], correct: 2 },
  { id: "R3-13", level: 13, category: "Pop Culture", question: "Which Indian film was the first to cross ₹1000 crore worldwide?", options: ["Dangal", "Baahubali 2: The Conclusion", "PK", "Bajrangi Bhaijaan"], correct: 1 },
  { id: "R3-14", level: 14, category: "Current Affairs", question: "Which city hosted the Maha Kumbh Mela in 2025?", options: ["Haridwar", "Ujjain", "Nashik", "Prayagraj"], correct: 3 },
  { id: "R3-15", level: 15, category: "GK", question: "Which is the only number in English whose letters are in alphabetical order?", options: ["Thirty", "Fifty", "Sixty", "Forty"], correct: 3 }
];

// Swap-in questions, one per level, in case a question gets challenged or was already seen
const CONTINGENCY = [
  { id: "C1", level: 1, category: "Tech", question: "Which company's early unofficial motto was 'Don't be evil'?", options: ["Facebook", "Google", "Yahoo", "Microsoft"], correct: 1 },
  { id: "C2", level: 2, category: "Pop Culture", question: "In 'The Matrix', which colour pill does Neo swallow to see how deep the rabbit hole goes?", options: ["Blue", "Green", "Red", "Yellow"], correct: 2 },
  { id: "C3", level: 3, category: "GK", question: "Which is the smallest Indian state by area?", options: ["Sikkim", "Goa", "Tripura", "Nagaland"], correct: 1 },
  { id: "C4", level: 4, category: "Current Affairs", question: "India played all its matches of the 2025 ICC Champions Trophy in which city, including the final?", options: ["Lahore", "Dubai", "Karachi", "Mumbai"], correct: 1 },
  { id: "C5", level: 5, category: "Tech", question: "What does the dreaded 'HTTP 404' error mean?", options: ["Page not found", "Server crashed", "Access denied", "Slow connection"], correct: 0 },
  { id: "C6", level: 6, category: "GK", question: "Which gas makes up most of Earth's atmosphere?", options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"], correct: 2 },
  { id: "C7", level: 7, category: "Pop Culture", question: "In 'Stranger Things', what is the name of the parallel dimension that swallows Hawkins' kids?", options: ["The Void", "The Backrooms", "The Shadow Realm", "The Upside Down"], correct: 3 },
  { id: "C8", level: 8, category: "Tech", question: "What does GPU, the chip AI training loves, stand for?", options: ["Graphics Processing Unit", "General Purpose Unit", "Graphical Power Utility", "Gaming Processor Unit"], correct: 0 },
  { id: "C9", level: 9, category: "GK", question: "Kaziranga National Park, famous for the one-horned rhinoceros, is in which state?", options: ["Assam", "West Bengal", "Odisha", "Tripura"], correct: 0 },
  { id: "C10", level: 10, category: "Tech", question: "The original computer 'bug' was a real moth found in 1947 in which machine?", options: ["ENIAC", "UNIVAC", "Colossus", "Harvard Mark II"], correct: 3 },
  { id: "C11", level: 11, category: "Pop Culture", question: "Which video game gave the internet the line 'The cake is a lie'?", options: ["Half-Life", "Portal", "BioShock", "Fallout"], correct: 1 },
  { id: "C12", level: 12, category: "Current Affairs", question: "Which company became the first in history to reach a $4 trillion market value, in July 2025?", options: ["Apple", "Microsoft", "Nvidia", "Alphabet"], correct: 2 },
  { id: "C13", level: 13, category: "GK", question: "Lothal, home to an ancient dockyard, is a Harappan-era site in which Indian state?", options: ["Rajasthan", "Punjab", "Gujarat", "Haryana"], correct: 2 },
  { id: "C14", level: 14, category: "Pop Culture", question: "In 'Interstellar', the water planet where one hour equals seven Earth years orbits which black hole?", options: ["Sagittarius A*", "Gargantua", "Pantagruel", "Cygnus X-1"], correct: 1 },
  { id: "C15", level: 15, category: "Tech", question: "In AI, what does RLHF, the technique used to make chatbots more helpful, stand for?", options: ["Recursive Learning with Heuristic Filtering", "Regularized Loss for High-dimensional Features", "Reinforcement Learning from Human Feedback", "Randomized Layers with Hidden Fine-tuning"], correct: 2 }
];

const QUESTION_BANK = { PRIZE_LADDER, ROUND_1, ROUND_2, ROUND_3, CONTINGENCY };