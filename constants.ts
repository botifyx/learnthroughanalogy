import { Analogy } from './types';

export const ANALOGY_DATA: Omit<Analogy, 'category'>[] = [
  {
    id: 1,
    title: 'How VOIP Calls Works',
    concept: 'VoIP (Voice over Internet Protocol) enables voice communication, converting voice signals into digital data packets for efficient transmission. This technology allows users to make calls using various devices, reducing costs and enabling seamless connectivity worldwide..',
    analogy: 'Let’s examine how a VoIP (Voice over IP) call works, using the postal mail analogy to make it easy to follow!',
    url: 'https://medium.com/@ramdinesh/how-voip-calls-works-5f4604f8798c'
  },
  {
    id: 2,
    title: 'Blockchain Technology',
    concept: 'Blockchain technology, a secure, transparent, and immutable distributed ledger, ensures high transparency. It can be used to create a tamper-proof decentralized database, keeping us well-informed in our digital interactions.',
    analogy: 'As we have learned about other technologies via analogy, let’s understand blockchain via analogy, too.',
    url: 'https://medium.com/@ramdinesh/blockchain-technology-116520f2ecab'
  },
  {
    id: 3,
    title: 'Neural Networks (AI)',
    concept: 'A series of algorithms that endeavors to recognize underlying relationships in a set of data through a process that mimics the way the human brain operates.',
    analogy: 'Artificial Intelligence sounds complex — full of neurons, layers, and backpropagation equations. But what if I told you that a neural network behaves a lot like you and me, every single day?.',
    url: 'https://medium.com/@ramdinesh/neural-networks-7ba226f68062'
  },
  {
    id: 4,
    title: 'API (Application Programming Interface)',
    concept: 'A set of rules and protocols that allows different software applications to communicate with each other.',
    analogy: 'An API is like a waiter in a restaurant. You don’t go directly to the kitchen. Instead, you give your order to the waiter (the API), who communicates with the kitchen and brings the food back to you.',
    url: 'https://medium.com/@ramdinesh/application-programming-interface-api-2d16528f9ec1'
  },
  {
    id: 5,
    title: 'Cloud Computing',
    concept: 'The on-demand availability of computer system resources, especially data storage and computing power, without direct active management by the user.',
    analogy: 'It’s like using a power grid instead of owning your own generator. You plug into the wall and use the electricity you need, paying only for what you use.',
    url: 'https://medium.com/@ramdinesh/cloud-technology-f1447b3c5242'
  },
  {
    id: 6,
    title: 'Git and Version Control',
    concept: 'A system that records changes to a file or set of files over time so that you can recall specific versions later.',
    analogy: 'Think of it as the "undo" button for your entire project, but on steroids. It’s like having a timeline of every save you’ve ever made, allowing you to go back to any previous version.',
    url: 'https://medium.com/@ramdinesh/git-and-version-control-bec8b79ee350'
  },
  {
    id: 7,
    title: 'Large Language Models (LLMs)',
    concept: 'Advanced AI systems trained on vast amounts of text data to understand and generate human-like language.',
    analogy: 'Let’s use the analogy of a “smart assistant in your home” to explain the concepts, tools, and ways of working with Large Language Models (LLMs). This analogy will be relatable and easy to understand.x`.',
    url: 'https://medium.com/@ramdinesh/large-language-model-bbb5793bf746'
  },
  {
    id: 8,
    title: 'Recursion in Programming',
    concept: 'A programming technique where a function calls itself to solve a problem by breaking it into smaller, identical subproblems.',
    analogy: 'Like standing between two parallel mirrors. You see your reflection, which contains a reflection of you, which contains another reflection, creating an infinite series until a "base case" stops it.',
    url: 'https://medium.com/@ramdinesh/recursion-in-programming-e4ee17e8e1e0'
  },
  {
    id: 9,
    title: 'Docker Containers',
    concept: 'A lightweight, standalone, executable package of software that includes everything needed to run it: code, runtime, libraries, and settings.',
    analogy: 'Like a shipping container. It can be moved from a ship to a train to a truck without being opened, ensuring the contents (your application) work the same way everywhere.',
    url: 'https://medium.com/@ramdinesh/docker-d4c3cfd7c85e'
  },
  {
    id: 10,
    title: 'Big O Notation',
    concept: 'A mathematical notation used to classify algorithms according to how their run time or space requirements grow as the input size grows.',
    analogy: 'Imagine sending a file. O(1) is handing over a USB stick (time is constant regardless of file size). O(n) is sending it online (time is proportional to file size).',
    url: 'https://medium.com/@ramdinesh/big-o-notation-3a05115fc4bd'
  },
  {
    id: 11,
    title: 'DevOps',
    concept: 'A culture and set of practices that combines software development (Dev) and IT operations (Ops) to shorten the development life cycle.',
    analogy: 'DevOps is like the entire process of creating a movie. It involves various stages, just like how a movie goes from scriptwriting to screening in theaters.',
    url: 'https://medium.com/@ramdinesh/devops-82d358225377'
  },
  {
    id: 12,
    title: 'The CAP Theorem',
    concept: 'A distributed system can only provide two of three guarantees: Consistency, Availability, and Partition tolerance.',
    analogy: 'Planning a pizza party. You can have a consistent topping list, availability from any pizza place, or tolerance for a place being closed. You can’t have all three perfectly.',
    url: 'https://medium.com/@ramdinesh/the-cap-theorem-34ecc5cae733'
  },
  {
    id: 13,
    title: 'Service Mesh',
    concept: 'A dedicated infrastructure layer for handling service-to-service communication in a microservices architecture.',
    analogy: 'An office building’s central infrastructure (security, mail, intercom). It handles communication and security for all offices (microservices) efficiently and uniformly.',
    url: 'https://medium.com/@ramdinesh/what-is-a-service-mesh-an-office-building-analogy-a83151325d7b'
  },
  {
    id: 14,
    title: 'CI/CD Pipeline',
    concept: 'Continuous Integration and Continuous Delivery/Deployment is a practice of automating the software release process.',
    analogy: 'An automated car factory. Code (raw materials) is continuously built, tested, and prepared on an assembly line (CI), and the finished software (car) is automatically delivered (CD).',
    url: 'https://medium.com/@ramdinesh/ci-cd-pipeline-27eb9b4ed802'
  },
  {
    id: 15,
    title: 'What is Kubernetes?',
    concept: 'An open-source container orchestration system for automating software deployment, scaling, and management.',
    analogy: 'Let’s understand Kubernetes concepts using analogies related to cooking to make them easier to understand.',
    url: 'https://medium.com/@ramdinesh/kubernetes-6a2f3078eaff'
  },
  {
    id: 16,
    title: 'Serverless Architecture',
    concept: 'A cloud computing execution model in which the cloud provider runs the server, and dynamically manages the allocation of machine resources.',
    analogy: 'Let’s dive into Serverless Architecture using a Restaurant analogy.',
    url: 'https://medium.com/@ramdinesh/serverless-architecture-98a682d445a3'
  },
  {
    id: 17,
    title: 'Quantum Computing',
    concept: 'A type of computing that uses the principles of quantum mechanics, like superposition and entanglement, to process information.',
    analogy: 'A regular computer uses bits (like light switches, either on or off). A quantum computer uses qubits, which are like dimmer switches that can be on, off, or anywhere in between, all at the same time.',
    url: 'https://medium.com/@ramdinesh/quantum-computing-c19e820baa92'
  },
  {
    id: 18,
    title: 'Artificial Intelligence',
    concept: 'Artificial Intelligence (AI) is one of the most transformative technologies of our time.',
    analogy: 'Understanding Artificial Intelligence (AI) through analogies from the “Money Heist” (La Casa de Papel) web series can make the concepts more engaging and relatable.',
    url: 'https://medium.com/@ramdinesh/artificial-intelligence-66125b74916c'
  },
  {
    id: 19,
    title: 'Microservices Architecture',
    concept: 'An architectural style that structures an application as a collection of loosely coupled services.',
    analogy: 'Let’s explore microservices using everyday analogies that can resonate with both men and women, making the concept easy to understand and engaging.',
    url: 'https://medium.com/@ramdinesh/microservices-1f16a26294d9'
  },
  {
    id: 20,
    title: 'Software Engineering',
    concept: 'Software Engineering is Applying engineering to software development to solve real-world problems efficiently and reliably.',
    analogy: 'It combines engineering principles with computer science to produce reliable, scalable, and maintainable software systems.',
    url: 'https://medium.com/@ramdinesh/software-engineering-lesson-1-3bd51c82656d'
  },
  {
    id: 21,
    title: 'Salesforce',
    concept: 'Salesforce is a cloud-based Customer Relationship Management (CRM) platform that provides tools for managing customer relationships, streamlining processes, and improving overall business efficiency.',
    analogy: 'Let’s expand on these Salesforce clouds using the restaurant analogy to illustrate how they work and how you can master them.',
    url: 'https://medium.com/@ramdinesh/salesforce-part-1-5e1b7b2f1a05'
  },
  {
    id: 22,
    title: 'Coding Guidelines',
    concept: 'An Article to explain and understand coding guidelinesk.',
    analogy: 'To help you understand coding guidelines, let’s use the analogy of building a house.',
    url: 'https://medium.com/@ramdinesh/coding-guidelines-part-1-fab779a50311'
  },
  {
    id: 23,
    title: 'Power BI',
    concept: 'Power BI is a powerful business analytics tool developed by Microsoft that allows users to visualize and share insights from their data.',
    analogy: 'Power BI is like having a smart kitchen that helps you effortlessly turn these ingredients into a beautiful and tasty meal.',
    url: 'https://medium.com/@ramdinesh/power-bi-88195bf205bb'
  },
  {
    id: 24,
    title: 'Software Estimation Techniques',
    concept: 'We estimate testing efforts for applications, whether web or mobile, by considering several factors, such as the scope of the testing, the complexity of the application, and the resources available.',
    analogy: 'Let’s use the analogy of planning a road trip to understand software estimation techniques and concepts.',
    url: 'https://medium.com/@ramdinesh/software-estimation-techniques-f97d99d17910'
  },
  {
    id: 25,
    title: 'Scaled Agile (SAFe)',
    concept: 'SAFe is a framework for scaling Agile across large organizations. It includes principles, practices, and roles that help manage and deliver large-scale projects efficiently.',
    analogy: 'Let’s use Marvel movies to understand the key components and roles in the SAFe (Scaled Agile Framework) process.',
    url: 'https://medium.com/@ramdinesh/scaled-agile-safe-971302b726db'
  },
  {
    id: 26,
    title: 'System Design',
    concept: 'System design entails defining the architecture, interfaces, and data of a system to fulfill specific requirements.',
    analogy: 'We’ll use the analogy of building and running a city to represent how system design works in software engineering.',
    url: 'https://medium.com/@ramdinesh/system-design-part-1-823cd3fd5968'
  }
];