export function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <button className="logout-button" type="submit">
        Log out
      </button>
    </form>
  );
}
