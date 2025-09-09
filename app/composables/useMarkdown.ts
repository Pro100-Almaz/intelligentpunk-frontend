import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  breaks: true, // respect line breaks
  linkify: true // auto-detect links
})

export function renderMarkdown(content: string) {
  return md.render(content)
}