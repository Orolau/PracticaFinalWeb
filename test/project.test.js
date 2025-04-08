const request = require("supertest");
const { app, server } = require("../app");
const mongoose = require("mongoose");
const {clientModel} = require('../models/index.js')

let token = "";
let projectId = "";
let clientId = "";

beforeAll(async () => {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    await clientModel.deleteMany({})
    // Login para obtener token válido
    const res = await request(app)
        .post("/api/user/login")
        .send({
            email: "testuser@example.com",
            password: "TestPassword123"
        });

    token = res.body.token;
    const resClient = await request(app)
        .post("/api/client")
        .set("Authorization", `Bearer ${token}`)
            .send({
                name: "ClientTest",
                cif: "553456789L",
                address: {
                    "street": "Calle Fuencarral",
                    "province": "Pontevedra",
                    "number": 10,
                    "postal": 36004,
                    "city": "Pontevedra"
                }
            });
    clientId = resClient.body._id;
});

describe("Project Endpoints", () => {

    test("Should create a new project", async () => {
        const res = await request(app)
            .post("/api/project")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Proyecto de Prueba",
                projectCode: "TEST001",
                clientId: clientId,
                code: "001",
                address: {
                    "street": "Calle Fuencarral",
                    "province": "Pontevedra",
                    "number": 10,
                    "postal": 36004,
                    "city": "Pontevedra"
                }
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("_id");
        expect(res.body.name).toBe("Proyecto de Prueba");
        projectId = res.body._id;
    });

    test("Should get all projects for the user and company", async () => {
        const res = await request(app)
            .get("/api/project")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Should get a project by ID", async () => {
        const res = await request(app)
            .get(`/api/project/${projectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("_id", projectId);
    });

    test("Should update the project", async () => {
        const res = await request(app)
            .put(`/api/project/${projectId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Proyecto Actualizado",
                projectCode: "TEST001",
                clientId: clientId,
                notes: "Proyecto actualizado con éxito",
                begin: "12-03-2025",
                end: "30-05-2025"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe("Proyecto Actualizado");
    });

    test("Should archive the project", async () => {
        const res = await request(app)
            .delete(`/api/project/archive/${projectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Project archived successfully");
    });

    test("Should list archived projects", async () => {
        const res = await request(app)
            .get("/api/project/archive")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.some(project => project._id === projectId)).toBe(true);
    });

    test("Should restore the archived project", async () => {
        const res = await request(app)
            .patch(`/api/project/archive/${projectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Project restored successfully");
    });

    test("Should delete the project permanently", async () => {
        const res = await request(app)
            .delete(`/api/project/${projectId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Project deleted successfully");
    });
});

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});
