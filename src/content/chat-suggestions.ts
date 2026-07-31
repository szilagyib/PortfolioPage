/**
 * Opening prompts offered before the visitor's first message.
 *
 * Four, not three: they cover the four things a recruiter actually wants —
 * scope, leadership, the differentiator, and a sign there's a person here —
 * and the chips wrap, so a fourth costs a row at most.
 *
 * They're deliberately non-overlapping. "Built end to end" returns the
 * products and RAMSey; "most proud of" returns the cross-team collaboration
 * she started at Prolan, which is a leadership answer nothing else on the
 * site makes. Pointing the proud question at a project would have returned
 * the same answer as the first chip.
 *
 * The fun fact stays. It's the one prompt that isn't selling anything, and
 * a page that only sells reads worse than one that doesn't.
 */
export const CHAT_SUGGESTIONS: readonly string[] = [
  'What has she built end to end?',
  'What is she most proud of?',
  'How does she use AI in production?',
  'Surprise me with a fun fact!',
];
