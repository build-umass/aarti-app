import { MockResource, Section } from '../../../packages/types/resource'
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
    },
    {
        "id": "5",
        "title": "World War II: A Comprehensive Overview",
        "sections": [
            {
                "header": "The Causes of World War II",
                "content": "World War II, which lasted from 1939 to 1945, was triggered by a complex web of factors, including the harsh terms of the Treaty of Versailles, the rise of authoritarian regimes in Germany, Italy, and Japan, and the global economic instability of the Great Depression. The aggressive expansionist policies of Adolf Hitler and the failure of appeasement further set the stage for global conflict."
            },
            {
                "header": "Key Events and Turning Points",
                "content": "World War II began with Germany's invasion of Poland in September 1939, prompting Britain and France to declare war. Major turning points included the Battle of Britain in 1940, the invasion of the Soviet Union in 1941, and the attack on Pearl Harbor, which brought the United States into the war. The Allied victory in the Battle of Stalingrad and the D-Day invasion of Normandy in 1944 marked significant shifts in the war's trajectory."
            },
            {
                "header": "The End of the War",
                "content": "The war in Europe ended in May 1945 with Germany's unconditional surrender following the fall of Berlin. In the Pacific, the conflict concluded after the United States dropped atomic bombs on Hiroshima and Nagasaki in August 1945, forcing Japan's surrender. The aftermath of the war reshaped global politics, leading to the establishment of the United Nations and the beginning of the Cold War."
            },
            {
                "header": "The Impact of World War II",
                "content": "World War II resulted in an estimated 70-85 million fatalities, making it the deadliest conflict in human history. It caused widespread devastation across Europe and Asia and led to significant social, economic, and technological changes. The war also paved the way for decolonization movements and set the foundation for international human rights initiatives."
            }
        ]
    }

]
