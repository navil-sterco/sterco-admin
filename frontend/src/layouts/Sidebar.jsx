import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import menuData from '../data/menuData.json';
import { assetUrl } from '../config';

const Sidebar = () => {
    return (
        <aside
            id="layout-menu"
            className="layout-menu menu-vertical menu bg-menu-theme"
        >
            <div className="app-brand demo">
                <Link
                    aria-label="Navigate to sneat homepage"
                    to="/"
                    className="app-brand-link"
                >
                    <span className="app-brand-logo demo">
                        <img
                            src={assetUrl('assets/img/sneat.svg')}
                            alt="sneat-logo"
                            aria-label="Sneat logo image"
                        />
                    </span>

                    <span className="app-brand-text demo menu-text fw-bold ms-2">
                        Sneat
                    </span>
                </Link>

                <a
                    href="#"
                    className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none"
                >
                    <i className="bx bx-chevron-left bx-sm align-middle"></i>
                </a>
            </div>

            <div className="menu-inner-shadow"></div>

            <ul className="menu-inner py-1">
                {menuData.map((section, index) => (
                    <React.Fragment key={section.header || `section-${index}`}>
                        {section.header && (
                            <li className="menu-header small text-uppercase">
                                <span className="menu-header-text">
                                    {section.header}
                                </span>
                            </li>
                        )}

                        {section.items?.map((item, itemIndex) => (
                            <MenuItem
                                key={item.link || `item-${itemIndex}`}
                                {...item}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </ul>
        </aside>
    );
};

const MenuItem = (item) => {
    const location = useLocation();

    const isActive = location.pathname === item.link;

    const hasSubmenu =
        item.submenu && item.submenu.length > 0;

    const isSubmenuActive =
        hasSubmenu &&
        item.submenu.some(
            (subitem) => location.pathname === subitem.link
        );

    return (
        <li
            className={`menu-item ${
                isActive || isSubmenuActive ? 'active' : ''
            } ${
                hasSubmenu && isSubmenuActive ? 'open' : ''
            }`}
        >
            <NavLink
                aria-label={`Navigate to ${item.text} ${
                    !item.available ? 'Pro' : ''
                }`}
                to={item.link}
                className={`menu-link ${
                    hasSubmenu ? 'menu-toggle' : ''
                }`}
                target={
                    item.link?.includes('http')
                        ? '_blank'
                        : undefined
                }
            >
                <i
                    className={`menu-icon tf-icons ${item.icon}`}
                ></i>

                <div>{item.text}</div>

                {item.available === false && (
                    <div className="badge bg-label-primary fs-tiny rounded-pill ms-auto">
                        Pro
                    </div>
                )}
            </NavLink>

            {hasSubmenu && (
                <ul className="menu-sub">
                    {item.submenu.map((subItem, subIndex) => (
                        <MenuItem
                            key={
                                subItem.link ||
                                `submenu-${subIndex}`
                            }
                            {...subItem}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default Sidebar;