---
author: Zicklag
title: "HOP: HVM Mini Language - Part 2"
postSlug: hop-hvm-mini-language-part-2
pubDatetime: 2023-03-16 20:17:00
description: HVM and functional programming intro, starting with a tiny language parser, part 2.

tags:
  - hop
  - hvm
  - hge
  - functional-programming
  - technology
---

In my [previous post](./hop-hvm-mini-language-part-1), I walked through the basics of an HVM program that could read and write files. Now we're going to make a compiler!

<!-- more -->

> **Note:** You can find the entire code for HOP on GitHub [here](https://github.com/zicklag/hop).

## Goal Functionality

Let's talk about what exactly we want to accomplish.

The first thing I wanted out of HOP was for it to be able to include other files, so that I don't have to write my whole program in one big file, and so that I can re-use files across multiple different programs.

The idea is to take lines that look like this:

```c
#include other_file.hop
```

And replace that line with the contents of `other_file.hop`. Ultra simple.

And if `other_file.hop` had a line like:

```c
#include yet_another_file.hop
```

Then it should substitute `yet_another_file.hop` into `other_file.hop` before sticking the whole thing into the first file. So we want it to recursively include all of our dependencies.

## Starting Files

Let's make sure we have a couple files in place before we start, so that we have something to work on:

**message.hop:**

```dart
Message = "Hello from HOP!";
```

**hello.hop:**

```dart
#include message.hop

Main = Message
```

The goal is to compile `hello.hop` into a new `hello.hvm` file with the `#include` statement properly evaluated.

## Compiler Flow

Let's start with where we left off in our previous post with `hop.hvm`:

```dart
(Main infile outfile) =
    (HVM.load
        infile
        @contents (HVM.store outfile contents Done)
    )
```

We are reading a file, and then writing it to another file, without changes. Let's add a new step to this flow so that we can _change_ the file before we write it out.

```dart
(Main infile outfile) =
    (HVM.load
        infile
        @contents (HVM.store outfile (Compile contents) Done)
        //                             ^
        //                             |
        //                             |------------|
        // Call compile on contents before writing -^
    )

// Replace compiled contents with "TODO"
(Compile contents) = "TODO"
```

And we can run it like this:

```bash
$ hvm run -f hop.hvm '(Main "hello.hop" "hello.hvm")'
(Done)
```

This will stupidly replace whatever was in our input file with `TODO` and then write it to the output file.

Not very useful _yet_ but at least we're _changing_ the file now.

### Breaking Into Lines

For simplicity, lets say that our `#include` statements must be on their own line, and must not have any whitespace before the `#`. This means that an easy way to find all our include statements, would be to break the file into lines and then replace each line that starts with `#include`.

The first step then is breaking into lines.

#### Strings and Lists in HVM

Now is a good time to talk about strings and lists in HVM. Strings are represented as what's called a Cons list, which are really common in functional programming languages. ( Though I don't know where the `Cons` term comes from ).

The idea is simple, each item in the list is either:

```dart
(List.cons list_item another_list)
// Or
(List.nil)
```

This might be a little hard to wrap your head around if you're not used to it, but a list with the numbers 1, 2, and 3, would look like this:

```dart
(List.cons 1 (List.cons 2 (List.cons 3 List.nil)))
```

Every `List.cons` represents an item in the list with wither some other list item after it, or nothing after it, at which point you reach the end of the list.

It's the same with strings. So the string "ABC" would be like this:

```dart
(String.cons 'A' (String.cons 'B' (String.cons 'C' String.nil)))
```

HVM has syntax sugar built in for both lists and strings so that you could write the above examples as `[1, 2, 3]` and `"ABC"` instead.

This seems weird, but it works really nicely for functional programming languages, as we'll see in a second.

### Appending to Strings And Lists

Before we get into breaking things into lines, we're going to need to have a way to append items to strings and lists.

This is where we reach an interesting concept: HVM has no standard library for us to work with. While it has syntax sugar for `String.cons`/`nil` and `List.cons`/`nil`, it doesn't give us any help _modifying_ those. We are starting from the ground up with pretty much nothing other than the power of substitution.

So how do we implement `String.append`?

We want the `String.append` function to take two arguments:

- The string to start with
- A character to append to the string.

Let's create a test file for a second to experiment. We want to append the character `!` to the string `"hi"` so that the end result is `"hi!"`.

**strings.hvm:**

```dart
Main = (String.append "hi" '!')
```

Notice that strings are represented with double-quotes and characters are represented with single-quotes.

Now we write our `String.append` function. We start with our first substitution rule:

```dart
(String.append String.nil appended_char) = (String.cons appended_char String.nil)
```

This says that whenever we call the `String.append` function, with `String.nil` as the first argument, and some other character in the second argument, we replace it with a new string with the appended character as the only character in the string.

That's simple enough! But that alone won't do what we need because what happens if we pass a string that isn't `String.nil` as the first argument. We need to write another substitution rule to make that work:

```dart
(String.append (String.cons first_char rest_of_string) appended_char) =
    (String.cons first_char (String.append rest_of_string appended_char))
```

This one is a little more confusing so we'll try to walk through it carefully.

Here we are handling the case when the first argument to `String.append` is a `(String.cons first_char rest_of_string)`. Note how we're able to _pattern match_ on what is being stuck into our function arguments, and define different equations for different patterns.

In plain(-ish) english this says:

> “When you see `String.append` with the first argument being a `String.cons`, take the first char from the `String.cons` and stick it at the beginning of a new `String.cons`, then append the `appended_char` to the end of the `rest_of_string`.”

