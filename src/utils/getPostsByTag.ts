import { slugifyAll } from "./slugify";
import type { CollectionEntry } from "astro:content";

const getPostsByTag = (posts: CollectionEntry<"blog">[], tag: string) =>
  posts
    .filter(post => slugifyAll(post.data.tags).includes(tag))
    .sort(
      (a, b) =>
        Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
        Math.floor(new Date(a.data.pubDatetime).getTime() / 1000)
    );

export default getPostsByTag;
