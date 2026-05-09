function AppLayout({ isDarkTheme, children }) {
  return (
    <div className={`page ${isDarkTheme ? "page--dark" : ""}`}>{children}</div>
  );
}

export default AppLayout;
