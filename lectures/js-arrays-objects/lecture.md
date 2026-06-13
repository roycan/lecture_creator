# Welcome to JavaScript - Part 2!

Welcome back! 🎉

In **Part 1**, you learned the foundations: variables, conditionals, loops, and functions. Now you're ready for the exciting stuff!

## Quick Recap: What You Already Know

Let's refresh your memory from Part 1:

### **Variables & Data Types**
```javascript
let name = "Maria";      // String
let age = 15;            // Number
let isPassed = true;     // Boolean
```

### **Conditionals (Making Decisions)**
```javascript
if (score >= 75) {
    console.log("Passed!");
} else {
    console.log("Not yet!");
}
```

### **Loops (Repeating Actions)**
```javascript
// For loop
for (let i = 1; i <= 5; i++) {
    console.log(i);
}

// While loop
while (count < 10) {
    count++;
}
```

### **Functions (Reusable Code)**
```javascript
function greet(name) {
    return "Hello, " + name + "!";
}

let message = greet("Jose");  // "Hello, Jose!"
```

**Great!** Now let's build on this foundation! 🚀

## Why Data Structures?

Imagine you need to store **100 students' names**. Would you do this?

```javascript
// ❌ Terrible way
let student1 = "Maria";
let student2 = "Jose";
let student3 = "Ana";
// ... 97 more lines ...
```

**No way!** That's where **Arrays** and **Objects** come in! 🎯

**Today you'll learn:**
- 📦 **Arrays** - Store lists of data (names, scores, prices)
- 🗂️ **Objects** - Store related information together (student profiles)
- ⚡ **Powerful Methods** - Process data like a pro!

## Arrays - Your First Data Structure

An **array** is like a **list** that stores multiple values in one variable.

### **Creating Arrays**

```javascript
// Empty array
let students = [];

// Array with students
let students = ["Maria", "Jose", "Ana", "Pedro"];

// Array with numbers
let scores = [85, 90, 78, 92, 88];

// Arrays can hold different types (but usually don't)
let mixed = [1, "hello", true, 3.14];
```

**Think of it like:** A numbered list where JavaScript counts starting from **0** (not 1!)

```
Array: ["Maria", "Jose", "Ana", "Pedro"]
Index:    0       1       2       3
```

### **Why Start at 0?**

Computer scientists count from 0. It's weird at first, but you'll get used to it! 😊

```javascript
let fruits = ["apple", "banana", "orange"];

// Index:      0        1         2
```

![Diagram showing array with four elements labeled by index 0 through 3, demonstrating zero-based indexing](diagrams/array-indexing.png)

## Accessing Array Elements

Use **square brackets** with the index number:

```javascript
let students = ["Maria", "Jose", "Ana", "Pedro"];

console.log(students[0]);  // Output: Maria
console.log(students[1]);  // Output: Jose
console.log(students[2]);  // Output: Ana
console.log(students[3]);  // Output: Pedro

// ❌ This doesn't exist!
console.log(students[4]);  // Output: undefined
```

### **Get Array Length**

```javascript
let students = ["Maria", "Jose", "Ana"];

console.log(students.length);  // Output: 3

// Get last item (useful trick!)
let lastStudent = students[students.length - 1];
console.log(lastStudent);  // Output: Ana
```

### **Real Example: Quiz Scores**

```javascript
let quizScores = [85, 90, 78, 92, 88];

console.log("First quiz: " + quizScores[0]);    // First quiz: 85
console.log("Last quiz: " + quizScores[4]);     // Last quiz: 88
console.log("Total quizzes: " + quizScores.length);  // Total quizzes: 5
```

### **Changing Array Values**

```javascript
let scores = [85, 90, 78];

console.log(scores);  // [85, 90, 78]

// Change the second score
scores[1] = 95;

console.log(scores);  // [85, 95, 78]
```

## Adding and Removing Items

Arrays are **dynamic** - they can grow and shrink!

### **Adding to the End: push()**

```javascript
let students = ["Maria", "Jose"];

students.push("Ana");
console.log(students);  // ["Maria", "Jose", "Ana"]

students.push("Pedro");
console.log(students);  // ["Maria", "Jose", "Ana", "Pedro"]
```

### **Removing from the End: pop()**

```javascript
let students = ["Maria", "Jose", "Ana"];

let removed = students.pop();  // Removes and returns "Ana"
console.log(removed);          // "Ana"
console.log(students);         // ["Maria", "Jose"]
```

### **Adding to the Beginning: unshift()**

```javascript
let students = ["Jose", "Ana"];

students.unshift("Maria");
console.log(students);  // ["Maria", "Jose", "Ana"]
```

### **Removing from the Beginning: shift()**

```javascript
let students = ["Maria", "Jose", "Ana"];

let removed = students.shift();  // Removes and returns "Maria"
console.log(removed);            // "Maria"
console.log(students);           // ["Jose", "Ana"]
```

### **Visual Summary**

```
Array: ["Maria", "Jose", "Ana"]

unshift("Pedro")  →  ["Pedro", "Maria", "Jose", "Ana"]  (add to start)
push("Rosa")      →  ["Maria", "Jose", "Ana", "Rosa"]   (add to end)
shift()           →  ["Jose", "Ana"]  (remove from start)
pop()             →  ["Maria", "Jose"]  (remove from end)
```

![Diagram showing array with directional arrows for push, pop, shift, and unshift operations at both ends](diagrams/array-mutation.png)

### **Real Example: Shopping Cart**

```javascript
let cart = [];

// Add items
cart.push("Coke Sakto");
cart.push("Pan de sal");
cart.push("Skyflakes");

console.log("Cart: " + cart);
console.log("Items: " + cart.length);

// Remove last item
let removed = cart.pop();
console.log("Removed: " + removed);
console.log("Cart now: " + cart);

// Output:
// Cart: Coke Sakto,Pan de sal,Skyflakes
// Items: 3
// Removed: Skyflakes
// Cart now: Coke Sakto,Pan de sal
```

