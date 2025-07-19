const domain = "lukemcdonald.com";
const name = "Luke McDonald";

export const SITE = {
  author: name,
  name,
  domain,
  url: `https://${domain}`,
  desc: "I'm Luke, a christian, husband, father and wrestling coach living in beautiful Eastern Iowa. My tent making is as a full-stack developer with an eye for design.",
  dir: "ltr",
  themeColor: "#122023",
  lang: "en",
  timezone: "America/Chicago",
  social: {
    twitter: {
      card: "summary",
      handle: "@thelukemcdonald",
    },
  },
} as const;
