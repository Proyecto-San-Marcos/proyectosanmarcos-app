import { useState } from "react";
import { MaterialSymbol } from 'react-material-symbols';
import 'react-material-symbols/rounded';

const SideNavigation = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const listNav = [
    {
      title: "Inicio",
      icon: (
        <MaterialSymbol icon="dashboard"/>
      ),
      href: "/app",
    },
    {
      title: "Notificaciones",
      icon: ( <MaterialSymbol icon="notifications"/>),
      href: "/app/notifications",
    },
    {
      title: "Buzon",
      icon: ( <MaterialSymbol icon="mail"/>),
      href: "/app/mailbox",
    }
  ];

  return (
    <>
      {/*  <!-- Component: Side navigation menu with content separator --> */}
      {/*  <!-- Mobile trigger --> */}
      <button
        title="Side navigation"
        type="button"
        className={`visible fixed left-6 top-6 z-40 order-10 block h-10 w-10 self-center rounded bg-white opacity-100 lg:hidden ${
          isSideNavOpen
            ? "visible opacity-100 [&_span:nth-child(1)]:w-6 [&_span:nth-child(1)]:translate-y-0 [&_span:nth-child(1)]:rotate-45 [&_span:nth-child(3)]:w-0 [&_span:nth-child(2)]:-rotate-45 "
            : ""
        }`}
        aria-haspopup="menu"
        aria-label="Side navigation"
        aria-expanded={isSideNavOpen ? " true" : "false"}
        aria-controls="nav-menu-2"
        onClick={() => setIsSideNavOpen(!isSideNavOpen)}
      >
        <div className="absolute top-1/2 left-1/2 w-6 -translate-x-1/2 -translate-y-1/2 transform">
          <span
            aria-hidden="true"
            className="absolute block h-0.5 w-9/12 -translate-y-2 transform rounded-full bg-slate-700 transition-all duration-300"
          ></span>
          <span
            aria-hidden="true"
            className="absolute block h-0.5 w-6 transform rounded-full bg-slate-900 transition duration-300"
          ></span>
          <span
            aria-hidden="true"
            className="absolute block h-0.5 w-1/2 origin-top-left translate-y-2 transform rounded-full bg-slate-900 transition-all duration-300"
          ></span>
        </div>
      </button>

      {/*  <!-- Side Navigation --> */}
      <aside
        id="nav-menu-2"
        aria-label="Side navigation"
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-r-slate-200 bg-white transition-transform lg:translate-x-0 ${
          isSideNavOpen ? "translate-x-0" : " -translate-x-full"
        }`}
      >
        <a
          aria-label="WindUI logo"
          className="flex items-center justify-center gap-2 whitespace-nowrap p-6 text-xl font-medium focus:outline-none"
          href="javascript:void(0)"
        >
          <img src="src\assets\logo.png" alt="" className="w-20" />
        </a>
        <nav
          aria-label="side navigation"
          className="flex-1 divide-y divide-slate-100 overflow-auto"
        >
          <div>
            <ul className="flex flex-1 flex-col gap-1 py-3">
              {listNav.map((item, index) => (
                <li className="px-3" key={index}>
                  <a
                    href={item.href}
                    className="flex items-center gap-3 rounded p-3 text-slate-700 transition-colors hover:bg-neutral-50 hover:text-neutral-500 focus:bg-neutral-50 aria-[current=page]:bg-neutral-50 aria-[current=page]:text-neutral-500"
                  >
                    <div className="flex items-center self-center ">{item.icon}</div>
                    <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                      {item.title}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <footer className="border-t border-slate-200 p-3">
          <a
            href="#"
            className="flex items-center gap-3 rounded p-3 text-slate-900 transition-colors hover:text-neutral-500 "
          >
            <div className="flex items-center self-center ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6"
                aria-label="Dashboard icon"
                role="graphics-symbol"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm font-medium">
              Logout
            </div>
          </a>
        </footer>
      </aside>

      {/*  <!-- Backdrop --> */}
      <div
        className={`fixed top-0 bottom-0 left-0 right-0 z-30 bg-slate-900/20 transition-colors sm:hidden ${
          isSideNavOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsSideNavOpen(false)}
      ></div>
      {/*  <!-- End Side navigation menu with content separator --> */}
    </>
  );
};

export default SideNavigation;
