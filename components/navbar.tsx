export default function NavBar() {
  return (
    <nav className="flex justify-between items-center">
      <h1>Aurex</h1>

      <ul className="flex items-center justify-between gap-8">
        <li>Product</li>
        <li>Template</li>
        <li>Blog</li>
        <li>Pricing</li>
      </ul>

      <div>
        <button>Sign in</button>

        <button>Start Free</button>
      </div>
    </nav>
  );
}
