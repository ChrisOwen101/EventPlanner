function NavBar({ onSearch }: { onSearch: (search: string) => void }) {
    return (
        <nav className="navbar bg-primary navbar-expand-lg" data-bs-theme="dark" style={{ margin: '24px', padding: '12px', borderRadius: '12px' }}>
            <div className="container-fluid">
                <span className="navbar-brand mb-0">
                    London Event Planner
                </span>
                <div className="collapse navbar-collapse">
                    <nav>
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            {/* <li className="nav-item">
                                <NavLink className="nav-link" to="/" end>
                                    Home
                                </NavLink>
                            </li> */}
                        </ul>
                    </nav>
                    <form className="d-flex ms-auto" role="search">
                        <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" onChange={(e) => {
                            onSearch(e.target.value);
                        }} />
                    </form>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;