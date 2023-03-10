import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import fm from "front-matter";
import Markdown from "~/components/Markdown";
import type { LoaderArgs } from "@remix-run/node";
import { downloadFile } from "~/utils/github.server";
import type { MDFileAttributes } from "~/types";

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
    <div className="flex flex-col h-full my-4">
      <article className="prose h-full mx-auto">
        <Markdown>{data.body}</Markdown>
      </article>
    </div>
  );
}

export default BlogScreen;
