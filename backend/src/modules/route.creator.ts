interface RESTAPI_RouteObject {
    url: string
    method: "POST" | "GET" | "PUT" | "DELETE"
    controller: (req: Request, res: typeof Response) => Response
}
interface RESTAPI_RouteStructure {
    controller: RESTAPI_RouteObject['controller']
    method: RESTAPI_RouteObject['method']
}
type RESTAPI_RouteStructureObjects = Record<string, RESTAPI_RouteStructure>


export class RouteCreator {
    AllRoute = {} as RESTAPI_RouteStructureObjects

    createRESTApi(RouteBuilder: (builder: RESTAPIRouteModules) => RESTAPIRouteModules) {

        const {controller, method, url} = RouteBuilder(new RESTAPIRouteModules).build()
        this.AllRoute[url as unknown as string] = {
            controller: controller,
            method: method
        }
    }
    hearRequest(req: Request) {
        const url = new URL(req.url)
        const method = req.method
        
        const targetedRoute = this.AllRoute[url.pathname]
        const targetedRouteMethod = (targetedRoute?.method ?? "unknown") !== method
        if (!targetedRoute || targetedRouteMethod) {
            const NotFound = {
                statusCode: "404",
                errorCode: "NOTFOUND",
                success: false,
                data: null,
                message: "Route not found"
            }
            return new Response(JSON.stringify(NotFound), {
                headers: {
                    "Content-Type": "application/json"
                }
            })
        }
        return targetedRoute.controller(req, Response)
    }
}

class RESTAPIRouteModules {
    private RouteStructure = {} as RESTAPI_RouteObject
    url(
        url: RESTAPI_RouteObject['url']
    ) {
        this.RouteStructure.url = url
        return this
    }
    method(
        method: RESTAPI_RouteObject['method']
    ) {
        this.RouteStructure.method = method
        return this
    }
    controller(
        controllerNya: RESTAPI_RouteObject['controller']
    ) {
        this.RouteStructure.controller = controllerNya
        return this
    }
    // Patokan buat dapet data route nya
    build() {
        return this.RouteStructure
    }
}

export const Route = new RouteCreator()