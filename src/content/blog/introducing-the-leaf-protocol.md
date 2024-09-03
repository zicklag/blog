---
author: Zicklag
title: Introducing The Leaf Protocol
pubDatetime: 2024-09-01 18:00:00
description: >
  An overview of the experimental Leaf Protocol for federated, local-first app development.
postSlug: introducing-leaf-protocol
draft: true
tags:
  - technology
  - weird
  - federation
  - internet
  - leaf-protocol
---

Over the last several months I've been working on creating a federated, offline-capable, data
backend for the [Weird.one] app. This post sums up the latest developments and goes into the
rational behind the experimental Leaf Protocol that has been developed for the use-case.

This builds on previous thoughts and developments touched on in my [How to
Federate?](./how-to-federate) and [Web of Data](./a-web-of-data) posts. You may also want to check
out the [Agentic Fediverse][af] vision page, which has an outline of some of the tenets we are
trying to uphold with Weird and Leaf.

I'll touch on some of the points in those posts briefly here, so they aren't required reading, but
will help to give more context.

[Weird.one]: https://weird.one
[af]: https://github.com/muni-town/agentic-fediverse?tab=readme-ov-file#agentic-fediverse

## Another Protocol?

Before going further I want to address an inevitable thought: "why are you making _another_
protocol!? We've already got ActivityPub, AtProto, Nostr, RDF, IPNS, etc. etc."

The first reason is that we have priorities for Weird, specifically being local-first and supporting
seamless data migration, that are different than most other protocols. Our goal **above all else**
is to make an excellent **product**, not an excellent protocol. The Leaf Protocol will grow
fundamentally out of what Weird needs, not the other way around.

We expose the Leaf Protocol so that multiple Weird instances will be able to federate with
each-other. If other apps find Leaf useful, then great, but if not, it's no problem for us.
Furthermore, if the protocol completely fails for whatever reason, we will continue to do what is
necessary to make Weird without it. It exists only to serve those benefited by it.

That said, we designed Leaf to be flexible, and useful outside of Weird. We hope that it will be
very feasible to make bridges between leaf and other protocols, possibly even acting as an
integration layer between different protocols. It is a huge win for us if we can manage to make Leaf
work well for us, while still being able to integrate with the wider ecosystem of protocols.

## Why Leaf?

### Data vs. Events

One of the big reasons that we started thinking about Leaf was because of the limitations of
ActivityPub, or rather, of the ActivityPub servers/standards that we have today.

ActivityPub is fundamentally a way to connect servers to each-other by sharing **events**.

One of the problems with this is that your server only knows about things that have been sent to one
of it's inboxes. This can lead to side-effects such as different servers having different reply
histories or like counts.

Importantly, your data is bound to your homeserver. Different apps are able to tell each-other about
things that happened, and to a certain extent, read data from other servers, but they're not
_necessarily_ able to transfer or migrate a users data, creating a level of lock-in despite the open
protocol.

> **Note:** There is more background context on ActivityPub limitations in the [Popular
> Solutions](./how-to-federate/#popular-solutions) section of the [How to
> Federate](./how-to-federate/) post.

For Weird, we wanted to avoid the problems of event synchronization and build instead on **data
replication**. The Leaf protocol is built on stores of data that can be replicated between peers.
These peers can be other servers, or even web or desktop clients. The data can be stored and edited
offline, and then synchronized to servers later. You can even synchronize to multiple servers if
desired, so that if one goes down, your data isn't lost.

This is a very different experience from most federated apps today, and goes a long way in promoting
user agency.

### Not a Totally New Protocol

Another important thing about Leaf is that we didn't just invent a new protocol from scratch. In
fact, it's actually just a thin layer on top of the [Willow Protocol][wp].

The Willow Protocol is a work-in-progress protocol specification that satisfies all of our needs for
a privacy-preserving, local-first, data replication protocol. The only thing we felt was missing was
a data format.

