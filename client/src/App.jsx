import { useEffect, useState } from "react";
import {
  ArrowRight,
  Box,
  Check,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const categories = ["all", "t-shirts", "hoodies", "pants", "shorts"];
const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

async function api(path, options = {}) {
  const token = localStorage.getItem("estore_token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("estore_user")) || null;
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("estore_cart") || "[]"),
  );
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const isStaff = user && ["admin", "staff"].includes(user.role);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    localStorage.setItem("estore_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!notice && !error) return undefined;

    const timeout = window.setTimeout(() => {
      setNotice("");
      setError("");
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [notice, error]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (user && view === "workspace") loadOrders();
  }, [user, view]);

  async function loadProducts() {
    setLoading(true);
    try {
      setProducts((await api("/products")).products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    try {
      const endpoint =
        user?.role === "admin"
          ? "/orders"
          : user?.role === "staff"
            ? "/orders/staff/my-orders"
            : "/orders/my-orders";
      const data = await api(endpoint);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    }
  }

  function signIn(data) {
    localStorage.setItem("estore_token", data.token);
    localStorage.setItem("estore_user", JSON.stringify(data.user));
    setUser(data.user);
    setAuthOpen(false);
    setNotice(`Welcome back, ${data.user.name.split(" ")[0]}.`);
  }

  function signOut() {
    localStorage.removeItem("estore_token");
    localStorage.removeItem("estore_user");
    setUser(null);
    setAccountOpen(false);
    setView("shop");
    setOrders([]);
    setNotice("You have been signed out.");
  }

  function addToCart(product, options = {}) {
    const color = options.color || product.colors?.[0] || "";
    const size = options.size || product.sizes?.[0] || "";
    const quantity = Math.min(options.quantity || 1, product.quantity);
    setCart((items) => {
      const existing = items.find(
        (item) =>
          item.productId === product._id &&
          item.color === color &&
          item.size === size,
      );
      if (existing)
        return items.map((item) =>
          item.productId === product._id &&
          item.color === color &&
          item.size === size
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, product.quantity),
              }
            : item,
        );
      return [
        ...items,
        {
          productId: product._id,
          productName: product.name,
          price: product.price,
          quantity,
          image: product.image,
          color,
          size,
        },
      ];
    });
    setNotice(`${product.name} added to bag`);
    setSelectedProduct(null);
  }

  function updateCart(itemToUpdate, quantity) {
    setCart((items) =>
      quantity < 1
        ? items.filter(
            (item) =>
              !(
                item.productId === itemToUpdate.productId &&
                item.color === itemToUpdate.color &&
                item.size === itemToUpdate.size
              ),
          )
        : items.map((item) =>
            item === itemToUpdate ? { ...item, quantity } : item,
          ),
    );
  }

  function showError(message) {
    setError(message);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setView("shop")}>
          <span className="brand-mark">N</span>
          <span>
            northstar<span className="brand-dot">.</span>
          </span>
        </button>
        <nav className="main-nav">
          <button
            className={view === "shop" ? "active" : ""}
            onClick={() => setView("shop")}
          >
            Shop
          </button>
          {user && (
            <button
              className={view === "orders" ? "active" : ""}
              onClick={() => setView("orders")}
            >
              My orders
            </button>
          )}
          {isStaff && (
            <button
              className={view === "workspace" ? "active" : ""}
              onClick={() => setView("workspace")}
            >
              <LayoutDashboard size={16} /> Workspace
            </button>
          )}
        </nav>
        <div className="top-actions">
          <button className="icon-button" aria-label="Search">
            <Search size={19} />
          </button>
          {user ? (
            <div className="account-menu">
              <button
                className="user-chip"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className="avatar">{user.name?.[0]}</span>
                <span className="user-name">{user.name}</span>
                <ChevronDown size={14} />
              </button>
              {accountOpen && (
                <div className="account-panel" role="menu">
                  <div className="account-details">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <small>{user.role}</small>
                  </div>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setView("orders");
                      setAccountOpen(false);
                    }}
                  >
                    My orders
                  </button>
                  {isStaff && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        setView("workspace");
                        setAccountOpen(false);
                      }}
                    >
                      Workspace
                    </button>
                  )}
                  <button
                    className="account-signout"
                    role="menuitem"
                    onClick={signOut}
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="text-button" onClick={() => setAuthOpen(true)}>
              Sign in <ArrowRight size={16} />
            </button>
          )}
          <button
            className="bag-button"
            onClick={() => setCartOpen(true)}
            aria-label="Open shopping bag"
          >
            <ShoppingBag size={19} />
            <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </button>
        </div>
      </header>

      {notice && (
        <div className="toast success">
          <Check size={16} /> {notice}
          <button onClick={() => setNotice("")}>
            <X size={14} />
          </button>
        </div>
      )}
      {error && (
        <div className="toast error">
          {error}
          <button onClick={() => setError("")}>
            <X size={14} />
          </button>
        </div>
      )}

      {view === "shop" && (
        <Storefront
          products={products}
          loading={loading}
          onAdd={addToCart}
          onOpenProduct={setSelectedProduct}
        />
      )}
      {view === "orders" && (
        <CustomerOrders orders={orders} onLoad={loadOrders} />
      )}
      {view === "workspace" && isStaff && (
        <Workspace
          orders={orders}
          products={products}
          isAdmin={isAdmin}
          onReload={() => {
            loadOrders();
            loadProducts();
          }}
          onError={showError}
        />
      )}

      <footer className="footer">
        <span>
          northstar<span className="brand-dot">.</span>
        </span>
        <span>Thoughtful essentials, made to move.</span>
        <span>© 2026</span>
      </footer>
      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSuccess={signIn}
          onError={showError}
        />
      )}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          user={user}
          onClose={() => setCartOpen(false)}
          onChange={updateCart}
          onSuccess={(message) => {
            setCart([]);
            setCartOpen(false);
            setNotice(message);
          }}
          onError={showError}
          onSignIn={() => {
            setCartOpen(false);
            setAuthOpen(true);
          }}
        />
      )}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
        />
      )}
    </div>
  );
}

