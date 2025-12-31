// components/ExpandableNavItem.jsx
import React, { useState, useEffect } from 'react';
import side from '../CSS_for_components/SideSubNavStyle.module.css';

const ExpandableNavItem = ({ subItems }) => {
    // Get initial activeId from the URL hash or default to first subItem
    const getInitialActiveId = () => {
        const hash = window.location.hash.replace('#', '');
        return subItems.find(item => item.id === hash)?.id || subItems[0]?.id || null;
    };

    const [activeId, setActiveId] = useState(getInitialActiveId);

    // Listen for hash changes and update activeId accordingly
    useEffect(() => {
        const onHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            const found = subItems.find(item => item.id === hash);
            if (found) setActiveId(found.id);
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, [subItems]);

    return (
        <div className={side["expandable-nav-item"] + " " + side["indent-1"]}>
            <div className={side["sub-items"]}>
                {subItems.map((item) => (
                    <a
                        key={item.key}
                        href={"#" + item.id}
                        className={
                            side["sub-item"] +
                            " " +
                            (item.id === activeId ? side["active"] : "")
                        }
                        onClick={() => setActiveId(item.id)}
                    >
                        <span
                            className={
                                side["triangle"] +
                                " " +
                                (item.id === activeId ? side["large"] : "")
                            }
                        ></span>
                        {item.label}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default ExpandableNavItem;
