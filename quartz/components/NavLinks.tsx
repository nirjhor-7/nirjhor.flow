import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { FullSlug, resolveRelative } from "../util/path"

interface Options {
  links: Record<string, string>
}

const defaultOptions: Options = {
  links: {
    About: "about",
    Now: "now",
  },
}

export default ((opts?: Partial<Options>) => {
  const options = { ...defaultOptions, ...opts }

  const NavLinks: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
    return (
      <div class={classNames(displayClass, "nav-links")}>
        {Object.entries(options.links).map(([text, link]) => {
          const href =
            link.startsWith("http") || link.startsWith("mailto")
              ? link
              : resolveRelative(fileData.slug!, link as FullSlug)
          return (
            <a href={href} class="nav-link">
              {text}
            </a>
          )
        })}
      </div>
    )
  }

  return NavLinks
}) satisfies QuartzComponentConstructor
