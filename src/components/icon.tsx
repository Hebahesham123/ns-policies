import { icons, type LucideProps, HelpCircle } from "lucide-react";

/** Convert a kebab/snake icon name to lucide's PascalCase export key. */
function toPascal(name: string): string {
  return name
    .replace(/(^\w|[-_]\w)/g, (m) => m.replace(/[-_]/, "").toUpperCase());
}

/** Render a Lucide icon by its (kebab-case) name — used for DB-driven icons. */
export function Icon({ name, ...props }: { name?: string | null } & Omit<LucideProps, "name">) {
  const key = toPascal(name || "") as keyof typeof icons;
  const Cmp = icons[key] ?? HelpCircle;
  return <Cmp {...props} />;
}
