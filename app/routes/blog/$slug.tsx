import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import fm from "front-matter";
import Markdown from "~/components/Markdown";
import type { LoaderArgs } from "@remix-run/node";
import { downloadFile } from "~/utils/github.server";
import type { MDFileAttributes } from "~/types";
import styles from "github-markdown-css/github-markdown.css";
import overrideStyles from "~/styles/override-github-markdown.css";
import codeStyles from "~/styles/code.css";

export const links = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: overrideStyles },
  { rel: "stylesheet", href: codeStyles },
];

export async function loader({ params }: LoaderArgs) {
  const slug = params.slug;
  const blogDir = "content/blog";
  const mdFile = await downloadFile(`${blogDir}/${slug}.md`);
  const result = fm<MDFileAttributes>(mdFile);
  return json({
    attributes: result.attributes,
    body: result.body,
  });
}

function BlogScreen() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="markdown-body px-6 m-auto">
      <Markdown>{data.body}</Markdown>
    </div>
  );
}

export default BlogScreen;
