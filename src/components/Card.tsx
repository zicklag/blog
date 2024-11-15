import Datetime from "./Datetime";
import type { BlogFrontmatter } from "@content/_schemas";

export interface Props {
  href?: string;
  frontmatter: BlogFrontmatter;
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, description } = frontmatter;
  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 className="text-lg font-medium decoration-dashed hover:underline">
            {title}
          </h2>
        ) : (
          <h3 className="text-lg font-medium decoration-dashed hover:underline">
            {title}
          </h3>
        )}
      </a>
      <div className="flex">
        <Datetime datetime={pubDatetime} /> <span className="ml-4 mr-1">|</span>
        {frontmatter.tags
          .map(tag => (
            <a
              key={tag}
              href={`${import.meta.env.BASE_URL}tags/${tag}`}
              className="mx-2 underline-offset-4 hover:underline"
            >
              #{tag}
            </a>
          ))
          .slice(0, 3)}
      </div>
      <p>{description}</p>
    </li>
  );
}
