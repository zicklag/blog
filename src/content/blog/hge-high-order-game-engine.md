---
author: Zicklag
title: HGE - High Order Game Engine
description: Thoughts on making a game engine built on top of HVM.
pubDatetime: 2023-03-15 18:07:00
tags:
  - hvm
  - hge
---

In the [last post](@/hvm-what-is-functional-programming.md) I eluded towards making a game engine, utilizing functional programming and the new [HVM] runtime.

The first thing I want to talk about is _why_ HVM seems like a great platform to build a game engine on.

<!-- more -->

[hvm]: https://github.com/HigherOrderCO/HVM

## Why HVM?

Maybe a better question is "Why HVM when you already have Rust?" 😜

Rust is amazing, and, so far, my favorite programming language. It gives you great control over the hardware, which is great for making performance critical applications ( such as games ). And its approachable to beginners, with a clean separation between safe and `unsafe` Rust.

It's just great, so why change? Especially when I'm already writing a game ( [Fish Folk: Jumpy](https://github.com/fishfolk/jumpy) ) and future game platform ( [Bones] ) in Rust.

[bones]: https://github.com/fishfolk/bones

### Goals

Well, it helps to think about some important game development goals of mine:

#### Modability

- I'm talking, **ultimate** modability.
- I want to make the game almost completely modable, so that users can change anything in the game as much as they want.
- To be clear, this includes programming ( i.e scripting in some form ), not just assets and logic.

#### Low Barrier

- I want it to be easy to change the game.
  - This includes both when modding and when contributing to the game itself, whatever that looks like.
- Factors affecting this include:
  - How difficult is it to learn the programming language.
  - How difficult is it to get the tooling on your computer to compile the language.
  - How long does it take to compile.
  - How well does the language/framework help you prevent bugs by it's nature.
  - Can you hot reload logic/assets.

#### Network Gaming

- This is a different kind of point, but it turned out very important in my experience with Jumpy.
- Key aspects for networking in Jumpy was **Snapshots** & **Determinism**.
- This is because using rollback networking works really great for limited scope network multiplayer games.
- This can make it _way_ easier to program network games, which also helps with the **Low Barrier** objective.

Those goals were the motivation for the creation of the snapshot/determinism friendly custom [Bones] ECS for Jumpy.

Combine Bones ECS with WASM and the ability to link multiple WASM modules together, and you have an incredibly modable core for making games!

### How HVM Fulfils Those Goals

If we look at using HVM, it has many of the same advantages of Bones + WASM:

- We can hot-reload HVM code, like we could with WASM.
  - I.e they can both be dynamically loaded at runtime without re-compiling the game platform/engine.
- We can snapshot and restore the HVM heap, just like we can the WASM linear memory.
- We can link multiple mods together into the game.
  - **WASM:** Unfortunately there's no WASM linking standard, other than Emscripten, which isn't necessarily supported by non-emscripten build tools, which is unfortunate. There is effort on a WASM linking standard, but it isn't finished yet. It's an area of investigation whether we can make WASM linking work for us.
  - **HVM:** There's no HVM linking standard yet either! But this is a weird case because there's hardly one language compiling to HVM anyway. This means we might just be able to roll our own, since we'll need to forge the ecosystem a bit anyway.

So HVM actually satisfies some of my biggest goals for game development, including its ( alleged ) performance.

And on the performance note, Bones hasn't been made multi-threaded. That was left out for simplicity in design and for determinism's sake, we might be able to enable it later. The crazy thing about HVM is that you get _automatic_ parallelism **while still maintaining determinism!**

This is because, when HVM parallelizes an operation, it does it by doing things that can be done on separate threads _without_ changing the result. So you don't having to worry about parallelism hurting your determinism like you do in most other contexts ( without putting care into how you design the parallelism ).

## Why Not HVM?

This is another good question. Why _not_ use HVM?

Probably the biggest glaring reason is that there is only one extremely work-in-progress language ( not counting a work-in-progress compiler for JS and Python ) that compiles to HVM code. This language, [Kind], is developed by the same community behind HVM for writing programs on HVM. But it's compiler is super new, and probably has a lot of improvement before it will be stable. For instance, it doesn't even have floats yet ( though I _think_ that might be easy to add ).

This leaves us with three obvious options:

- 1: Use the nascent Kind language and contribute to it as necessary.
- 2: Write our own language that compiles to HVM.
- 3: Just write HVM code directly.

Option 2 probably isn't much better than option 1, except for the consideration that we might want to pursue option 2 to some extent either way for eventual ( or maybe soon? ) visual scripting.

Option 3 is interesting, though. HVM code isn't _really_ designed to be written by hand. It's _almost_ the equivalent "assembly" code: you're supposed to write other languages that compile to it. But HVM code is actually quite ergonomic for how simple it is. It _is_ writable without feeling like you're being tortured. Maybe it's not as nice as a full language, and it isn't statically typed, but it's not half bad.

That kind of leads to a fourth option, which is a combination of options 2 and 3: we write a simple language on top of HVM that is a little nicer, but not complicated so it will be easy to make the compiler. That's what I think I'm going to try.

[kind]: https://github.com/HigherOrderCO/Kind

## Conclusion

HVM seems to solve a lot of the important big issues for writing a game with the goals that I've outlined. It is extremely new and relatively untested, but seems to have enormous potential for the future.

As an exercise, then, I'm going to try to throw together, as fast as possible, a prototype game engine, built with the lessons I've learned so far working on Jumpy and Bones, but on top of HVM and using functional programming techniques. As a working name for the engine, I'll go with HGE for High-order Game Engine.

As kind of a side quest, I'm going to be working on a simple HVM pre-processor/compiler, that can make raw HVM a little nicer to use, and will be useful for writing HGE. This little language I'm calling HOP, for High-Order Plus, and I'm going to write the HOP compiler in raw HVM to help learn how to use both it, and functional programming techniques.

I've already got a simple HOP compiler that works by replacing `#include` statements with included file contents so you can spread your HVM program across multiple files. In my next post I'll write about what that looks like so far. It's my first functional program and I'll write a little bit about how it's feeling to write for the first time and how it compares to the imperative programming I'm used to.

Onward ho!
