/**
 * Single source of truth for the downloadable CV.
 *
 * The file lives in /public, so the path is also the public URL. Both the
 * desktop pill (CvDownload) and the compact pill (CvPill) read it from
 * here — previously the filename was duplicated in two components, which
 * is how it drifted out of date.
 *
 * The old `/SzilagyiBorbala_CV_EN_2026_NoPhoto.pdf` path is 301'd to this
 * one in `public/_redirects`, so links already sent out still resolve.
 */
export const CV_PDF_PATH = '/SzilagyiBorbala_CV.pdf';