function Storefront({ products, loading, onAdd, onOpenProduct }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const filtered = products.filter(
    (product) =>
      (category === "all" || product.category === category) &&
      product.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={14} /> Spring / Summer 2026
          </p>
          <h1>
            Everyday pieces,
            <br />
            <em>considered.</em>
          </h1>
          <p className="hero-text">
            A focused collection of comfortable essentials, designed to stay in
            rotation.
          </p>
          <button
            className="primary-button"
            onClick={() =>
              document
                .getElementById("collection")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore the collection <ArrowRight size={17} />
          </button>
        </div>
        <div className="hero-art">
          <div className="sun-disc" />
          <div className="art-label">
            01 / 04
            <br />
            <strong>NEW ARRIVALS</strong>
          </div>
          <div className="abstract-figure" />
        </div>
      </section>
      <section className="collection" id="collection">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The collection</p>
            <h2>Made for the in-between.</h2>
          </div>
          <div className="collection-tools">
            <div className="search-field">
              <Search size={16} />
              <input
                placeholder="Find a piece"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="category-tabs">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "selected" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="loading-state">Loading the collection...</div>
        ) : filtered.length ? (
          <div className="product-grid">
            {filtered.map((product, index) => (
              <ProductCard
                key={product._id}
                product={product}
                index={index}
                onAdd={onAdd}
                onOpenProduct={onOpenProduct}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">No pieces match that search.</div>
        )}
      </section>
    </main>
  );
}

function ProductCard({ product, index, onAdd, onOpenProduct }) {
  return (
    <article className={`product-card tone-${index % 4}`}>
      <button
        className="product-image product-image-button"
        onClick={() => onOpenProduct(product)}
        aria-label={`View ${product.name}`}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="product-placeholder">
            <span>{product.category?.replace("-", " ")}</span>
            <Box size={44} strokeWidth={1.2} />
          </div>
        )}
        <span
          className={`stock-badge ${product.quantity === 0 ? "sold-out" : ""}`}
        >
          {product.quantity === 0
            ? "Sold out"
            : `${product.quantity} available`}
        </span>
      </button>
      <div className="product-meta">
        <div>
          <p className="product-category">{product.category}</p>
          <button
            className="product-name-button"
            onClick={() => onOpenProduct(product)}
          >
            {product.name}
          </button>
        </div>
        <strong>{money.format(product.price)}</strong>
      </div>
      <p className="product-description">
        {product.description || "Quietly dependable. Built for daily wear."}
      </p>
      <button
        className="add-button"
        disabled={!product.quantity}
        onClick={() => onAdd(product)}
      >
        {product.quantity ? (
          <>
            <Plus size={17} /> Add to bag
          </>
        ) : (
          "Unavailable"
        )}
      </button>
    </article>
  );
}

