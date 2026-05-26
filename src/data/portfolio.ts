export const experienceItems = [
  {
    date: 'January 2024 – Present',
    company: 'Mikobyte Solutions',
    role: 'Software Developer',
    bullets: [
      'Developed a chat feature in C++ using the ChatGPT API, allowing tenants to obtain detailed, context-aware answers to building-related questions.',
      'Implemented custom document chunking and message content generation to improve response accuracy.',
      'Created a user-friendly stock trading interface, enabling seamless interaction with real-time stock market data.',
      'Designed and optimized algorithmic solutions in C++ to meet client requirements and performance constraints.',
    ],
  },
  {
    date: 'January 2023 – April 2023',
    company: 'AlertDriving',
    role: 'Software Engineer',
    bullets: [
      'Automated user account creation by enabling bulk employee uploads via Excel and sending setup emails.',
      'Developed over 20 features and bug fixes using PHP, JavaScript, and SQL, enhancing application performance.',
      'Implemented comprehensive unit tests with PHPUnit for features in a driver training system, ensuring robustness and reliability.',
    ],
  },
  {
    date: 'May 2022 – August 2022',
    company: 'Year Zero Studios',
    role: 'Backend Software Developer',
    bullets: [
      'Developed a quiz-building application using React and Firestore, improving overall user experience.',
      'Enhanced functionality and performance across multiple Year Zero Studios websites by designing and implementing features and bug fixes for over 5 active projects using Figma, Git, Firestore, and Heroku.',
      'Composed support documentation to aid other developers on topics including Git, Heroku deployment, and Firestore.',
    ],
  },
  {
    date: 'September 2021 – December 2021',
    company: 'University of Waterloo',
    role: 'Computing Assistant',
    bullets: [
      'Built a mobile-responsive version of an asset management website using PHP, HTML, and JavaScript, improving accessibility and overall user experience.',
      'Maintained an asset management website for the University of Waterloo, resolving over 30 issues.',
      'Provided desktop and hardware support for students and faculty at the University of Waterloo.',
    ],
  },
  {
    date: 'January 2021 – April 2021',
    company: 'Regional Municipality of York',
    role: 'Support Analyst',
    bullets: [
      'Provided cellular and desktop support to the employees of the Regional Municipality of York.',
      'Identified and resolved employee issues using service desk ticketing software, BlackBerry UEM and Microsoft Intune.',
      'Composed support documentation on common issues to reduce the amount of time they take to solve.',
    ],
  },
  {
    date: 'September 2016 – September 2020',
    company: 'The Family Central Restaurant',
    role: 'Server/Supervisor',
    bullets: [
      'Supervised other team members to ensure that customer service standards were met.',
      'Completed daily paperwork and bank deposits.',
      'Delegated cleaning duties to ensure board of health standards were not only met but exceeded.',
    ],
  },
];

export const educationItems = [
  {
    school: 'University of Waterloo',
    date: 'Sept 2020 – April 2025',
    degree: 'Bachelor of Applied Science in Computer Engineering',
    detail: 'Awards: Presidents Scholarship',
  },
  {
    school: 'Glendale High School',
    date: 'Sept 2015 – 2019',
    degree: 'High School Diploma',
    detail:
      'Awards: Ontario Scholar, Proficiency in Physics, Proficiency in Chemistry, Proficiency in Calculus. Clubs: Rube Goldberg Club, Math Competitions, Junior Band.',
  },
];

export type ProjectItem = {
  meta: string;
  title: string;
  tags: string[];
  bullets: string[];
  featured?: boolean;
};

export const projects: ProjectItem[] = [
  {
    meta: 'University of Waterloo · 2024',
    title: 'CargoBuddy: Advanced Autonomous Cargo Delivery System',
    tags: ['C++', 'Robotics', 'Raspberry Pi', 'LiDAR'],
    bullets: [
      'Developed an autonomous robotic system for transporting items in storage facilities, enhancing efficiency.',
      'Optimized path planning algorithms in C++ on a Raspberry Pi, utilizing an internal map for efficient navigation.',
      'Engineered precise navigation using a particle filter algorithm, integrating ultrasonic sensors and LiDAR.',
      "Designed a custom PCB to optimize the robotic system's functionality and streamline hardware integration.",
    ],
    featured: true,
  },
  {
    meta: 'University of Waterloo · 2024',
    title: 'Space XPlorer: Celestial Tracking App',
    tags: ['Kotlin', 'Python', 'PostgreSQL', 'Docker'],
    bullets: [
      'Designed and developed a mobile app for tracking celestial events using Kotlin, XML, Python, Docker Microservices, and PostgreSQL.',
      "Utilized NASA's open APIs, News API, and Weather API for real-time discovery and tracking of celestial events.",
      'Managed user accounts, event tracking functionalities, and a dynamic news feed.',
    ],
  },
  {
    meta: 'University of Waterloo · 2023',
    title: 'RTL 5-Stage Pipelined Processor',
    tags: ['Verilog', 'SystemVerilog', 'FPGA'],
    bullets: [
      'Designed a 5-stage pipelined processor on a PYNQ-Z1 FPGA, using Verilog and SystemVerilog.',
      'Developed hazard detection and forwarding units, reducing data hazards and optimizing pipeline efficiency.',
      'Executed functional and timing simulations with Verilator and Vivado, resolving critical design issues.',
    ],
  },
  {
    meta: 'University of Waterloo · 2023',
    title: 'VHDL Compiler',
    tags: ['Java', 'Compilers'],
    bullets: [
      'Built a compiler for a VHDL-like language, handling lexical analysis, parsing, translation, and optimization.',
      'Implemented multiple parsing algorithms in Java, such as a custom Recursive Descent Parser and Parboiled.',
    ],
  },
  {
    meta: 'University of Waterloo · 2023',
    title: 'Altera Cyclone FPGA Operating System',
    tags: ['C', 'FPGA', 'RTOS'],
    bullets: [
      'Designed and implemented a first-fit memory management system in C, reducing memory fragmentation.',
      'Developed a priority-based kernel with min-heap scheduling and aging techniques, improving task run times.',
      'Implemented inter-task communication enabling seamless coordination between tasks and devices.',
    ],
  },
];

export const skillsGroups = [
  {
    label: 'Languages & hardware',
    items: ['C++/C', 'Java', 'Kotlin', 'Python', 'Verilog', 'VHDL', 'RISC-V', 'FPGA'],
  },
  {
    label: 'Platforms & tools',
    items: ['UNIX/Linux', 'Git', 'Vim', 'PuTTY'],
  },
  {
    label: 'Web & data',
    items: ['JavaScript', 'Node.js', 'React', 'PHP', 'Laravel', 'HTML/CSS', 'SQL', 'Express'],
  },
];
