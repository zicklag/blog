import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://zicklag.katharos.group",
  author: "Zicklag",
  desc: "Experiments, technology, and thoughts on life.",
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
