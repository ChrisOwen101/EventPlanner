import { FaFilter, FaHeart } from 'react-icons/fa6'
import './navbar.css'


function NavBar({ onSearch, onFilter, onFavourite }: { onSearch: (search: string) => void, onFilter: () => void, onFavourite: () => void }) {
    return (
        <nav className="navbar bg-primary navbar-expand-lg custom-navbar" data-bs-theme="dark">
            <div className="container-fluid">
                <span className="logo mb-0" >
                    <span className='poppins-bold'>Exhibitions</span>London
                </span>
                <div className="">
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
                        <button type="button" className="btn btn-secondary" onClick={onFavourite} style={{
                            marginRight: '16px'
                        }}><FaHeart /></button>

                        <button type="button" className="btn btn-secondary" onClick={onFilter} style={{
                            marginRight: '16px'
                        }}><FaFilter /></button>

                        <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" onChange={(e) => {
                            onSearch(e.target.value)
                        }} style={{ backgroundColor: '#314D36', color: 'white', border: '1px solid grey' }} />

                    </form>
                </div>
            </div>
        </nav>
    )
}

export default NavBar