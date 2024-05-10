---
author: Zicklag
title: "HVM / What is Functional Programming?"
postSlug: hvm-what-is-functional-programming
pubDatetime: 2023-03-15 14:18:00
description: |
  HVM, the High Order Virtual Machine, is a new, blazing fast runtime for functional programming languages that seems to have some pretty incredible potential for the future.
featured: false
tags:
  - hvm
  - functional-programming
---

[HVM], the High Order Virtual Machine, is a new, blazing fast runtime for functional programming languages that seems to have some pretty incredible potential for the future.

Their [homepage][HVM] sums it up pretty well, but I'll go over some major points here:

- **No garbage collector:** Similar to Rust, HVM doesn't have a garbage collector. But it is able to accomplish this _without_ requiring lifetime annotations.

- **Automatically parallel:** Programs are automatically run across multiple threads as much as possible, _without_ mutexes, RW locks, or atomic ref counts!

- **Insanely fast:** Despite being extremely new, the radically new architecture for computation makes it faster than even mature compilers in some cases. With proper time and investment, its performance potential could be enormous, and _might_ ( big might ) compare with Rust eventually.

- **Written in [Rust] 🦀**: Always a great bonus for me, as it means I can contribute!

<!-- more -->

If you want more details on how it works and where it's at, check out the [FAQ] on the HVM homepage, it gives a great overview.

[Rust]: https://rust-lang.org
[HVM]: https://github.com/HigherOrderCO/HVM
[FAQ]: https://github.com/HigherOrderCO/HVM#faq

## What is Functional Programming?

OK, so we have an incredibly fast functional runtime, but what does that mean exactly? What is functional Programming?

**Functional** programming languages are one of two major groups of programming languages, with **Imperative** programming languages being the other group. Most people write imperative languages such as C, C++, Rust, JavaScript, Python, etc. Some functional programming languages include Haskell and OCaml, and a slew of others I'm not familiar with.

I'm going to make an attempt to explain this a little, but I'm very new to functional programming, so I may or may not do the best job. A cool perspective on the history of these two models and how they relate to each-other can also be found in the [HighOrderCo Manifesto][manifesto], which I also recommend reading.

[manifesto]: https://github.com/HigherOrderCO/manifesto

### Example of Imperative Logic

Imperative languages work by telling the computer what to do:

> "Hey computer, get me a byte of memory at offset `0x1003`."
>
> "Now go set that byte in memory at `0x2030` to `0x30`."

Note that one distinguishing feature of imperative languages is that they work by giving commands to mutate some sort of global state. The machine is in a certain state all the time, and you give instructions on how to change that state.

A major cause of bugs in any software is the fact that it's easy to end up in some state that you hadn't thought of before. Correct behavior depends on handling all the states you might end up in, but it's hard to figure out what might happen when any command might modify the state at any time, and things like ordering might cause totally different results.

Add multi-threading to the mix and things get **way** more complicated and require techniques to keep the program devolving into chaos.

### Example of Functional Logic

Functional languages on the other hand, are more declarative. They tell the computer program what to _be_.

That's pretty vague, so maybe a better analogy is a math problem. In a functional language you use statements that say things like:

> "The `Head` of a `List` is what you get if you take the first item off the top of the list."
>
> "The concatenation of two strings is what you get when you take all the letters of the first string, followed by all the letters of the second string."

You take these kinds of _equations_, saying one thing is equal to another thing, to build up a gradually more complicated program. Functional programming is like _programming by substitution_.

There are some other important properties of most functional programming languages, though sometimes there are deviations from these rules:

- Each function must be **pure**: if you call the function with the same arguments, it will always have the same result.
- Variables can't be mutated. They can be created, moved, or copied, but they can't be mutated.

One cool part about the functional paradigm is that, when combined with the HVM execution model, different parts of your equation can be evaluated in parallel, because it knows when the variables from one part of the program are independent from another part and can be evaluated at the same time without effecting the result.

Because each function is dependent only on its inputs, there's not a big, mutable state, which can really help cut down on bugs and unpredictability. And there's no need for mutexes or ref counting or, in the case of HVM, garbage collection.

## Is Functional Programming Better?

First off, a disclaimer, **I'm not really trying to find out which one is better!** Everybody has their own preferences, and everything has its pros and cons. What I really want to know is: "Are there compelling reasons to use a functional programming language for writing some of _my_ software?"

The thing about functional programming languages is that they don't natively map well do our processors and memory, which inherently are like big state machines. So part of the reason they haven't caught on is because they aren't always as efficient to run. Substitutions don't map to clearly determined, time bounded instructions.

That's what HVM's major innovation was: it implemented a way to efficiently execute functional languages. So if we say, for the sake of argument, that performance _isn't_ a problem, is functional programming "better"?

While I'm still getting into it, it almost seems that functional programming is more like the way programming was _meant_ to be. Again, that's being kind of overly philosophical and I don't 100% mean it, but maybe I 80% mean it.

It seems like a way to break your program down more into the simple pieces that I want to think about when writing code. Instead of telling it what to do directly, I'm telling the way I want the program to convert things into other things, piece by piece.

Maybe I'm over glorifying it in my head because I haven't barely used it yet, and I'm heavily aware that the shine that I see in it now may well evaporate once I get into the weeds, but I fully intend to get into the weeds so that I can find out.

## What's a Functional Program Look Like?

It can be hard to imagine how you might use equations to actually _write_ a program, if you are only used to imperative programming. How do you write a program with equations?

Well, you can write an if statement with a couple substitutions rules.

```dart
(If True a b) = a
(If False a b) = b
```

This says, “If you find an `If` function call on a `True` value and two arguments, return the first argument, but if you call it on a `False` value, return the second argument”. This gives us the functionality of an if-else statement.

Notice that we can do this with substitutions alone, no new language features necessary!

We can do boolean operations easily, too:

```dart
(Not True) = False
(Not False) = True
(And True True) = True
(And a b) = False
// And so on.
```

Combining this, we might do things like this:

```dart
(Greet name likes_chocolate likes_brownies) =
    let name_greeting = (String.concat "Hello, " name)
    let likes_greeting = (If
      (And likes_chocolate (Not likes_brownies))
      "You like chocolate but now brownies!?"
      "I like those, too!"
    )
    (String.concat name_greeting likes_greeting)
```

> **Note:** Here I'm writing _raw_ HVM code, which you aren't usually supposed to write by hand. Raw HVM is supposed to be a compiler target, similar to assembly, but for now, for learning purposes, I'm going to write it directly, and eventually try to write a small compiler so that I don't have to write it out by hand.

But what does a full program look like?

That's what I need to find out by writing some real code.

So what should I write to take advantage of HVM's performance, and try out functional programming in general? I'm thinking a game engine... 😉
