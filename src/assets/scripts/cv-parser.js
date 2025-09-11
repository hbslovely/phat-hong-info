const fs = require('fs');
const path = require('path');

const jsonDir = path.join(__dirname, '..', 'json');
const rawContent = require(path.join(jsonDir, 'raw-content.json'));

// Helper function to write JSON files
const writeJsonFile = (filename, data) => {
    const filePath = path.join(jsonDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Parse personal information
const personalInfo = {
    name: "Hong Phung Phat",
    title: "Senior Software Developer",
    dateOfBirth: "30 Sep 1992",
    address: "201/1/4 Doi Cung, W.9, D.11 HCMC",
    phone: "0764 74 99 64",
    email: "hpphat1992@gmail.com",
    linkedin: "https://www.linkedin.com/in/hpphat1992/",
    summary: "Senior Web Developer specializing in front-end development. Experienced with all stages of the development cycle for dynamic web projects in many scopes (social networks, data management, travelling, ...). Well-versed in numerous programming languages including HTML5, JavaScript, CSS. Have strong background in some common Web frameworks and libraries such as AngularJS, Angular, ReactJS... The target is to become a full stack developer or a tech-lead."
};

// Parse work experience
const experience = {
    workExperience: [
        {
            company: "Backbase",
            position: "Senior Software Engineer",
            department: "R&D AI Team",
            location: "District 3 - HCM",
            type: "Hybrid",
            startDate: "Nov 2024",
            endDate: "Present",
            responsibilities: [
                "Collaborate closely with project managers and the AI team to develop and implement AI-powered solutions for the banking sector",
                "Implement ideas and ensure it is following the release schedule"
            ],
            achievements: [
                "Worked as part of an R&D team in a product-focused company, where the process and workflow emphasized innovation and idea development over traditional delivery timelines"
            ]
        },
        {
            company: "HCL Technologies Limited",
            position: "Senior Software Engineer",
            location: "District 1 - HCM",
            type: "Remote",
            startDate: "Dec 2021",
            endDate: "Nov 2024",
            responsibilities: [
                "Work with a team from a multi-country company to develop a DMS for managing documents of whole aerospace company using technologies: Angular 11-14, GoJS",
                "Joining meetings in the Agile/Scrum process to understand, report and contribute to the development process",
                "Raising some new ideas to improve the current UI/UX of the application"
            ],
            achievements: [
                "Learn a new scope of business in managing the documents",
                "Work with other team members from other countries with different countries and timezones"
            ]
        },
        {
            company: "Saigon Technology Solution",
            position: "Senior Software Engineer",
            location: "Tan Binh - HCM",
            type: "Hybrid",
            startDate: "Oct 2020",
            endDate: "Dec 2021",
            responsibilities: [
                "Work in a team to develop a wealth management application using Angular, Ruby on Rails, SOLID principles",
                "Joining meetings in the Agile/Scrum process",
                "Contribution in the development process"
            ],
            achievements: [
                "Have some contribution in the working process and code quality improvement"
            ]
        },
        {
            company: "Nashtech Vietnam",
            position: "Senior Software Engineer",
            location: "Tan Binh - HCM",
            type: "Onsite",
            startDate: "Dec 2018",
            endDate: "Oct 2020",
            responsibilities: [
                "Joined the team to develop a web application for the wealth management domain of a bank",
                "Joined meetings and followed the Agile/Scrum process",
                "Using modern technologies at the running time: Kendo UI, moment, lodash"
            ],
            achievements: [
                "Learned many new things from new business scope in wealth management and Agile/Scrum process"
            ]
        },
        {
            company: "New Ocean Information System Co., Ltd",
            position: "Software Engineer",
            location: "Tan Binh - HCM",
            type: "Onsite",
            startDate: "Sep 2014",
            endDate: "Dec 2018",
            responsibilities: [
                "Joined a team to develop an application based on Qt to send and receive data on a big network",
                "Joined a team to develop applications using modern technologies at that time (AngularJS, Angular, Reactjs)",
                "Helped to support other teams to review code",
                "Helped companies train for new comers"
            ],
            achievements: [
                "Archived knowledge of web development and had some basic knowledge on Javascript"
            ]
        }
    ]
};

// Parse education
const education = {
    education: [
        {
            institution: "University of Science, Ho Chi Minh, Viet Nam",
            degree: "Bachelor of Computer Science",
            field: "Computer Vision",
            startDate: "2010",
            endDate: "2014"
        }
    ]
};

// Parse skills
const skills = {
    technicalSkills: {
        programmingLanguages: ["HTML5", "JavaScript", "CSS"],
        frameworks: ["Angular", "AngularJS", "ReactJS", "Qt"],
        libraries: ["KendoUI", "D3.js", "jQuery", "Lodash", "Moment.js"],
        testing: ["Jest", "Jasmine", "Karma", "Protractor", "ChaiJS", "Sinon"],
        methodologies: ["SOLID principles", "Agile/Scrum"],
        tools: ["Git", "SVN", "Webpack", "Grunt", "Angular CLI"],
        environments: ["Webstorm", "Visual Studio Code", "Chrome", "Windows", "MacOS"]
    }
};

// Parse projects
const projects = {
    projects: [
        {
            name: "Backbase",
            company: "Backbase",
            duration: "Nov 2024 - Now",
            description: "Working on the R&D department to implement the new AI-based ideas to collaborate the the main product of company",
            scope: "Banking",
            technologies: ["Angular", "Bootstrap", "Jest"],
            environment: ["Webstorm", "Github", "Nx"],
            role: "Front-end Developer"
        },
        {
            name: "Statrys",
            company: "HCL",
            duration: "Sep 2022 - Nov 2024",
            description: "Building the application for both Front users and admin user of a fintech company to allow user to make a money transfer in different currencies",
            scope: "FinTech",
            technologies: ["Angular", "ReactJS", "TailwindCSS", "Material", "GraphQL", "Jasmine", "Karma"],
            environment: ["VSC", "Git", "Chrome", "Windows", "Agile/Scrum"],
            role: "Front-end Developer"
        },
        {
            name: "PW",
            company: "HCL",
            duration: "Dec 2021 - Dec 2023",
            description: "Develop a DMS system for storing the document regarding to aerospace scope",
            scope: "Aerospace, DMS",
            technologies: ["Angular 11-14", "GoJS", "ASP NET"],
            environment: ["Webstorm", "Git", "Chrome", "Windows", "Agile/Scrum", "Remote Desktop Connection"],
            role: "Front-end Developer"
        },
        {
            name: "Finantix",
            company: "Nashtech",
            duration: "Dec 2018 – Oct 2020",
            description: "An applicant for manage the orders/invoices/payments. Also, other bankers, or wealth managers can use to introduce / demonstrate the plan to customer",
            scope: "ODC – Finance, Banking, Insurance, Wealth management",
            technologies: ["Angularjs", "Angular 7", "Nodejs", "IOS (Swift)", "Android (Java)", "SOLID principles"],
            environment: ["Webstorm", "Git", "Chrome", "IOS", "Android", "MacOS", "Agile/Scrum"],
            role: "Front-end Developer, Mobile App Developer (Minor)"
        },
        {
            name: "Trabble – chatbot",
            duration: "Feb 2018 –Oct 2018",
            description: "A project to build a chat-bot for tourism to be able to understand about the destination (famous places, restaurants, hotels) in Singapore",
            technologies: ["HTML", "CSS", "Angular 5", "ReactJS", "Nativescript", "SignalR", "ASP Net core", "Facebook API", "Google Place API", "Angular Material", "Nodejs"],
            environment: ["Webstorm", "Git", "Chrome", "Angular Cli", "Azure portal", "Invision", "Trello"],
            role: "Front-end and Back-end developer"
        }
    ]
};

// Write all JSON files
writeJsonFile('personal-info.json', personalInfo);
writeJsonFile('experience.json', experience);
writeJsonFile('education.json', education);
writeJsonFile('skills.json', skills);
writeJsonFile('projects.json', projects);

console.log('CV data has been parsed and saved to JSON files successfully!');