## Practice: Student Roster

**Challenge:** Create a class roster system that can add and remove students.

**Try it yourself! Solution:**

```javascript
let classRoster = [];

// Add students
classRoster.push("Maria Santos");
classRoster.push("Jose Cruz");
classRoster.push("Ana Reyes");
classRoster.push("Pedro Garcia");

console.log("Class Roster:");
console.log("Total students: " + classRoster.length);

// Show each student
for (let i = 0; i < classRoster.length; i++) {
    console.log((i + 1) + ". " + classRoster[i]);
}

// Output:
// Class Roster:
// Total students: 4
// 1. Maria Santos
// 2. Jose Cruz
// 3. Ana Reyes
// 4. Pedro Garcia
```

## Essential Array Methods

Now for the **powerful stuff**! These methods make working with arrays much easier.

> 🟢 **You Need These!** Master these three methods - they're used everywhere in real JavaScript code.

![Taxonomy diagram grouping array methods into Essential (forEach, map, filter) and Advanced (find, reduce, includes, slice, sort) categories](diagrams/method-taxonomy.png)

### **forEach() - Do Something with Each Item**

Instead of writing a for loop, use `forEach()`:

```javascript
let scores = [85, 90, 78, 92];

// ❌ Old way (for loop)
for (let i = 0; i < scores.length; i++) {
    console.log(scores[i]);
}

// ✅ Modern way (forEach)
scores.forEach(function(score) {
    console.log(score);
});
```

**How it works:** `forEach()` calls your function once for each item.

```javascript
let students = ["Maria", "Jose", "Ana"];

students.forEach(function(student) {
    console.log("Hello, " + student + "!");
});

// Output:
// Hello, Maria!
// Hello, Jose!
// Hello, Ana!
```

**You can also get the index:**

```javascript
let students = ["Maria", "Jose", "Ana"];

students.forEach(function(student, index) {
    console.log((index + 1) + ". " + student);
});

// Output:
// 1. Maria
// 2. Jose
// 3. Ana
```

### **Real Example: Sari-Sari Store Prices**

```javascript
let products = ["Coke Sakto", "Pan de sal", "Skyflakes"];
let prices = [20, 5, 15];

console.log("Aling Maria's Store - Price List:");
console.log("================================");

products.forEach(function(product, index) {
    console.log(product + " - ₱" + prices[index]);
});

// Output:
// Aling Maria's Store - Price List:
// ================================
// Coke Sakto - ₱20
// Pan de sal - ₱5
// Skyflakes - ₱15
```

### **map() - Transform Each Item**

`map()` creates a **new array** by transforming each item:

```javascript
let prices = [100, 200, 150];

// Add 10% tax to each price
let withTax = prices.map(function(price) {
    return price * 1.10;
});

console.log("Original: " + prices);    // [100, 200, 150]
console.log("With tax: " + withTax);   // [110, 220, 165]
```

**Key point:** `map()` doesn't change the original array - it makes a new one!

### **Real Example: Grade Bonus**

```javascript
let scores = [75, 80, 85, 90];

// Teacher adds 5 bonus points to everyone
let bonusScores = scores.map(function(score) {
    return score + 5;
});

console.log("Original scores: " + scores);
console.log("With bonus: " + bonusScores);

// Output:
// Original scores: 75,80,85,90
// With bonus: 80,85,90,95
```

### **Real Example: Peso Prices to Dollar**

```javascript
let pesoPrices = [100, 250, 500, 1000];
let exchangeRate = 56.50;

let dollarPrices = pesoPrices.map(function(pesos) {
    return (pesos / exchangeRate).toFixed(2);
});

console.log("Peso: " + pesoPrices);
console.log("Dollar: $" + dollarPrices);

// Output:
// Peso: 100,250,500,1000
// Dollar: $1.77,$4.42,$8.85,$17.70
```

### **filter() - Keep Only Some Items**

`filter()` creates a **new array** with only items that pass a test:

```javascript
let scores = [85, 65, 90, 72, 78, 95];

// Keep only passing scores (≥75)
let passed = scores.filter(function(score) {
    return score >= 75;
});

console.log("All scores: " + scores);
console.log("Passed: " + passed);

// Output:
// All scores: 85,65,90,72,78,95
// Passed: 85,90,78,95
```

**How it works:** If the function returns `true`, keep the item. If `false`, skip it.

### **Real Example: Filter Available Products**

```javascript
let products = ["Coke", "Pepsi", "Sprite", "Water"];
let stock = [10, 0, 5, 0];  // 0 = out of stock

let available = products.filter(function(product, index) {
    return stock[index] > 0;
});

console.log("All products: " + products);
console.log("Available: " + available);

// Output:
// All products: Coke,Pepsi,Sprite,Water
// Available: Coke,Sprite
```

### **Real Example: Find Top Students**

```javascript
let students = ["Maria", "Jose", "Ana", "Pedro", "Rosa"];
let scores = [95, 72, 88, 91, 85];

// Find students with 85 or higher
let topStudents = students.filter(function(student, index) {
    return scores[index] >= 85;
});

console.log("Top students (85+): " + topStudents);

// Output:
// Top students (85+): Maria,Ana,Pedro,Rosa
```

### **Combining Methods**

You can **chain** methods together! 🔗

```javascript
let scores = [70, 85, 65, 90, 78, 92];

// Filter passing scores, then add 5 bonus points
let result = scores
    .filter(function(score) {
        return score >= 75;  // Keep passing scores
    })
    .map(function(score) {
        return score + 5;    // Add bonus
    });

console.log("Original: " + scores);
console.log("Passed with bonus: " + result);

// Output:
// Original: 70,85,65,90,78,92
// Passed with bonus: 90,95,83,97
```

![Linear pipeline diagram showing array transformation through filter, map, and reduce stages with intermediate values](diagrams/array-pipeline.png)

## Advanced Array Methods

