# AutoJade

**Write documents, connect pages, and build a local knowledge base.**

[中文](README.cn.md) · [Sample knowledge base](docs/releases/v0.1.0-rc/sample-workspace/wiki/欢迎.ad) · [Developer documentation](docs/README.md) · [Release status](docs/RELEASE.md)

AutoJade is an editor for AutoDown (`.ad`) documents and local knowledge bases. It brings document writing, page links, backlinks, search, tags, and file organization into one workspace. Your pages are local files, with directories for grouping and metadata for titles, aliases, and tags.

The product and source project are named **AutoJade / auto-jade**. This repository currently retains the name **jade-edit**. AutoJade is an independent application alongside AutoEdit: AutoEdit focuses on code and text editing, while AutoJade focuses on writing and knowledge relationships.

[![AutoJade dark workspace showing the product manual, file tree, document tabs, and editor](docs/images/auto-jade/p1-main-dark.png)](docs/images/auto-jade/p1-main-dark.png)

*The first-party product manual running in the native desktop window. This original image is also used by the AutoLang website. The six screenshots below were provided on October 10, 2026 for release preparation; they are not final release acceptance evidence. Click an image to view the original. [Image sources](docs/images/auto-jade/SOURCES.md).*

## A workspace for connected writing

Start with a page, write, and save. Add `[[Page name]]` links as ideas become related, inspect the pages that reference your work, and return through quick open, tags, or full-text search.

| Capability | What you can do |
|---|---|
| Documents and tabs | Edit `.ad` pages with headings, paragraphs, lists, code blocks, and YAML metadata; keep several pages open |
| Page links and backlinks | Follow related pages and see incoming links, outgoing links, and unlinked mentions |
| Missing links | Collect unwritten destinations and create a page through a confirmation dialog |
| Quick open and search | Use `Ctrl+P` to find page names, display titles, aliases, and paths; search document content separately |
| Tags and page properties | Browse frontmatter and inline tags; edit a page's display title, aliases, and tags |
| Daily notes and recent pages | Create today's note and return to recently opened pages across sessions |
| Files and directories | Create, rename, move, and delete pages and directories; recover deleted pages from the trash |
| Draft protection | Checkpoint unsaved content locally and recover it as a separate copy after restart |

### See the knowledge workflow

<details>
<summary>Page links and backlinks</summary>

The manual's “双链与反链” page links to related topics. Its backlinks panel shows the pages referring to it; the second image shows a link highlighted in the document.

[![AutoJade manual with incoming and outgoing page links in the backlinks panel](docs/images/auto-jade/p2-backlinks-dark.png)](docs/images/auto-jade/p2-backlinks-dark.png)

[![A highlighted page link in the AutoJade document editor](docs/images/auto-jade/p3-wikilink-dark.png)](docs/images/auto-jade/p3-wikilink-dark.png)

</details>

<details>
<summary>Find a page and create a missing destination</summary>

Quick open finds “别名与检索” through its alias “检索”. This is name and alias lookup; full-text search has a separate entry point. Clicking the manual's missing page link opens a creation confirmation; cancelling leaves the files unchanged.

[![AutoJade quick-open dialog finding a page through its alias](docs/images/auto-jade/p5-quick-open-dark.png)](docs/images/auto-jade/p5-quick-open-dark.png)

[![AutoJade confirmation dialog for creating a missing page](docs/images/auto-jade/p6-dangling-create-dark.png)](docs/images/auto-jade/p6-dangling-create-dark.png)

</details>

<details>
<summary>Organize pages in directories</summary>

The sample includes a nested page under `wiki/子目录/`. Pages remain ordinary local files that you can inspect outside the application.

[![AutoJade workspace tree with an expanded directory and nested page](docs/images/auto-jade/p7-filetree-dark.png)](docs/images/auto-jade/p7-filetree-dark.png)

</details>

## Learn inside the sample knowledge base

The bundled [sample workspace](docs/releases/v0.1.0-rc/sample-workspace/) is a **14-page product manual that also demonstrates the product**. Its pages contain real links, aliases, tags, a nested directory, and one deliberately missing destination. The manual is currently in Chinese.

| Start here | Explore |
|---|---|
| [Welcome](docs/releases/v0.1.0-rc/sample-workspace/wiki/欢迎.ad) · [Quick start](docs/releases/v0.1.0-rc/sample-workspace/wiki/快速开始.ad) | Open a page, type, save, then reopen it to check your changes |
| [Interface tour](docs/releases/v0.1.0-rc/sample-workspace/wiki/界面导览.ad) | Understand the file tree, document tabs, editor, and side panels |
| [Page links and backlinks](docs/releases/v0.1.0-rc/sample-workspace/wiki/双链与反链.ad) · [Tags and mentions](docs/releases/v0.1.0-rc/sample-workspace/wiki/标签与提及.ad) | Connect pages and browse relationships |
| [Aliases and search](docs/releases/v0.1.0-rc/sample-workspace/wiki/别名与检索.ad) · [Missing links](docs/releases/v0.1.0-rc/sample-workspace/wiki/悬空链接与建页.ad) | Find existing pages and discover what to write next |
| [Page management](docs/releases/v0.1.0-rc/sample-workspace/wiki/页面管理.ad) · [AutoDown syntax](docs/releases/v0.1.0-rc/sample-workspace/wiki/AutoDown%20语法速查.ad) | Organize files and learn the writing format |
| [Version and boundaries](docs/releases/v0.1.0-rc/sample-workspace/wiki/版本与边界.ad) | Understand the source-trial scope |

