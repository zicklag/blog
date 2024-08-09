---
author: Zicklag
title: A Web of Data
pubDatetime: 2024-07-15 14:00:00
description: >
  Thoughts on making a "Web of Data" instead of a "Web of Pages", and how that might let us take a step away from the dominance of large, complicated browsers.
postSlug: a-web-of-data
tags:
  - technology
  - weird
  - federation
  - internet
---

Recently while working on a data model for [Weird], I've started thinking about using an
Entity-Component model to create a "web of data" instead of the "web of documents/pages/HTML" that
we have today.

For more context on how this idea has been evolving see, [this discussion][discussion]. In this
post, I'm going to share the latest high-level idea.

[Weird]: https://github.com/commune-os/weird
[Iroh]: https://iroh.computer
[discussion]: https://github.com/commune-os/weird/discussions/32#discussioncomment-10044252

### Today: The Internet of Pages

Today the internet is made up primarily of a web of HTML pages. The HTML usually contains or
references CSS and JavaScript that is largely concerned with the presentation or interactivity of
that page. We need massively complicated web browsers and web standards to actually view these pages
as they are meant to be viewed.

The idea is to lean away from this web of complicated pages and towards a web of simpler data.

For example, while there have been many iterations on the concepts of blogs, chats,
microblogs/tweets, etc. the data hasn't changed that much. And yet, we still depend on complicated
web browsers or diverse protocols and APIs in order to access that data.

### Entities & Components: An Internet of Data

Imagine an alternative internet protocol were each "thing" on the internet is an "Entity". Entities
might represent blog articles, chat messages, tweets, comments, or anything else. Each entity also has
a path to that entity, like a URL.

All the data for the entity is stored in "Components".

Each component has a schema that describes the data in the component.

Some of the most common components would be things like:

- `NameDescription`: a component that has a name and description for the entity.
- `Image`: a component that contains a single image for the entity. I.e. a feature image for a blob
  post or an avatar for a profile.

Note that these components give you what is necessary to create a link preview for the entity.

Significantly, apps can understand these two components even if they don't understand any other
components on the entity. The components provide independent slices of meaning.

### Platforms on top of Components

Many more components can be added, and each can be standardized independently.

<!-- Applications can incrementally understand entities, and different applications can add and -->
<!-- manipulate different components on the same entity. -->

This means we are not limited to putting simple data in our web. We could expand our components to
include platform-related enhancements.

For example, we could add a `WebView` component that contains HTML, CSS, and JavaScript that may be
used to display the entity in a browser or webview such as [Tauri] or [Blitz].

We could create components containing WASM modules and standards for how they interact with the
environment or other entities.

You can even add app-specific components without preventing other apps from
understanding the non-specific data in the entity.

Instead of forcing everybody to agree on an enormous, backward-compatible web browser standard, we
are free to incrementally develop new components and standards that can live side-by-side for
enhancement.

This might help us converge on one shared, flexible data protocol, similar to the internet of HTML
pages that exists today, instead of having to make new protocols and APIs every time we want to let
other people create custom frontends to our _data_.

It will inherently be a web of data, and presentation will be an optionally configurable layer on
top, not an inescapable necessity for delivering your content.

[Tauri]: https://tauri.app/
[Blitz]: https://github.com/DioxusLabs/blitz

### Sound Familiar?

This starts to sound somewhat similar to the old idea of semantic HTML and keeping presentation
separate from the content.

It's not necessarily a new idea, but I think we are starting to feel how important it is to get back
to owning data _and_ the way that we browse/access it.

It would be best if we could do this in a simple, extensible way that doesn't force us to have an
entire web browser, and yet doesn't stop us from taking advantage of the great developments browsers
have made.

I think the Entity-Component model _might_ be able to provide for that, but that's a big **might**.
Let's try it. 😉

### Technical Details & Experimentation

The explanation above was intentionally abstract, but I'm actively working on an experiment in this
direction with the [Weird] project.

Weird is taking a top-down approach to promoting user agency.

Instead of starting at the bottom ( protocol ) level, we're starting at the user/app level giving
you 1) an alternative to "login with Google" and 2) a way to have your own personal website that you
control.

Under the hood we're **experimenting** with open federation/internet protocol stuff that will
support the Weird app, and new features that we add such as chat, blogging, etc.

We're building our own Entity-Component model on top of [Iroh], a re-imagining of [IPFS].

We're still feeling everything out, and the design has already evolved quite a bit as we've worked.
If you're interested and want to discuss, feel free to reach out on [Discord], [Matrix], [GitHub] or
ping me on the Fediverse: `@zicklag@mastodon.social`.

[Discord]: https://discord.gg/mbQYgFVBQx
[Matrix]: https://matrix.to/#/#discord:commune.sh
[GitHub]: https://github.com/commune-os/weird/discussions
[IPFS]: https://ipfs.tech/

---

> **Update ( 07/20/2024 ):** Since this post we've started a [draft
> specification](https://github.com/commune-os/agentic-fediverse/blob/main/leaf-protocol-draft.md)
> for a data model on top of the [WillowProtocol](https://willowprotocol.org).