These methods are **super useful** but a bit more complex. Learn them when you're ready!

> 🟡 **Advanced but Useful!** These are commonly used in real projects. Take your time learning them.

### **find() - Get First Match**

Find the **first item** that passes a test:

```javascript
let scores = [65, 75, 85, 90, 78];

// Find first score above 80
let highScore = scores.find(function(score) {
    return score > 80;
});

console.log(highScore);  // Output: 85 (first one > 80)
```

**Difference from filter():**
- `filter()` returns **all matches** (array)
- `find()` returns **first match** (single item)

```javascript
let students = ["Maria", "Jose", "Ana", "Jose"];

let found = students.find(function(student) {
    return student === "Jose";
});

console.log(found);  // Output: Jose (only the first one)
```

![Comparison diagram showing find, filter, and includes methods with their different return types and behaviors](diagrams/search-methods.png)

### **findIndex() - Get Position of First Match**

```javascript
let students = ["Maria", "Jose", "Ana", "Pedro"];

let index = students.findIndex(function(student) {
    return student === "Ana";
});

console.log("Ana is at index: " + index);  // Output: Ana is at index: 2
```

### **Real Example: Find Student by ID**

```javascript
let studentIDs = [101, 102, 103, 104];
let studentNames = ["Maria", "Jose", "Ana", "Pedro"];

function findStudentByID(id) {
    let index = studentIDs.findIndex(function(studentID) {
        return studentID === id;
    });
    
    if (index !== -1) {
        return studentNames[index];
    } else {
        return "Student not found";
    }
}

console.log(findStudentByID(103));  // Output: Ana
console.log(findStudentByID(999));  // Output: Student not found
```

### **reduce() - Combine All Items into One Value**

`reduce()` is **powerful** but takes practice to understand. It "reduces" an array to a single value.

**Common use: Calculate total**

```javascript
let prices = [50, 100, 75, 125];

let total = prices.reduce(function(sum, price) {
    return sum + price;
}, 0);  // Start with 0

console.log("Total: ₱" + total);  // Output: Total: ₱350
```

**How it works:**
```
Step 1: sum=0,   price=50  → return 0+50=50
Step 2: sum=50,  price=100 → return 50+100=150
Step 3: sum=150, price=75  → return 150+75=225
Step 4: sum=225, price=125 → return 225+125=350
Final: 350
```

![Step-by-step flowchart showing reduce accumulator evolution through each iteration with state values](diagrams/reduce-steps.png)

### **Real Example: Calculate Total Baon Spent**

```javascript
let dailyExpenses = [65, 80, 70, 55, 90];  // Mon-Fri

let totalSpent = dailyExpenses.reduce(function(sum, expense) {
    return sum + expense;
}, 0);

console.log("Weekly expenses:");
dailyExpenses.forEach(function(expense, index) {
    let days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    console.log(days[index] + ": ₱" + expense);
});
console.log("Total: ₱" + totalSpent);

// Output:
// Weekly expenses:
// Mon: ₱65
// Tue: ₱80
// Wed: ₱70
// Thu: ₱55
// Fri: ₱90
// Total: ₱360
```

### **includes() - Check if Item Exists**

Simple way to check if an array contains something:

```javascript
let fruits = ["apple", "banana", "orange"];

console.log(fruits.includes("banana"));  // true
console.log(fruits.includes("mango"));   // false
```

### **Real Example: Check Membership**

```javascript
let members = ["Maria", "Jose", "Ana"];

function checkMembership(name) {
    if (members.includes(name)) {
        console.log(name + " is a member! ✅");
    } else {
        console.log(name + " is not a member. ❌");
    }
}

checkMembership("Jose");   // Jose is a member! ✅
checkMembership("Pedro");  // Pedro is not a member. ❌
```

### **slice() - Copy Part of Array**

Get a portion of an array **without changing the original**:

```javascript
let students = ["Maria", "Jose", "Ana", "Pedro", "Rosa"];

let firstThree = students.slice(0, 3);  // Start at 0, stop before 3
console.log(firstThree);  // ["Maria", "Jose", "Ana"]

let lastTwo = students.slice(-2);  // Last 2 items
console.log(lastTwo);  // ["Pedro", "Rosa"]

console.log(students);  // Original unchanged!
```

### **sort() - Sort Array Items**

Sort items in alphabetical or numerical order:

```javascript
// Sort strings (alphabetical)
let names = ["Pedro", "Ana", "Maria", "Jose"];
names.sort();
console.log(names);  // ["Ana", "Jose", "Maria", "Pedro"]

// Sort numbers (needs special function!)
let scores = [85, 90, 78, 92, 88];

// ❌ Wrong way
scores.sort();
console.log(scores);  // [78, 85, 88, 90, 92] - works by luck!

// ✅ Right way for numbers
scores.sort(function(a, b) {
    return a - b;  // Ascending order
});
console.log(scores);  // [78, 85, 88, 90, 92]

// Descending order
scores.sort(function(a, b) {
    return b - a;  // Reverse
});
console.log(scores);  // [92, 90, 88, 85, 78]
```

![Decision flowchart showing how sort comparator function determines element ordering based on return value](diagrams/sort-comparator.png)

### **Real Example: Leaderboard**

```javascript
let players = ["Maria", "Jose", "Ana", "Pedro"];
let scores = [1500, 2000, 1800, 1200];

// Create leaderboard (sorted by score, highest first)
let leaderboard = [];

for (let i = 0; i < players.length; i++) {
    leaderboard.push({
        name: players[i],
        score: scores[i]
    });
}

// Sort by score (highest first)
leaderboard.sort(function(a, b) {
    return b.score - a.score;
});

console.log("🏆 LEADERBOARD 🏆");
leaderboard.forEach(function(player, index) {
    console.log((index + 1) + ". " + player.name + " - " + player.score + " pts");
});

// Output:
// 🏆 LEADERBOARD 🏆
// 1. Jose - 2000 pts
// 2. Ana - 1800 pts
// 3. Maria - 1500 pts
// 4. Pedro - 1200 pts
```

