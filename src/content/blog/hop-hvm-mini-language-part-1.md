---
author: Zicklag
title: "HOP: HVM Mini Language - Part 1"
postSlug: hop-hvm-mini-language-part-1
pubDatetime: 2023-03-16 10:51:00
description: HVM and functional programming intro, starting with a tiny language parser, part 1.

tags:
  - hop
  - hvm
  - hge
  - functional-programming
---

In my [previous post](./hge-high-order-game-engine), I talked about why I want to use [HVM] to make a game engine. I decided that, for now, I was going to try to get along writing a thin language on top of raw HVM code, to make it a little bit easier to write and maintain.

For now, I'm calling that language HOP for High Order Plus.

This turned more into a basic HVM tutorial than I initially thought so I figure I'll make this a 2 part post, with the first one going through HVM basics such as printing and loading files, and the next post going over the compiler designing aspect.

<!-- more -->

So let's get started!

[hvm]: https://github.com/HigherOrderCO/HVM

## HVM Programming Basics

If you want, you can follow along yourself. ( Open an [issue](https://github.com/zicklag/blog/issues/new) if you run into problems following along. )

You just have to install HVM ( assuming you've already installed [Rust] ):

```bash
cargo +nightly install --git https://github.com/HigherOrderCO/HVM.git
```

> **ℹ️ Note:** I had to submit a [couple](https://github.com/HigherOrderCO/HVM/pull/217) [fixes](https://github.com/HigherOrderCO/HVM/pull/220) to HVM to get through this, and at the time of writing they haven't been merged yet, so you can install from my fork if the above command doesn't work.
>
> ```bash
> cargo +nightly install --git https://github.com/zicklag/HVM.git
> ```

[rust]: https://rust-lang.org

### Hello World

Let's start with the "Hello World!" of HVM. I create a file called `hop.hvm` and write:

```dart
Main = "Hello World!";
```

Now to run it we do:

```bash
$ hvm run -f hop.hvm '(Main)'
"Hello world!"
```

Simple enough, but what happened exactly?

1. The `-f hop.hvm` flag told HVM to load our `hop.hvm` file.
2. And the `'(Main)'` argument told HVM to normalize ( evaluate ) the expression `(Main)` and return the result.
3. HVM found that `Main` is equal to `"Hello World!"` and made a _substitution_ to give us the result.

So simple!

But can we actually write a program like this? Let's find out.

### Arguments

First, we'll make our main function take a couple of arguments. Since we're writing a compiler, we want to take an `infile` and an `outfile` argument:

```dart
(Main infile outfile) = (Files infile outfile)
```

Now we run it again:

```bash
$ hvm run -f hop.hvm '(Main "hello.hop" "hello.hvm")'
(Files "hello.hop" "hello.hvm")
```

_Now_ what happened?

1. This time we tell it to evaluate, not just `(Main)` but `(Main "hello.hop" "hello.hvm")`. `"hello.hop"` and `"hello.hvm"` correspond to our infile and outfile arguments.
2. HVM evaluates the expression and finds that saying `(Main "hello.hop" "hello.hvm")` is equal to `(Files "hello.hop" "hello.hvm")`.
3. HVM makes the substitution and returns the result.

That's _kind of_ interesting, but it doesn't do much for us. It's just substituting main for `Files`. And even though it changed it to `Files` that doesn't really _mean_ anything.

Testing this out isn't super useful but it helps us build intuition about what HVM is going to do and how we pass arguments through the HVM CLI.

### Printing Output

Let's get HVM printing some output instead. We can do that with the builtin function `HVM.log` or with `HVM.print`. They are both similar, but `HVM.print` will only print strings, and `HVM.log` will print any expression. So `log` is great for debugging, and `print` is great for user-facing output.

The `HVM.log` and `HVM.print` functions have the same structure:

```dart
(HVM.print something_to_print expression_to_return_when_done_printing)
(HVM.log   something_to_print expression_to_return_when_done_printing)
```

Let's see what that looks like:

```dart
(Main infile outfile) = (HVM.print infile Done)
//                                 |        |
// Expression to print ------------^        |
// Expression to return when done printing -^
```

```bash
$ hvm run -f hop.hvm '(Main "hello.hop" "hello.hvm")'
hello.hop
(Done)
```

We printed something! But what's up with the `(Done)`?

We told the print function to return `Done` when it was done, so when HVM goes and makes it's substitutions, it finds that `Main` finally substitutes to `Done`.

`Done`, similar to `Files` from earlier, is completely arbitrary, and could just as well be `Finished` or `Complete` or `ThisDoesNotMatter`.

HVM is just going through and making substitutions until there are no more substitutions to be made.

Now, what if we want to print the input file, and then print the output file?

```dart
(Main infile outfile) =
    (HVM.print                   // First print call.
        infile                   // Expression to print.
        (HVM.print outfile Done) // Expression to return when done
                                 // ( which is another print call! )
    )
```

```bash
$ vm run -f hop.hvm '(Main "hello.hop" "hello.hvm")'
hello.hop
hello.hvm
(Done)
```

Ah, interesting! Note how we are able to use whitespace and newlines pretty much however we want to improve readability. And it shows how we are able to get sequential behavior with HVM's print function by passing another print function in as it's second argument.

### Creating Our Input File

Now that we can print, let's load a file! First, make sure you create the file we'll be loading: **hello.hop**:

```dart
Main = "Hello from HOP!"
```

Our goal is to have HVM print out the contents of that file. Note that, for now, our HOP file is just normal HVM code. We'll add extra stuff to it later.

### Loading Our Input File

Loading files can be done with the `HVM.load` function. It takes arguments like so:

```dart
(HVM.load file_path_to_load lambda_to_run_with_file_contents_after_loading)
```

OK, so what's a `lambda`?

Lambdas are functions that:

- can be stored in variables
- take one argument
- evaluate to an expression that may include that argument
  - even if that expression is another lambda ( which lets you make multi-argument lambdas )

Lambdas in HVM look like this, with `argument` being any name you want to give the variable:

```dart
@argument lambda_body_expression
```

So we can load a file and print it out like this:

```dart
(Main infile outfile) =
    (HVM.load                               // Load a file
        infile                              // With this path
        @contents (HVM.print contents Done) // Then run this lambda
    )
```

```bash
$ hvm run -f hop.hvm '(Main "hello.hop" "hello.hvm")'
Main = "Hello from HOP!"

(Done)
```

It worked! It loaded our `hello.hop` file and printed it out.

### Writing a File

As the last step for the introduction, let's write to our output file.

We do this with the `HVM.store` function:

```dart
(HVM.store filepath file_contents expression_to_return_after_file_is_written)
```

Let's do it!

```dart
(Main infile outfile) =
    (HVM.load
        infile
        @contents (HVM.store outfile contents Done)
    )
```

```bash
$ hvm run -f hop.hvm '(Main "hello.hop" "hello.hvm")'
(Done)
```

Voilà! You can now check and see that `hello.hvm` contains the same code as `hello.hop` now! We successfully read a file and wrote it to another file.

Now all we have to do is make it actually do some compiling by changing the file as it is written.

Coming right up!
