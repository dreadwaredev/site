import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const postsDir = './posts';
const templatePath = './template.html';
const outputPath = './dist/index.html';

const files = await readdir(postsDir);
const mdFiles = files
  .filter(f => f.endsWith('.md'))
  .sort((a, b) => b.localeCompare(a)); // newest first

let postsHtml = '';
let tocHtml = '<ul class="toc-list">';

for (const file of mdFiles) {
  const md = await readFile(join(postsDir, file), 'utf-8');
  const titleMatch = md.match(/^#\s+(.+)$/m);
  const rawTitle = titleMatch ? titleMatch[1].trim() : file.replace('.md', '').slice(11);
  const title = rawTitle.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  const date = file.slice(0, 10);
  const prettyDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const anchorId = `post-${date}`;  // e.g. post-2025-11-18

  // Add to TOC
  tocHtml += `<li><a href="#${anchorId}">${rawTitle}</a> <span class="toc-date">${prettyDate}</span></li>`;

  // Add full post with anchor
  postsHtml += `
    <article id="${anchorId}">
      <h2>${rawTitle}</h2>
      <div class="date">${prettyDate}</div>
      <div class="post-body">${md}</div>
      <hr>
    </article>
  `;
}

tocHtml += '</ul>';

const template = await readFile(templatePath, 'utf-8');
const finalHtml = template
  .replace('{{POSTS}}', postsHtml)
  .replace('{{TOC}}', tocHtml);

await writeFile(outputPath, finalHtml);
console.log(`Built ${mdFiles.length} posts + TOC`);