## Practice: Array Methods Challenge

**Challenge:** Given an array of quiz scores, find the average of all passing scores (≥75).

**Try it yourself! Solution:**

```javascript
let scores = [85, 65, 90, 72, 78, 95, 68, 88];

// Step 1: Filter passing scores
let passingScores = scores.filter(function(score) {
    return score >= 75;
});

// Step 2: Calculate sum using reduce
let sum = passingScores.reduce(function(total, score) {
    return total + score;
}, 0);

// Step 3: Calculate average
let average = sum / passingScores.length;

console.log("All scores: " + scores);
console.log("Passing scores: " + passingScores);
console.log("Average of passing: " + average.toFixed(1));

// Output:
// All scores: 85,65,90,72,78,95,68,88
// Passing scores: 85,90,78,95,88
// Average of passing: 87.2
```

## Objects - Organizing Related Data

**Arrays** store lists. **Objects** store related information together.

### **Creating Objects**

```javascript
// Empty object
let student = {};

// Object with properties
let student = {
    name: "Maria Santos",
    age: 15,
    grade: 9,
    isPassed: true
};
```

**Think of it like:** A real-world object with **labels** (properties) describing it.

```
Student Object:
{
    name: "Maria Santos"    ← property: value
    age: 15                 ← property: value
    grade: 9
    isPassed: true
}
```

![Class diagram showing object structure with properties and methods, demonstrating the 'this' keyword binding](diagrams/object-anatomy.png)

### **Accessing Object Properties**

Two ways: **dot notation** or **bracket notation**

```javascript
let student = {
    name: "Maria Santos",
    age: 15,
    grade: 9
};

// Dot notation (most common)
console.log(student.name);   // Maria Santos
console.log(student.age);    // 15

// Bracket notation (useful for variables)
console.log(student["name"]);  // Maria Santos
console.log(student["age"]);   // 15

let property = "grade";
console.log(student[property]);  // 9
```

### **Changing Properties**

```javascript
let student = {
    name: "Maria",
    grade: 8
};

// Change existing property
student.grade = 9;
console.log(student.grade);  // 9

// Add new property
student.age = 15;
console.log(student.age);  // 15
```

### **Real Example: Student Profile**

```javascript
let student = {
    firstName: "Maria",
    lastName: "Santos",
    age: 15,
    grade: 9,
    scores: [85, 90, 88],
    isEnrolled: true
};

console.log("Student Profile:");
console.log("Name: " + student.firstName + " " + student.lastName);
console.log("Age: " + student.age);
console.log("Grade: " + student.grade);
console.log("Scores: " + student.scores);
console.log("Enrolled: " + student.isEnrolled);

// Output:
// Student Profile:
// Name: Maria Santos
// Age: 15
// Grade: 9
// Scores: 85,90,88
// Enrolled: true
```

## Object Methods - Functions Inside Objects

Objects can have **functions** as properties! These are called **methods**.

```javascript
let student = {
    name: "Maria Santos",
    scores: [85, 90, 88],
    
    // Method: function inside object
    getAverage: function() {
        let sum = 0;
        for (let i = 0; i < this.scores.length; i++) {
            sum += this.scores[i];
        }
        return sum / this.scores.length;
    },
    
    greet: function() {
        return "Hello, I'm " + this.name;
    }
};

// Call the methods
console.log(student.greet());        // Hello, I'm Maria Santos
console.log(student.getAverage());   // 87.666...
```

**The `this` keyword** refers to the current object.

### **Real Example: Product with Tax Calculator**

```javascript
let product = {
    name: "Laptop",
    price: 25000,
    taxRate: 0.12,  // 12% VAT
    
    getPriceWithTax: function() {
        return this.price * (1 + this.taxRate);
    },
    
    getInfo: function() {
        return this.name + " - ₱" + this.price;
    }
};

console.log(product.getInfo());
console.log("With tax: ₱" + product.getPriceWithTax());

// Output:
// Laptop - ₱25000
// With tax: ₱28000
```

### **Real Example: Bank Account**

```javascript
let account = {
    owner: "Maria Santos",
    balance: 5000,
    
    deposit: function(amount) {
        this.balance += amount;
        console.log("Deposited ₱" + amount);
        console.log("New balance: ₱" + this.balance);
    },
    
    withdraw: function(amount) {
        if (amount > this.balance) {
            console.log("Insufficient funds! ❌");
        } else {
            this.balance -= amount;
            console.log("Withdrew ₱" + amount);
            console.log("New balance: ₱" + this.balance);
        }
    },
    
    getBalance: function() {
        return this.balance;
    }
};

account.deposit(1000);   // Deposited ₱1000, New balance: ₱6000
account.withdraw(2000);  // Withdrew ₱2000, New balance: ₱4000
account.withdraw(5000);  // Insufficient funds! ❌
```

## Practice: Create a Student Object

**Challenge:** Create a student object with properties and a method to check if they passed.

**Try it yourself! Solution:**

```javascript
let student = {
    name: "Jose Cruz",
    studentID: 12345,
    scores: [85, 78, 90],
    passingGrade: 75,
    
    getAverage: function() {
        let sum = this.scores.reduce(function(total, score) {
            return total + score;
        }, 0);
        return sum / this.scores.length;
    },
    
    hasPassed: function() {
        return this.getAverage() >= this.passingGrade;
    },
    
    getReport: function() {
        let avg = this.getAverage();
        let status = this.hasPassed() ? "PASSED ✅" : "NOT YET ❌";
        
        console.log("=================================");
        console.log("STUDENT REPORT");
        console.log("=================================");
        console.log("Name: " + this.name);
        console.log("ID: " + this.studentID);
        console.log("Scores: " + this.scores.join(", "));
        console.log("Average: " + avg.toFixed(1));
        console.log("Status: " + status);
        console.log("=================================");
    }
};

student.getReport();

// Output:
// =================================
// STUDENT REPORT
// =================================
// Name: Jose Cruz
// ID: 12345
// Scores: 85, 78, 90
// Average: 84.3
// Status: PASSED ✅
// =================================
```

