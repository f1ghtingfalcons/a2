export class PagePermissions {
    /**
     * Object to hold page permission information
     */
    constructor(public needsLogin: boolean, public needsAdmin: boolean) {}
}

export class Page {
    /**
     * Object to hold page route information
     */
    constructor(public label: string, public url: string, public permissions: PagePermissions) {}
}