Willow only lets you read and write one kind of data: **bytes**.

Being able to store bytes lets you store any kind of data, but just having a bunch of bytes doesn't
tell you anything about what the bytes _mean_. That is what Leaf solves for.

[wp]: https://willowprotocol.org/

### An Interoperable Data Format

When thinking about a data format, one of the big questions was how to make it inter-operable. For
example, we didn't want to restrict what kind of data you could store, but we also wanted it to be
possible for different servers or apps to read and write each-other's data so that you weren't
locked in.

To this end we came up with an Entity-Component data model. Entities are almost like webpages. They
have a location, like a URL, and they can be linked to by other entities. Instead of storing HTML,
though, entities store a list of **components**.

Components are little pieces of data that mean something by themselves. For example, most entities
will have a `Name` and a `Description` component, and possibly and `Image` component.

Each different kind of component has a human-readable **specification** that documents what the
component means and how it should be used in an app. It also has a machine-readable **data format**
that describes exactly how the different bytes of the component data map to numbers, lists, text,
etc. The specification and the data format are then hashed to create a globally unique **component
ID**.

By breaking entity data up into individual components, different apps are able to incrementally
inter-operate and understand different entities.

For example, you might have an entity for your public profile, and an entity for a blob post of
yours. Your profile and your blob post would both have `Name`, `Description`, and `Image`
components. They also might have components the other doesn't, like `Friends` and `Article`.

Because each component means something by itself, an app can read whatever components it
understands, and simply ignore the ones that it doesn't.

For example, if I share a link to my profile or my blog post, a chat app can read the `Name`,
`Description`, and `Image` components to generate a link preview, without having to know anything
else about the entity. It doesn't care if it's a blog post or a profile, or a picture in my photo
album. They all have components that it understands well enough to show a link preview.

> **Note:** You can get more background on this concept in my [Web of Data](./web-of-data) post.

## Other Questions

### Identity

Identity is a big topic and in Weird and Leaf we are focusing on leaving options as open as possible.

Strictly an "identity" in Leaf is a cryptographic keypair. The reason for this is that we want users
to be **able** to create and manage their own identity, if desired, without the need for servers or
DNS or anything else.

That said, we don't want to _force_ users to do this. We want you to be able to sign up with your
Email address, just like you do with any other app, and start using Weird right away. Cryptographic
keys allow you to do this, too. In that case the key can just be stored on the server.

Since we're using keypairs, though, we have to think about what happens if somebody loses a keypair,
or if it gets stolen.

My current impression is that users should manage identities as a "contact book", and that apps
should allow users to assign different keys to their own "contacts" as they see fit.

> **Note:** This is not an original concept, and may be done similarly to the [Pet
> Names](https://github.com/cwebber/rebooting-the-web-of-trust-spring2018/blob/petnames/draft-documents/petnames.md#petnames-a-humane-approach-to-secure-decentralized-naming)
> proposal.

For example, if my friend Alice loses her private key, and then creates a new one on a new server,
she can come and tell me in person, or even on another platform, about her new identity. I can then
update "Alice" in my contact book and all Alice's new posts with her new "identity" will still be
treated as they came from my friend "Alice".

This model is important I believe, because it divorces the human and machine concepts of "identity"
and puts emphasis on the human concept.

The fact is that we must have a machine concept of identity for the sake of efficiency. When we use
the internet, though, we can't create any proof of our _human_ concept of identity, in the machine.

While we are always seeking the holy grail of digital identity, that will somehow allow us to
perfectly represent our human identities in the machine, we will probably never find it, and all of
our existing solutions may break our trust in some form or another. Our goal, then, is to allow the
user the freedom to tell the machine what _their_ idea of identity is, for the times when the trust
in the machine identity is broken.

If you can convince me that you are who you say you are, by any means, in or out of band, then I
should be able to tell my app as much and have a suitable user experience for it.