## Advanced Objects

### **Object.keys() - Get All Property Names**

```javascript
let student = {
    name: "Maria",
    age: 15,
    grade: 9
};

let keys = Object.keys(student);
console.log(keys);  // ["name", "age", "grade"]

// Loop through properties
keys.forEach(function(key) {
    console.log(key + ": " + student[key]);
});

// Output:
// name: Maria
// age: 15
// grade: 9
```

### **Object.values() - Get All Values**

```javascript
let scores = {
    math: 85,
    english: 90,
    science: 88
};

let values = Object.values(scores);
console.log(values);  // [85, 90, 88]

// Calculate average
let sum = values.reduce(function(total, score) {
    return total + score;
}, 0);
let average = sum / values.length;

console.log("Average: " + average);  // Average: 87.666...
```

### **Object.entries() - Get Key-Value Pairs**

```javascript
let prices = {
    coke: 20,
    bread: 5,
    crackers: 15
};

let entries = Object.entries(prices);
console.log(entries);
// [["coke", 20], ["bread", 5], ["crackers", 15]]

// Display nicely
entries.forEach(function(entry) {
    let item = entry[0];
    let price = entry[1];
    console.log(item + ": ₱" + price);
});

// Output:
// coke: ₱20
// bread: ₱5
// crackers: ₱15
```

## Arrays of Objects - Powerful Combination!

The **most common** data structure in real applications!

```javascript
let students = [
    {
        name: "Maria Santos",
        age: 15,
        grade: 9,
        average: 87
    },
    {
        name: "Jose Cruz",
        age: 15,
        grade: 9,
        average: 84
    },
    {
        name: "Ana Reyes",
        age: 14,
        grade: 9,
        average: 91
    }
];

// Access individual students
console.log(students[0].name);  // Maria Santos
console.log(students[1].average);  // 84

// Loop through all students
students.forEach(function(student) {
    console.log(student.name + " - Average: " + student.average);
});

// Output:
// Maria Santos - Average: 87
// Jose Cruz - Average: 84
// Ana Reyes - Average: 91
```

### **Filter Students**

```javascript
let students = [
    { name: "Maria", average: 87 },
    { name: "Jose", average: 72 },
    { name: "Ana", average: 91 },
    { name: "Pedro", average: 68 }
];

// Find honor students (average ≥ 85)
let honorStudents = students.filter(function(student) {
    return student.average >= 85;
});

console.log("Honor Students:");
honorStudents.forEach(function(student) {
    console.log("- " + student.name + " (" + student.average + ")");
});

// Output:
// Honor Students:
// - Maria (87)
// - Ana (91)
```

### **Sort Students**

```javascript
let students = [
    { name: "Maria", average: 87 },
    { name: "Jose", average: 72 },
    { name: "Ana", average: 91 },
    { name: "Pedro", average: 68 }
];

// Sort by average (highest first)
students.sort(function(a, b) {
    return b.average - a.average;
});

console.log("Class Ranking:");
students.forEach(function(student, index) {
    console.log((index + 1) + ". " + student.name + " - " + student.average);
});

// Output:
// Class Ranking:
// 1. Ana - 91
// 2. Maria - 87
// 3. Jose - 72
// 4. Pedro - 68
```

### **Real Example: Product Inventory**

```javascript
let inventory = [
    { name: "Coke Sakto", price: 20, stock: 50 },
    { name: "Pan de sal", price: 5, stock: 100 },
    { name: "Skyflakes", price: 15, stock: 30 },
    { name: "Lucky Me", price: 15, stock: 0 }
];

// Show available products
console.log("AVAILABLE PRODUCTS:");
console.log("==================");

let available = inventory.filter(function(product) {
    return product.stock > 0;
});

available.forEach(function(product) {
    console.log(product.name + " - ₱" + product.price + " (" + product.stock + " in stock)");
});

// Calculate total inventory value
let totalValue = inventory.reduce(function(sum, product) {
    return sum + (product.price * product.stock);
}, 0);

console.log("==================");
console.log("Total inventory value: ₱" + totalValue);

// Output:
// AVAILABLE PRODUCTS:
// ==================
// Coke Sakto - ₱20 (50 in stock)
// Pan de sal - ₱5 (100 in stock)
// Skyflakes - ₱15 (30 in stock)
// ==================
// Total inventory value: ₱1950
```

## Real-World Project: Sari-Sari Store System

Let's build a complete inventory management system! 🏪

![Architecture diagram showing Store object containing inventory array of Product objects with key methods](diagrams/inventory-architecture.png)

