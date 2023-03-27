---
title: "HOP: HVM Mini Language - Conclusion"
date: 2023-03-16 22:00:00

taxonomies:
  tags:
    - HOP
    - HVM
    - HGE
---

In my [previous post](@/hop-hvm-mini-language-part-2.md), I walked through the first steps of making a simple compiler with [HVM]. Now I cover some final thoughts and conclusions.

<!-- more -->

[HVM]: https://github.com/HigherOrderCO/HVM

## Automatic Multi-threading is Awesome

Despite the very simple programming that I used to make the HOP compiler, it's automatically multi-threaded as it recursively resolves `#include` statements, and that is really cool.

Without having to worry about queues, channels, locks or anything like that, I was able to focus on the core logic for my program, and get a very performant implementation.

So far, that seems to be one of the biggest advantages of the programming model: being able to focus on your app's logic, without worrying about memory management, **and** without having to worry about garbage collection slowing your app down when it needs to finally face the world.

## Substitutions Are Powerful

You can represent so may different ideas, even quite ergonomically, just with the substitutions that HVM offers. Here are some examples I used in HOP.

### If Statements

You can make if-else statements:

```dart
(If 1 a b) = a
(If 0 a b) = b
```

You just treat the number `1` as true and the number `0` as false. It will return the first expression if it's true and the second expression if it's false.

### Boolean Operators

You can really easily do boolean operators too:

```dart
(Not 1) = 0
(Not 0) = 1
(And 1 1) = 1
(And a b) = 0
```

### Options

Finally, I implemented something like Rust's `Option` type.

```dart
(Option.map (Option.some x) map) = (Option.some (map x))
(Option.map (Option.none) map) = (Option.none)
(Option.unwrap_or (Option.some x) default) = x
(Option.unwrap_or Option.none default) = default
(Option.or (Option.some s) x) = s
(Option.or Option.none x) = x
```

### Others

Other things I implemented quickly for HOP were:

- `List.join`
- `List.filter`
- `List.map`
- `String.starts_with`
- `String.strip_prefix`

## Final Thoughts

All of these things are things I would normally pull from Rust's standard library, but they were trivial to implement with just one or two lines each for HVM. I'm really intrigued by how simple all of it can be.

I mean, the `Vec` implementation in Rust is a very complicated thing, but in HVM, I can just make lists out of thin air, and then implement operations on those lists easily.

It just feels like a very elegant and powerful form of programming.

I'm really enjoying getting into it, and, while it may not be some magic key that unlocks a greater power and simplicity in programming, it seems like it might possibly simplify software development and bring it a little closer to how I like to imagine it in my head.

Time will tell...

More experimentation is coming soon, and I'll let be posting about my progress. Bye for now!
