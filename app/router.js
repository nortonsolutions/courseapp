class Router {

    constructor(controller) {
        this.controller = controller;
        this.routeMap = new Map();
        this.navigateTo = this.navigateTo.bind(this);
        this.setRouteLinks = this.setRouteLinks.bind(this);
    }

    add(path,handler) {
        this.routeMap[path] = handler;
    }

    navigateTo(path,query) {
        let handler = this.routeMap[path];
        
        // Handle history state push
        var historyState = { path: path, query: query };
        history.pushState(historyState, null, path);

        var queryParams = query.substring(1);
        let request = { parameters: queryParams.split('&') };
        
        handler(request);
    }

    setRouteLinks(location) {

        if (location == null) location = document;
        
        // MOVE TO VIEW
        location.querySelectorAll('a[data-route-link]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                e.preventDefault();
                this.navigateTo(anchor.pathname, anchor.search);

            })
        })
    }
}

export { Router }