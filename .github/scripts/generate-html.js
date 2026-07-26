const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Directories
const blogDir = path.join(__dirname, '../../blog');
const dataDir = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Main function
async function generateHTML() {
    console.log('Starting markdown to HTML conversion...');

    const categories = fs.readdirSync(blogDir);
    const allData = [];

    for (const category of categories) {
        const categoryPath = path.join(blogDir, category);
        const stat = fs.statSync(categoryPath);

        if (!stat.isDirectory()) continue;

        console.log(`Processing category: ${category}`);

        const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md'));

        for (const file of files) {
            const filePath = path.join(categoryPath, file);
            const fileName = path.parse(file).name;

            try {
                // Read markdown file
                const content = fs.readFileSync(filePath, 'utf-8');

                // Extract frontmatter if exists
                let frontmatter = {};
                let markdown = content;
                const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

                if (frontmatterMatch) {
                    const frontmatterText = frontmatterMatch[1];
                    markdown = frontmatterMatch[2];

                    // Parse simple YAML-like frontmatter
                    const lines = frontmatterText.split('\n');
                    for (const line of lines) {
                        const [key, ...valueParts] = line.split(':');
                        if (key) {
                            frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^['"]|['"]$/g, '');
                        }
                    }
                }

                // Convert markdown to HTML
                const html = await marked(markdown);

                // Create data object
                const data = {
                    id: fileName,
                    category: category,
                    title: frontmatter.title || fileName,
                    date: frontmatter.date || new Date().toISOString().split('T')[0],
                    description: frontmatter.description || '',
                    content: html,
                    tags: frontmatter.tags ? frontmatter.tags.split(',').map(t => t.trim()) : []
                };

                allData.push(data);

                // Create individual HTML files
                const htmlFileName = `${fileName}.html`;
                const htmlOutputPath = path.join(dataDir, category);

                if (!fs.existsSync(htmlOutputPath)) {
                    fs.mkdirSync(htmlOutputPath, { recursive: true });
                }

                const htmlFilePath = path.join(htmlOutputPath, htmlFileName);

                const htmlTemplate = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <link rel="stylesheet" href="../../css/style.css">
</head>
<body>
    <article>
        <header>
            <h1>${data.title}</h1>
            <p class="meta">
                <span class="category">${data.category}</span>
                <span class="date">${data.date}</span>
            </p>
        </header>
        <main>
            ${data.content}
        </main>
        <footer>
            <a href="../../index.html">← Back to Portfolio</a>
        </footer>
    </article>
</body>
</html>`;

                fs.writeFileSync(htmlFilePath, htmlTemplate);
                console.log(`Generated: ${htmlFilePath}`);

            } catch (error) {
                console.error(`Error processing ${filePath}:`, error);
            }
        }
    }

    // Generate index JSON file
    const jsonIndexPath = path.join(dataDir, 'index.json');
    fs.writeFileSync(jsonIndexPath, JSON.stringify(allData, null, 2));
    console.log(`Generated index: ${jsonIndexPath}`);

    console.log('Markdown to HTML conversion completed!');
}

generateHTML().catch(console.error);
