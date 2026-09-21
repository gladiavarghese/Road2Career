/**
 * Quiz Question Generator for Weekly Planner Tasks
 * Generates contextually relevant multiple-choice questions for task topics
 */

const QUESTION_BANK = {
  python: [
    {
      question: "Which keyword in Python is used to define a class method for object initialization?",
      options: ["def __init__(self)", "function construct()", "def create()", "class __main__()"],
      correct: 0,
      explanation: "In Python OOP, `def __init__(self)` serves as the class constructor method for initializing instance attributes."
    },
    {
      question: "What is the key difference between a Python List and a Tuple?",
      options: [
        "Lists are immutable while tuples are mutable",
        "Lists are mutable while tuples are immutable",
        "Tuples can store only numbers",
        "Lists cannot be nested"
      ],
      correct: 1,
      explanation: "Lists (`[...]`) can be changed after creation (mutable), whereas Tuples (`(...)`) cannot be modified (immutable)."
    },
    {
      question: "What does `type hints` (e.g. `def add(x: int) -> int:`) accomplish in modern Python?",
      options: [
        "Enforces hard type errors at runtime like C++",
        "Improves code readability, IDE autocompletion, and static analysis (mypy)",
        "Compiles Python into machine code",
        "Prevents memory leaks automatically"
      ],
      correct: 1,
      explanation: "Type hints provide documentation, IDE autocomplete, and allow static type checking with tools like `mypy` without affecting runtime execution."
    }
  ],
  oop: [
    {
      question: "What is the core OOP principle of 'Encapsulation'?",
      options: [
        "Inheriting methods from parent classes",
        "Bundling data and methods operating on that data into a single unit, hiding internal state",
        "Creating multiple methods with the same name",
        "Converting code into bytecode"
      ],
      correct: 1,
      explanation: "Encapsulation restricts direct access to some of an object's components, which prevents accidental modification of data."
    },
    {
      question: "In OOP, what is 'Polymorphism'?",
      options: [
        "Ability of different classes to respond to the same method call in their own specific way",
        "Storing objects in a relational database",
        "Writing code in multiple programming languages",
        "Creating single-instance singleton classes"
      ],
      correct: 0,
      explanation: "Polymorphism allows objects of different classes to be treated as objects of a common superclass, each implementing the method differently."
    },
    {
      question: "What does 'Inheritance' allow in Object-Oriented Programming?",
      options: [
        "Allows a child class to acquire properties and methods of a parent class",
        "Prevents classes from having private attributes",
        "Forces all functions to return boolean values",
        "Deletes unused objects from RAM"
      ],
      correct: 0,
      explanation: "Inheritance promotes code reuse by enabling a derived class to inherit behavior and structure from a base class."
    }
  ],
  data_structures: [
    {
      question: "What is the average time complexity for searching an element in a Hash Table (Dictionary)?",
      options: ["O(N)", "O(log N)", "O(1)", "O(N^2)"],
      correct: 2,
      explanation: "Hash tables provide average constant time O(1) lookup performance using hash keys."
    },
    {
      question: "Which Data Structure follows LIFO (Last-In, First-Out) ordering?",
      options: ["Queue", "Stack", "Linked List", "Binary Tree"],
      correct: 1,
      explanation: "A Stack operates on LIFO (Last-In, First-Out), where the last added item is removed first."
    },
    {
      question: "What is a main advantage of a Linked List over an Array?",
      options: [
        "Random memory access by index in O(1)",
        "Dynamic memory allocation and efficient insertion/deletion without shifting elements",
        "Uses less total memory",
        "Guaranteed cache line spatial locality"
      ],
      correct: 1,
      explanation: "Linked lists allow dynamic allocation and fast O(1) node insertion/deletion once the pointer location is known."
    }
  ],
  algorithms: [
    {
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["O(N log N)", "O(N)", "O(N^2)", "O(1)"],
      correct: 2,
      explanation: "QuickSort has a worst-case time complexity of O(N^2) when poor pivots (e.g., sorted array with first element pivot) are chosen."
    },
    {
      question: "Which algorithm search technique requires the input array to be pre-sorted?",
      options: ["Linear Search", "Binary Search", "Depth-First Search", "Breadth-First Search"],
      correct: 1,
      explanation: "Binary Search operates by repeatedly halving the search interval and requires a sorted sequence."
    },
    {
      question: "What is the main characteristic of Dynamic Programming (DP)?",
      options: [
        "Randomly sampling solutions",
        "Breaking down problems into overlapping subproblems and storing subproblem results (memoization/tabulation)",
        "Sorting elements alphabetically",
        "Executing instructions on multiple CPU cores"
      ],
      correct: 1,
      explanation: "Dynamic Programming optimizes recursive algorithms by storing and reusing solutions to overlapping subproblems."
    }
  ],
  javascript: [
    {
      question: "How does the JavaScript Event Loop handle resolved promises?",
      options: [
        "Pushes callbacks into the Microtask Queue",
        "Blocks the main execution thread",
        "Spawns background OS threads",
        "Executes callbacks before synchronous code"
      ],
      correct: 0,
      explanation: "Promise handlers (.then, await) are placed into the Microtask Queue, which executes before the Macrotask Queue."
    },
    {
      question: "What is a closure in JavaScript?",
      options: [
        "A function combined with references to its surrounding lexical environment",
        "Closing an open database connection",
        "A method to stop event bubbling",
        "A minified JS bundle"
      ],
      correct: 0,
      explanation: "A closure gives an inner function access to an outer function's scope even after the outer function has returned."
    },
    {
      question: "What is the primary difference between `let` and `var`?",
      options: [
        "`let` is block-scoped while `var` is function-scoped",
        "`var` cannot be reassigned",
        "`let` is global only",
        "No difference exists"
      ],
      correct: 0,
      explanation: "`let` respects block scoping ({ ... }), whereas `var` is scoped to the nearest function or global context."
    }
  ],
  react: [
    {
      question: "What rule must be observed when calling React Hooks like `useState` or `useEffect`?",
      options: [
        "They can be called inside conditional statements or loops",
        "They must only be called at the top level of React functional components",
        "They can only be called in class constructors",
        "They must return raw HTML strings"
      ],
      correct: 1,
      explanation: "React relies on the call order of hooks, so they must always be invoked unconditionally at the top level."
    },
    {
      question: "What is the primary purpose of the `useEffect` hook in React?",
      options: [
        "To perform side effects (fetching data, subscriptions, manual DOM changes)",
        "To define CSS styles dynamically",
        "To replace Redux global state",
        "To compile JSX into browser native code"
      ],
      correct: 0,
      explanation: "`useEffect` enables functional components to handle lifecycle events and asynchronous side effects."
    },
    {
      question: "Why does React require a unique `key` prop when rendering lists of elements?",
      options: [
        "To style each item differently",
        "To help React identify which items have changed, been added, or removed during Reconciliation",
        "To enable local storage caching",
        "To encrypt list item content"
      ],
      correct: 1,
      explanation: "Keys give elements a stable identity, allowing the virtual DOM algorithm to efficiently update changed items."
    }
  ],
  testing: [
    {
      question: "What is the main goal of Unit Testing?",
      options: [
        "Testing the full end-to-end user UI flow",
        "Testing individual isolated functions or components in isolation from dependencies",
        "Testing server hardware load capacity",
        "Testing database storage speed"
      ],
      correct: 1,
      explanation: "Unit tests focus on validating small, isolated units of code (like individual functions or classes)."
    },
    {
      question: "What does 'TDD' stand for in software development?",
      options: [
        "Test-Driven Development",
        "Technical Document Design",
        "Total Data Deployment",
        "Time-Domain Debugging"
      ],
      correct: 0,
      explanation: "Test-Driven Development is a workflow where unit test cases are written before writing actual functional code."
    },
    {
      question: "What is a 'Mock' in automated testing?",
      options: [
        "A fake implementation of a dependency (like a database or API) used to isolate the code under test",
        "A broken unit test that always fails",
        "A production deployment script",
        "A user UI theme layout"
      ],
      correct: 0,
      explanation: "Mocks simulate external services or dependencies to ensure tests remain fast, deterministic, and isolated."
    }
  ],
  project: [
    {
      question: "What is the recommended practice before pushing code to a shared Git repository?",
      options: [
        "Delete local git history",
        "Run local tests, check git status, and write descriptive commit messages",
        "Force push directly to main without review",
        "Disable code linting"
      ],
      correct: 1,
      explanation: "Verifying code quality locally and providing clear commit messages ensures project stability and clean collaboration."
    },
    {
      question: "What is the primary benefit of code refactoring?",
      options: [
        "Changing external application behavior",
        "Improving internal code structure, readability, and maintainability without altering external behavior",
        "Adding new features to production",
        "Deleting database tables"
      ],
      correct: 1,
      explanation: "Refactoring cleans up code debt, making it cleaner and easier to maintain without breaking functionality."
    },
    {
      question: "What does a CI/CD pipeline automate?",
      options: [
        "Writing feature specifications",
        "Building, testing, and deploying application code automatically upon code changes",
        "Designing marketing logos",
        "Generating database seed passwords"
      ],
      correct: 1,
      explanation: "Continuous Integration & Deployment pipelines automate build checks, test execution, and deployment."
    }
  ],
  general: [
    {
      question: "What is a primary principle of writing clean, maintainable code?",
      options: [
        "DRY (Don't Repeat Yourself) and high cohesion with loose coupling",
        "Writing all logic in one massive function",
        "Avoiding variable naming standards",
        "Suppressing error log messages"
      ],
      correct: 0,
      explanation: "The DRY principle and modular architecture ensure code is maintainable, reusable, and easy to debug."
    },
    {
      question: "Why is error handling (try/catch) important in production applications?",
      options: [
        "It makes application code run 10x faster",
        "It prevents unhandled application crashes and provides helpful feedback/recovery to users",
        "It removes the need for database indexes",
        "It encrypts variable names"
      ],
      correct: 1,
      explanation: "Proper error handling captures unexpected exceptions gracefully, avoiding app crashes and keeping logs clean."
    },
    {
      question: "What is the purpose of Code Reviews in software development teams?",
      options: [
        "To test network bandwidth",
        "To catch bugs early, share knowledge, and ensure architectural standards across team members",
        "To slow down the release process",
        "To replace unit testing completely"
      ],
      correct: 1,
      explanation: "Code reviews improve overall code quality, maintain consistency, and foster team knowledge sharing."
    }
  ]
};

