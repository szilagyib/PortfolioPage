export type ContactIconKind = 'github' | 'linkedin' | 'mail';

export interface ContactEntry {
  readonly icon: ContactIconKind;
  /** Used as aria-label; not displayed as visible text. */
  readonly label: string;
  /** Full URL or mailto: link. */
  readonly href: string;
}

export type ArtifactBlock =
  | { readonly kind: 'heading';      readonly text: string }
  | { readonly kind: 'paragraph';    readonly text: string }
  | { readonly kind: 'metric';       readonly value: string; readonly label: string }
  | { readonly kind: 'bullet';       readonly items: readonly string[] }
  | { readonly kind: 'quote';        readonly text: string; readonly attribution?: string }
  /** Compact list of products (used by Engineering). Distinct visual style
   *  from `projectCard`, which is the clickable-external pattern. */
  | { readonly kind: 'productList';
      readonly products: readonly {
        readonly name: string;
        readonly type: string;
        readonly summary: string;
        readonly stack: readonly string[];
      }[];
    }
  | { readonly kind: 'contactGroup'; readonly contacts: readonly ContactEntry[] }
  | { readonly kind: 'photo';        readonly src: string; readonly alt: string }
  | { readonly kind: 'profileHeader';
      readonly photo: { readonly src: string; readonly alt: string };
      readonly name: string;
      readonly location: string;
      readonly contacts: readonly ContactEntry[];
    }
  /** Small mono-style divider used within a card to break sections. */
  | { readonly kind: 'sectionLabel'; readonly text: string }
  /** External project tile with optional preview image and tech stack. */
  | { readonly kind: 'projectCard';
      readonly name: string;
      readonly summary: string;
      readonly href: string;
      /** Deployed site, when the project has one. Rendered as a separate
       *  link under the tile — the tile itself is already an <a>, and an
       *  anchor cannot nest inside another. */
      readonly liveHref?: string;
      readonly stack?: readonly string[];
      readonly preview?: { readonly src: string; readonly alt: string };
    }
  /** External post / writing tile — title, date, pull-quote, link. */
  | { readonly kind: 'postCard';
      readonly title: string;
      readonly date: string;
      readonly quote: string;
      readonly href: string;
      readonly publication?: string;
    }
  | { readonly kind: 'aiChat' };
