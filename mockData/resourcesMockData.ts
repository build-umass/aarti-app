interface Resource {
    id: string;
    title: string;
    content: string;
}
export const resources: Resource[] = [
    {
        id: '1',
        title: 'Resource 1',
        content: 'Detailed content for getting started...'
    },
    { id: '2', title: 'Resource 2', content: 'Best practices for development...' },
    { id: '3', title: 'Resource 3', content: 'Complete API documentation...' },
];

export interface Section {
    header: string;
    content: string;
}

export interface MockResource {
    id: string;
    title: string;
    sections: Section[];
}



export const mainResource: MockResource[] = [
    {
        "id": "1",
        "title": "A Beginner's Guide to Web Development",
        "sections": [
            {
                "header": "Introduction to Web Development",
                "content": "Web development refers to the work involved in building and maintaining websites. It encompasses aspects such as web design, web publishing, web programming, and database management. Web developers create and maintain the functionality of a website to ensure an optimal user experience."
            },
            {
                "header": "Frontend vs Backend",
                "content": "Frontend development focuses on what users see, including design, interactivity, and responsiveness. Backend development, on the other hand, involves server-side logic, databases, and application architecture. Both are crucial for a fully functioning web application."
            },
            {
                "header": "Essential Tools",
                "content": "Some essential tools for web developers include text editors like VS Code, version control systems like Git, and browser developer tools. Familiarity with frameworks like React for frontend and Node.js for backend can also be advantageous."
            }
        ]
    },
    {
        "id": "2",
        "title": "Exploring Artificial Intelligence",
        "sections": [
            {
                "header": "What is Artificial Intelligence?",
                "content": "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines programmed to think and learn. These systems can perform tasks like recognizing speech, making decisions, and analyzing data, often surpassing human efficiency in specific areas."
            },
            {
                "header": "Applications of AI",
                "content": "AI has applications across various industries, including healthcare, where it assists in diagnostics and personalized treatment, and finance, where it improves fraud detection and trading strategies. In everyday life, AI powers voice assistants, recommendation systems, and autonomous vehicles."
            },
            {
                "header": "Future of AI",
                "content": "The future of AI holds promise for advancements in natural language understanding, robotics, and predictive analytics. As AI systems evolve, ethical considerations such as privacy, bias, and accountability become increasingly important to address."
            }
        ]
    },
    {
        "id": "3",
        "title": "Exploring Artificial Intelligence",
        "sections": [
            {
                "header": "What is Artificial Intelligence?",
                "content": "Artificial Intelligence (AI) refers to the simulation of human intelligence in machines programmed to think and learn. These systems can perform tasks like recognizing speech, making decisions, and analyzing data, often surpassing human efficiency in specific areas."
            },
            {
                "header": "Applications of AI",
                "content": "AI has applications across various industries, including healthcare, where it assists in diagnostics and personalized treatment, and finance, where it improves fraud detection and trading strategies. In everyday life, AI powers voice assistants, recommendation systems, and autonomous vehicles."
            },
            {
                "header": "Future of AI",
                "content": "The future of AI holds promise for advancements in natural language understanding, robotics, and predictive analytics. As AI systems evolve, ethical considerations such as privacy, bias, and accountability become increasingly important to address."
            }
        ]
    },
    {
        "id": "4",
        "title": "Mastering Time Management",
        "sections": [
            {
                "header": "Why Time Management Matters",
                "content": "Time management is the process of organizing and planning how to divide your time between activities. It allows you to work smarter rather than harder, ensuring productivity and balance in your personal and professional life."
            },
            {
                "header": "Key Strategies",
                "content": "Effective time management strategies include prioritizing tasks using methods like the Eisenhower Matrix, setting SMART goals, and minimizing distractions. Tools such as calendars, task management apps, and time-tracking software can enhance your efficiency."
            },
            {
                "header": "Overcoming Procrastination",
                "content": "Procrastination can undermine your efforts to manage time effectively. To combat this, break tasks into smaller, manageable parts, set deadlines, and reward yourself for completing milestones. Developing a routine can also help you stay consistent."
            }
        ]
    }

]
