import NoirService from "../services/Noirservice.js";

class NoirController {
    constructor() {
        this.noirService = new NoirService();
    }

    async deployZeroBot(req, res) {
        try {
            await this.noirService.deployZeroBot();
            return Response.json({ message: "ZeroBot deployed successfully" }, { status: 200 });
        } catch (error) {
            console.error("Error deploying ZeroBot:", error);
            return Response.json({ error: "Failed to deploy ZeroBot" }, { status: 500 });
        }
    }

    async deployIdentity(req, res) {
        try {
            await this.noirService.deployIdentity();
            return Response.json({ message: "Identity deployed successfully" }, { status: 200 });
        } catch (error) {
            console.error("Error deploying Identity:", error);
            return Response.json({ error: "Failed to deploy Identity" }, { status: 500 });
        }
    }
}

export default NoirController;