The idea is that we just keep going through the characters in the string, and saying "put our appended character after the next character". Eventually, though, we will get to the `String.nil` at the end of the string, and when that happens, our first substitution will now come into effect, because we are calling `(String.append String.nil appended_char)`.

It's a little mind twisting if you're not used to it!

Let's prove that it works with a complete example:

```dart
(String.append String.nil appended_char) = (String.cons appended_char String.nil)
(String.append (String.cons first_char rest_of_string) appended_char) =
    (String.cons first_char (String.append rest_of_string appended_char))

Main = (String.append "hi" '!')
```

```bash
$ hvm run -f strings.hvm
"hi!"
```

It works. How bizarre right? We just programmed with substitution.

Don't worry if it doesn't make sense right away. I've done a _lot_ of programming, and it didn't make sense to me without some practice. Once you start doing it more, it starts to click and you get almost into a functional rhythm. At least that's how it's worked for me so far. We'll see if it keeps seeming cool as we get deeper into it.

So, now that we have `String.append`, go ahead and add it to your `hop.hvm` file.

While you're at it add the `List.append` equivalent.

```dart
(List.append List.nil appended_item) = (List.cons appended_item List.nil)
(List.append (List.cons first_item rest_of_list) appended_item) =
    (List.cons first_item (List.append rest_of_list appended_item))
```

### Implementing `String.lines`

Now we have all we need to write `String.lines`!

The first substitution rule is really simple:

```dart
// The lines of `String.nil` is just an empty list.
(String.lines String.nil) = (List.nil)
```

Now we need to make a substitution rule for what to do with other strings. This is more complicated.

Let's think about what process we want to do to get the lines out of the string:

- First, let's start out with an empty list of lines.
- And let's have an empty string that represents the current line.
- Then we'll go through each character in the string.
  - If the character is not a newline: then add it to our current line string.
  - If the character _is_ a newline, then:
    - add our current line string to the list of lines
    - clear our current line string to be empty
    - and continue going through the rest of the characters in the string.

Now we can implement!

This next substitution rules will call our helper function `String.lines_` and give it the starting empty list of lines, and the starting empty string for our current line. Finally it also passes it our string to break into lines.

```dart
(String.lines string) = (String.lines_ List.nil String.nil string)
```

Here's the first rule for `String.lines_`:

```dart
(String.lines_ lines current_line String.nil) = (List.append lines current_line)
```

This says “if we reach the end of the string, add the current line to our list of lines, and then return the list”.

Next rule handles finding a newline character in the string:

> **Note:** The `10` is number representation of the newline character. HVM doesn't have a `\n` escape to let us type a newline character easily, so we just use a `10` instead.

```dart
(String.lines_ lines current_line (String.cons 10 rest_of_string)) =
    (String.lines_ (List.append lines current_line) String.nil rest_of_string)
```

If we find a newline, we call `String.lines_` again, but we append the current line to `lines` and we set the current line to `String.nil` again.

**This is a really importation concept.** Earlier I mentioned that functional programming languages usually don't let you mutate your data, but here we see a way around that by creating _new_ data, and then passing it back into a new function call recursively.

The idea is that we run `String.lines_` over and over, with different data each time, allowing us to store the current list of lines and the current string, as it changes over the repeated function calls.

We only need one more rule! What do we do when we find a character that isn't a newline.

```dart
(String.lines_ lines current_line (String.cons char rest_of_string)) =
    (String.lines_ lines (String.append current_line char) rest_of_string)
```

This takes any character from the string, and just appends it to the current line, before continuing our recursion over the rest of the string.

Another important point here is the **order of the rules**. We need to put our _least specific_ rules last in the file, because HVM will take the first substitution that matches.

If we put this substitution above the one that checks for newline characters, the newline detecting rule would never match, because this one matches for _all_ characters. So we need to make sure it looks for newlines first, and if it doesn't find one, it will use this rule.

That's it! You can add this all together to `hop.hvm`:

```dart
(String.lines String.nil) = (List.nil)
(String.lines string) = (String.lines_ List.nil String.nil string)
(String.lines_ lines current_line String.nil) = (List.append lines current_line)
(String.lines_ lines current_line (String.cons 10 rest_of_string)) =
    (String.lines_ (List.append lines current_line) String.nil rest_of_string)
(String.lines_ lines current_line (String.cons char rest_of_string)) =
    (String.lines_ lines (String.append current_line char) rest_of_string)
```

### Finally Some Lines

Finally, lets get some lines out of our file!

```dart
(Compile contents) =
    let lines = (String.lines contents);
    (HVM.log lines contents)
```

This shows another new concept. For convenience, HVM lets us assign the results of expressions to temporary variables in our functions with the `let` keyword. This can make it easier to read functions
with lots of nesting.

In this case, we get the lines of the file, log them, and then return the contents of the file unchaged.

```bash
$ hvm run -f hop.hvm '(Main "hello.hop" "hello.hvm")'
["Main = "Hello from HOP!"", ""]
(Done)
```

Yay! 🎉 It printed out the lines of our file. One line, followed by a blank line.

## Fast Forward

Unfortunately this post already turned out enormous! I wasn't expecting to do such an extensive tutorial, and now I've run out of time! The full code for HOP so far is [here](https://github.com/zicklag/hop/blob/ab6ceffd0eaa10aa945d4cbc6eb17c87dc18ddff/hop.hvm#L1).

If you are reading this and you want a finished tutorial, let me know by opening a [discussion](https://github.com/zicklag/blog/discussions/new?category=general).

Finally, let's skip to my [Conclusion so far](./hop-hvm-mini-language-conclusion).
