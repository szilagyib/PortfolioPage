import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CvPill } from '@/components/canvas/CvPill';
import { CV_PDF_PATH } from '@/config/cv';

/* The pill offers two actions over the same file: view (new tab) and
 * download. It used to hard-code the filename, which is how the link
 * drifted onto a stale PDF — these tests pin the shared constant and the
 * fact that the file actually ships in /public.
 *
 * There was a second component here, CvDownload, covered by the same
 * table: a near-copy of this one used only on the desktop pentagon, which
 * is why the CV button looked different depending on the view. Every
 * surface renders CvPill now. */
describe('CvPill', () => {
  const Component = CvPill;

  it('offers a view link that opens the PDF in a new tab', () => {
    render(<Component />);
    const view = screen.getByLabelText('view CV');
    expect(view).toHaveAttribute('href', CV_PDF_PATH);
    expect(view).toHaveAttribute('target', '_blank');
    /* target=_blank without noopener leaks window.opener to the PDF host. */
    expect(view.getAttribute('rel')).toContain('noopener');
    expect(view).not.toHaveAttribute('download');
  });

  it('offers a separate download link for the same file', () => {
    render(<Component />);
    const download = screen.getByLabelText('download CV');
    expect(download).toHaveAttribute('href', CV_PDF_PATH);
    expect(download).toHaveAttribute('download');
    expect(download).not.toHaveAttribute('target');
  });

  it('acknowledges a download click without acknowledging a view click', async () => {
    const user = userEvent.setup();
    render(<Component />);

    expect(screen.getByText('↓')).toBeInTheDocument();

    await user.click(screen.getByLabelText('view CV'));
    expect(screen.getByText('↓')).toBeInTheDocument();

    await user.click(screen.getByLabelText('download CV'));
    expect(await screen.findByText('✓')).toBeInTheDocument();
  });
});

describe('CV asset', () => {
  it('ships the file the links point at', () => {
    const onDisk = resolve(process.cwd(), 'public', CV_PDF_PATH.replace(/^\//, ''));
    expect(existsSync(onDisk)).toBe(true);
  });
});
