body {
  background: #f8f3ed;
}

.admin-main {
  padding-top: 120px;
}

.admin-header {
  padding: 30px 0 20px;
}

.admin-header h1 {
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  color: var(--coffee-dark);
}

.admin-container {
  padding: 20px 0 90px;
}

.tabs-admin {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.admin-tab {
  border: none;
  padding: 12px 18px;
  border-radius: 999px;
  background: var(--white);
  color: var(--coffee-dark);
  font-weight: 700;
  cursor: pointer;
}
.admin-tab.active {
  background: var(--coffee);
  color: var(--white);
}

.admin-pedidos {
  display: grid;
  gap: 18px;
}

.admin-card {
  background: var(--white);
  border: 1px solid var(--cream-dark);
  border-radius: 18px;
  padding: 22px;
}
.admin-card h3 {
  color: var(--coffee-dark);
  margin-bottom: 12px;
}
.admin-card p {
  color: var(--muted);
  margin-bottom: 8px;
}
.admin-card button {
  margin-top: 16px;
}
