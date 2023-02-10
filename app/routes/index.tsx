import { NavLink } from "@remix-run/react";
import { GithubOutlined, TwitterOutlined } from "@ant-design/icons";

export default function Index() {
  return (
    <section>
      <article>
        <p className="my-2">
          Hi, i am vincenteof. I am a <b>frontend developer</b> living in
          Shanghai.
        </p>
        <p className="my-2">
          I mainly focus on frontend development, and i also have a strong
          belief in blockchain technology like <b>ethereum</b>.{" "}
          <NavLink to="about">Read more about me</NavLink>
        </p>

        <p className="my-2">
          After regularly working in tech companies for about five years, i am
          currently looking for some new way of life, such as being a digital
          nomad, participating in OSS or starting a startup.
        </p>
        <p className="my-2">
          If you think there are some opportunity we could cooperate with each
          other, please do not hesitate to contact me.
        </p>
        <div className="flex items-start md:items-center my-8 flex-col md:flex-row">
          <img
            className="rounded-full w-[100px] h-[100px]"
            alt="vincenteof"
            src="https://avatars.githubusercontent.com/u/14847208?v=4"
          />
          <div className="mt-8 md:mt-0 ml-0 md:ml-6 space-y-2 text-neutral-500 dark:text-neutral-400">
            <p className="flex items-center gap-2">
              Find me on
              <a
                href="https://github.com/vincenteof"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 underline underline-offset-2"
              >
                <GithubOutlined />
                Github
              </a>
              ,
              <a
                href="https://twitter.com/vincenteof"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 underline underline-offset-2"
              >
                <TwitterOutlined />
                Twitter
              </a>
            </p>
            <p>
              Mail me at{" "}
              <a href="mailto:vincenteofchen@gmail.com">
                vincenteofchen@gmail.com
              </a>
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
