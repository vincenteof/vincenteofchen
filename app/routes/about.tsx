import {
  GithubOutlined,
  TwitterOutlined,
  MailOutlined,
} from "@ant-design/icons";

export default function AboutPage() {
  return (
    <div className="flex h-full flex-col mt-4 gap-8">
      <div>
        <h2 className="text-xl font-medium mb-4">About Me</h2>
        <div className="flex flex-col gap-4">
          <p className="text-neutral-800 dark:text-neutral-200">
            Hey, I am <b>vincenteof</b>. I am a software engineer living in
            Shanghai and I mainly focus on frontend development. Comparing to
            introducing myself in a systematic way, I prefer to giving several
            bullet point.
          </p>
          <ul className="text-neutral-800 dark:text-neutral-200 list-disc list-inside">
            <li>I am married and have a cute baby.</li>
            <li>
              I work as a software engineer for about five years, and I switch
              from backend to frontend during my career.
            </li>
            <li>
              My favorite stacks:
              <a
                href="https://reactjs.org/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 px-1"
              >
                React
              </a>
              ,
              <a
                href="https://remix.run/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 px-1"
              >
                Remix
              </a>
              ,
              <a
                href="https://nodejs.org/en/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 px-1"
              >
                Node.js
              </a>
              ,
              <a
                href="https://www.typescriptlang.org/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 px-1"
              >
                Typescript
              </a>
            </li>
            <li>
              I believe in
              <a
                href="https://twitter.com/ProfFeynman/status/1054763640220467201"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 px-1"
              >
                what Feynman said
              </a>
              , so reverse engineering is a learning method I often use.
            </li>
            <li>
              I have a CS degree but college doesn't offer me sufficient help.
              Essence of what I learned is obtained from Internet or book. I
              think education should exist in a more decentralized form.
            </li>
            <li>
              I am an <b>ETH(ethereum)</b> holder. I have a strong belief in
              blockchain technology and I am very willing to contribute to the
              system.
            </li>
          </ul>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-medium mb-4">About This Site</h2>
        <p className="text-neutral-800 dark:text-neutral-200">
          This site is powered by
          <a
            href="https://remix.run/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 px-1"
          >
            Remix
          </a>
          and is under active iteration. Currently, I primarily use this site
          for writing and recording. If you have any opinion or suggestion,
          <a
            href="https://github.com/vincenteof/vincenteofchen"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 px-1"
          >
            feedback is welcome
          </a>
          .
        </p>
      </div>
      <div>
        <h2 className="text-xl font-medium mb-4">Contact</h2>
        <div className="flex flex-row gap-2">
          <a
            href="https://github.com/vincenteof"
            target="_blank"
            rel="noreferrer"
            className="flex w-full border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 no-underline items-center text-neutral-800 dark:text-neutral-200 hover:dark:bg-neutral-900 hover:bg-neutral-100 transition-all justify-between"
          >
            <div className="flex items-center">
              <GithubOutlined style={{ fontSize: "1.125rem" }} />
              <div className="ml-3">GitHub</div>
            </div>
          </a>
          <a
            href="https://github.com/vincenteof"
            target="_blank"
            rel="noreferrer"
            className="flex w-full border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 no-underline items-center text-neutral-800 dark:text-neutral-200 hover:dark:bg-neutral-900 hover:bg-neutral-100 transition-all justify-between"
          >
            <div className="flex items-center">
              <TwitterOutlined style={{ fontSize: "1.125rem" }} />
              <div className="ml-3">Twitter</div>
            </div>
          </a>
          <a
            href="mailto:vincenteofchen@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="flex w-full border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 no-underline items-center text-neutral-800 dark:text-neutral-200 hover:dark:bg-neutral-900 hover:bg-neutral-100 transition-all justify-between"
          >
            <div className="flex items-center">
              <MailOutlined style={{ fontSize: "1.125rem" }} />
              <div className="ml-3">Email</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