function ProductDetail({ product, onClose, onAdd }) {
  const [color, setColor] = useState(product.colors?.[0] || "");
  const [size, setSize] = useState(product.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="product-detail-modal">
        <button
          className="modal-close icon-button"
          onClick={onClose}
          aria-label="Close product details"
        >
          <X size={19} />
        </button>
        <div className="detail-product-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <Package size={54} />
          )}
        </div>
        <div className="detail-product-copy">
          <p className="eyebrow">{product.category}</p>
          <h2>{product.name}</h2>
          <strong className="detail-product-price">
            {money.format(product.price)}
          </strong>
          <p className="muted">
            {product.description || "Quietly dependable. Built for daily wear."}
          </p>
          {product.colors?.length > 0 && (
            <div className="choice-group">
              <div className="choice-heading">
                <span>Color</span>
                <strong>{color}</strong>
              </div>
              <div className="choice-options">
                {product.colors.map((option) => (
                  <button
                    key={option}
                    className={color === option ? "choice selected" : "choice"}
                    onClick={() => setColor(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.sizes?.length > 0 && (
            <div className="choice-group">
              <div className="choice-heading">
                <span>Size</span>
                <strong>{size}</strong>
              </div>
              <div className="choice-options">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    className={size === option ? "choice selected" : "choice"}
                    onClick={() => setSize(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="detail-buy-row">
            <div className="quantity">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                −
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.quantity, quantity + 1))
                }
              >
                +
              </button>
            </div>
            <button
              className="primary-button"
              disabled={!product.quantity}
              onClick={() => onAdd(product, { color, size, quantity })}
            >
              {product.quantity ? "Add to bag" : "Sold out"}{" "}
              <ShoppingBag size={16} />
            </button>
          </div>
          <p className="stock-note">{product.quantity} available</p>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  cart,
  user,
  onClose,
  onChange,
  onSuccess,
  onError,
  onSignIn,
}) {
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
    notes: "",
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  async function placeOrder(event) {
    event.preventDefault();
    if (!user) return onSignIn();
    try {
      await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map(({ image, ...item }) => item),
          totalPrice: total,
          shippingAddress: {
            street: form.street,
            city: form.city,
            postalCode: form.postalCode,
            country: form.country,
          },
          phone: form.phone,
          notes: form.notes,
        }),
      });
      onSuccess("Order placed. We will take it from here.");
      localStorage.removeItem("estore_cart");
    } catch (err) {
      onError(err.message);
    }
  }

  function continueToCheckout() {
    if (!user) {
      onSignIn();
      return;
    }

    setCheckout(true);
  }

  return (
    <aside
      className="drawer-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="drawer">
        <div className="drawer-head">
          <div>
            <p className="eyebrow">Your selection</p>
            <h2>{checkout ? "Delivery details" : "Shopping bag"}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {!checkout ? (
          <>
            {cart.length ? (
              <div className="cart-items">
                {cart.map((item) => (
                  <div
                    className="cart-item"
                    key={`${item.productId}-${item.color}-${item.size}`}
                  >
                    <div className="mini-image">
                      {item.image ? (
                        <img src={item.image} alt="" />
                      ) : (
                        <Package size={20} />
                      )}
                    </div>
                    <div className="cart-item-info">
                      <strong>{item.productName}</strong>
                      <span>
                        {money.format(item.price)}
                        {item.color || item.size
                          ? ` · ${item.color || ""}${item.color && item.size ? " / " : ""}${item.size || ""}`
                          : ""}
                      </span>
                      <div className="quantity">
                        <button
                          onClick={() => onChange(item, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => onChange(item, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => onChange(item, 0)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                Your bag is waiting for something good.
              </div>
            )}
            <div className="drawer-total">
              <span>Subtotal</span>
              <strong>{money.format(total)}</strong>
            </div>
            <button
              className="primary-button full"
              disabled={!cart.length}
              onClick={continueToCheckout}
            >
              {user ? "Continue to checkout" : "Sign in to continue"}{" "}
              <ArrowRight size={17} />
            </button>
          </>
        ) : (
          <form className="checkout-form" onSubmit={placeOrder}>
            <div className="form-row">
              <label>
                Street
                <input
                  required
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
              </label>
              <label>
                City
                <input
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </label>
            </div>
            <div className="form-row">
              <label>
                Postal code
                <input
                  required
                  value={form.postalCode}
                  onChange={(e) =>
                    setForm({ ...form, postalCode: e.target.value })
                  }
                />
              </label>
              <label>
                Country
                <input
                  required
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Phone
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label>
              Notes <span className="optional">optional</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            <div className="drawer-total">
              <span>Total</span>
              <strong>{money.format(total)}</strong>
            </div>
            <button className="primary-button full" type="submit">
              {user ? "Place order" : "Sign in to place order"}{" "}
              <ArrowRight size={17} />
            </button>
            <button
              className="back-button"
              type="button"
              onClick={() => setCheckout(false)}
            >
              Back to bag
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}

function AuthModal({ onClose, onSuccess, onError }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  async function submit(event) {
    event.preventDefault();
    try {
      onSuccess(
        await api(`/users/${mode === "login" ? "login" : "register"}`, {
          method: "POST",
          body: JSON.stringify(form),
        }),
      );
    } catch (err) {
      onError(err.message);
    }
  }
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="auth-modal">
        <button className="modal-close icon-button" onClick={onClose}>
          <X size={19} />
        </button>
        <p className="eyebrow">Northstar account</p>
        <h2>
          {mode === "login" ? "Welcome back." : "Make room for good things."}
        </h2>
        <p className="muted">
          {mode === "login"
            ? "Sign in to track orders and move faster."
            : "Create an account to save your order history."}
        </p>
        <form onSubmit={submit}>
          {mode === "register" && (
            <label>
              Your name
              <input
                required
                minLength="2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
          )}
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            Password
            <input
              required
              minLength="6"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </label>
          <button className="primary-button full" type="submit">
            {mode === "login" ? "Sign in" : "Create account"}{" "}
            <ArrowRight size={17} />
          </button>
        </form>
        <button
          className="switch-auth"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Need an account? Register"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function CustomerOrders({ orders, onLoad }) {
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    onLoad();
  }, []);
  return (
    <main className="page-content">
      <div className="page-title">
        <div>
          <p className="eyebrow">Your account</p>
          <h1>Order history</h1>
        </div>
        <button className="outline-button" onClick={onLoad}>
          <SlidersHorizontal size={16} /> Refresh
        </button>
      </div>
      {orders.length ? (
        <div className="order-list">
          {orders.map((order) => (
            <OrderRow
              order={order}
              key={order._id}
              onOpen={() => setSelectedOrder(order)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-panel">
          <ClipboardList size={28} />
          <h3>No orders yet</h3>
          <p>Your next favorite piece is probably in the collection.</p>
        </div>
      )}
      {selectedOrder && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setSelectedOrder(null)
          }
        >
          <div className="order-detail-modal">
            <OrderDetail
              order={selectedOrder}
              readOnly
              onBack={() => setSelectedOrder(null)}
            />
          </div>
        </div>
      )}
    </main>
  );
}

function OrderRow({ order, compact = false, actions, onOpen }) {
  return (
    <article
      className={`order-row ${compact ? "compact" : ""}`}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={
        onOpen
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
    >
      <div className="order-main">
        <span className="order-icon">
          <Package size={19} />
        </span>
        <div>
          <strong>{order.orderNumber}</strong>
          <span>
            {new Date(order.orderDate || order.createdAt).toLocaleDateString()}{" "}
            · {order.items?.length || 0} items
          </span>
        </div>
      </div>
      <span className={`status status-${order.status}`}>{order.status}</span>
      <strong className="order-total">{money.format(order.totalPrice)}</strong>
      {actions}
    </article>
  );
}

function Workspace({ orders, products, isAdmin, onReload, onError }) {
  const [tab, setTab] = useState("orders");
  const [selected, setSelected] = useState(null);
  const [showProduct, setShowProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const visibleOrders = selected
    ? orders.filter((order) => order._id === selected)
    : orders;
  return (
    <main className="workspace">
      <aside className="workspace-nav">
        <p className="eyebrow">Operations</p>
        <h1>Control room</h1>
        <div className="role-banner">
          <ShieldCheck size={17} />
          <div>
            <strong>{isAdmin ? "Administrator" : "Staff member"}</strong>
            <span>
              {isAdmin ? "Full store access" : "Limited store access"}
            </span>
          </div>
        </div>
        <button
          className={
            tab === "orders" ? "workspace-tab active" : "workspace-tab"
          }
          onClick={() => {
            setTab("orders");
            setSelected(null);
          }}
        >
          <ClipboardList size={18} /> {isAdmin ? "All orders" : "My orders"}
          <span>{orders.length}</span>
        </button>
        {isAdmin && (
          <button
            className={
              tab === "products" ? "workspace-tab active" : "workspace-tab"
            }
            onClick={() => setTab("products")}
          >
            <Package size={18} /> Products<span>{products.length}</span>
          </button>
        )}
      </aside>
      <section className="workspace-main">
        {tab === "orders" ? (
          <OrderManager
            orders={visibleOrders}
            isAdmin={isAdmin}
            selected={selected}
            onSelect={setSelected}
            onReload={onReload}
            onError={onError}
          />
        ) : (
          <ProductManager
            products={products}
            onReload={onReload}
            onError={onError}
            onAdd={() => setShowProduct(true)}
            onEdit={setEditingProduct}
          />
        )}
      </section>
      {showProduct && (
        <ProductModal
          onClose={() => setShowProduct(false)}
          onDone={() => {
            setShowProduct(false);
            onReload();
          }}
          onError={onError}
        />
      )}
      {editingProduct && (
        <ProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onDone={() => {
            setEditingProduct(null);
            onReload();
          }}
          onError={onError}
        />
      )}
    </main>
  );
}

function OrderManager({
  orders,
  isAdmin,
  selected,
  onSelect,
  onReload,
  onError,
}) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filtered = orders.filter(
    (order) => statusFilter === "all" || order.status === statusFilter,
  );
  async function action(path, options = {}) {
    try {
      await api(path, options);
      onReload();
    } catch (err) {
      onError(err.message);
    }
  }
  async function updateStatus(id, status) {
    await action(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }
  return (
    <div>
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">{isAdmin ? "Store overview" : "Your queue"}</p>
          <h2>
            {selected
              ? "Order detail"
              : isAdmin
                ? "Order desk"
                : "Assigned orders"}
          </h2>
        </div>
        <div className="workspace-actions">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="outline-button" onClick={onReload}>
            <SlidersHorizontal size={16} /> Refresh
          </button>
        </div>
      </div>
      {selected ? (
        <OrderDetail
          order={orders[0]}
          isAdmin={isAdmin}
          onBack={() => onSelect(null)}
          onStatus={(status) => updateStatus(selected, status)}
          onAction={action}
        />
      ) : (
        <div className="ops-list">
          {filtered.length ? (
            filtered.map((order) => (
              <OrderRow
                key={order._id}
                order={order}
                compact
                actions={
                  <div className="row-actions">
                    <button
                      className="link-button"
                      onClick={() => onSelect(order._id)}
                    >
                      Open <ArrowRight size={14} />
                    </button>
                    {order.status === "pending" && (
                      <button
                        className="confirm-button"
                        onClick={() =>
                          action(`/orders/${order._id}/confirm`, {
                            method: "POST",
                          })
                        }
                      >
                        <Check size={14} /> Confirm
                      </button>
                    )}
                  </div>
                }
              />
            ))
          ) : (
            <div className="empty-panel">
              <ClipboardList size={28} />
              <h3>Nothing in this view</h3>
              <p>Orders will appear here as customers check out.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OrderDetail({
  order,
  isAdmin,
  readOnly = false,
  onBack,
  onStatus,
  onAction,
}) {
  const [note, setNote] = useState("");
  if (!order) return null;
  return (
    <div className="detail-panel">
      {readOnly ? (
        <button
          className="modal-close icon-button"
          onClick={onBack}
          aria-label="Close order details"
          title="Close order details"
        >
          <X size={19} />
        </button>
      ) : (
        <button className="back-button" onClick={onBack}>
          ← Back to orders
        </button>
      )}
      <div className="detail-top">
        <div>
          <p className="eyebrow">{order.orderNumber}</p>
          <h2>{order.userId?.name || "Customer order"}</h2>
          <p className="muted">
            {order.userId?.email} · {order.phone}
          </p>
        </div>
        {readOnly ? (
          <span className={`status status-${order.status}`}>
            {order.status}
          </span>
        ) : (
          <select
            value={order.status}
            onChange={(e) => onStatus(e.target.value)}
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        )}
      </div>
      <div className="detail-grid">
        <div>
          <h3>Items</h3>
          {order.items.map((item, index) => (
            <div className="detail-item" key={`${item.productId}-${index}`}>
              <span>{item.productName}</span>
              <span>
                {item.quantity} × {money.format(item.price)}
              </span>
            </div>
          ))}
          <div className="detail-total">
            <span>Total</span>
            <strong>{money.format(order.totalPrice)}</strong>
          </div>
        </div>
        <div>
          <h3>Delivery</h3>
          <p className="address">
            {order.shippingAddress?.street}
            <br />
            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
            <br />
            {order.shippingAddress?.country}
          </p>
          <h3 className="timeline-heading">Timeline</h3>
          {order.timeline?.length ? (
            order.timeline
              .slice()
              .reverse()
              .map((item, index) => (
                <div
                  className="timeline-item"
                  key={`${item.timestamp}-${index}`}
                >
                  <span className="timeline-dot" />
                  <div>
                    <strong>{item.action?.replaceAll("_", " ")}</strong>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))
          ) : (
            <p className="muted">No timeline entries yet.</p>
          )}
        </div>
      </div>
      {isAdmin && !readOnly && (
        <div className="timeline-form">
          <input
            placeholder="Add an internal note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            className="outline-button"
            disabled={!note}
            onClick={async () => {
              await onAction(`/orders/${order._id}/timeline`, {
                method: "POST",
                body: JSON.stringify({
                  action: "note_added",
                  description: note,
                }),
              });
              setNote("");
            }}
          >
            Add note
          </button>
        </div>
      )}
    </div>
  );
}

function ProductManager({ products, onReload, onError, onAdd, onEdit }) {
  async function remove(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api(`/products/${id}`, { method: "DELETE" });
      onReload();
    } catch (err) {
      onError(err.message);
    }
  }
  return (
    <div>
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Products</h2>
        </div>
        <button className="primary-button" onClick={onAdd}>
          <Plus size={17} /> Add product
        </button>
      </div>
      <div className="product-table">
        {products.map((product) => (
          <div
            className="product-table-row"
            key={product._id}
            role="button"
            tabIndex={0}
            onClick={() => onEdit(product)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onEdit(product);
              }
            }}
          >
            <div className="table-product-image">
              {product.image ? (
                <img src={product.image} alt="" />
              ) : (
                <Package size={18} />
              )}
            </div>
            <div>
              <strong>{product.name}</strong>
              <span>{product.category}</span>
            </div>
            <span>{product.quantity} in stock</span>
            <strong>{money.format(product.price)}</strong>
            <button
              className="icon-button danger"
              onClick={(event) => {
                event.stopPropagation();
                remove(product._id);
              }}
              aria-label={`Delete ${product.name}`}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductModal({ product, onClose, onDone, onError }) {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price ?? "",
    quantity: product?.quantity ?? "",
    category: product?.category || "t-shirts",
    image: product?.image || "",
    colors: product?.colors?.join(", ") || "",
    sizes: product?.sizes?.join(", ") || "",
  });
  async function submit(event) {
    event.preventDefault();
    try {
      await api(product ? `/products/${product._id}` : "/products", {
        method: product ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          quantity: Number(form.quantity),
          colors: form.colors
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          sizes: form.sizes
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      onDone();
    } catch (err) {
      onError(err.message);
    }
  }
  const change = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  return (
    <div className="modal-backdrop">
      <div className="product-modal">
        <div className="drawer-head">
          <div>
            <p className="eyebrow">Catalog</p>
            <h2>{product ? "Edit product" : "Add a product"}</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="form-row">
            <label>
              Name
              <input
                required
                minLength="2"
                value={form.name}
                onChange={change("name")}
              />
            </label>
            <label>
              Category
              <select value={form.category} onChange={change("category")}>
                {categories.slice(1).map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={change("description")}
            />
          </label>
          <div className="form-row">
            <label>
              Price
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={change("price")}
              />
            </label>
            <label>
              Quantity
              <input
                required
                type="number"
                min="0"
                value={form.quantity}
                onChange={change("quantity")}
              />
            </label>
          </div>
          <label>
            Image URL <span className="optional">optional</span>
            <input value={form.image} onChange={change("image")} />
          </label>
          <div className="form-row">
            <label>
              Colors <span className="optional">comma separated</span>
              <input value={form.colors} onChange={change("colors")} />
            </label>
            <label>
              Sizes <span className="optional">comma separated</span>
              <input value={form.sizes} onChange={change("sizes")} />
            </label>
          </div>
          <button className="primary-button full" type="submit">
            {product ? "Save changes" : "Create product"}{" "}
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
