# Method Overriding

> Roy Canseco

## About this deck

**RogueEdu Grade 9 Computer Science** · **Study Guide 10: Method Overriding** · same door, new room — making an inherited method your own.

## Inheritance hands you a method that may not fit

```python
class Animal:
    def make_sound(self):
        print(self.name, "makes a sound")

dog = Dog("Bruno")
dog.make_sound()   # "Bruno makes a sound"
```

Inheritance gives every child the parent's methods for free, and sometimes that is exactly the problem. A dog that merely makes a sound is not wrong — it is bland: the inherited method is sometimes too general and does not fully match the child's needs. The child needs its own version.

## Same name, same parameters, new body

```python
class Animal:
    def make_sound(self):
        print(self.name, "makes a sound")

class Dog(Animal):
    def make_sound(self):        # override
        print(self.name, "says Woof!")

class Cat(Animal):
    def make_sound(self):        # override
        print(self.name, "says Meow!")
```

Overriding means the child defines a method with the exact same name and parameters as the parent, but a different body. When that method is called, Python runs the child's version — dispatching on what the object actually is, never on where you found the variable.

## PREDICT: six lines of output

```python
animals = [animal1, dog1, cat1]

animal1.make_sound()
dog1.make_sound()
cat1.make_sound()

for animal in animals:
    animal.make_sound()
```

Six lines will print — three direct calls, then the loop repeating all three. Commit to all six, in order, before I reveal them. Warning: the loop variable is called animal — does that name change anything? Thinking time: five, four, three, two, one. Advance with your six lines locked in.

## The answer: dispatch on the object

Generic Animal makes a sound. Bruno says Woof. Kitty says Meow — then the loop prints those same three lines again. The loop changed nothing. Each pass, Python looks at the actual object's type and runs that class's version: list position and variable names carry no type power in Python — objects do. That automatic choice is dynamic dispatch — the door to next unit's polymorphism.

## Replace, or extend?

```python
class Book(Publication):
    def display_info(self):
        super().display_info()    # the parent's work first
        print("Number of Pages:", self.__number_of_pages)
```

Two honest choices. Replace: the child's body is the whole truth — Dog's "Woof!" needs nothing of the parent's generic line, so total replacement is correct there. Extend: when the parent still has work worth doing, like printing the title and author, call super().display_info() first and add your own lines. Build on the parent; never copy its code.

## Forgetting super() fails silently

If an extending override skips the super() call, nothing crashes. The program prints only the child's line and drops the parent's output on the floor — no error, no warning, missing data. This is the quietest bug in the unit: the parent's behavior vanishes while everything looks like it worked. Whenever an override extends, make super() the first line and watch the parent's output appear exactly where the call sits.

## A worked example: hospital billing

```python
class Patient:
    def set_bill_amount(self, amount):
        if amount > 0:
            self.__bill_amount = amount

    def calculate_bill(self):
        return self.__bill_amount

class SeniorPatient(Patient):
    def calculate_bill(self):
        return self.__bill_amount * 0.80

class PhilHealthPatient(Patient):
    def calculate_bill(self):
        return self.__bill_amount * 0.85
```

Patient stores a validated amount — its setter refuses zero and negative numbers — and charges the full price. Its children override calculate_bill with the same parameters but their own bodies: twenty percent off for senior citizens, fifteen percent off for PhilHealth members. One interface, three pricing policies, all enforced through overriding.

## PREDICT: one loop, three bills

```python
patients = [Patient("Juan Dela Cruz", 15000),
            SeniorPatient("Lola M. Santos", 15000),
            PhilHealthPatient("Juanita Reyes", 15000)]

for p in patients:
    print(f"{p.get_name()}: PHP {p.calculate_bill():,.2f}")
```

All three patients start with a bill of fifteen thousand pesos, and the loop has no type checks — just two method calls per object. What exactly will print? Commit to all three lines, centavos included. Thinking time: five, four, three, two, one. Advance when your three lines are written.

## The answer: three exact lines

Juan Dela Cruz: PHP 15,000.00 — full bill. Lola Maria Santos: PHP 12,000.00 — twenty percent senior discount. Juanita Reyes: PHP 12,750.00 — fifteen percent PhilHealth discount. Same call, three different bodies, zero type checks: the loop never asked who anyone was. A list of parent-typed objects, one method call, each object's class replying — name that behavior now, because it is the next unit: polymorphism.

## One call site, every villain

```python
# engine/core.py — the villain phase, condensed
for villain in self.villains:
    if not villain.is_alive():
        continue
    action = self._validated_action(villain, villain.act(view))
```

Now the same idea inside RogueEdu. The engine's turn loop calls villain.act(view) — one line, one method name, for every villain on the board. The base Villain class declares act as an abstract method, so overriding it is not optional: Python refuses to even build a subclass that skipped it. Slime's act decides chase or bite, and the engine validates whatever intent comes back — move, attack, or wait. You decide; the engine acts.

## Three ways an override silently is not one

First, the typo: define make_sand instead of make_sound, and Python sees a brand-new method — the parent's version keeps answering with zero crash. Second, the signature mismatch: add a times parameter and the contract changes, so the loop's zero-argument call breaks with a TypeError about a missing argument. Third, the self-recursion: write self.make_sound() where you meant super().make_sound(), and the child calls itself forever until Python raises RecursionError. An override is a promise about a name — spell it the same, keep the parameters the same, and reach the parent only through super().

## Takeaways and what comes next

Overriding specializes behavior while keeping the interface constant — same door, new room. The name and the parameters must match the parent, or Python quietly treats your method as a different one. Total replacement overwrites the parent's logic; super().method() extends it — the parent's work first, your addition after. Overriding lets an engine treat every entity uniformly while each acts distinctively: you decide, the engine acts. Next: many different objects answering one single call — polymorphism.