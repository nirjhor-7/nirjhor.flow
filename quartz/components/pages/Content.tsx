import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { HomeFeed } from "../HomeFeed"

const Content: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData, tree } = props
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  const classString = ["popover-hint", ...classes].join(" ")

  if (fileData.slug === "index") {
    return (
      <article class={classString}>
        <HomeFeed {...props} />
      </article>
    )
  }

  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren
  return <article class={classString}>{content}</article>
}

export default (() => Content) satisfies QuartzComponentConstructor
