import contacts from "./contacts.json" with { type: "json" };

export default [
  { text: "Source", href: "https://github.com/404Wolf/404wolf.com-v2" },
  {
    text: "Email",
    href: contacts.find((c) => c.name === "Email")?.link || "#",
  },
  {
    text: "Phone",
    href: contacts.find((c) => c.name === "Phone")?.link || "#",
  },
];
