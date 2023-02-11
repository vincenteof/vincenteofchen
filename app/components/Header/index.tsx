import { NavLink } from "@remix-run/react";

function Header() {
  const nonActiveLinkStyle = "opacity-20 hover:opacity-50";
  return (
    <header className="text-center mb-3">
      <h1 className="text-[2.25rem] font-bold pb-2">vincenteof.eth</h1>
      <nav className="max-w-2xl mx-auto">
        <ul className="w-full flex justify-center">
          <li className="px-2 py-1">
            <NavLink
              to=""
              className={({ isActive }) =>
                isActive ? undefined : nonActiveLinkStyle
              }
            >
              Home
            </NavLink>
          </li>
          <li className="px-2 py-1">
            <NavLink
              to="about"
              className={({ isActive }) =>
                isActive ? undefined : nonActiveLinkStyle
              }
            >
              About
            </NavLink>
          </li>
          <li className="px-2 py-1">
            <NavLink
              to="blog"
              className={({ isActive }) =>
                isActive ? undefined : nonActiveLinkStyle
              }
            >
              Blog
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
