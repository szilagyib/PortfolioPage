/**
 * Baked in when the module first loads. Static-generated pages inline it
 * at build time; the client-side view reads whatever year the visitor
 * arrives in. Either way it's a small aliveness signal.
 *
 * Lives here rather than in a component because both the canvas footer and
 * AllDoorsStack show it, and AllDoorsStack is lazy — importing it from
 * there would pull that chunk back into first paint.
 */
export const LAST_UPDATED_YEAR = new Date().getFullYear();
