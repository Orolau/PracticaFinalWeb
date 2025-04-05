const request = require("supertest");
const { app, server } = require("../app");
const mongoose = require("mongoose");

let token = "";
let clientId = "";

beforeAll(async () => {
    // Login para obtener token válido
    const res = await request(app)
        .post("/api/user/login")
        .send({
            email: "testuser@example.com",
            password: "TestPassword123"
        });

    token = res.body.token;
});

describe("Client Endpoints", () => {
    test("Should create a new client", async () => {
        const res = await request(app)
            .post("/api/client")
            .set("Authorization", `Bearer ${token}`)
            .send({
                name: "Client Test",
                cif: "123456789L",
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
        expect(res.body.name).toBe("Client Test");
        clientId = res.body._id;
    });

    test("Should get all clients for the user and company", async () => {
        const res = await request(app)
            .get("/api/client")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Should get a client by ID", async () => {
        const res = await request(app)
            .get(`/api/client/${clientId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("_id", clientId);
    });

    test("Should update the client", async () => {
        const res = await request(app)
            .patch(`/api/client/${clientId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                cif: "123456789L",
                address:{
                    "street": "Calle Fuencarral",
                    "province": "Pontevedra",
                    "number": 10,
                    "postal": 36004,
                    "city": "Pontevedra"
                }
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.cif).toBe("123456789L");
    });

    test("Should archive the client", async () => {
        const res = await request(app)
            .delete(`/api/client/archive/${clientId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Client archived successfully");
    });

    test("Should list archived clients", async () => {
        const res = await request(app)
            .get("/api/client/archive")
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.some(client => client._id === clientId)).toBe(true);
    });

    test("Should restore an archived client", async () => {
        const res = await request(app)
            .patch(`/api/client/archive/${clientId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Client restored successfully");
    });

    test("Should delete client permanently", async () => {
        const res = await request(app)
            .delete(`/api/client/${clientId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Client deleted successfully");
    });
});

afterAll(async () => {
    server.close();
    await mongoose.connection.close();
});
