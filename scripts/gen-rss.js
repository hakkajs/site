const { promises: fs } = require('fs')
const path = require('path')
const RSS = require('rss')
const matter = require('gray-matter')

async function generate() {
  const feed = new RSS({
    title: '客家万事',
    site_url: 'https://hakka.vercel.app',
    feed_url: 'https://hakka.vercel.app/feed.xml'
  })

  const readFile = (data, name, p) => {
    const frontmatter = matter(data)
    feed.item({
      title: frontmatter.data.title,
      url: '/posts/' + p + name.replace(/\.mdx?/, ''),
      date: frontmatter.data.date,
      description: frontmatter.data.description,
      categories: frontmatter.data.tag.split(', '),
      author: frontmatter.data.author
    })
  }

  const dirs = await fs.readdir(path.join(__dirname, '..', 'pages', 'posts'))
  await Promise.all(
    dirs.map(async (name) => {
      if (name.startsWith('index.')) return
      const currentPath = path.join(__dirname, '..', 'pages', 'posts', name)
      if (name.includes('.md')) {
        const content = await fs.readFile(currentPath)
        readFile(content, name, '')
      } else {
        const subdirs = await fs.readdir(currentPath)
        for (const n of subdirs) {
          const content = await fs.readFile(path.join(currentPath, n))
          readFile(content, n, name + '/')
        }
      }
    })
  )
  await fs.writeFile('./public/feed.xml', feed.xml({ indent: true }))
}

generate()
