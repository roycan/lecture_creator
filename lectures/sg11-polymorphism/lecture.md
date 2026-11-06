# Polymorphism

> Roy Canseco

## About this deck

**RogueEdu Grade 9 Computer Science** · **Study Guide 11: Polymorphism** · many forms, one interface — one call, many answers.

## Many forms, one interface

Poly means many; morph means form. The core sentence of this study guide: polymorphism allows the same name to do different things depending on what you give it. The everyday analogy is play — a song, a movie, a game: one word, three behaviors. In Python, different objects answering the same method call, each in their own way, is the whole idea.

## The zoo: one loop, three answers

```python
class Dog(Animal):
    def make_sound(self):
        print(self.name, "says Woof!")

class Cat(Animal):
    def make_sound(self):
        print(self.name, "says Meow!")

class Lion(Animal):
    def make_sound(self):
        print(self.name, "roars loudly.")

zoo = [Dog("Bruno"), Cat("Kitty"), Lion("Simba")]
for animal in zoo:
    animal.make_sound()
```

One list, one loop, one method name — three different bodies answering. Nothing in the loop cares what each animal is; the objects carry their own behavior with them. This is the same pattern you used in the billing lesson, now stated as a general principle.

## Billing, revisited

Three patient types — regular, senior, and PhilHealth — sat together in one list while a single loop called get_name() and calculate_bill() on each. The answers were PHP 15,000.00, PHP 12,000.00, and PHP 12,750.00, from one starting bill of fifteen thousand. You wrote those overrides yourself in the previous lesson. Today we name that machinery and watch it drive the game engine.

## Python trusts the duck

A Java or C# list would demand a declared type — every element must be an Animal before the loop may run. Python never asks for your family tree. The loop simply calls make_sound(); the only question is whether this object has it — if it does, the call runs. If it walks like a duck and quacks like a duck, it is a duck: behavior matters, ancestry does not. That is duck typing.

## The anti-pattern: one branch per breed

```python
for enemy in enemies:
    if type(enemy) == Slime:
        enemy.chase_and_bite()
    elif type(enemy) == Shadow:
        enemy.strike_from_the_dark()
    elif type(enemy) == CowardGoblin:
        enemy.run_away_if_wounded()
```

Here is the nightmare version — and it works, which is what makes it dangerous. Every new breed adds another branch to a loop that already worked, and the day you forget one, that breed silently does nothing. Working code grows a type-check chain around every addition — polymorphism exists so new kinds of objects arrive as new classes, never as new branches in code that already runs.

## One call site, every monster

```python
# engine/core.py — the villain phase, condensed
for villain in self.villains:
    action = self._validated_action(villain, villain.act(view))
```

The real engine does the opposite of that branch chain. self.villains is a mixed list — Slime, Shadow, CowardGoblin, and whatever you add next — and one line calls act(view) on each. The method the engine asks for never changes; each object's own class decides what runs. The engine validates the returned intent — move, attack, or wait. You decide; the engine acts. That single line is polymorphism doing its job.

## PREDICT: same view, two rounds

```python
party = [Slime(5, 5), Shadow(5, 5), CowardGoblin(5, 5)]
# the hero stands one step east of everyone

for villain in party:
    print(villain.act(view))
```

Round one: all three monsters are healthy. Round two: the same three, each wounded down to four hit points. Six intents will print — commit to all six before I reveal the trace. One hint to sharpen your thinking: what does CowardGoblin's own code do when its health is low? Thinking time: five, four, three, two, one. Advance with your six answers.

## The answer: healthy alike, wounded apart

Round one, everyone healthy: Slime, Shadow, and CowardGoblin each return AttackAction(dx=1, dy=0) — three classes, one answer, because at full health all three attack. Round two, wounded to four hit points: Slime still returns AttackAction, Shadow still returns AttackAction, and CowardGoblin alone returns MoveAction(dx=-1, dy=0), the only one that flees west. There is no ambush behavior in this engine. The loop did nothing differently — the object did. Many answers to one call: that is polymorphism.

## New monsters, zero engine edits

The evidence comes from your own missions. In Mission C-3 you added Shadow, and in Mission C-4 you added CowardGoblin — each a student-written villain class pasted into your classes file and registered with one line, not a stock engine creature. Meanwhile the turn loop, the collision math, and the combat rules stayed untouched, unchanged since before either mission. Add a hundred monsters and touch zero engine lines — that is polymorphism, how big systems scale.

## Duck typing fails loudly

```python
from engine.base_classes import Wall
w = Wall("Rock", 0, 0)
w.act(view)
```

Ask a wall to act, and Python raises AttributeError: 'Wall' object has no attribute 'act' — the call was trusted, and the quack was not there. No inheritance, no override, no fallback. The engine guards its own door too: hand add_villain a wall and it refuses with a TypeError — only a Villain subclass may enter the roster. Polymorphism is not no rules: duck typing moves the type check to the moment of the call, and the referee still checks the roster at the door.

## Takeaways

Polymorphism treats different objects uniformly through one shared method name. It stands on inheritance and overriding — the differences were built in the last two units. Python uses duck typing: the method is assumed to exist, checked only at the moment of the call. That is how engines and big systems scale — new kinds of objects arrive as new classes, never as new if-else chains in working code. In the village, the loop says act(view): the slime bites, the shadow strikes, the goblin runs. You decide; the engine acts.