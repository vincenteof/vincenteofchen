import { json } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import fm from "front-matter";
import { downloadDirList, downloadFile } from "~/utils/github.server";
import type { MDFileAttributes } from "~/types";

export async function loader() {
  const blogDir = "content/blog";
  const dirList = (await downloadDirList(blogDir))
    .map(({ name, path }) => ({
      name,
      slug: path.replace(`${blogDir}/`, "").replace(/\.md$/, ""),
    }))
    .filter(({ name }) => name !== "README.md");

  const posts = await Promise.all(
    dirList.map(async ({ name, slug }) => {
      const mdFile = await downloadFile(`${blogDir}/${name}`);
      const result = fm<MDFileAttributes>(mdFile);
      return {
        slug,
        attributes: result.attributes,
      };
    })
  );

  const data = {
    posts,
  };
  return json(data, {
    // headers: {
    //   "Cache-Control": "private, max-age=3600",
    //   Vary: "Cookie",
    //   "Server-Timing": getServerTimeHeader(timings),
    // },
  });
}

function BlogIndex() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="flex h-full flex-col my-4">
      <h2 className="text-xl font-bold">Archive</h2>
      <ul className="mt-4 max-w-2xl">
        {data.posts.map((post) => (
          <NavLink
            to={post.slug}
            key={post.slug}
            className="block opacity-60 hover:opacity-100 max-w-2xl"
          >
            <li>
              <div>{post.attributes.title}</div>
            </li>
          </NavLink>
        ))}
      </ul>
    </div>
  );
}

export default BlogIndex;
