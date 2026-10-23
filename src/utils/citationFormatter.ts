import { CitationData, CitationStyle } from '../types/writing';

function formatAuthorsAPA(authors: string[]): string {
  if (authors.length === 0) return 'Anonymous';
  const formatted = authors.map((a) => {
    const parts = a.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const lastName = parts[parts.length - 1];
    const initials = parts
      .slice(0, parts.length - 1)
      .map((p) => `${p[0].toUpperCase()}.`)
      .join(' ');
    return `${lastName}, ${initials}`;
  });

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
  return `${formatted.slice(0, -1).join(', ')}, & ${formatted[formatted.length - 1]}`;
}

function formatAuthorsMLA(authors: string[]): string {
  if (authors.length === 0) return 'Anonymous';
  const parts1 = authors[0].trim().split(' ');
  const first =
    parts1.length > 1
      ? `${parts1[parts1.length - 1]}, ${parts1.slice(0, -1).join(' ')}`
      : parts1[0];

  if (authors.length === 1) return first;
  if (authors.length === 2) return `${first}, and ${authors[1]}`;
  return `${first}, et al`;
}

function formatAuthorsChicago(authors: string[]): string {
  if (authors.length === 0) return 'Anonymous';
  const parts1 = authors[0].trim().split(' ');
  const first =
    parts1.length > 1
      ? `${parts1[parts1.length - 1]}, ${parts1.slice(0, -1).join(' ')}`
      : parts1[0];

  if (authors.length === 1) return first;
  if (authors.length === 2) return `${first}, and ${authors[1]}`;
  return `${first}, et al.`;
}

export function generateCitation(
  data: CitationData,
  style: CitationStyle
): { reference: string; inText: string } {
  const { title, authors, year, sourceOrJournal, volume, issue, pages, publisher, doiOrUrl, type } =
    data;

  // Primary author last name for in-text
  const primaryLastName =
    authors.length > 0 ? authors[0].trim().split(' ').pop() || 'Unknown' : 'Unknown';

  let reference = '';
  let inText = '';

  switch (style) {
    case 'apa': {
      // APA 7th
      const auth = formatAuthorsAPA(authors);
      const yr = year || 'n.d.';
      if (type === 'journal') {
        const volStr = volume ? ` ${volume}` : '';
        const issStr = issue ? `(${issue})` : '';
        const pgStr = pages ? `, ${pages}` : '';
        const doiStr = doiOrUrl ? ` https://doi.org/${doiOrUrl.replace(/^https?:\/\/doi\.org\//, '')}` : '';
        reference = `${auth} (${yr}). ${title}. ${sourceOrJournal || 'Journal'}${volStr}${issStr}${pgStr}.${doiStr}`.trim();
      } else if (type === 'book') {
        const pubStr = publisher ? ` ${publisher}.` : '';
        reference = `${auth} (${yr}). ${title}.${pubStr}`.trim();
      } else {
        const siteStr = sourceOrJournal ? ` ${sourceOrJournal}.` : '';
        const urlStr = doiOrUrl ? ` ${doiOrUrl}` : '';
        reference = `${auth} (${yr}). ${title}.${siteStr}${urlStr}`.trim();
      }

      if (authors.length === 1) {
        inText = `(${primaryLastName}, ${yr})`;
      } else if (authors.length === 2) {
        const secondLastName = authors[1].trim().split(' ').pop();
        inText = `(${primaryLastName} & ${secondLastName}, ${yr})`;
      } else {
        inText = `(${primaryLastName} et al., ${yr})`;
      }
      break;
    }

    case 'mla': {
      // MLA 9th
      const auth = formatAuthorsMLA(authors);
      if (type === 'journal') {
        const volStr = volume ? ` vol. ${volume}` : '';
        const issStr = issue ? `, no. ${issue}` : '';
        const yrStr = year ? `, ${year}` : '';
        const pgStr = pages ? `, pp. ${pages}` : '';
        reference = `${auth}. "${title}." ${sourceOrJournal || 'Journal'}${volStr}${issStr}${yrStr}${pgStr}.`.trim();
      } else if (type === 'book') {
        const pubStr = publisher ? ` ${publisher}` : '';
        const yrStr = year ? `, ${year}` : '';
        reference = `${auth}. ${title}.${pubStr}${yrStr}.`.trim();
      } else {
        const siteStr = sourceOrJournal ? ` ${sourceOrJournal}` : '';
        const yrStr = year ? `, ${year}` : '';
        const urlStr = doiOrUrl ? `, ${doiOrUrl}` : '';
        reference = `${auth}. "${title}."${siteStr}${yrStr}${urlStr}.`.trim();
      }

      const pageCitation = pages ? ` ${pages.split('-')[0]}` : '';
      if (authors.length <= 2) {
        inText = `(${primaryLastName}${pageCitation})`;
      } else {
        inText = `(${primaryLastName} et al.${pageCitation})`;
      }
      break;
    }

    case 'chicago': {
      // Chicago 17th (Notes & Bibliography)
      const auth = formatAuthorsChicago(authors);
      const yr = year || 'n.d.';
      if (type === 'journal') {
        const volStr = volume ? ` ${volume}` : '';
        const issStr = issue ? `, no. ${issue}` : '';
        const pgStr = pages ? `: ${pages}` : '';
        reference = `${auth}. "${title}." ${sourceOrJournal || 'Journal'}${volStr}${issStr} (${yr})${pgStr}.`.trim();
      } else {
        const pubStr = publisher ? ` ${publisher}` : '';
        reference = `${auth}. ${title}.${pubStr}, ${yr}.`.trim();
      }
      inText = `(${primaryLastName} ${yr})`;
      break;
    }

    case 'harvard': {
      // Harvard style
      const auth = formatAuthorsAPA(authors).replace('&', 'and');
      const yr = year || 'n.d.';
      if (type === 'journal') {
        reference = `${auth} (${yr}) '${title}', ${sourceOrJournal || 'Journal'}, ${volume || '1'}(${issue || '1'}), pp. ${pages || '1-10'}.`.trim();
      } else {
        reference = `${auth} (${yr}) ${title}. ${publisher || ''}.`.trim();
      }
      inText = `(${primaryLastName}, ${yr})`;
      break;
    }
  }

  return { reference, inText };
}
