# Tailwind CSS & Shadcn UI Styling Rules

- **No Global CSS Hacks:** Never use `!important` tags or global CSS selectors in `globals.css` to aggressively override Tailwind utility classes (e.g., `.rounded-xl { border-radius: 11px !important; }`). This breaks the predictable utility-first pattern of Tailwind CSS.
- **Component-Level Styling:** When instructed to change styling universally, do so by modifying the reusable React components directly (e.g., updating the `className` in `card.tsx`), or by updating the base Tailwind theme variables.
- **Respect Shadcn Defaults:** Rely on the default Shadcn UI styles and border radii unless the user explicitly requests custom overrides. Do not force arbitrary custom styles globally unless absolutely necessary.