Copy the sample into your own workspace before trying edits. A useful first session is to open “写作示例”, write a paragraph, save with the toolbar, the File menu, or `Ctrl+S`, then reopen the page. Next, open “欢迎”, follow a page link, inspect backlinks, and try the missing link “尚不存在的页面”.

## Names, files, and unsaved content

A display title, a file name, and an alias serve different purposes. Quick open can match all three. Page links resolve through file names and aliases; changing the display title alone does not change link identity.

Renaming a page updates matching references. Moving a page without changing its file name keeps its links valid without rewriting them. Deleting a page moves it to the trash and leaves incoming links missing; restoring it can reconnect those links.

Application file operations check the affected open documents and block when those documents contain unsaved changes or need reconciliation. Manual reload also protects unsaved content. Local draft checkpoints preserve recoverable content, but **a protected draft is not a saved document**: recovery opens a separate copy and does not overwrite the original. See the [file-operation contract](docs/specs/document-lifecycle.md) and [draft-recovery contract](docs/specs/draft-recovery.md).

## Run from source

The current **v0.1.0 milestone is a Windows source trial in release preparation**. It needs a matching Auto toolchain and sibling repositories; there is no standalone installer yet. Final candidate details and verification remain in the [release documentation](docs/RELEASE.md) and [trial guide](docs/releases/v0.1.0-rc/trial-guide.md).

Keep the repositories in this layout; the existing `jade-edit` directory name is intentional:

```text
workspace/
├── jade-edit/   # AutoJade, this repository
├── auto-lang/  # Auto toolchain and shared blueprints
├── auto-edit/  # Shared style components
└── auto-down/  # AutoDown editor package
```

For the Vue path, prepare Node.js, pnpm, and the AutoDown engine build. The build script checks engine freshness. From the `jade-edit` root, set your actual toolchain and engine paths, then build:

```powershell
$env:AUTO_EXE = (Resolve-Path '..\auto-lang\target\debug\auto.exe').Path
$env:AUTO_JADE_ENGINE_ROOT = (Resolve-Path '..\auto-down\autodown\packages\engine').Path
& $env:AUTO_EXE --version
pnpm install
pnpm build
```

The example uses a locally built debug toolchain. For a frozen release trial, use the toolchain and fingerprints specified by the release documentation.

Copy the bundled manual to a new directory and select it as the workspace:

```powershell
$taskWiki = Join-Path $env:USERPROFILE ('auto-jade-manual-' + (Get-Date -Format 'yyyyMMdd-HHmmssfff'))
Copy-Item -LiteralPath '.\docs\releases\v0.1.0-rc\sample-workspace' -Destination $taskWiki -Recurse
$env:AUTO_JADE_WORKSPACE = $taskWiki

# Native desktop window
& $env:AUTO_EXE run -r vm --theme dark
```

Alternatively, run the browser interface with its application backend:

```powershell
& $env:AUTO_EXE run -r vue --server vm -B 8211 -F 4443
```

Open <http://127.0.0.1:4443>. Set `AUTO_JADE_WORKSPACE` explicitly for either form. The Vue interface needs its backend for reading, writing, search, and saving; a static copy of the generated interface does not provide those operations.

## Current scope and direction

The two forms share Auto application and interface sources: AutoVM/AutoUI renders the native window, while generation produces Vue 3 + Vite for the browser. AutoDown supplies the document/editor foundations; AutoEdit supplies shared style components. Jade Garden is the older feature and design reference. Shared sources do not guarantee identical behavior in every runtime.

The source trial targets workspaces of **up to 200 pages**, with name lookup within **8 directory levels**. Larger workspaces trigger a warning. Some shortcuts containing Shift currently need their menu equivalents. Newly typed page-link text does not immediately become an active link, and opening a linked page does not position the caret at a block anchor. Native empty-page input remains a user trial check. Consult the [current limitations and trial checklist](docs/releases/v0.1.0-rc/trial-guide.md).

Near-term work focuses on writing quality and reliable document operations. Graph views, outlines, automatic saving/version history, collaboration, deeper AI knowledge workflows, and packaged distribution are future work rather than current release promises.

For implementation details, use the [developer overview](docs/README.md), [architecture](docs/ARCHITECTURE.md), and [module specifications](docs/specs/). Product description checked against the repository and website on October 11, 2026.
