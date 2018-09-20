import * as React from 'react';
import { render } from 'react-dom';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom';

import * as components from './samples';

const initApp = () => {

    let routes = [];

    for (let id in components) {
        routes.push({
            path: `/${id}`,
            ...components[id]
        });
    }

    const Samples = ({routes}) => {
        const links = routes.map((route) => {
            return (
                <li key={route.path}>
                    <Link to={route.path}>{route.title}</Link>
                </li>
            );
        });

        return (
            <ul>
                {links}
            </ul>
        );
    };

    const sampleRoutes = routes.map((route) => {
        return <Route key={route.path} path={route.path} component={route.component}></Route>;
    });

    render((
        <Router>
            <div style={{ width: '100%', height: 'calc(100vh - 16px)' }}>
                <Route exact path='/' render={() => <Samples routes={routes}></Samples>}></Route>
                {sampleRoutes}
            </div>
        </Router>
    ), document.getElementById('app_container'));
};

window.addEventListener('DOMContentLoaded', initApp, false);
