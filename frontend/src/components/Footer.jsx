export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                CC
              </div>
              <span className="text-sm font-semibold">Consulting Copilot</span>
            </div>
            <p className="text-xs text-zinc-500">
              AI-powered tools for modern consultants.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-300">Product</h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li><a href="#" className="hover:text-zinc-300">Features</a></li>
              <li><a href="#" className="hover:text-zinc-300">Pricing</a></li>
              <li><a href="#" className="hover:text-zinc-300">Changelog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-300">Resources</h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li><a href="#" className="hover:text-zinc-300">Documentation</a></li>
              <li><a href="#" className="hover:text-zinc-300">API Reference</a></li>
              <li><a href="#" className="hover:text-zinc-300">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-zinc-300">Company</h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li><a href="#" className="hover:text-zinc-300">About</a></li>
              <li><a href="#" className="hover:text-zinc-300">Privacy</a></li>
              <li><a href="#" className="hover:text-zinc-300">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-600">
          &copy; {year} Consulting Copilot. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