```javascript
// Aling Maria's Sari-Sari Store Inventory System

let store = {
    name: "Aling Maria's Store",
    location: "Barangay Masaya",
    inventory: [
        { id: 1, name: "Coke Sakto", price: 20, stock: 50, category: "drinks" },
        { id: 2, name: "Pan de sal", price: 5, stock: 100, category: "food" },
        { id: 3, name: "Skyflakes", price: 15, stock: 30, category: "snacks" },
        { id: 4, name: "Lucky Me", price: 15, stock: 45, category: "food" },
        { id: 5, name: "Chippy", price: 10, stock: 0, category: "snacks" }
    ],
    
    // Show all products
    showInventory: function() {
        console.log("========================================");
        console.log(this.name.toUpperCase());
        console.log(this.location);
        console.log("========================================");
        console.log();
        
        this.inventory.forEach(function(product) {
            let status = product.stock > 0 ? "✅" : "❌ OUT OF STOCK";
            console.log(product.id + ". " + product.name);
            console.log("   ₱" + product.price + " | Stock: " + product.stock + " " + status);
        });
    },
    
    // Find product by ID
    findProduct: function(id) {
        return this.inventory.find(function(product) {
            return product.id === id;
        });
    },
    
    // Sell a product
    sellProduct: function(id, quantity) {
        let product = this.findProduct(id);
        
        if (!product) {
            console.log("❌ Product not found!");
            return;
        }
        
        if (product.stock < quantity) {
            console.log("❌ Not enough stock! Only " + product.stock + " available.");
            return;
        }
        
        product.stock -= quantity;
        let total = product.price * quantity;
        
        console.log("✅ SALE SUCCESSFUL");
        console.log("Product: " + product.name);
        console.log("Quantity: " + quantity);
        console.log("Total: ₱" + total);
        console.log("Remaining stock: " + product.stock);
    },
    
    // Restock a product
    restock: function(id, quantity) {
        let product = this.findProduct(id);
        
        if (!product) {
            console.log("❌ Product not found!");
            return;
        }
        
        product.stock += quantity;
        console.log("✅ RESTOCKED: " + product.name);
        console.log("New stock: " + product.stock);
    },
    
    // Get products by category
    getByCategory: function(category) {
        return this.inventory.filter(function(product) {
            return product.category === category && product.stock > 0;
        });
    },
    
    // Calculate total inventory value
    getTotalValue: function() {
        return this.inventory.reduce(function(sum, product) {
            return sum + (product.price * product.stock);
        }, 0);
    },
    
    // Get low stock alerts
    getLowStockAlerts: function(threshold) {
        if (threshold === undefined) {
            threshold = 20;  // Default threshold
        }
        
        return this.inventory.filter(function(product) {
            return product.stock > 0 && product.stock <= threshold;
        });
    },
    
    // Get bestsellers (by stock sold - you'd track this in real app)
    getMostExpensiveProducts: function(count) {
        let sorted = this.inventory.slice().sort(function(a, b) {
            return b.price - a.price;
        });
        return sorted.slice(0, count);
    }
};

// ========================================
// TESTING THE SYSTEM
// ========================================

console.log("\n📦 INVENTORY STATUS");
store.showInventory();

console.log("\n\n💰 TRANSACTIONS");
console.log("================");
store.sellProduct(1, 3);  // Sell 3 Coke Sakto

console.log("\n");
store.sellProduct(2, 5);  // Sell 5 Pan de sal

console.log("\n");
store.sellProduct(5, 1);  // Try to sell out-of-stock item

console.log("\n\n📦 RESTOCKING");
console.log("===============");
store.restock(5, 25);  // Restock Chippy

console.log("\n\n🔍 CATEGORY: SNACKS");
console.log("===================");
let snacks = store.getByCategory("snacks");
snacks.forEach(function(product) {
    console.log(product.name + " - ₱" + product.price);
});

![Funnel diagram showing filtering products by category and stock availability to get final available list](diagrams/category-filter.png)

console.log("\n\n⚠️ LOW STOCK ALERTS");
console.log("===================");
let lowStock = store.getLowStockAlerts(30);
lowStock.forEach(function(product) {
    console.log("⚠️ " + product.name + " - Only " + product.stock + " left!");
});

console.log("\n\n💎 MOST EXPENSIVE PRODUCTS");
console.log("==========================");
let expensive = store.getMostExpensiveProducts(3);
expensive.forEach(function(product) {
    console.log(product.name + " - ₱" + product.price);
});

console.log("\n\n💵 TOTAL INVENTORY VALUE");
console.log("========================");
console.log("₱" + store.getTotalValue());
```

**Output:**
```
📦 INVENTORY STATUS
========================================
ALING MARIA'S STORE
Barangay Masaya
========================================

1. Coke Sakto
   ₱20 | Stock: 50 ✅
2. Pan de sal
   ₱5 | Stock: 100 ✅
3. Skyflakes
   ₱15 | Stock: 30 ✅
4. Lucky Me
   ₱15 | Stock: 45 ✅
5. Chippy
   ₱10 | Stock: 0 ❌ OUT OF STOCK


💰 TRANSACTIONS
================
✅ SALE SUCCESSFUL
Product: Coke Sakto
Quantity: 3
Total: ₱60
Remaining stock: 47

✅ SALE SUCCESSFUL
Product: Pan de sal
Quantity: 5
Total: ₱25
Remaining stock: 95

❌ Not enough stock! Only 0 available.


📦 RESTOCKING
===============
✅ RESTOCKED: Chippy
New stock: 25


🔍 CATEGORY: SNACKS
===================
Skyflakes - ₱15
Chippy - ₱10


⚠️ LOW STOCK ALERTS
===================
⚠️ Chippy - Only 25 left!


💎 MOST EXPENSIVE PRODUCTS
==========================
Coke Sakto - ₱20
Skyflakes - ₱15
Lucky Me - ₱15


💵 TOTAL INVENTORY VALUE
========================
₱2165
```

**Congratulations!** You just built a complete business application! 🎉

## Arrow Functions (Modern JavaScript)

You've been writing functions like this:

```javascript
let numbers = [1, 2, 3, 4];

let doubled = numbers.map(function(num) {
    return num * 2;
});
```

**Modern JavaScript** has a shorter way called **arrow functions**:

```javascript
let numbers = [1, 2, 3, 4];

let doubled = numbers.map((num) => {
    return num * 2;
});

// Even shorter for one line:
let doubled = numbers.map(num => num * 2);
```

### **Comparison**

```javascript
// Traditional function
scores.forEach(function(score) {
    console.log(score);
});

// Arrow function (same thing!)
scores.forEach((score) => {
    console.log(score);
});

// Arrow function (single parameter, no parentheses)
scores.forEach(score => {
    console.log(score);
});
```

### **When to Use Each**

**Traditional functions:**
- ✅ When you need `this` to refer to the object
- ✅ When learning (easier to read)
- ✅ Object methods

**Arrow functions:**
- ✅ Array methods (map, filter, forEach, etc.)
- ✅ Shorter callbacks
- ✅ Modern code style

