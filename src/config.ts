import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://zicklag.github.io/blog",
  author: "Zicklag",
  desc: "Zicklag's log of experiments and technology explanations.",
  title: "@Zicklag's Blog",
  ogImage: "",
  lightAndDarkMode: false,
  postPerPage: 6,
};

export const LOCALE = ["en-EN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/zicklag",
    linkTitle: `Zicklag on Github`,
    active: true,
  },
];
