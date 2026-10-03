import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "n\\rjhor",
    pageTitleSuffix: " • n\\rjhor",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    // This is the corrected URL for your GitHub Pages setup
    baseUrl: "nirjhor-7.github.io/nirjhor.flow",
    ignorePatterns: ["private/**", "templates/**", ".obsidian/**"],
    defaultDateType: "created",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Inter",
        body: "Inter",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#FFFCF0",
          lightgray: "#F2F0E5",
          gray: "#878580",
          darkgray: "#100F0F",
          dark: "#100F0F",
          secondary: "#24837B",
          tertiary: "#3AA99F",
          highlight: "rgba(246, 226, 160, 0.4)",
          textHighlight: "rgba(246, 226, 160, 0.8)",
        },
        darkMode: {
          light: "#100F0F",
          lightgray: "#1C1B1A",
          gray: "#878580",
          darkgray: "#CECDC3",
          dark: "#CECDC3",
          secondary: "#3AA99F",
          tertiary: "#5ABDAC",
          highlight: "rgba(58, 45, 4, 0.4)",
          textHighlight: "rgba(58, 45, 4, 0.8)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({
        markdownLinkResolution: "shortest",
        externalLinkIcon: false,
        openLinksInNewTab: true,
      }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
