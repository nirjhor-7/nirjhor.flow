import { QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { getDate } from "./Date"
import { GlobalConfiguration } from "../cfg"
import { QuartzPluginData } from "../plugins/vfile"
import readingTime from "reading-time"
import { JSX } from "preact"

function isIgnored(file: QuartzPluginData): boolean {
  if (!file.slug) return true
  if (file.frontmatter?.draft === true) return true

  const slug = file.slug.toLowerCase().trim()
  if (slug === "index" || slug === "") return true
  if (slug === "about") return true
  if (slug === "now") return true
  if (slug === "get-in-touch" || slug.includes("get in touch")) return true
  if (slug.startsWith("templates/") || file.filePath?.toLowerCase().includes("templates/")) return true

  return false
}

function isVerse(file: QuartzPluginData): boolean {
  const slug = (file.slug ?? "").toLowerCase()
  const fp = (file.filePath ?? "").toLowerCase()
  return slug.startsWith("verses/") || fp.includes("/verses/")
}

function getFileDate(cfg: GlobalConfiguration, file: QuartzPluginData): Date {
  const d = getDate(cfg, file) ?? file.dates?.published ?? file.dates?.created ?? file.dates?.modified
  if (d) {
    const dt = new Date(d)
    if (!isNaN(dt.getTime()) && dt.getTime() > 0) return dt
  }
  return new Date(0)
}

function formatTabularDate(d: Date): string {
  if (d.getTime() === 0) return "2026 · 01"
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  return `${year} · ${month}`
}

function formatLongDate(d: Date): string {
  if (d.getTime() === 0) return "April 14, 2026"
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function getFileTitle(file: QuartzPluginData): string {
  if (file.frontmatter?.title && typeof file.frontmatter.title === "string" && file.frontmatter.title.trim()) {
    return file.frontmatter.title.trim()
  }
  if (file.filePath) {
    const filename = file.filePath.split("/").pop()?.replace(/\.md$/, "")
    if (filename) return filename
  }
  if (file.slug) {
    const lastSeg = file.slug.split("/").pop()
    if (lastSeg) return lastSeg.replace(/-/g, " ")
  }
  return "Untitled"
}

function getReadingTime(text?: string): string {
  if (!text) return "1 min read"
  const { minutes } = readingTime(text)
  return `${Math.max(1, Math.ceil(minutes))} min read`
}

function getExcerpt(file: QuartzPluginData): string {
  if (file.description && typeof file.description === "string" && file.description.trim()) {
    return file.description.trim()
  }
  if (file.text) {
    const clean = file.text.replace(/\s+/g, " ").trim()
    if (clean.length > 220) {
      return clean.slice(0, 220).trim() + "..."
    }
    return clean
  }
  return ""
}

export function HomeFeed(props: QuartzComponentProps) {
  const { cfg, fileData, allFiles } = props

  // Filter valid published notes
  const validFiles = (allFiles ?? []).filter((f) => !isIgnored(f))

  const writingNotes = validFiles.filter((f) => !isVerse(f))
  const verseNotes = validFiles.filter((f) => isVerse(f))

  // Sort newest first
  writingNotes.sort((a, b) => getFileDate(cfg, b).getTime() - getFileDate(cfg, a).getTime())
  verseNotes.sort((a, b) => getFileDate(cfg, b).getTime() - getFileDate(cfg, a).getTime())

  // Pinned post or newest writing post
  const pinnedTitle = fileData.frontmatter?.pinned as string | undefined
  let latestNote = writingNotes[0] ?? verseNotes[0]
  if (pinnedTitle) {
    const found = validFiles.find((f) => getFileTitle(f).toLowerCase() === pinnedTitle.toLowerCase())
    if (found) latestNote = found
  }

  // Topics
  const topicItems: { label: string; href: string; slug: string }[] = []
  const tags = new Set<string>()
  for (const n of [...writingNotes, ...verseNotes]) {
    const fileTags = n.frontmatter?.tags
    if (Array.isArray(fileTags)) {
      for (const t of fileTags) {
        if (typeof t === "string" && t.trim()) tags.add(t.trim())
      }
    }
  }

  // Add tags
  for (const tag of tags) {
    topicItems.push({
      label: tag,
      href: resolveRelative("index" as FullSlug, `tags/${tag}` as FullSlug),
      slug: `tags/${tag}`,
    })
  }

  // Add verses if verses exist
  if (verseNotes.length > 0) {
    topicItems.push({
      label: "verses",
      href: resolveRelative("index" as FullSlug, "Verses/" as FullSlug),
      slug: "Verses/",
    })
  }

  // Add about if about exists
  if (allFiles.some((f) => f.slug === "about")) {
    topicItems.push({
      label: "about",
      href: resolveRelative("index" as FullSlug, "about" as FullSlug),
      slug: "about",
    })
  }

  // Add now if now exists
  if (allFiles.some((f) => f.slug === "now")) {
    topicItems.push({
      label: "now",
      href: resolveRelative("index" as FullSlug, "now" as FullSlug),
      slug: "now",
    })
  }

  return (
    <>
      {latestNote && (
        <>
          <p class="section-label">Latest</p>
          <h3 id={latestNote.slug}>
            <a
              href={resolveRelative("index" as FullSlug, latestNote.slug!)}
              class="internal alias"
              data-slug={latestNote.slug}
            >
              {getFileTitle(latestNote)}
            </a>
          </h3>
          <p class="metadata font-ui">
            {formatLongDate(getFileDate(cfg, latestNote))} · {getReadingTime(latestNote.text)}
          </p>
          <p>
            {getExcerpt(latestNote)}{" "}
            <a
              href={resolveRelative("index" as FullSlug, latestNote.slug!)}
              class="internal alias"
              data-slug={latestNote.slug}
            >
              Keep reading →
            </a>
          </p>
        </>
      )}

      {topicItems.length > 0 && (
        <>
          <hr />
          <p class="section-label">Topics</p>
          <p>
            {topicItems.map((topic, i) => (
              <span key={topic.slug}>
                {i > 0 && ", "}
                <a href={topic.href} class="internal alias" data-slug={topic.slug}>
                  {topic.label}
                </a>
              </span>
            ))}
          </p>
        </>
      )}

      {writingNotes.length > 0 && (
        <>
          <hr />
          <p class="section-label">Writing</p>
          <ul>
            {writingNotes.map((note) => {
              const d = getFileDate(cfg, note)
              const dateStr = formatTabularDate(d)
              const title = getFileTitle(note)
              const href = resolveRelative("index" as FullSlug, note.slug!)
              return (
                <li key={note.slug}>
                  <span class="date">{dateStr}</span>
                  <a href={href} class="internal alias" data-slug={note.slug}>
                    {title}
                  </a>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {verseNotes.length > 0 && (
        <>
          <hr />
          <p class="section-label">Verses</p>
          <ul>
            {verseNotes.map((note) => {
              const d = getFileDate(cfg, note)
              const dateStr = formatTabularDate(d)
              const title = getFileTitle(note)
              const href = resolveRelative("index" as FullSlug, note.slug!)
              return (
                <li key={note.slug}>
                  <span class="date">{dateStr}</span>
                  <a href={href} class="internal alias" data-slug={note.slug}>
                    {title}
                  </a>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </>
  )
}
export default HomeFeed
