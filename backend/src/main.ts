import { Route, RouteCreator } from "./modules/route.creator"

const server = Bun.serve({
    port: 3000,
    async fetch(request) {
        const rb = Route

        rb.createRESTApi((route_build) => {
            return route_build
                .url("/")
                .method("GET")
                .controller((req, res) => {
                    return new res(JSON.stringify({message: "Halo :D"}), {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                })
        })

        rb.createRESTApi(route_build => {
            return route_build
                .url("/greet")
                .method('GET')
                .controller((req, res) => {
                    return new res(JSON.stringify({message: "Halo lagi"}), {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                })
        })

        return rb.hearRequest(request)
    }
})