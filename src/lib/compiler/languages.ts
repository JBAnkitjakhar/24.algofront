// src/lib/compiler/languages.ts

export interface Language {
  name: string;
  pistonName: string;
  version: string;
  monacoLanguage: string;
  extension: string;
  defaultCode: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    name: "Python",
    pistonName: "python",
    version: "3.10.0",
    monacoLanguage: "python",
    extension: "py",
    defaultCode: `# Python Code Example
def main():
    # Example: Add two numbers
    print("Welcome to Python!")
    
    # Uncomment below lines if you need input
    # name = input("Enter your name: ")
    # age = int(input("Enter your age: "))
    # print(f"Hello {name}, you are {age} years old!")
    
    # Simple calculation
    result = 5 + 3
    print(f"5 + 3 = {result}")

if __name__ == "__main__":
    main()`,
  },
  {
    name: "Java",
    pistonName: "java",
    version: "15.0.2",
    monacoLanguage: "java",
    extension: "java",
    defaultCode: `// Java Code Example
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to Java!");
        
        // Example: Simple calculation
        int result = 5 + 3;
        System.out.println("5 + 3 = " + result);
        
        // Uncomment below lines if you need input
        /*
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.print("Enter your age: ");
        int age = scanner.nextInt();
        System.out.println("Hello " + name + ", you are " + age + " years old!");
        scanner.close();
        */
    }
}`,
  },
  {
    name: "C++",
    pistonName: "cpp",
    version: "10.2.0",
    monacoLanguage: "cpp",
    extension: "cpp",
    defaultCode: `// C++ Code Example
#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Welcome to C++!" << endl;
    
    // Example: Simple calculation
    int result = 5 + 3;
    cout << "5 + 3 = " << result << endl;
    
    // Uncomment below lines if you need input
    /*
    string name;
    int age;
    cout << "Enter your name: ";
    getline(cin, name);
    cout << "Enter your age: ";
    cin >> age;
    cout << "Hello " << name << ", you are " << age << " years old!" << endl;
    */
    
    return 0;
}`,
  },
  {
    name: "JavaScript",
    pistonName: "javascript",
    version: "18.15.0",
    monacoLanguage: "javascript",
    extension: "js",
    defaultCode: `// JavaScript Code Example (Node.js)
console.log("Welcome to JavaScript!");

// Example: Simple calculation
const result = 5 + 3;
console.log(\`5 + 3 = \${result}\`);

// Uncomment below lines if you need input
/*
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your name: ', (name) => {
    rl.question('Enter your age: ', (age) => {
        console.log(\`Hello \${name}, you are \${age} years old!\`);
        rl.close();
    });
});
*/`,
  },
  {
    name: "C",
    pistonName: "c",
    version: "10.2.0",
    monacoLanguage: "c",
    extension: "c",
    defaultCode: `// C Code Example
#include <stdio.h>
#include <string.h>

int main() {
    printf("Welcome to C!\\n");
    
    // Example: Simple calculation
    int result = 5 + 3;
    printf("5 + 3 = %d\\n", result);
    
    // Uncomment below lines if you need input
    /*
    char name[100];
    int age;
    printf("Enter your name: ");
    fgets(name, sizeof(name), stdin);
    name[strcspn(name, "\\n")] = 0; // Remove newline
    printf("Enter your age: ");
    scanf("%d", &age);
    printf("Hello %s, you are %d years old!\\n", name, age);
    */
    
    return 0;
}`,
  },
  {
    name: "Go",
    pistonName: "go",
    version: "1.16.2",
    monacoLanguage: "go",
    extension: "go",
    defaultCode: `// Go Code Example
package main

import (
    "fmt"
    // "bufio"
    // "os"
    // "strconv"
    // "strings"
)

func main() {
    fmt.Println("Welcome to Go!")
    
    // Example: Simple calculation
    result := 5 + 3
    fmt.Printf("5 + 3 = %d\\n", result)
    
    // Uncomment below lines if you need input
    /*
    reader := bufio.NewReader(os.Stdin)
    fmt.Print("Enter your name: ")
    name, _ := reader.ReadString('\\n')
    name = strings.TrimSpace(name)
    
    fmt.Print("Enter your age: ")
    ageStr, _ := reader.ReadString('\\n')
    age, _ := strconv.Atoi(strings.TrimSpace(ageStr))
    
    fmt.Printf("Hello %s, you are %d years old!\\n", name, age)
    */
}`,
  },
  {
    name: "Rust",
    pistonName: "rust",
    version: "1.68.2",
    monacoLanguage: "rust",
    extension: "rs",
    defaultCode: `// Rust Code Example
// use std::io;

fn main() {
    println!("Welcome to Rust!");
    
    // Example: Simple calculation
    let result = 5 + 3;
    println!("5 + 3 = {}", result);
    
    // Uncomment below lines if you need input
    /*
    println!("Enter your name: ");
    let mut name = String::new();
    io::stdin().read_line(&mut name).expect("Failed to read line");
    let name = name.trim();
    
    println!("Enter your age: ");
    let mut age = String::new();
    io::stdin().read_line(&mut age).expect("Failed to read line");
    let age: u32 = age.trim().parse().expect("Please enter a number");
    
    println!("Hello {}, you are {} years old!", name, age);
    */
}`,
  },
  {
    name: "TypeScript",
    pistonName: "typescript",
    version: "5.0.3",
    monacoLanguage: "typescript",
    extension: "ts",
    defaultCode: `// TypeScript Code Example
console.log("Welcome to TypeScript!");

// Example: Simple calculation with types
const num1: number = 5;
const num2: number = 3;
const result: number = num1 + num2;
console.log(\`\${num1} + \${num2} = \${result}\`);

// Uncomment below lines if you need input
/*
import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter your name: ', (name: string) => {
    rl.question('Enter your age: ', (ageStr: string) => {
        const age: number = parseInt(ageStr);
        console.log(\`Hello \${name}, you are \${age} years old!\`);
        rl.close();
    });
});
*/`,
  }
];

export const getLanguageByName = (name: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.name === name);
};

export const getDefaultLanguage = (): Language => {
  return SUPPORTED_LANGUAGES[0]; // Python as default
};