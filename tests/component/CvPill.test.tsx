import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CvPill } from '@/components/canvas/CvPill';
import { CvDownload } from '@/components/canvas/CvDownload';
import { CV_PDF_PATH } from '@/config/cv';

/* Both pills offer two actions over the same file: view (new tab) and
 * download. Previously each hard-coded the filename, which is how the
 * link drifted onto a stale PDF — these tests pin the shared constant
 * and the fact that the file actually ships in /public. */
describe.each([
  ['CvPill', CvPill],
  ['CvDownload', CvDownload],
])('%s', (_name, Component) => {
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