/**
 * Get 3 questions tailored to the given task title and context
 */
export function getQuestionsForTask(taskTitle = '', dayType = 'learning') {
  const text = (taskTitle || '').toLowerCase();

  let category = 'general';
  if (text.includes('python') || text.includes('type hint') || text.includes('exercise')) category = 'python';
  if (text.includes('oop') || text.includes('class') || text.includes('object')) category = 'oop';
  if (text.includes('structure') || text.includes('list') || text.includes('array') || text.includes('stack') || text.includes('queue')) category = 'data_structures';
  if (text.includes('algo') || text.includes('sort') || text.includes('search') || text.includes('dp')) category = 'algorithms';
  if (text.includes('js') || text.includes('javascript') || text.includes('es6') || text.includes('async')) category = 'javascript';
  if (text.includes('react') || text.includes('component') || text.includes('hook') || text.includes('state')) category = 'react';
  if (text.includes('test') || text.includes('mock') || text.includes('unit')) category = 'testing';
  if (text.includes('project') || text.includes('github') || text.includes('build') || text.includes('deploy')) category = 'project';

  const questions = QUESTION_BANK[category] || QUESTION_BANK.general;
  
  // Return shallow copy of 3 questions
  return questions.map((q, idx) => ({
    id: idx + 1,
    question: q.question,
    options: [...q.options],
    correct: q.correct,
    explanation: q.explanation,
  }));
}