**Both are correct!** Use what you're comfortable with. 😊

## Summary - What You Learned Today

**You now know:**

### **Arrays** 📦
- ✅ Create and access arrays
- ✅ Add/remove items (push, pop, shift, unshift)
- ✅ Loop through arrays (forEach)
- ✅ Transform arrays (map)
- ✅ Filter arrays (filter)
- ✅ Find items (find, includes)
- ✅ Combine items (reduce)
- ✅ Sort arrays (sort)
- ✅ Copy arrays (slice)

### **Objects** 🗂️
- ✅ Create objects with properties
- ✅ Access properties (dot and bracket notation)
- ✅ Create methods (functions in objects)
- ✅ Use `this` keyword
- ✅ Get keys, values, entries
- ✅ Combine arrays and objects

**You can now:**
- 🚀 Build a complete inventory system
- 🚀 Manage lists of data efficiently
- 🚀 Process data with powerful methods
- 🚀 Create real-world applications

**This is huge!** You've learned the most important tools in JavaScript! 🎯

## Common Mistakes & Tips

### **Mistake 1: Modifying Arrays While Looping**

```javascript
// ❌ Don't do this
let numbers = [1, 2, 3, 4];
for (let i = 0; i < numbers.length; i++) {
    numbers.pop();  // Changes the array during loop!
}

// ✅ Use filter instead
let numbers = [1, 2, 3, 4];
numbers = numbers.filter(num => num > 2);
```

### **Mistake 2: Forgetting Return in map()**

```javascript
// ❌ Returns undefined
let doubled = numbers.map(num => {
    num * 2;  // Forgot return!
});

// ✅ Return the value
let doubled = numbers.map(num => {
    return num * 2;
});

// ✅ Or use short syntax
let doubled = numbers.map(num => num * 2);
```

### **Mistake 3: Mutating Original Array**

```javascript
// ❌ Changes original
let scores = [85, 90, 78];
scores.sort();
console.log(scores);  // Original is changed!

// ✅ Make a copy first
let scores = [85, 90, 78];
let sorted = scores.slice().sort();
console.log(scores);  // Original unchanged
console.log(sorted);  // Sorted copy
```

### **Mistake 4: Confusing Array and Object Syntax**

```javascript
// Array uses [ ]
let students = ["Maria", "Jose"];
console.log(students[0]);

// Object uses { }
let student = { name: "Maria", age: 15 };
console.log(student.name);
```

### **Pro Tips** 💡

1. **Use const for arrays/objects that won't be reassigned**
   ```javascript
   const students = [];  // Can still push/pop
   students.push("Maria");  // ✅ OK
   students = ["Ana"];  // ❌ Error
   ```

2. **Chain array methods for powerful operations**
   ```javascript
   let result = scores
       .filter(score => score >= 75)
       .map(score => score + 5)
       .sort((a, b) => b - a);
   ```

3. **Use meaningful names**
   ```javascript
   // ❌ Unclear
   arr.forEach(x => console.log(x));
   
   // ✅ Clear
   students.forEach(student => console.log(student.name));
   ```

4. **Console.log() is your friend!**
   ```javascript
   let result = scores
       .filter(score => {
           console.log("Checking:", score);  // Debug!
           return score >= 75;
       });
   ```

## Final Challenge: Complete System

Build a **Student Management System** with everything you learned!

**Requirements:**
1. Array of student objects (name, scores, attendance)
2. Calculate averages
3. Find honor students (average ≥ 90)
4. Sort by average
5. Check attendance status
6. Generate reports

**Try it yourself! Solution:**

![Data pipeline diagram showing student objects being mapped to add averages, sorted by score, and displayed with rankings](diagrams/ranking-pipeline.png)

```javascript
let classroom = {
    section: "Grade 9 - Einstein",
    students: [
        { name: "Maria Santos", scores: [95, 92, 94], attendance: 98 },
        { name: "Jose Cruz", scores: [88, 85, 90], attendance: 95 },
        { name: "Ana Reyes", scores: [78, 80, 75], attendance: 88 },
        { name: "Pedro Garcia", scores: [92, 95, 93], attendance: 100 },
        { name: "Rosa Lopez", scores: [85, 88, 86], attendance: 92 }
    ],
    
    calculateAverage: function(scores) {
        let sum = scores.reduce((total, score) => total + score, 0);
        return sum / scores.length;
    },
    
    generateReport: function() {
        console.log("========================================");
        console.log(this.section.toUpperCase());
        console.log("CLASS PERFORMANCE REPORT");
        console.log("========================================\n");
        
        // Add average to each student
        let studentsWithAvg = this.students.map(student => {
            return {
                name: student.name,
                average: this.calculateAverage(student.scores),
                attendance: student.attendance,
                scores: student.scores
            };
        });
        
        // Sort by average (highest first)
        studentsWithAvg.sort((a, b) => b.average - a.average);
        
        // Display rankings
        console.log("📊 CLASS RANKINGS:");
        console.log("------------------");
        studentsWithAvg.forEach((student, index) => {
            let medal = "";
            if (index === 0) medal = "🥇";
            else if (index === 1) medal = "🥈";
            else if (index === 2) medal = "🥉";
            
            console.log(medal + " " + (index + 1) + ". " + student.name);
            console.log("   Average: " + student.average.toFixed(1));
            console.log("   Attendance: " + student.attendance + "%");
            console.log();
        });
        
        // Honor students (average >= 90)
        console.log("🌟 HONOR STUDENTS (90+):");
        console.log("------------------------");
        let honorStudents = studentsWithAvg.filter(s => s.average >= 90);
        if (honorStudents.length > 0) {
            honorStudents.forEach(student => {
                console.log("⭐ " + student.name + " - " + student.average.toFixed(1));
            });
        } else {
            console.log("No honor students this period.");
        }
        console.log();
        
        // Attendance warnings (< 90%)
        console.log("⚠️ ATTENDANCE ALERTS (< 90%):");
        console.log("-----------------------------");
        let lowAttendance = studentsWithAvg.filter(s => s.attendance < 90);
        if (lowAttendance.length > 0) {
            lowAttendance.forEach(student => {
                console.log("⚠️ " + student.name + " - " + student.attendance + "%");
            });
        } else {
            console.log("All students have good attendance! ✅");
        }
        console.log();
        
            ![Matrix diagram showing student classification by performance and attendance status](diagrams/attendance-matrix.png)
        
        // Class statistics
        console.log("📈 CLASS STATISTICS:");
        console.log("--------------------");
        let classAvg = studentsWithAvg.reduce((sum, s) => sum + s.average, 0) / studentsWithAvg.length;
        let avgAttendance = this.students.reduce((sum, s) => sum + s.attendance, 0) / this.students.length;
        
        console.log("Class Average: " + classAvg.toFixed(1));
        console.log("Average Attendance: " + avgAttendance.toFixed(1) + "%");
        console.log("Total Students: " + this.students.length);
        console.log("========================================");
    }
};

// Generate the report
classroom.generateReport();
```

**Output:**
```
========================================
GRADE 9 - EINSTEIN
CLASS PERFORMANCE REPORT
========================================

📊 CLASS RANKINGS:
------------------
🥇 1. Maria Santos
   Average: 93.7
   Attendance: 98%

🥈 2. Pedro Garcia
   Average: 93.3
   Attendance: 100%

🥉 3. Jose Cruz
   Average: 87.7
   Attendance: 95%

4. Rosa Lopez
   Average: 86.3
   Attendance: 92%

5. Ana Reyes
   Average: 77.7
   Attendance: 88%

🌟 HONOR STUDENTS (90+):
------------------------
⭐ Maria Santos - 93.7
⭐ Pedro Garcia - 93.3

⚠️ ATTENDANCE ALERTS (< 90%):
-----------------------------
⚠️ Ana Reyes - 88%

📈 CLASS STATISTICS:
--------------------
Class Average: 87.7
Average Attendance: 94.6%
Total Students: 5
========================================
```

**AMAZING!** You built a complete student management system! 🎓

## Homework Assignment 📝

### **Easy Level:**

1. **Shopping List**
   - Create array of items
   - Add/remove items
   - Display the list
   - Count total items

2. **Student Object**
   - Create object with name, age, grade, scores
   - Add method to calculate average
   - Add method to check if passed

### **Medium Level:**

3. **Product Catalog**
   - Array of 5 product objects (name, price, stock)
   - Filter available products (stock > 0)
   - Sort by price (low to high)
   - Calculate total inventory value

4. **Grade Book**
   - Array of student objects
   - Find students with average >= 85
   - Calculate class average
   - Identify highest scorer

### **Challenge Level:**

5. **Baon Budget Tracker**
   - Track daily expenses for a week
   - Calculate total spent
   - Find highest expense day
   - Check if within ₱500 weekly budget
   - Show remaining budget

6. **Game Leaderboard**
   - Array of player objects (name, score, level)
   - Sort by score (highest first)
   - Show top 3 players
   - Calculate average score
   - Filter players above level 5

**Bonus Challenge:** Expand the Sari-Sari Store system with new features:
- Search products by name
- Apply discounts to categories
- Track sales history
- Generate daily sales report

## Resources for Practice

### **Interactive Coding:**
- 🌐 **JavaScript.info** - Array and Object chapters
- 🌐 **freeCodeCamp** - ES6 section
- 🌐 **Codecademy** - JavaScript arrays and objects
- 🌐 **Exercism.io** - JavaScript track with mentors

### **Practice Challenges:**
- 🎮 **LeetCode** - Easy array problems
- 🎮 **HackerRank** - JavaScript basics
- 🎮 **Codewars** - 8kyu and 7kyu problems

### **What to Learn Next:**
1. ✅ Master these array/object skills with practice
2. Learn about the **DOM** (manipulating web pages)
3. Learn **async JavaScript** (APIs, fetching data)
4. Build projects: Todo list, Quiz app, Expense tracker
5. Learn a framework: React, Vue, or Node.js

## Questions to Think About 🤔

1. When would you use an **array** vs an **object**?
2. What's the difference between `map()` and `forEach()`?
3. How would you combine multiple array methods?
4. Why is `this` useful in object methods?
5. How would you search for a student by name in an array of objects?

**Discuss with your classmates!**

## Congratulations! 🎉🎓

You've completed **JavaScript Fundamentals!**

**You now have the skills to:**
- ✅ Store and organize data efficiently
- ✅ Process lists with powerful methods
- ✅ Build real-world applications
- ✅ Create interactive systems
- ✅ Write professional JavaScript code

**From Part 1 + Part 2, you know:**
1. Variables & Data Types
2. Conditionals (if-else)
3. Loops (for, while)
4. Functions
5. Arrays & Methods
6. Objects & Methods
7. Combining Everything!

**You're ready to build real projects!** 🚀

### **Next Steps:**

1. **Practice, practice, practice!** Build small projects every day.
2. **Learn the DOM** to make websites interactive.
3. **Build a portfolio** of projects to showcase your skills.
4. **Join coding communities** to learn from others.
5. **Keep coding!** The more you code, the better you get.

**Remember:**
- 💪 Every expert was once a beginner
- 🐛 Bugs are learning opportunities
- 📚 Google is your friend (everyone uses it!)
- 🤝 Ask for help when stuck
- 🎯 Focus on understanding, not memorizing

## Thank You! 🎊

You did an **amazing job** completing this course! JavaScript is a powerful language, and you now have a solid foundation.

**Keep building, keep learning, keep coding!** 💻✨

**The journey has just begun!** 🌟

---

*"The only way to learn a new programming language is by writing programs in it."* - Dennis Ritchie

**Now go build something awesome!** 🚀
